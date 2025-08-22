"""
Vector store management API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from uuid import UUID

from app.schemas.vector_store import (
    VectorStoreResponse,
    VectorStoreStatsResponse,
    VectorStoreHealthCheckResponse,
    VectorSearchRequest,
    VectorSearchResponse,
    VectorIndexingRequest,
    VectorIndexingResponse
)

router = APIRouter()


# Mock dependency for getting current user
async def get_current_user() -> dict:
    return {
        "user_id": UUID("550e8400-e29b-41d4-a716-446655440000"),
        "tenant_id": UUID("550e8400-e29b-41d4-a716-446655440001"),
        "email": "scholar@example.com"
    }


@router.get("/stats", response_model=List[VectorStoreStatsResponse])
async def get_vector_store_stats(
    user: dict = Depends(get_current_user)
):
    """Get statistics for all user-accessible vector stores."""
    
    try:
        # Mock stats - would get from vector store repository
        stats = [
            VectorStoreStatsResponse(
                store_id=f"ws:{user['user_id']}",
                total_documents=42,
                total_vectors=847,
                total_chunks=847,
                avg_chunk_size=750,
                storage_size_mb=125.3,
                avg_query_time=0.45,
                queries_per_day=12,
                cache_hit_rate=0.73,
                health_score=0.98,
                last_health_check=datetime.utcnow(),
                error_rate=0.02,
                popular_queries=["cancer treatment", "immunotherapy", "biomarkers"],
                active_users=1,
                peak_usage_hours=[9, 10, 14, 15]
            ),
            VectorStoreStatsResponse(
                store_id=f"global:{user['tenant_id']}",
                total_documents=1523,
                total_vectors=12847,
                total_chunks=12847,
                avg_chunk_size=680,
                storage_size_mb=2341.7,
                avg_query_time=0.78,
                queries_per_day=156,
                cache_hit_rate=0.81,
                health_score=0.95,
                last_health_check=datetime.utcnow(),
                error_rate=0.05,
                popular_queries=["latest research", "clinical trials", "drug development"],
                active_users=23,
                peak_usage_hours=[8, 9, 13, 14, 16]
            )
        ]
        
        return stats
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve vector store statistics"
        )


@router.get("/health")
async def get_vector_stores_health(
    user: dict = Depends(get_current_user)
):
    """Get health status of all vector stores."""
    
    try:
        from datetime import datetime
        # Mock health data
        health_status = {
            "overall_health": "healthy",
            "stores": [
                {
                    "store_id": f"ws:{user['user_id']}",
                    "health": "healthy",
                    "status": "green",
                    "issues": [],
                    "last_check": datetime.utcnow()
                },
                {
                    "store_id": f"global:{user['tenant_id']}",
                    "health": "healthy", 
                    "status": "green",
                    "issues": [],
                    "last_check": datetime.utcnow()
                }
            ],
            "summary": {
                "healthy_stores": 2,
                "total_stores": 2,
                "degraded_stores": 0,
                "unhealthy_stores": 0
            },
            "last_check": datetime.utcnow()
        }
        
        return health_status
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check vector store health"
        )


@router.post("/search", response_model=VectorSearchResponse)
async def search_vectors(
    search_request: VectorSearchRequest,
    user: dict = Depends(get_current_user)
):
    """
    Search for similar vectors across accessible stores.
    
    This endpoint allows direct vector similarity search for development
    and debugging purposes. For normal research queries, use the query API.
    """
    try:
        # Determine accessible stores if not specified
        store_ids = search_request.store_ids or [
            f"ws:{user['user_id']}",  # Private store
            f"global:{user['tenant_id']}"  # Global store
        ]
        
        # Mock search results
        from app.schemas.vector_store import VectorSearchResult, DocumentVectorResponse
        from datetime import datetime
        
        mock_results = [
            VectorSearchResult(
                document_vector=DocumentVectorResponse(
                    id=UUID("550e8400-e29b-41d4-a716-446655440050"),
                    vector_store_id=f"ws:{user['user_id']}",
                    document_id=UUID("550e8400-e29b-41d4-a716-446655440030"),
                    document_version_id=UUID("550e8400-e29b-41d4-a716-446655440031"),
                    chunk_id="doc1_chunk_1",
                    chunk_index=1,
                    content="Cancer immunotherapy has revolutionized treatment approaches...",
                    elasticsearch_doc_id="doc1_chunk_1",
                    embedding_hash="abc123",
                    word_count=89,
                    char_count=456,
                    page_number=1,
                    section_title="Introduction",
                    extraction_method="direct",
                    processing_version="1.0",
                    quality_score=0.95,
                    query_count=5,
                    citation_count=3,
                    avg_relevance_score=0.87,
                    last_retrieved=datetime.utcnow(),
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                ),
                similarity_score=0.89,
                rank=1,
                metadata=None
            ),
            VectorSearchResult(
                document_vector=DocumentVectorResponse(
                    id=UUID("550e8400-e29b-41d4-a716-446655440051"),
                    vector_store_id=f"global:{user['tenant_id']}",
                    document_id=UUID("550e8400-e29b-41d4-a716-446655440032"),
                    document_version_id=UUID("550e8400-e29b-41d4-a716-446655440033"),
                    chunk_id="global_doc2_chunk_1",
                    chunk_index=1,
                    content="Recent advances in CAR-T cell therapy show promising results...",
                    elasticsearch_doc_id="global_doc2_chunk_1",
                    embedding_hash="def456",
                    word_count=76,
                    char_count=387,
                    page_number=2,
                    section_title="Results",
                    extraction_method="direct",
                    processing_version="1.0",
                    quality_score=0.92,
                    query_count=12,
                    citation_count=8,
                    avg_relevance_score=0.83,
                    last_retrieved=datetime.utcnow(),
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                ),
                similarity_score=0.82,
                rank=2,
                metadata=None
            )
        ]
        
        response = VectorSearchResponse(
            query=search_request.query,
            results=mock_results[:search_request.limit],
            total_found=len(mock_results),
            search_time=0.23,
            stores_searched=store_ids,
            filters_applied=search_request.filters or {}
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Vector search failed"
        )


@router.post("/reindex", response_model=VectorIndexingResponse)
async def reindex_document(
    indexing_request: VectorIndexingRequest,
    user: dict = Depends(get_current_user)
):
    """Trigger reindexing of a document's vectors."""
    
    try:
        # Mock reindexing response
        response = VectorIndexingResponse(
            document_id=indexing_request.document_id,
            job_id=f"reindex_{indexing_request.document_id}",
            status="queued",
            estimated_time=300,  # 5 minutes
            progress={
                "stage": "queued",
                "percent_complete": 0,
                "estimated_remaining": 300
            }
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to trigger reindexing"
        )


