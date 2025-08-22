"""
Vector store-related Pydantic schemas.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

from app.models.vector_store import VectorStoreType, VectorStoreHealth


class VectorStoreResponse(BaseModel):
    """Schema for vector store information."""
    id: str
    store_type: str
    namespace: str
    tenant_id: UUID
    name: str
    description: Optional[str]
    
    # Statistics
    document_count: int
    vector_count: int
    total_chunks: int
    
    # Health
    health: str
    last_health_check: Optional[datetime]
    avg_query_time: float
    
    # Configuration
    embedding_model: str
    chunk_size: int
    chunk_overlap: int
    similarity_threshold: float
    
    # Index info
    elasticsearch_index: str
    last_reindex: Optional[datetime]
    reindex_in_progress: bool
    
    # Access
    is_active: bool
    access_level: str
    
    # Performance
    cache_enabled: bool
    cache_ttl: int
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    last_accessed: Optional[datetime]
    
    class Config:
        from_attributes = True


class DocumentVectorResponse(BaseModel):
    """Schema for document vector information."""
    id: UUID
    vector_store_id: str
    document_id: UUID
    document_version_id: Optional[UUID]
    chunk_id: str
    chunk_index: int
    content: str
    elasticsearch_doc_id: str
    embedding_hash: Optional[str]
    
    # Content metadata
    word_count: int
    char_count: int
    page_number: Optional[int]
    section_title: Optional[str]
    
    # Processing
    extraction_method: str
    processing_version: str
    quality_score: float
    
    # Analytics
    query_count: int
    citation_count: int
    avg_relevance_score: float
    last_retrieved: Optional[datetime]
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class VectorMetadataResponse(BaseModel):
    """Schema for vector metadata."""
    id: UUID
    document_vector_id: UUID
    
    # Document context
    document_title: Optional[str]
    document_author: Optional[str]
    document_date: Optional[datetime]
    document_type: Optional[str]
    
    # Content analysis
    entities: List[str]
    keywords: List[str]
    topics: List[str]
    sentiment: Optional[float]
    
    # Research classification
    research_areas: List[str]
    methodologies: List[str]
    data_types: List[str]
    
    # Citation info
    references: List[Dict[str, Any]]
    citations: List[Dict[str, Any]]
    
    # Language and formatting
    language: str
    formatting: Dict[str, Any]
    tables: List[Dict[str, Any]]
    figures: List[Dict[str, Any]]
    
    # Quality
    coherence_score: float
    completeness_score: float
    readability_score: float
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class VectorSearchRequest(BaseModel):
    """Schema for vector similarity search."""
    query: str = Field(..., min_length=1, max_length=1000)
    store_ids: Optional[List[str]] = Field(None, description="Specific stores to search")
    limit: int = Field(10, ge=1, le=100)
    similarity_threshold: Optional[float] = Field(None, ge=0.0, le=1.0)
    include_metadata: bool = Field(True, description="Include vector metadata")
    filters: Optional[Dict[str, Any]] = Field(None, description="Additional filters")


class VectorSearchResult(BaseModel):
    """Schema for vector search result."""
    document_vector: DocumentVectorResponse
    similarity_score: float
    rank: int
    metadata: Optional[VectorMetadataResponse] = None


class VectorSearchResponse(BaseModel):
    """Schema for vector search response."""
    query: str
    results: List[VectorSearchResult]
    total_found: int
    search_time: float
    stores_searched: List[str]
    filters_applied: Dict[str, Any]


class VectorStoreStatsResponse(BaseModel):
    """Schema for vector store statistics."""
    store_id: str
    total_documents: int
    total_vectors: int
    total_chunks: int
    avg_chunk_size: int
    storage_size_mb: float
    
    # Performance metrics
    avg_query_time: float
    queries_per_day: int
    cache_hit_rate: float
    
    # Health metrics
    health_score: float
    last_health_check: datetime
    error_rate: float
    
    # Usage patterns
    popular_queries: List[str]
    active_users: int
    peak_usage_hours: List[int]


class VectorStoreHealthCheckResponse(BaseModel):
    """Schema for vector store health check."""
    store_id: str
    health: VectorStoreHealth
    checks: Dict[str, bool]
    issues: List[str]
    recommendations: List[str]
    last_check: datetime
    
    class Config:
        use_enum_values = True


class VectorIndexingRequest(BaseModel):
    """Schema for vector indexing request."""
    document_id: UUID
    document_version_id: Optional[UUID] = None
    force_reindex: bool = Field(False, description="Force reindexing even if exists")
    priority: str = Field("normal", description="Processing priority: low, normal, high")


class VectorIndexingResponse(BaseModel):
    """Schema for vector indexing response."""
    document_id: UUID
    job_id: str
    status: str
    estimated_time: Optional[int]
    progress: Dict[str, Any]
    
    
class VectorStoreReindexRequest(BaseModel):
    """Schema for store reindexing request."""
    store_id: str
    full_reindex: bool = Field(False, description="Full reindex vs incremental")
    batch_size: int = Field(100, ge=1, le=1000)
    priority: str = Field("normal", description="Processing priority")


class VectorStoreReindexResponse(BaseModel):
    """Schema for store reindexing response."""
    store_id: str
    job_id: str
    reindex_type: str
    estimated_time: Optional[int]
    progress: Dict[str, Any]
    
    
class VectorStoreAnalyticsResponse(BaseModel):
    """Schema for vector store analytics."""
    store_id: str
    date_range: Dict[str, datetime]
    
    # Usage metrics
    total_queries: int
    unique_users: int
    avg_queries_per_user: float
    
    # Performance metrics
    avg_response_time: float
    p95_response_time: float
    error_rate: float
    
    # Content metrics
    documents_added: int
    documents_removed: int
    vectors_created: int
    
    # User behavior
    popular_query_types: List[Dict[str, Any]]
    peak_usage_patterns: Dict[str, Any]
    user_satisfaction: float
    
    
class VectorOptimizationRequest(BaseModel):
    """Schema for vector store optimization."""
    store_id: str
    optimization_type: str = Field("performance", description="performance, storage, accuracy")
    parameters: Optional[Dict[str, Any]] = None
    
    
class VectorOptimizationResponse(BaseModel):
    """Schema for optimization response."""
    store_id: str
    optimization_id: str
    type: str
    status: str
    progress: float
    estimated_completion: Optional[datetime]
    improvements: Dict[str, Any]
