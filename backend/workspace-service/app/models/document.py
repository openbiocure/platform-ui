"""
Document management models with tenant isolation and version control.
"""

from sqlalchemy import Column, String, DateTime, Integer, Boolean, Text, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID as pg_UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid
from enum import Enum
from typing import Optional
from sqlalchemy import Float


class DocumentStatus(str, Enum):
    """Document processing status."""
    UPLOADING = "uploading"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"
    ARCHIVED = "archived"


class DocumentType(str, Enum):
    """Document type classification."""
    RESEARCH_PAPER = "research_paper"
    DATA_FILE = "data_file"
    PROTOCOL = "protocol"
    REPORT = "report"
    PRESENTATION = "presentation"
    OTHER = "other"


class Document(Base):
    """
    Main document model with tenant isolation.
    Each document belongs to a specific user within a tenant.
    """
    __tablename__ = "documents"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Tenant isolation - CRITICAL for security
    tenant_id = Column(pg_UUID(as_uuid=True), nullable=False, index=True)
    uploader_id = Column(pg_UUID(as_uuid=True), nullable=False, index=True)
    
    # Document metadata
    title = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # pdf, doc, docx, etc.
    file_size = Column(Integer, nullable=False)  # in bytes
    mime_type = Column(String, nullable=False)
    
    # Classification
    document_type = Column(String, default=DocumentType.OTHER)
    tags = Column(JSON, default=list)  # List of tags
    
    # Content metadata
    page_count = Column(Integer, nullable=True)
    word_count = Column(Integer, nullable=True)
    language = Column(String, default="en")
    
    # Processing status
    status = Column(String, default=DocumentStatus.UPLOADING)
    processing_error = Column(Text, nullable=True)
    
    # Version management
    latest_version_id = Column(pg_UUID(as_uuid=True), nullable=True)
    version_count = Column(Integer, default=1)
    
    # Privacy and sharing
    is_private = Column(Boolean, default=True)  # Always starts private
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")
    permissions = relationship("DocumentPermission", back_populates="document", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Document(id={self.id}, title={self.title}, tenant_id={self.tenant_id})>"


class DocumentVersion(Base):
    """
    Document version model for tracking document evolution.
    Each version has its own MinIO path and vector embeddings.
    """
    __tablename__ = "document_versions"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(pg_UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False, index=True)
    
    # Version information
    version_number = Column(Integer, nullable=False)
    change_description = Column(Text, nullable=True)
    is_latest = Column(Boolean, default=False, index=True)
    
    # Storage paths (versioned)
    minio_path = Column(String, nullable=False)  # ws-{userId}/documents/file-v{version}.pdf
    minio_bucket = Column(String, nullable=False)
    
    # Content extraction
    extracted_text = Column(Text, nullable=True)
    text_chunks = Column(JSON, default=list)  # List of text chunks for vector processing
    
    # Vector processing
    vector_store_id = Column(String, nullable=True)  # Reference to vector store entry
    embedding_status = Column(String, default="pending")  # pending, processing, ready, failed
    embedding_error = Column(Text, nullable=True)
    chunk_count = Column(Integer, default=0)
    
    # File metadata for this version
    file_size = Column(Integer, nullable=False)
    file_hash = Column(String, nullable=True)  # SHA-256 hash for deduplication
    
    # Processing metadata
    extracted_entities = Column(JSON, default=list)  # Named entities extracted from text
    extracted_keywords = Column(JSON, default=list)  # Keywords/keyphrases
    summary = Column(Text, nullable=True)  # Auto-generated summary
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    document = relationship("Document", back_populates="versions")
    
    def __repr__(self):
        return f"<DocumentVersion(id={self.id}, document_id={self.document_id}, version={self.version_number})>"


class DocumentPermission(Base):
    """
    Document permission model for project sharing.
    Controls access when documents are added to projects.
    Maintains tenant isolation - users can only share within their tenant.
    """
    __tablename__ = "document_permissions"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(pg_UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False, index=True)
    
    # Project sharing (tenant-isolated)
    project_id = Column(pg_UUID(as_uuid=True), nullable=True, index=True)
    
    # Permission levels
    permission_type = Column(String, nullable=False)  # read, write, admin
    granted_by = Column(pg_UUID(as_uuid=True), nullable=False)  # User who granted permission
    granted_to = Column(pg_UUID(as_uuid=True), nullable=True)  # Specific user (optional)
    
    # Access control
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Vector store synchronization
    synced_to_project_store = Column(Boolean, default=False)
    sync_error = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    document = relationship("Document", back_populates="permissions")
    
    def __repr__(self):
        return f"<DocumentPermission(document_id={self.document_id}, project_id={self.project_id})>"


class DocumentAnalytics(Base):
    """
    Document analytics for tracking usage and insights.
    Helps with personalized recommendations and research patterns.
    """
    __tablename__ = "document_analytics"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(pg_UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False, index=True)
    
    # Usage metrics
    view_count = Column(Integer, default=0)
    query_count = Column(Integer, default=0)  # How many times referenced in queries
    download_count = Column(Integer, default=0)
    share_count = Column(Integer, default=0)
    
    # Research insights
    cited_in_queries = Column(JSON, default=list)  # List of query IDs that cited this document
    research_topics = Column(JSON, default=list)  # Auto-extracted research topics
    collaboration_score = Column(Integer, default=0)  # How often shared/discussed
    
    # Quality metrics
    relevance_score = Column(Float, default=0.0)  # Based on user interactions
    completeness_score = Column(Float, default=0.0)  # Content quality assessment
    
    # Last activity
    last_accessed = Column(DateTime(timezone=True), nullable=True)
    last_queried = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<DocumentAnalytics(document_id={self.document_id}, views={self.view_count})>"
