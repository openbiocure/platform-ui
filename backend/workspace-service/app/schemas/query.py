"""
Query and conversation-related Pydantic schemas.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum

from app.models.query import QueryScope, QueryStatus


class QueryCreate(BaseModel):
    """Schema for creating a new query."""
    query: str = Field(..., min_length=1, max_length=1000, description="Research question")
    scope: QueryScope = Field(QueryScope.PRIVATE, description="Query scope")
    scope_ids: Optional[List[UUID]] = Field(default_factory=list, description="Project IDs for project scope")
    conversation_id: Optional[UUID] = Field(None, description="Conversation context")
    language: str = Field("en", description="Query language")
    
    @validator('scope_ids')
    def validate_scope_ids(cls, v, values):
        scope = values.get('scope')
        if scope == QueryScope.PROJECT and not v:
            raise ValueError("Project scope requires at least one project ID")
        if scope != QueryScope.PROJECT and v:
            raise ValueError("Scope IDs only allowed for project scope")
        return v
    
    class Config:
        use_enum_values = True


class CitationResponse(BaseModel):
    """Schema for citation information."""
    id: UUID
    document_id: UUID
    document_version_id: Optional[UUID]
    document_title: str
    chunk_id: Optional[str]
    content: str
    page_number: Optional[int]
    section: Optional[str]
    relevance_score: float
    rank_position: int
    source_type: str
    source_id: Optional[str]
    vector_store_id: str
    clicked: bool
    helpful_rating: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True


class QueryResponse(BaseModel):
    """Schema for query response."""
    id: UUID
    tenant_id: UUID
    user_id: UUID
    query: str
    language: str
    scope: str
    scope_ids: List[UUID]
    
    # Response
    answer: Optional[str]
    confidence: float
    
    # Processing
    status: str
    processing_error: Optional[str]
    vector_stores_queried: List[str]
    
    # Performance
    retrieval_time: float
    synthesis_time: float
    total_time: float
    
    # Cross-service data
    services_called: List[str]
    service_responses: Dict[str, Any]
    
    # Context
    conversation_id: Optional[UUID]
    follow_up_to: Optional[UUID]
    
    # User interaction
    is_saved: bool
    saved_title: Optional[str]
    user_rating: Optional[int]
    user_feedback: Optional[str]
    
    # Analytics
    cited_documents_count: int
    result_clicked: bool
    shared_count: int
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    # Related data
    citations: Optional[List[CitationResponse]] = None
    
    class Config:
        from_attributes = True


class ConversationCreate(BaseModel):
    """Schema for creating a new conversation."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    primary_scope: Optional[QueryScope] = None
    
    class Config:
        use_enum_values = True


class ConversationUpdate(BaseModel):
    """Schema for updating conversation."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    is_archived: Optional[bool] = None
    is_shared: Optional[bool] = None


class ConversationResponse(BaseModel):
    """Schema for conversation response."""
    id: UUID
    tenant_id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    context: Dict[str, Any]
    primary_scope: Optional[str]
    research_topics: List[str]
    
    # Status
    is_active: bool
    is_archived: bool
    is_shared: bool
    
    # Analytics
    query_count: int
    total_interaction_time: float
    avg_query_rating: float
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    last_activity: datetime
    
    # Related data
    queries: Optional[List[QueryResponse]] = None
    recent_queries: Optional[List[QueryResponse]] = None
    
    class Config:
        from_attributes = True


class SavedSearchCreate(BaseModel):
    """Schema for creating saved search."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    query_template: str = Field(..., min_length=1, max_length=1000)
    scope: QueryScope = Field(QueryScope.PRIVATE)
    scope_ids: Optional[List[UUID]] = Field(default_factory=list)
    category: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = Field(default_factory=list)
    auto_run_frequency: Optional[str] = Field(None, description="daily, weekly, monthly")
    is_public: bool = Field(False, description="Share within tenant")
    
    class Config:
        use_enum_values = True


class SavedSearchUpdate(BaseModel):
    """Schema for updating saved search."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    query_template: Optional[str] = Field(None, min_length=1, max_length=1000)
    scope: Optional[QueryScope] = None
    scope_ids: Optional[List[UUID]] = None
    category: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = None
    auto_run_frequency: Optional[str] = None
    is_public: Optional[bool] = None
    
    class Config:
        use_enum_values = True


class SavedSearchResponse(BaseModel):
    """Schema for saved search response."""
    id: UUID
    tenant_id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    query_template: str
    scope: str
    scope_ids: List[UUID]
    
    # Execution
    auto_run_frequency: Optional[str]
    last_run: Optional[datetime]
    next_run: Optional[datetime]
    
    # Organization
    category: Optional[str]
    tags: List[str]
    is_public: bool
    
    # Analytics
    run_count: int
    avg_result_rating: float
    last_used: Optional[datetime]
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class QueryExecutionRequest(BaseModel):
    """Schema for executing a saved search."""
    variables: Optional[Dict[str, str]] = Field(default_factory=dict, description="Template variables")
    scope_override: Optional[QueryScope] = Field(None, description="Override saved scope")
    scope_ids_override: Optional[List[UUID]] = Field(None, description="Override saved scope IDs")


class QueryFeedbackRequest(BaseModel):
    """Schema for providing query feedback."""
    rating: int = Field(..., ge=1, le=5, description="1-5 star rating")
    feedback: Optional[str] = Field(None, max_length=1000, description="Text feedback")
    helpful_citations: Optional[List[UUID]] = Field(None, description="Helpful citation IDs")
    
    
class QueryAnalyticsResponse(BaseModel):
    """Schema for query analytics."""
    query_id: UUID
    scope_distribution: Dict[str, int]
    popular_topics: List[str]
    avg_response_time: float
    success_rate: float
    user_satisfaction: float
    citation_patterns: Dict[str, Any]
    
    class Config:
        from_attributes = True


class ConversationSummaryRequest(BaseModel):
    """Schema for requesting conversation summary."""
    include_topics: bool = Field(True, description="Include research topics")
    include_insights: bool = Field(True, description="Include key insights")
    include_gaps: bool = Field(True, description="Include knowledge gaps")
    max_length: int = Field(500, ge=100, le=2000, description="Summary length in words")


class ConversationSummaryResponse(BaseModel):
    """Schema for conversation summary."""
    conversation_id: UUID
    summary: str
    key_topics: List[str]
    main_insights: List[str]
    knowledge_gaps: List[str]
    recommended_actions: List[str]
    generated_at: datetime
