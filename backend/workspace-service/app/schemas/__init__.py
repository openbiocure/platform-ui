"""Pydantic schemas for workspace service API."""

from .document import (
    DocumentCreate,
    DocumentUpdate,
    DocumentResponse,
    DocumentVersionResponse,
    DocumentPermissionCreate,
    DocumentUploadResponse
)
from .query import (
    QueryCreate,
    QueryResponse,
    ConversationCreate,
    ConversationResponse,
    CitationResponse,
    SavedSearchCreate,
    SavedSearchResponse
)
from .vector_store import (
    VectorStoreResponse,
    DocumentVectorResponse,
    VectorMetadataResponse
)
from .dashboard import (
    DashboardResponse,
    ProjectSummaryResponse,
    AIInsightResponse,
    ResearchTrendResponse
)

__all__ = [
    # Document schemas
    "DocumentCreate",
    "DocumentUpdate", 
    "DocumentResponse",
    "DocumentVersionResponse",
    "DocumentPermissionCreate",
    "DocumentUploadResponse",
    
    # Query schemas
    "QueryCreate",
    "QueryResponse",
    "ConversationCreate",
    "ConversationResponse", 
    "CitationResponse",
    "SavedSearchCreate",
    "SavedSearchResponse",
    
    # Vector store schemas
    "VectorStoreResponse",
    "DocumentVectorResponse",
    "VectorMetadataResponse",
    
    # Dashboard schemas
    "DashboardResponse",
    "ProjectSummaryResponse",
    "AIInsightResponse",
    "ResearchTrendResponse",
]
