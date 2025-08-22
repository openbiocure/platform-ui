"""
Vector store models for tenant-isolated document embeddings.
"""

from sqlalchemy import Column, String, DateTime, Integer, Boolean, Text, JSON, Float, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID as pg_UUID, ARRAY
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid
from enum import Enum
from typing import List, Dict, Any


class VectorStoreType(str, Enum):
    """Vector store types with tenant isolation."""
    PRIVATE = "private"      # ws:userId - Personal documents
    PROJECT = "project"      # proj:projectId - Project collaboration  
    GLOBAL = "global"        # global:tenantId - Tenant-wide knowledge


class VectorStoreHealth(str, Enum):
    """Vector store health status."""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    MAINTENANCE = "maintenance"


class VectorStore(Base):
    """
    Vector store metadata and management.
    Each store is tenant-isolated and serves different scopes.
    """
    __tablename__ = "vector_stores"
    
    id = Column(String, primary_key=True)  # ws:userId, proj:projectId, global:tenantId
    
    # Store classification
    store_type = Column(String, nullable=False)  # VectorStoreType enum
    namespace = Column(String, nullable=False, index=True)  # userId, projectId, or tenantId
    
    # Tenant isolation - CRITICAL
    tenant_id = Column(pg_UUID(as_uuid=True), nullable=False, index=True)
    
    # Store metadata
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Content statistics
    document_count = Column(Integer, default=0)
    vector_count = Column(Integer, default=0)
    total_chunks = Column(Integer, default=0)
    
    # Health and performance
    health = Column(String, default=VectorStoreHealth.HEALTHY)
    last_health_check = Column(DateTime(timezone=True), nullable=True)
    avg_query_time = Column(Float, default=0.0)
    
    # Configuration
    embedding_model = Column(String, nullable=False)
    chunk_size = Column(Integer, default=1000)
    chunk_overlap = Column(Integer, default=100)
    similarity_threshold = Column(Float, default=0.7)
    
    # Index management
    elasticsearch_index = Column(String, nullable=False)  # Actual ES index name
    last_reindex = Column(DateTime(timezone=True), nullable=True)
    reindex_in_progress = Column(Boolean, default=False)
    
    # Access control
    is_active = Column(Boolean, default=True)
    access_level = Column(String, default="private")  # private, project, tenant
    
    # Performance optimization
    cache_enabled = Column(Boolean, default=True)
    cache_ttl = Column(Integer, default=3600)  # Cache TTL in seconds
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_accessed = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    document_vectors = relationship("DocumentVector", back_populates="vector_store", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<VectorStore(id={self.id}, type={self.store_type}, tenant_id={self.tenant_id})>"


class DocumentVector(Base):
    """
    Individual document vector embeddings.
    Links documents to their vector representations in Elasticsearch.
    """
    __tablename__ = "document_vectors"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Store and document references
    vector_store_id = Column(String, ForeignKey("vector_stores.id"), nullable=False, index=True)
    document_id = Column(pg_UUID(as_uuid=True), nullable=False, index=True)
    document_version_id = Column(pg_UUID(as_uuid=True), nullable=True, index=True)
    
    # Chunk information
    chunk_id = Column(String, nullable=False, unique=True, index=True)  # Unique chunk identifier
    chunk_index = Column(Integer, nullable=False)  # Order within document
    content = Column(Text, nullable=False)  # Original text content
    
    # Vector data (stored in Elasticsearch, referenced here)
    elasticsearch_doc_id = Column(String, nullable=False)  # ES document ID
    embedding_hash = Column(String, nullable=True)  # Hash for deduplication
    
    # Content metadata
    word_count = Column(Integer, default=0)
    char_count = Column(Integer, default=0)
    page_number = Column(Integer, nullable=True)
    section_title = Column(String, nullable=True)
    
    # Processing information
    extraction_method = Column(String, default="direct")  # direct, ocr, tika
    processing_version = Column(String, default="1.0")
    quality_score = Column(Float, default=1.0)  # Text extraction quality
    
    # Usage analytics
    query_count = Column(Integer, default=0)  # How many times retrieved
    citation_count = Column(Integer, default=0)  # How many times cited
    avg_relevance_score = Column(Float, default=0.0)
    last_retrieved = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    vector_store = relationship("VectorStore", back_populates="document_vectors")
    metadata = relationship("VectorMetadata", back_populates="document_vector", uselist=False, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<DocumentVector(id={self.id}, chunk_id={self.chunk_id}, store={self.vector_store_id})>"


class VectorMetadata(Base):
    """
    Extended metadata for vector chunks including entities and keywords.
    """
    __tablename__ = "vector_metadata"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_vector_id = Column(pg_UUID(as_uuid=True), ForeignKey("document_vectors.id"), nullable=False, unique=True)
    
    # Document context
    document_title = Column(String, nullable=True)
    document_author = Column(String, nullable=True)
    document_date = Column(DateTime(timezone=True), nullable=True)
    document_type = Column(String, nullable=True)
    
    # Content analysis
    entities = Column(JSON, default=list)  # Named entities (persons, organizations, locations)
    keywords = Column(JSON, default=list)  # Extracted keywords and keyphrases
    topics = Column(JSON, default=list)  # Topic modeling results
    sentiment = Column(Float, nullable=True)  # Sentiment analysis score
    
    # Research classification
    research_areas = Column(JSON, default=list)  # Biomedical research categories
    methodologies = Column(JSON, default=list)  # Research methodologies mentioned
    data_types = Column(JSON, default=list)  # Types of data discussed
    
    # Citation and reference information
    references = Column(JSON, default=list)  # Extracted references
    citations = Column(JSON, default=list)  # Papers that cite this content
    
    # Language and formatting
    language = Column(String, default="en")
    formatting = Column(JSON, default=dict)  # Bold, italic, headers, etc.
    tables = Column(JSON, default=list)  # Table data if extracted
    figures = Column(JSON, default=list)  # Figure references and descriptions
    
    # Quality indicators
    coherence_score = Column(Float, default=0.0)  # Text coherence
    completeness_score = Column(Float, default=0.0)  # Information completeness
    readability_score = Column(Float, default=0.0)  # Text readability
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    document_vector = relationship("DocumentVector", back_populates="metadata")
    
    def __repr__(self):
        return f"<VectorMetadata(id={self.id}, document_vector_id={self.document_vector_id})>"


class VectorSearchIndex(Base):
    """
    Search index optimization and caching.
    Tracks popular queries and pre-computed results.
    """
    __tablename__ = "vector_search_indexes"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Index configuration
    vector_store_id = Column(String, ForeignKey("vector_stores.id"), nullable=False, index=True)
    index_name = Column(String, nullable=False)
    index_type = Column(String, default="similarity")  # similarity, keyword, hybrid
    
    # Query optimization
    common_queries = Column(JSON, default=list)  # Frequently asked questions
    cached_results = Column(JSON, default=dict)  # Pre-computed query results
    optimization_rules = Column(JSON, default=dict)  # Custom optimization rules
    
    # Performance metrics
    query_count = Column(Integer, default=0)
    avg_response_time = Column(Float, default=0.0)
    cache_hit_rate = Column(Float, default=0.0)
    
    # Maintenance
    last_optimization = Column(DateTime(timezone=True), nullable=True)
    optimization_in_progress = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<VectorSearchIndex(id={self.id}, store={self.vector_store_id}, type={self.index_type})>"


class VectorStoreAnalytics(Base):
    """
    Analytics for vector store usage and performance.
    Helps optimize retrieval and understand user behavior.
    """
    __tablename__ = "vector_store_analytics"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vector_store_id = Column(String, ForeignKey("vector_stores.id"), nullable=False, index=True)
    
    # Usage metrics
    daily_queries = Column(Integer, default=0)
    weekly_queries = Column(Integer, default=0)
    monthly_queries = Column(Integer, default=0)
    
    # Performance metrics
    avg_retrieval_time = Column(Float, default=0.0)
    avg_relevance_score = Column(Float, default=0.0)
    query_success_rate = Column(Float, default=0.0)
    
    # User behavior
    most_queried_topics = Column(JSON, default=list)
    popular_documents = Column(JSON, default=list)
    user_satisfaction = Column(Float, default=0.0)
    
    # System health
    error_count = Column(Integer, default=0)
    timeout_count = Column(Integer, default=0)
    reindex_count = Column(Integer, default=0)
    
    # Date tracking
    analytics_date = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<VectorStoreAnalytics(store={self.vector_store_id}, date={self.analytics_date})>"
