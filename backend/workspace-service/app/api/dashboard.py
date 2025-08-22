"""
Dashboard API endpoints for cross-service aggregation.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta

from app.schemas.dashboard import (
    DashboardResponse,
    QuickStatsResponse,
    ProjectSummaryResponse,
    AIInsightResponse,
    ResearchTrendResponse,
    AnalyticsSummaryResponse,
    WorkspaceOverviewResponse
)

router = APIRouter()


# Mock dependency for getting current user
async def get_current_user() -> dict:
    return {
        "user_id": UUID("550e8400-e29b-41d4-a716-446655440000"),
        "tenant_id": UUID("550e8400-e29b-41d4-a716-446655440001"),
        "email": "scholar@example.com"
    }


@router.get("/", response_model=DashboardResponse)
async def get_dashboard(
    time_period: str = "30d",
    user: dict = Depends(get_current_user)
):
    """
    Get unified dashboard data aggregated from all services.
    
    This endpoint orchestrates calls to:
    - Document service for recent documents
    - Query service for recent queries and saved searches
    - Project service for project summaries (via integration layer)
    - Analytics service for trends and insights
    - AI service for research recommendations
    """
    try:
        # Mock dashboard data - in real implementation, this would aggregate from services
        dashboard_data = DashboardResponse(
            user_id=user["user_id"],
            tenant_id=user["tenant_id"],
            
            # Quick stats
            quick_stats=QuickStatsResponse(
                documents_count=42,
                private_documents=38,
                shared_documents=4,
                active_projects=3,
                weekly_queries=15,
                weekly_uploads=5,
                weekly_collaborations=8,
                vector_stores_healthy=3,
                total_vector_stores=3,
                processing_queue_size=2,
                last_query=datetime.utcnow() - timedelta(hours=2),
                last_upload=datetime.utcnow() - timedelta(days=1),
                last_collaboration=datetime.utcnow() - timedelta(hours=6)
            ),
            
            # Recent documents (mock data)
            recent_documents=[],  # Would be populated from document service
            
            # Recent queries (mock data)
            recent_queries=[],  # Would be populated from query service
            
            # Saved searches (mock data)
            saved_searches=[],  # Would be populated from query service
            
            # Cross-service aggregated data
            projects=[
                ProjectSummaryResponse(
                    id=UUID("550e8400-e29b-41d4-a716-446655440010"),
                    title="Cancer Research Meta-Analysis",
                    description="Systematic review of immunotherapy treatments",
                    status="active",
                    phase="analysis",
                    collaborators=3,
                    documents_count=15,
                    last_activity=datetime.utcnow() - timedelta(hours=4),
                    progress=0.65,
                    created_at=datetime.utcnow() - timedelta(days=30),
                    updated_at=datetime.utcnow() - timedelta(hours=4),
                    shared_documents=4,
                    workspace_queries=12
                ),
                ProjectSummaryResponse(
                    id=UUID("550e8400-e29b-41d4-a716-446655440011"),
                    title="Biomarker Discovery Pipeline",
                    description="ML-based biomarker identification",
                    status="active",
                    phase="execution",
                    collaborators=2,
                    documents_count=23,
                    last_activity=datetime.utcnow() - timedelta(days=2),
                    progress=0.45,
                    created_at=datetime.utcnow() - timedelta(days=45),
                    updated_at=datetime.utcnow() - timedelta(days=2),
                    shared_documents=8,
                    workspace_queries=7
                )
            ],
            
            # AI insights
            ai_insights=[
                AIInsightResponse(
                    id=UUID("550e8400-e29b-41d4-a716-446655440020"),
                    type="gap",
                    title="Missing Methodology Information",
                    description="Your research collection lacks detailed methodology descriptions for statistical analysis approaches.",
                    confidence=0.82,
                    sources=[{"type": "document_analysis", "count": 15}],
                    created_at=datetime.utcnow() - timedelta(hours=6),
                    related_documents=[UUID("550e8400-e29b-41d4-a716-446655440030")],
                    triggered_by_query=None
                ),
                AIInsightResponse(
                    id=UUID("550e8400-e29b-41d4-a716-446655440021"),
                    type="trend",
                    title="Emerging Research Area",
                    description="CRISPR-based therapeutic approaches are trending in your research domain.",
                    confidence=0.91,
                    sources=[{"type": "literature_analysis", "count": 45}],
                    created_at=datetime.utcnow() - timedelta(days=1),
                    related_documents=[],
                    triggered_by_query=None
                )
            ],
            
            # Research trends
            trends=[
                ResearchTrendResponse(
                    id=UUID("550e8400-e29b-41d4-a716-446655440040"),
                    topic="Immunotherapy",
                    trend_type="rising",
                    score=0.89,
                    time_period="30d",
                    description="Publications and citations increasing significantly",
                    data_points=[
                        {"date": "2024-01-01", "value": 45},
                        {"date": "2024-01-15", "value": 62},
                        {"date": "2024-01-30", "value": 78}
                    ],
                    related_keywords=["checkpoint inhibitors", "CAR-T", "tumor microenvironment"],
                    user_relevance=0.95,
                    related_documents=8
                )
            ],
            
            # Notifications
            notifications=[],
            
            # Recent activity
            recent_activity=[],
            
            # Analytics summary
            analytics=AnalyticsSummaryResponse(
                user_id=user["user_id"],
                time_period=time_period,
                total_queries=47,
                total_documents=42,
                total_collaborations=12,
                avg_query_time=2.3,
                query_success_rate=0.94,
                document_processing_rate=0.98,
                top_research_topics=["cancer immunotherapy", "biomarkers", "CRISPR"],
                most_cited_documents=[
                    {"document_id": "550e8400-e29b-41d4-a716-446655440030", "citations": 15},
                    {"document_id": "550e8400-e29b-41d4-a716-446655440031", "citations": 12}
                ],
                collaboration_patterns={"project_queries": 0.6, "shared_documents": 0.4},
                query_trend="increasing",
                productivity_score=0.87,
                research_diversity=0.73
            ),
            
            # System status
            system_health={
                "vector_stores": "healthy",
                "document_processing": "healthy",
                "search_performance": "optimal",
                "service_integrations": "healthy"
            },
            
            processing_status={
                "documents_processing": 2,
                "vectors_indexing": 1,
                "background_jobs": 3
            },
            
            generated_at=datetime.utcnow(),
            cache_expires_at=datetime.utcnow() + timedelta(minutes=15)
        )
        
        return dashboard_data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate dashboard"
        )


@router.get("/workspace-overview", response_model=WorkspaceOverviewResponse)
async def get_workspace_overview(
    user: dict = Depends(get_current_user)
):
    """Get detailed workspace overview and statistics."""
    
    try:
        overview = WorkspaceOverviewResponse(
            workspace_id=f"ws:{user['user_id']}",
            user_id=user["user_id"],
            tenant_id=user["tenant_id"],
            
            # Storage overview
            total_documents=42,
            storage_used_mb=1250.5,
            storage_limit_mb=10000.0,
            
            # Vector store overview
            private_vectors=847,
            shared_vectors=234,
            global_vectors=1523,
            
            # Activity overview
            queries_this_month=47,
            documents_this_month=8,
            collaborations_this_month=12,
            
            # Research insights
            research_areas=["cancer immunotherapy", "biomarker discovery", "CRISPR therapeutics"],
            collaboration_network={
                "frequent_collaborators": ["Dr. Smith", "Dr. Johnson"],
                "project_overlap": 0.6,
                "knowledge_sharing": 0.8
            },
            productivity_trends={
                "queries_per_week": [12, 15, 18, 22],
                "documents_per_week": [2, 3, 1, 2],
                "avg_response_time": [2.1, 1.9, 2.0, 1.8]
            },
            
            # Recommendations
            suggested_documents=[
                {"title": "Latest CAR-T Cell Therapy Review", "relevance": 0.89},
                {"title": "CRISPR Off-Target Analysis", "relevance": 0.82}
            ],
            suggested_collaborations=[
                {"project": "Cancer Research Meta-Analysis", "potential": 0.91},
                {"project": "Biomarker Discovery Pipeline", "potential": 0.76}
            ],
            suggested_queries=[
                "What are the latest developments in CAR-T cell therapy?",
                "How do CRISPR off-target effects impact therapeutic applications?",
                "What biomarkers predict immunotherapy response?"
            ]
        )
        
        return overview
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate workspace overview"
        )


@router.get("/insights")
async def get_ai_insights(
    insight_type: Optional[str] = None,
    limit: int = 10,
    user: dict = Depends(get_current_user)
):
    """Get AI-generated research insights."""
    
    try:
        # Mock insights - would integrate with AI service
        insights = [
            {
                "id": "550e8400-e29b-41d4-a716-446655440020",
                "type": "gap",
                "title": "Missing Methodology Information",
                "description": "Your research collection lacks detailed methodology descriptions.",
                "confidence": 0.82,
                "actionable": True,
                "priority": "high"
            },
            {
                "id": "550e8400-e29b-41d4-a716-446655440021",
                "type": "trend",
                "title": "Emerging Research Area",
                "description": "CRISPR-based approaches are trending in your domain.",
                "confidence": 0.91,
                "actionable": True,
                "priority": "medium"
            }
        ]
        
        # Filter by type if specified
        if insight_type:
            insights = [i for i in insights if i["type"] == insight_type]
        
        return {
            "insights": insights[:limit],
            "total": len(insights),
            "generated_at": datetime.utcnow()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve insights"
        )


@router.get("/trends")
async def get_research_trends(
    time_period: str = "30d",
    category: Optional[str] = None,
    limit: int = 10,
    user: dict = Depends(get_current_user)
):
    """Get research trends and patterns."""
    
    try:
        # Mock trends - would integrate with analytics service
        trends = [
            {
                "topic": "Immunotherapy",
                "trend_type": "rising",
                "score": 0.89,
                "change_percent": 34.5,
                "publications": 156,
                "citations": 2341
            },
            {
                "topic": "CRISPR Therapeutics",
                "trend_type": "rising",
                "score": 0.76,
                "change_percent": 28.2,
                "publications": 89,
                "citations": 1567
            },
            {
                "topic": "Biomarker Discovery",
                "trend_type": "stable",
                "score": 0.65,
                "change_percent": 5.1,
                "publications": 234,
                "citations": 3456
            }
        ]
        
        return {
            "trends": trends[:limit],
            "time_period": time_period,
            "generated_at": datetime.utcnow()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve trends"
        )


@router.get("/projects")
async def get_project_summaries(
    include_archived: bool = False,
    user: dict = Depends(get_current_user)
):
    """Get project summaries from project service."""
    
    try:
        # Mock project data - would call project service
        projects = [
            {
                "id": "550e8400-e29b-41d4-a716-446655440010",
                "title": "Cancer Research Meta-Analysis",
                "status": "active",
                "phase": "analysis",
                "collaborators": 3,
                "documents_shared": 4,
                "workspace_queries": 12,
                "last_activity": "2024-01-15T10:30:00Z"
            },
            {
                "id": "550e8400-e29b-41d4-a716-446655440011",
                "title": "Biomarker Discovery Pipeline",
                "status": "active",
                "phase": "execution",
                "collaborators": 2,
                "documents_shared": 8,
                "workspace_queries": 7,
                "last_activity": "2024-01-13T14:20:00Z"
            }
        ]
        
        return {
            "projects": projects,
            "total": len(projects),
            "generated_at": datetime.utcnow()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve project summaries"
        )


@router.get("/analytics")
async def get_analytics_summary(
    time_period: str = "30d",
    user: dict = Depends(get_current_user)
):
    """Get detailed analytics summary."""
    
    try:
        # Mock analytics - would aggregate from multiple services
        analytics = {
            "user_id": user["user_id"],
            "time_period": time_period,
            
            # Usage metrics
            "usage_metrics": {
                "total_queries": 47,
                "successful_queries": 44,
                "total_documents": 42,
                "documents_processed": 41,
                "collaborations": 12,
                "hours_active": 156
            },
            
            # Performance metrics
            "performance_metrics": {
                "avg_query_time": 2.3,
                "query_success_rate": 0.94,
                "document_processing_rate": 0.98,
                "collaboration_response_rate": 0.87
            },
            
            # Research insights
            "research_insights": {
                "top_topics": ["cancer immunotherapy", "biomarkers", "CRISPR"],
                "research_diversity": 0.73,
                "collaboration_score": 0.81,
                "productivity_trend": "increasing"
            },
            
            # Temporal patterns
            "temporal_patterns": {
                "peak_hours": [9, 10, 14, 15],
                "active_days": ["Monday", "Tuesday", "Wednesday", "Thursday"],
                "query_frequency": "steady",
                "document_upload_pattern": "batch"
            }
        }
        
        return analytics
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve analytics"
        )