@router.get("/{store_id}/health", response_model=VectorStoreHealthCheckResponse)
async def check_store_health(
    store_id: str,
    user: dict = Depends(get_current_user)
):
    """Get detailed health check for a specific vector store."""
    
    # Verify user has access to this store
    accessible_stores = [
        f"ws:{user['user_id']}",
        f"global:{user['tenant_id']}"
    ]
    
    if store_id not in accessible_stores:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to vector store"
        )
    
    try:
        from app.models.vector_store import VectorStoreHealth
        from datetime import datetime
        
        # Mock health check
        health_check = VectorStoreHealthCheckResponse(
            store_id=store_id,
            health=VectorStoreHealth.HEALTHY,
            checks={
                "elasticsearch_connection": True,
                "index_exists": True,
                "mappings_correct": True,
                "shards_healthy": True,
                "recent_activity": True
            },
            issues=[],
            recommendations=[],
            last_check=datetime.utcnow()
        )
        
        return health_check
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Health check failed"
        )


@router.get("/{store_id}/stats", response_model=VectorStoreStatsResponse)
async def get_store_stats(
    store_id: str,
    user: dict = Depends(get_current_user)
):
    """Get detailed statistics for a specific vector store."""
    
    # Verify access
    accessible_stores = [
        f"ws:{user['user_id']}",
        f"global:{user['tenant_id']}"
    ]
    
    if store_id not in accessible_stores:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to vector store"
        )
    
    try:
        from datetime import datetime
        
        # Mock store-specific stats
        if store_id.startswith("ws:"):
            stats = VectorStoreStatsResponse(
                store_id=store_id,
                total_documents=42,
                total_vectors=847,
                total_chunks=847,
                avg_chunk_size=750,
                storage_size_mb=125.3,
                avg_query_time=0.45,
                queries_per_day=12,
                cache_hit_rate=0.73,
                health_score=0.98,
                last_health_check=datetime.utcnow(),
                error_rate=0.02,
                popular_queries=["cancer treatment", "immunotherapy", "biomarkers"],
                active_users=1,
                peak_usage_hours=[9, 10, 14, 15]
            )
        else:  # Global store
            stats = VectorStoreStatsResponse(
                store_id=store_id,
                total_documents=1523,
                total_vectors=12847,
                total_chunks=12847,
                avg_chunk_size=680,
                storage_size_mb=2341.7,
                avg_query_time=0.78,
                queries_per_day=156,
                cache_hit_rate=0.81,
                health_score=0.95,
                last_health_check=datetime.utcnow(),
                error_rate=0.05,
                popular_queries=["latest research", "clinical trials", "drug development"],
                active_users=23,
                peak_usage_hours=[8, 9, 13, 14, 16]
            )
        
        return stats
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve store statistics"
        )


@router.delete("/{store_id}")
async def delete_vector_store(
    store_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Delete a vector store.
    Only private stores can be deleted by users.
    """
    
    # Only allow deletion of private stores
    expected_private_store = f"ws:{user['user_id']}"
    if store_id != expected_private_store:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only delete private vector stores"
        )
    
    try:
        # Mock deletion
        return {
            "message": f"Vector store {store_id} deletion initiated",
            "job_id": f"delete_{store_id}",
            "estimated_time": 600  # 10 minutes
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete vector store"
        )
