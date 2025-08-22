from fastapi import FastAPI, Request, WebSocket, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import uvicorn
import uuid
import asyncio
from datetime import datetime

from app.core.database import get_db, create_tables, check_database_health
from app.api.analytics import router as analytics_router
from app.api.websocket import websocket_endpoint, cleanup_stale_connections, manager

# Basic configuration
SERVICE_NAME = "analytics-service"
VERSION = "1.0.0"
DEBUG = True

# Initialize FastAPI app
app = FastAPI(
    title="OpenBioCure Analytics Service",
    description="Self-hosted analytics and metrics microservice for OpenBioCure platform",
    version=VERSION,
    docs_url="/docs" if DEBUG else None,
    redoc_url="/redoc" if DEBUG else None
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000", "https://app.openbiocure.com"],
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

# Include analytics router
app.include_router(analytics_router)

@app.get("/")
async def root():
    """Service health check"""
    db_healthy = check_database_health()
    return {
        "service": SERVICE_NAME,
        "version": VERSION,
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected" if db_healthy else "disconnected",
        "websocket_connections": manager.get_active_connections_count()
    }

@app.get("/health")
async def health_check():
    """Detailed health check for monitoring"""
    db_healthy = check_database_health()
    connection_stats = manager.get_connection_stats()
    
    return {
        "service": SERVICE_NAME,
        "version": VERSION,
        "status": "healthy" if db_healthy else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected" if db_healthy else "disconnected",
        "websocket": {
            "total_connections": connection_stats["total_connections"],
            "active_tenants": connection_stats["active_tenants"]
        },
        "features": {
            "real_time_analytics": True,
            "batch_processing": True,
            "websocket_streaming": True,
            "tenant_isolation": True,
            "offline_support": True
        }
    }

@app.get("/api/v1/health")
async def api_health():
    """API health check"""
    return {
        "service": SERVICE_NAME,
        "version": VERSION,
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

# WebSocket endpoint
@app.websocket("/ws/analytics")
async def websocket_analytics(
    websocket: WebSocket,
    tenant_id: str = Query(..., description="Tenant ID"),
    user_id: str = Query(None, description="User ID"),
    db: Session = Depends(get_db)
):
    """WebSocket endpoint for real-time analytics"""
    await websocket_endpoint(websocket, tenant_id, user_id, db)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize service on startup"""
    try:
        # Create database tables
        create_tables()
        
        # Start background cleanup task
        asyncio.create_task(cleanup_stale_connections())
        
        print(f"🚀 {SERVICE_NAME} v{VERSION} started successfully")
        print(f"📊 Analytics API: http://localhost:8002/api/v1/analytics")
        print(f"🔌 WebSocket: ws://localhost:8002/ws/analytics")
        print(f"📚 Documentation: http://localhost:8002/docs")
        
    except Exception as e:
        print(f"❌ Failed to start service: {e}")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print(f"🛑 {SERVICE_NAME} shutting down...")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8002,  # Analytics service on port 8002
        reload=DEBUG
    )