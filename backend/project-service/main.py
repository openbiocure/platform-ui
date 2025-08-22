#!/usr/bin/env python3
"""
Project Service - Main Entry Point
Manages research projects, publications, insights, and workflows
"""
import os
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from datetime import datetime
import uuid

# Basic configuration
SERVICE_NAME = "project-service"
VERSION = "1.0.0"
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

# Initialize FastAPI app
app = FastAPI(
    title="OpenBioCure Project Service",
    description="Manages research projects, publications, insights, and research workflows",
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
    correlation_id = request.headers.get("x-correlation-id") or str(uuid.uuid4())
    request.state.correlation_id = correlation_id
    
    response = await call_next(request)
    response.headers["x-correlation-id"] = correlation_id
    return response

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for load balancers"""
    return {
        "service": SERVICE_NAME,
        "version": VERSION,
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected",  # TODO: Add actual DB health check
        "features": {
            "project_management": True,
            "research_insights": True,
            "publication_tracking": True,
            "workflow_management": True,
            "ai_analysis": True
        }
    }

# TODO: Add API routes
# app.include_router(projects_router)
# app.include_router(publications_router)
# app.include_router(insights_router)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unexpected errors"""
    correlation_id = getattr(request.state, 'correlation_id', 'unknown')
    
    logging.error(f"Unhandled exception: {exc}", extra={
        "correlation_id": correlation_id,
        "path": request.url.path,
        "method": request.method
    })
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "correlation_id": correlation_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.DEBUG if DEBUG else logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Run the service
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8003,  # Different port from auth (8001) and analytics (8002)
        reload=DEBUG,
        log_level="debug" if DEBUG else "info"
    )
