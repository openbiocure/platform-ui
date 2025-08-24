import os
import sys

# Add shared directory to Python path BEFORE any other imports
shared_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'shared'))
sys.path.insert(0, shared_path)

import json
import uuid
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, Depends, HTTPException, status, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx


from app.core.config import settings
from app.services.auth_service import AuthService
from app.services.permission_service import PermissionService
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.dependencies import get_auth_service, get_permission_service
from app.core.security import security
from app.models.user import User
from app.models.tenant import Tenant
from app.models.permissions import Role, Permission
from app.core.database import get_db, engine


# Create tables
from app.models import Base
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Auth Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Service registry configuration
SERVICE_REGISTRY_URL = os.getenv("SERVICE_REGISTRY_URL", "http://localhost:8001")

# Token store for opaque tokens (in production, use Redis)
token_store = {}

def get_token(opaque_token: str) -> Optional[dict]:
    """Get token info from store"""
    return token_store.get(opaque_token)

# Store the token store function for access by other functions
get_token.token_store = token_store

@app.on_event("startup")
async def startup_event():
    print("Auth Service starting up...")
    print(f"Service Registry URL: {SERVICE_REGISTRY_URL}")

@app.on_event("shutdown")
async def shutdown_event():
    print("Auth Service shutting down...")

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "auth-service", "timestamp": datetime.utcnow().isoformat()}

# Service registry endpoints
@app.get("/api/v1/services")
async def list_services():
    """List all registered services"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{SERVICE_REGISTRY_URL}/api/v1/services")
            return response.json()
    except Exception as e:
        print(f"Failed to fetch services: {e}")
        return {"services": [], "error": "Service registry unavailable"}

@app.get("/api/v1/services/{service_id}")
async def get_service(service_id: str):
    """Get service details by ID"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{SERVICE_REGISTRY_URL}/api/v1/services/{service_id}")
            return response.json()
    except Exception as e:
        print(f"Failed to fetch service {service_id}: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Service registry unavailable")

# Authentication endpoints
@app.post("/api/v1/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest, req: Request, auth_service: AuthService = Depends(get_auth_service)):
    try:
        return await auth_service.login(
            request.email, 
            request.password,
            ip_address=req.client.host,
            user_agent=req.headers.get("user-agent")
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@app.post("/api/v1/auth/register", response_model=TokenResponse)
async def register(request: RegisterRequest, auth_service: AuthService = Depends(get_auth_service)):
    try:
        return await auth_service.register(request.email, request.password, request.name, request.type or "individual")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@app.post("/api/v1/auth/refresh")
async def refresh_token(user_id: str, tenant_id: str, auth_service: AuthService = Depends(get_auth_service)):
    try:
        return await auth_service.refresh_token(user_id, tenant_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@app.get("/api/v1/auth/verify")
async def verify_token(user_id: str, auth_service: AuthService = Depends(get_auth_service)):
    try:
        return await auth_service.verify_token(user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

# Service-to-service authentication endpoint
@app.post("/api/v1/auth/service-auth")
async def service_auth(request: Request):
    """Service-to-service authentication endpoint"""
    try:
        # Get service credentials from request
        service_data = await request.json()
        service_id = service_data.get("service_id")
        service_secret = service_data.get("service_secret")
        requested_scope = service_data.get("scope", "basic")
        
        if not service_id or not service_secret:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing service credentials")
        
        # Validate service credentials (in production, check against service registry)
        if not validate_service_credentials(service_id, service_secret):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid service credentials")
        
        # Generate opaque token for service
        opaque_token = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(hours=24)
        
        token_store[opaque_token] = {
            "service_id": service_id,
            "scope": requested_scope,
            "expires_at": expires_at,
            "jwt": security.create_access_token(
                data={"sub": service_id, "scope": requested_scope, "type": "service"},
                expires_delta=timedelta(hours=24)
            )
        }
        
        return {
            "opaque_token": opaque_token,
            "expires_at": expires_at.isoformat(),
            "scope": requested_scope
        }
        
    except Exception as e:
        print(f"Service auth error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Service authentication failed")

# Token exchange endpoint
@app.post("/api/v1/auth/exchange")
async def exchange_token(request: Request):
    """Exchange opaque token for JWT"""
    try:
        exchange_request = await request.json()
        opaque_token = exchange_request.get("opaque_token")
        requested_scope = exchange_request.get("scope", "basic")
        
        if not opaque_token:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing opaque token")
        
        # Get token info
        token_info = token_store.get(opaque_token)
        if not token_info:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
        
        # Check if token is expired
        if token_info['expires_at'] < datetime.utcnow():
            del token_store[opaque_token]
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
        
        # Check scope
        if requested_scope not in token_info['scope']:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient scope")
        
        return {
            "access_token": token_info['jwt'],
            "scope": token_info['scope'],
            "expires_at": token_info['expires_at'].isoformat()
        }
        
    except Exception as e:
        print(f"Token exchange error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token exchange failed")

# Permission endpoints
@app.get("/api/v1/permissions/user/{user_id}")
async def get_user_permissions(user_id: str, permission_service: PermissionService = Depends(get_permission_service)):
    """Get user permissions"""
    try:
        permissions = await permission_service.get_user_permissions(user_id)
        return {"user_id": user_id, "permissions": permissions}
    except Exception as e:
        print(f"Failed to get user permissions: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get permissions")

@app.get("/api/v1/permissions/check")
async def check_permission(
    user_id: str, 
    resource: str, 
    action: str, 
    permission_service: PermissionService = Depends(get_permission_service)
):
    """Check if user has permission for resource/action"""
    try:
        has_permission = await permission_service.check_permission(user_id, resource, action)
        return {
            "user_id": user_id,
            "resource": resource,
            "action": action,
            "has_permission": has_permission
        }
    except Exception as e:
        print(f"Failed to check permission: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to check permission")

# Utility functions
def validate_service_credentials(service_id: str, service_secret: str) -> bool:
    """Validate service credentials (simplified for MVP)"""
    # In production, check against service registry
    # For now, allow common service IDs
    allowed_services = ["analytics-service", "api-gateway", "frontend"]
    return service_id in allowed_services

def validate_service_scope(service_id: str, requested_scope: str) -> bool:
    """Validate if service has permission for requested scope"""
    # For now, allow analytics service to access analytics scopes
    if service_id == "analytics-service" and requested_scope.startswith("analytics:"):
        return True
    
    # Allow API gateway to access analytics scopes
    if service_id == "api-gateway" and requested_scope.startswith("analytics:"):
        return True
    
    # Allow public analytics access
    if requested_scope.startswith("analytics:public"):
        return True
    
    return False

# Include auth router
from app.api.auth import router as auth_router
app.include_router(auth_router, prefix="/api/v1")

# Include other routers
from app.api.users import router as users_router
app.include_router(users_router, prefix="/api/v1")

from app.api.tenants import router as tenants_router
app.include_router(tenants_router, prefix="/api/v1")

from app.api.roles import router as roles_router
app.include_router(roles_router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
