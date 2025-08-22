"""
Dashboard-related Pydantic schemas for cross-service aggregation.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class ProjectSummaryResponse(BaseModel):
    """Schema for project summary from project service."""
    id: UUID
    title: str
    description: Optional[str]
    status: str
    phase: Optional[str]
    collaborators: int
    documents_count: int
    last_activity: datetime
    progress: float
    created_at: datetime
    updated_at: datetime
    
    # Workspace-specific data
    shared_documents: int
    workspace_queries: int
    
    class Config:
        from_attributes = True


class AIInsightResponse(BaseModel):
    """Schema for AI insights from ai service."""
    id: UUID
    type: str  # pattern, gap, trend, recommendation
    title: str
    description: str
    confidence: float
    sources: List[Dict[str, Any]]
    created_at: datetime
    
    # Workspace-specific context
    related_documents: List[UUID]
    triggered_by_query: Optional[UUID]
    
    class Config:
        from_attributes = True


class ResearchTrendResponse(BaseModel):
    """Schema for research trends from analytics service."""
    id: UUID
    topic: str
    trend_type: str  # rising, stable, declining
    score: float
    time_period: str
    description: str
    
    # Trend data
    data_points: List[Dict[str, Any]]
    related_keywords: List[str]
    
    # Workspace context
    user_relevance: float
    related_documents: int
    
    class Config:
        from_attributes = True


class NotificationResponse(BaseModel):
    """Schema for notifications."""
    id: UUID
    type: str  # document_processed, query_completed, insight_available, etc.
    title: str
    message: str
    priority: str  # low, medium, high, urgent
    read: bool
    action_url: Optional[str]
    action_label: Optional[str]
    metadata: Dict[str, Any]
    created_at: datetime
    expires_at: Optional[datetime]


class QuickStatsResponse(BaseModel):
    """Schema for quick dashboard statistics."""
    documents_count: int
    private_documents: int
    shared_documents: int
    active_projects: int
    
    # Weekly activity
    weekly_queries: int
    weekly_uploads: int
    weekly_collaborations: int
    
    # Vector store health
    vector_stores_healthy: int
    total_vector_stores: int
    processing_queue_size: int
    
    # Recent activity
    last_query: Optional[datetime]
    last_upload: Optional[datetime]
    last_collaboration: Optional[datetime]


class RecentActivityResponse(BaseModel):
    """Schema for recent activity."""
    id: UUID
    type: str  # query, upload, share, collaboration
    title: str
    description: str
    timestamp: datetime
    metadata: Dict[str, Any]
    action_url: Optional[str]


class DashboardResponse(BaseModel):
    """Schema for unified dashboard data."""
    # User context
    user_id: UUID
    tenant_id: UUID
    
    # Core workspace data
    quick_stats: QuickStatsResponse
    recent_documents: List["DocumentResponse"]
    recent_queries: List["QueryResponse"]
    saved_searches: List["SavedSearchResponse"]
    
    # Cross-service aggregated data
    projects: List[ProjectSummaryResponse]
    ai_insights: List[AIInsightResponse]
    trends: List[ResearchTrendResponse]
    notifications: List[NotificationResponse]
    recent_activity: List[RecentActivityResponse]
    
    # Analytics summary
    analytics: "AnalyticsSummaryResponse"
    
    # System status
    system_health: Dict[str, Any]
    processing_status: Dict[str, Any]
    
    # Timestamps
    generated_at: datetime
    cache_expires_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class AnalyticsSummaryResponse(BaseModel):
    """Schema for analytics summary."""
    user_id: UUID
    time_period: str
    
    # Usage metrics
    total_queries: int
    total_documents: int
    total_collaborations: int
    
    # Performance metrics
    avg_query_time: float
    query_success_rate: float
    document_processing_rate: float
    
    # Research insights
    top_research_topics: List[str]
    most_cited_documents: List[Dict[str, Any]]
    collaboration_patterns: Dict[str, Any]
    
    # Trends
    query_trend: str  # increasing, stable, decreasing
    productivity_score: float
    research_diversity: float


class WorkspaceOverviewResponse(BaseModel):
    """Schema for workspace overview."""
    workspace_id: str  # ws:userId
    user_id: UUID
    tenant_id: UUID
    
    # Storage overview
    total_documents: int
    storage_used_mb: float
    storage_limit_mb: float
    
    # Vector store overview
    private_vectors: int
    shared_vectors: int
    global_vectors: int
    
    # Activity overview
    queries_this_month: int
    documents_this_month: int
    collaborations_this_month: int
    
    # Research insights
    research_areas: List[str]
    collaboration_network: Dict[str, Any]
    productivity_trends: Dict[str, Any]
    
    # Recommendations
    suggested_documents: List[Dict[str, Any]]
    suggested_collaborations: List[Dict[str, Any]]
    suggested_queries: List[str]


class DashboardFilterRequest(BaseModel):
    """Schema for dashboard filtering."""
    time_period: str = Field("30d", description="Time period: 7d, 30d, 90d, 1y")
    project_ids: Optional[List[UUID]] = Field(None, description="Filter by specific projects")
    document_types: Optional[List[str]] = Field(None, description="Filter by document types")
    research_areas: Optional[List[str]] = Field(None, description="Filter by research areas")
    include_archived: bool = Field(False, description="Include archived items")
    limit: int = Field(10, ge=1, le=100, description="Limit results")


class DashboardExportRequest(BaseModel):
    """Schema for dashboard data export."""
    format: str = Field("json", description="Export format: json, csv, pdf")
    sections: List[str] = Field(..., description="Sections to include")
    time_period: str = Field("30d", description="Time period")
    include_attachments: bool = Field(False, description="Include document attachments")


class DashboardExportResponse(BaseModel):
    """Schema for dashboard export response."""
    export_id: UUID
    format: str
    status: str  # pending, processing, completed, failed
    download_url: Optional[str]
    file_size: Optional[int]
    expires_at: Optional[datetime]
    created_at: datetime


# Forward references for circular imports
from app.schemas.document import DocumentResponse
from app.schemas.query import QueryResponse, SavedSearchResponse

DashboardResponse.model_rebuild()
