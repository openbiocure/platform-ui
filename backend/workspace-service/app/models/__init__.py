"""Data models for workspace service."""

from .document import (
    Document, 
    DocumentVersion, 
    DocumentPermission, 
    DocumentAnalytics,
    DocumentStatus,
    DocumentType
)
from .query import (
    Query, 
    Conversation, 
    Citation, 
    SavedSearch,
    QueryScope,
    QueryStatus
)
from .vector_store import (
    VectorStore, 
    DocumentVector, 
    VectorMetadata,
    VectorSearchIndex,
    VectorStoreAnalytics,
    VectorStoreType,
    VectorStoreHealth
)

__all__ = [
    # Document models
    "Document",
    "DocumentVersion", 
    "DocumentPermission",
    "DocumentAnalytics",
    "DocumentStatus",
    "DocumentType",
    
    # Query models
    "Query",
    "Conversation",
    "Citation",
    "SavedSearch",
    "QueryScope",
    "QueryStatus",
    
    # Vector store models
    "VectorStore",
    "DocumentVector",
    "VectorMetadata",
    "VectorSearchIndex",
    "VectorStoreAnalytics",
    "VectorStoreType",
    "VectorStoreHealth",
]
