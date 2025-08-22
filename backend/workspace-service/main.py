"""
Workspace Service - Central RAG Orchestrator
FastAPI application entry point.
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import get_settings
from app.core.database import init_db, close_db, get_db
from app.api import documents, queries, dashboard, vector_stores
from app.services import DocumentService, QueryService, RAGOrchestrator, VectorService
from app.repositories import (
    DocumentRepository, 
    QueryRepository, 
    VectorStoreRepository,
    DocumentVectorRepository
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("workspace-service.log")
    ]
)

logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management."""
    # Startup
    logger.info("Starting Workspace Service...")
    
    try:
        # Initialize database
        init_db()
        logger.info("Database initialized")
        
        # Initialize vector stores and other resources
        # await initialize_vector_stores()
        
        logger.info("Workspace Service started successfully")
        yield
        
    except Exception as e:
        logger.error(f"Failed to start service: {e}")
        raise
    
    finally:
        # Shutdown
        logger.info("Shutting down Workspace Service...")
        close_db()
        logger.info("Workspace Service shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="Workspace Service",
    description="Central RAG Orchestrator for OpenBioCure Platform",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure appropriately for production
)


# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": "2024-01-01T00:00:00Z"  # In real app, use datetime.utcnow()
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "timestamp": "2024-01-01T00:00:00Z"
        }
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "workspace-service",
        "version": "1.0.0",
        "timestamp": "2024-01-01T00:00:00Z"
    }


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Workspace Service - Central RAG Orchestrator",
        "version": "1.0.0",
        "docs": "/docs" if settings.debug else "Documentation not available in production"
    }


# Include API routers
app.include_router(
    documents.router,
    prefix=f"{settings.api_prefix}/documents",
    tags=["documents"]
)

app.include_router(
    queries.router,
    prefix=f"{settings.api_prefix}/queries",
    tags=["queries"]
)

app.include_router(
    dashboard.router,
    prefix=f"{settings.api_prefix}/dashboard",
    tags=["dashboard"]
)

app.include_router(
    vector_stores.router,
    prefix=f"{settings.api_prefix}/vectors",
    tags=["vector-stores"]
)


# Dependency injection for services
def get_document_service(db = Depends(get_db)) -> DocumentService:
    """Get document service instance."""
    from app.repositories.document_repository import (
        DocumentRepository, 
        DocumentVersionRepository, 
        DocumentPermissionRepository
    )
    
    doc_repo = DocumentRepository(db)
    version_repo = DocumentVersionRepository(db)
    permission_repo = DocumentPermissionRepository(db)
    
    return DocumentService(db, doc_repo, version_repo, permission_repo)


def get_query_service(db = Depends(get_db)) -> QueryService:
    """Get query service instance."""
    from app.repositories.query_repository import (
        QueryRepository,
        ConversationRepository, 
        CitationRepository,
        SavedSearchRepository
    )
    from app.repositories.vector_store_repository import VectorStoreRepository, DocumentVectorRepository
    
    query_repo = QueryRepository(db)
    conversation_repo = ConversationRepository(db)
    citation_repo = CitationRepository(db)
    saved_search_repo = SavedSearchRepository(db)
    
    vector_store_repo = VectorStoreRepository(db)
    doc_vector_repo = DocumentVectorRepository(db)
    
    rag_orchestrator = RAGOrchestrator(vector_store_repo, doc_vector_repo)
    
    return QueryService(
        db, query_repo, conversation_repo, citation_repo, saved_search_repo, rag_orchestrator
    )


def get_vector_service(db = Depends(get_db)):
    """Get vector service instance."""
    # This would be implemented when we create the vector service
    pass


# Authentication and authorization dependencies
async def get_current_user(authorization: str = None) -> dict:
    """
    Get current user from JWT token.
    This would integrate with the auth service.
    """
    # Mock user for development
    return {
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
        "email": "scholar@example.com",
        "role": "scholar"
    }


async def verify_tenant_access(user: dict = Depends(get_current_user), tenant_id: str = None):
    """Verify user has access to the specified tenant."""
    if tenant_id and user["tenant_id"] != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access to tenant denied"
        )
    return user


if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"Starting Workspace Service on {settings.api_host}:{settings.api_port}")
    
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
