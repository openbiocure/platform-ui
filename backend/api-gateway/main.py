from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
import uvicorn
import uuid
import httpx
from datetime import datetime
from typing import Dict, Any

# Basic configuration
SERVICE_NAME = "api-gateway"
VERSION = "1.0.0"
DEBUG = True

# Service registry
SERVICES = {
    "auth": "http://localhost:8001",
    "analytics": "http://localhost:8002"
}

# Initialize FastAPI app
app = FastAPI(
    title="OpenBioCure API Gateway",
    description="Main API gateway for OpenBioCure platform - routes requests to microservices",
    version=VERSION,
    docs_url="/docs" if DEBUG else None,
    redoc_url="/redoc" if DEBUG else None
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://app.openbiocure.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Request correlation middleware
@app.middleware("http")
async def add_correlation_id(request: Request, call_next):
    """Add correlation ID to all requests for tracking"""
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    request.state.correlation_id = correlation_id
    
    response = await call_next(request)
    response.headers["X-Correlation-ID"] = correlation_id
    return response

@app.get("/")
async def root():
    """Service health check"""
    return {
        "service": SERVICE_NAME,
        "version": VERSION,
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check for monitoring"""
    # Check downstream services
    service_status = {}
    for service_name, service_url in SERVICES.items():
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{service_url}/health", timeout=2.0)
                service_status[service_name] = "healthy" if response.status_code == 200 else "unhealthy"
        except:
            service_status[service_name] = "unreachable"
    
    overall_status = "healthy" if all(status == "healthy" for status in service_status.values()) else "degraded"
    
    return {
        "service": SERVICE_NAME,
        "version": VERSION,
        "status": overall_status,
        "timestamp": datetime.utcnow().isoformat(),
        "downstream_services": service_status,
        "features": {
            "request_routing": True,
            "load_balancing": False,
            "authentication_proxy": True,
            "rate_limiting": False
        }
    }

@app.get("/api/v1/health")
async def api_health():
    """API health check"""
    return {
        "api_version": "v1",
        "service": SERVICE_NAME,
        "status": "operational",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/v1/services")
async def list_services():
    """List available services"""
    return {
        "services": list(SERVICES.keys()),
        "service_registry": SERVICES,
        "timestamp": datetime.utcnow().isoformat()
    }

# Auth service proxy routes
@app.api_route("/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_auth(request: Request, path: str):
    """Proxy requests to auth service"""
    try:
        async with httpx.AsyncClient() as client:
            # Get request body if present
            body = None
            if request.method in ["POST", "PUT", "PATCH"]:
                try:
                    body = await request.body()
                except:
                    body = None
            
            url = f"{SERVICES['auth']}/auth/{path}"
            response = await client.request(
                method=request.method,
                url=url,
                params=request.query_params,
                headers={k: v for k, v in request.headers.items() if k.lower() != 'host'},
                content=body,
                timeout=10.0
            )
            
            # Return response with proper content type
            if response.headers.get("content-type", "").startswith("application/json"):
                return JSONResponse(
                    content=response.json(),
                    status_code=response.status_code,
                    headers={k: v for k, v in response.headers.items() if k.lower() not in ['content-length', 'transfer-encoding']}
                )
            else:
                return Response(
                    content=response.content,
                    status_code=response.status_code,
                    headers={k: v for k, v in response.headers.items() if k.lower() not in ['content-length', 'transfer-encoding']}
                )
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Auth service unavailable: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proxy error: {str(e)}")

# Example proxy route to analytics service
@app.api_route("/analytics/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_analytics(request: Request, path: str):
    """Proxy requests to analytics service"""
    try:
        async with httpx.AsyncClient() as client:
            url = f"{SERVICES['analytics']}/{path}"
            response = await client.request(
                method=request.method,
                url=url,
                params=request.query_params,
                headers=dict(request.headers),
                timeout=10.0
            )
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text,
                status_code=response.status_code
            )
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Analytics service unavailable")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,  # API Gateway on port 8000
        reload=DEBUG
    )
