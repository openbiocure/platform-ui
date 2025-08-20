from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import uuid
from datetime import datetime

# Basic configuration
SERVICE_NAME = "analytics-service"
VERSION = "1.0.0"
DEBUG = True

# Initialize FastAPI app
app = FastAPI(
    title="OpenBioCure Analytics Service",
    description="Data analytics and metrics microservice for OpenBioCure platform",
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
    return {
        "service": SERVICE_NAME,
        "version": VERSION,
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "not_configured",
        "features": {
            "usage_tracking": True,
            "performance_metrics": True,
            "user_analytics": True,
            "dashboard_reports": True
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

@app.get("/api/v1/metrics")
async def get_metrics():
    """Get system metrics"""
    return {
        "metrics": {
            "total_users": 0,
            "active_sessions": 0,
            "api_calls_today": 0,
            "error_rate": 0.0
        },
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8002,  # Analytics service on port 8002
        reload=DEBUG
    )
