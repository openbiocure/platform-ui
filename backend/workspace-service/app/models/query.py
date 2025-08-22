"""
Query and conversation models with tenant isolation.
"""

from sqlalchemy import Column, String, DateTime, Integer, Boolean, Text, JSON, Float, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID as pg_UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid
from enum import Enum
from typing import List, Optional


class QueryScope(str, Enum):
    """Query scope for vector store routing."""
    PRIVATE = "private"      # ws:userId only
    PROJECT = "project"      # proj:projectId only  
    GLOBAL = "global"        # global:tenantId only
    MULTI = "multi"          # Cross-scope with tenant isolation


class QueryStatus(str, Enum):
    """Query processing status."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Query(Base):
    """
    Query model for RAG-powered research questions.
    Maintains tenant isolation and tracks cross-service orchestration.
    """
    __tablename__ = "queries"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Tenant isolation - CRITICAL for security
    tenant_id = Column(pg_UUID(as_uuid=True), nullable=False, index=True)
    user_id = Column(pg_UUID(as_uuid=True), nullable=False, index=True)
    
    # Query content
    query = Column(Text, nullable=False)
    language = Column(String, default="en")
    
    # Scope and routing
    scope = Column(String, nullable=False)  # QueryScope enum
    scope_ids = Column(JSON, default=list)  # project IDs for project scope
    
    # Response
    answer = Column(Text, nullable=True)
    confidence = Column(Float, default=0.0)
    
    # Processing metadata
    status = Column(String, default=QueryStatus.PENDING)
    processing_error = Column(Text, nullable=True)
    vector_stores_queried = Column(JSON, default=list)  # List of vector store IDs queried
    
    # Performance metrics
    retrieval_time = Column(Float, default=0.0)  # Time to retrieve relevant documents
    synthesis_time = Column(Float, default=0.0)  # Time for LLM synthesis
    total_time = Column(Float, default=0.0)  # Total query processing time
    
    # Cross-service orchestration
    services_called = Column(JSON, default=list)  # [project-service, analytics-service, ai-service]
    service_responses = Column(JSON, default=dict)  # Aggregated responses from services
    
    # Context and conversation
    conversation_id = Column(pg_UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=True, index=True)
    follow_up_to = Column(pg_UUID(as_uuid=True), ForeignKey("queries.id"), nullable=True)
    
    # User interaction
    is_saved = Column(Boolean, default=False)
    saved_title = Column(String, nullable=True)
    user_rating = Column(Integer, nullable=True)  # 1-5 star rating
    user_feedback = Column(Text, nullable=True)
    
    # Analytics and insights
    cited_documents_count = Column(Integer, default=0)
    result_clicked = Column(Boolean, default=False)
    shared_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    conversation = relationship("Conversation", back_populates="queries")
    citations = relationship("Citation", back_populates="query", cascade="all, delete-orphan")
    follow_ups = relationship("Query", remote_side=[id])
    
    def __repr__(self):
        return f"<Query(id={self.id}, scope={self.scope}, tenant_id={self.tenant_id})>"


class Conversation(Base):
    """
    Conversation model for maintaining context across multiple queries.
    Enables follow-up questions and contextual research assistance.
    """
    __tablename__ = "conversations"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Tenant isolation
    tenant_id = Column(pg_UUID(as_uuid=True), nullable=False, index=True)
    user_id = Column(pg_UUID(as_uuid=True), nullable=False, index=True)
    
    # Conversation metadata
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Context management
    context = Column(JSON, default=dict)  # Conversation context and memory
    primary_scope = Column(String, nullable=True)  # Most common scope in conversation
    research_topics = Column(JSON, default=list)  # Auto-extracted research topics
    
    # Status and organization
    is_active = Column(Boolean, default=True)
    is_archived = Column(Boolean, default=False)
    is_shared = Column(Boolean, default=False)  # Can be shared within projects
    
    # Analytics
    query_count = Column(Integer, default=0)
    total_interaction_time = Column(Float, default=0.0)
    avg_query_rating = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    queries = relationship("Query", back_populates="conversation", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Conversation(id={self.id}, title={self.title}, user_id={self.user_id})>"


class Citation(Base):
    """
    Citation model for tracking document references in query responses.
    Maintains source attribution and enables document discovery.
    """
    __tablename__ = "citations"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    query_id = Column(pg_UUID(as_uuid=True), ForeignKey("queries.id"), nullable=False, index=True)
    
    # Document reference
    document_id = Column(pg_UUID(as_uuid=True), nullable=False, index=True)
    document_version_id = Column(pg_UUID(as_uuid=True), nullable=True)  # Specific version cited
    document_title = Column(String, nullable=False)
    
    # Content reference
    chunk_id = Column(String, nullable=True)  # Vector store chunk ID
    content = Column(Text, nullable=False)  # Actual cited content
    page_number = Column(Integer, nullable=True)
    section = Column(String, nullable=True)
    
    # Relevance and ranking
    relevance_score = Column(Float, nullable=False)
    rank_position = Column(Integer, nullable=False)  # Position in results (1, 2, 3...)
    
    # Source tracking
    source_type = Column(String, nullable=False)  # private, project, global
    source_id = Column(String, nullable=True)  # project_id or tenant_id for context
    vector_store_id = Column(String, nullable=False)  # Which vector store provided this
    
    # User interaction
    clicked = Column(Boolean, default=False)
    helpful_rating = Column(Integer, nullable=True)  # 1-5 rating for citation helpfulness
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    query = relationship("Query", back_populates="citations")
    
    def __repr__(self):
        return f"<Citation(query_id={self.query_id}, document_title={self.document_title}, score={self.relevance_score})>"


class SavedSearch(Base):
    """
    Saved search model for reusable queries and research workflows.
    """
    __tablename__ = "saved_searches"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Tenant isolation
    tenant_id = Column(pg_UUID(as_uuid=True), nullable=False, index=True)
    user_id = Column(pg_UUID(as_uuid=True), nullable=False, index=True)
    
    # Search configuration
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    query_template = Column(Text, nullable=False)  # Can include variables like {topic}
    scope = Column(String, nullable=False)
    scope_ids = Column(JSON, default=list)
    
    # Execution settings
    auto_run_frequency = Column(String, nullable=True)  # daily, weekly, monthly
    last_run = Column(DateTime(timezone=True), nullable=True)
    next_run = Column(DateTime(timezone=True), nullable=True)
    
    # Organization
    category = Column(String, nullable=True)  # literature_review, methodology, data_analysis
    tags = Column(JSON, default=list)
    is_public = Column(Boolean, default=False)  # Can be shared within tenant
    
    # Usage analytics
    run_count = Column(Integer, default=0)
    avg_result_rating = Column(Float, default=0.0)
    last_used = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<SavedSearch(id={self.id}, title={self.title}, user_id={self.user_id})>"
