"""
Document-related Pydantic schemas for API validation.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum

from app.models.document import DocumentStatus, DocumentType


class DocumentUploadRequest(BaseModel):
    """Request schema for document upload."""
    change_description: Optional[str] = Field(None, description="Description of changes for new version")
    document_type: Optional[DocumentType] = Field(DocumentType.OTHER, description="Document classification")
    tags: Optional[List[str]] = Field(default_factory=list, description="Document tags")
    is_private: bool = Field(True, description="Privacy setting (always starts private)")


class DocumentCreate(BaseModel):
    """Schema for creating a new document."""
    title: str = Field(..., min_length=1, max_length=255)
    filename: str = Field(..., min_length=1, max_length=255)
    file_type: str = Field(..., min_length=1, max_length=10)
    file_size: int = Field(..., gt=0)
    mime_type: str = Field(...)
    document_type: Optional[DocumentType] = DocumentType.OTHER
    tags: Optional[List[str]] = Field(default_factory=list)
    
    class Config:
        use_enum_values = True


class DocumentUpdate(BaseModel):
    """Schema for updating document metadata."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    document_type: Optional[DocumentType] = None
    tags: Optional[List[str]] = None
    
    class Config:
        use_enum_values = True


class DocumentVersionResponse(BaseModel):
    """Schema for document version information."""
    id: UUID
    document_id: UUID
    version_number: int
    change_description: Optional[str]
    is_latest: bool
    minio_path: str
    minio_bucket: str
    file_size: int
    file_hash: Optional[str]
    
    # Processing status
    embedding_status: str
    embedding_error: Optional[str]
    chunk_count: int
    
    # Content metadata
    extracted_entities: List[str]
    extracted_keywords: List[str]
    summary: Optional[str]
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DocumentResponse(BaseModel):
    """Schema for document response."""
    id: UUID
    tenant_id: UUID
    uploader_id: UUID
    
    # Document metadata
    title: str
    filename: str
    file_type: str
    file_size: int
    mime_type: str
    document_type: str
    tags: List[str]
    
    # Content metadata
    page_count: Optional[int]
    word_count: Optional[int]
    language: str
    
    # Status
    status: str
    processing_error: Optional[str]
    
    # Version info
    latest_version_id: Optional[UUID]
    version_count: int
    
    # Privacy
    is_private: bool
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    # Optional related data
    latest_version: Optional[DocumentVersionResponse] = None
    permissions: Optional[List["DocumentPermissionResponse"]] = None
    
    class Config:
        from_attributes = True


class DocumentPermissionCreate(BaseModel):
    """Schema for creating document permissions."""
    project_id: Optional[UUID] = Field(None, description="Project to share document with")
    permission_type: str = Field("read", description="Permission level: read, write, admin")
    granted_to: Optional[UUID] = Field(None, description="Specific user to grant permission")
    expires_at: Optional[datetime] = Field(None, description="Permission expiration")


class DocumentPermissionResponse(BaseModel):
    """Schema for document permission response."""
    id: UUID
    document_id: UUID
    project_id: Optional[UUID]
    permission_type: str
    granted_by: UUID
    granted_to: Optional[UUID]
    is_active: bool
    expires_at: Optional[datetime]
    synced_to_project_store: bool
    sync_error: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class DocumentUploadResponse(BaseModel):
    """Schema for document upload response."""
    document: DocumentResponse
    upload_url: Optional[str] = Field(None, description="Pre-signed upload URL if needed")
    processing_job_id: Optional[str] = Field(None, description="Background processing job ID")
    estimated_processing_time: Optional[int] = Field(None, description="Estimated processing time in seconds")


class DocumentSearchRequest(BaseModel):
    """Schema for document search request."""
    query: Optional[str] = Field(None, description="Search query")
    document_type: Optional[DocumentType] = Field(None, description="Filter by document type")
    tags: Optional[List[str]] = Field(None, description="Filter by tags")
    status: Optional[DocumentStatus] = Field(None, description="Filter by status")
    created_after: Optional[datetime] = Field(None, description="Filter by creation date")
    created_before: Optional[datetime] = Field(None, description="Filter by creation date")
    limit: int = Field(10, ge=1, le=100, description="Number of results")
    offset: int = Field(0, ge=0, description="Pagination offset")
    
    class Config:
        use_enum_values = True


class DocumentSearchResponse(BaseModel):
    """Schema for document search response."""
    documents: List[DocumentResponse]
    total_count: int
    limit: int
    offset: int
    has_more: bool


class DocumentAnalyticsResponse(BaseModel):
    """Schema for document analytics response."""
    document_id: UUID
    view_count: int
    query_count: int
    download_count: int
    share_count: int
    cited_in_queries: List[UUID]
    research_topics: List[str]
    collaboration_score: int
    relevance_score: float
    completeness_score: float
    last_accessed: Optional[datetime]
    last_queried: Optional[datetime]
    
    class Config:
        from_attributes = True


class BulkDocumentOperation(BaseModel):
    """Schema for bulk document operations."""
    document_ids: List[UUID] = Field(..., min_items=1, max_items=100)
    operation: str = Field(..., description="Operation: delete, archive, tag, share")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Operation-specific parameters")


class BulkOperationResponse(BaseModel):
    """Schema for bulk operation response."""
    operation: str
    total_requested: int
    successful: int
    failed: int
    errors: List[Dict[str, Any]]
    results: List[Dict[str, Any]]


# Forward reference resolution
DocumentResponse.model_rebuild()
