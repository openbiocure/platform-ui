from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import uuid
from datetime import datetime

from app.core.config import settings

# Import database only if needed
try:
    from app.core.database import engine, Base
    DATABASE_AVAILABLE = True
except Exception as e:
    print(f"Database connection failed: {e}")
    print("Running in database-free mode for development")
    DATABASE_AVAILABLE = False

# Import API routes
try:
    from app.api import auth_router, users_router, tenants_router
    API_AVAILABLE = True
except Exception as e:
    print(f"API routes failed to load: {e}")
    print("Running with basic routes only")
    API_AVAILABLE = False

# Create database tables only if database is available
if DATABASE_AVAILABLE:
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Failed to create database tables: {e}")
        DATABASE_AVAILABLE = False

# Initialize FastAPI app
app = FastAPI(
    title="OpenBioCure Auth Service",
    description="Authentication and authorization microservice for OpenBioCure platform",
    version=settings.VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
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

# Include routers only if available
if API_AVAILABLE:
    try:
        app.include_router(auth_router)
        app.include_router(users_router)
        app.include_router(tenants_router)
        print("API routes loaded successfully")
    except Exception as e:
        print(f"Failed to load API routes: {e}")
        API_AVAILABLE = False

@app.get("/")
async def root():
    """Service health check"""
    return {
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check for monitoring"""
    return {
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "status": "healthy" if DATABASE_AVAILABLE else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected" if DATABASE_AVAILABLE else "disconnected",
        "api_routes": "loaded" if API_AVAILABLE else "failed",
        "features": {
            "multi_tenant_auth": DATABASE_AVAILABLE,
            "oauth_support": API_AVAILABLE,
            "jwt_tokens": API_AVAILABLE,
            "audit_logging": DATABASE_AVAILABLE,
            "tenant_isolation": settings.TENANT_ISOLATION_ENABLED and DATABASE_AVAILABLE
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,  # Auth service on port 8001
        reload=settings.DEBUG
    )
