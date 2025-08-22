"""
Query and conversation API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from uuid import UUID

from app.services.query_service import QueryService
from app.schemas.query import (
    QueryCreate,
    QueryResponse,
    ConversationCreate,
    ConversationResponse,
    SavedSearchCreate,
    SavedSearchResponse,
    QueryFeedbackRequest
)

router = APIRouter()


# Mock dependency for getting current user
async def get_current_user() -> dict:
    return {
        "user_id": UUID("550e8400-e29b-41d4-a716-446655440000"),
        "tenant_id": UUID("550e8400-e29b-41d4-a716-446655440001"),
        "email": "scholar@example.com"
    }


@router.post("/", response_model=QueryResponse)
async def create_query(
    query_data: QueryCreate,
    user: dict = Depends(get_current_user),
    query_service: QueryService = Depends()
):
    """
    Create and process a new research query.
    
    The query will be processed using RAG orchestration to search relevant documents
    and generate an intelligent answer with citations.
    """
    try:
        result = await query_service.create_query(
            user_id=user["user_id"],
            tenant_id=user["tenant_id"],
            query_data=query_data
        )
        return result
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process query"
        )


@router.get("/", response_model=List[QueryResponse])
async def get_queries(
    conversation_id: Optional[UUID] = None,
    saved_only: bool = False,
    skip: int = 0,
    limit: int = 100,
    user: dict = Depends(get_current_user),
    query_service: QueryService = Depends()
):
    """Get user's queries with optional filtering."""
    
    try:
        if saved_only:
            # Get saved queries only
            queries = query_service.query_repo.get_saved_queries(
                user_id=user["user_id"],
                tenant_id=user["tenant_id"]
            )
            from app.schemas.query import QueryResponse
            return [QueryResponse.from_orm(q) for q in queries]
        else:
            # Get regular queries
            queries = query_service.get_user_queries(
                user_id=user["user_id"],
                tenant_id=user["tenant_id"],
                conversation_id=conversation_id,
                skip=skip,
                limit=limit
            )
            return queries
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve queries"
        )


@router.get("/{query_id}", response_model=QueryResponse)
async def get_query(
    query_id: UUID,
    user: dict = Depends(get_current_user),
    query_service: QueryService = Depends()
):
    """Get a specific query by ID."""
    
    query = query_service.get_query_by_id(
        query_id=query_id,
        user_id=user["user_id"],
        tenant_id=user["tenant_id"]
    )
    
    if not query:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Query not found"
        )
    
    return query


@router.post("/{query_id}/save")
async def save_query(
    query_id: UUID,
    title: Optional[str] = None,
    user: dict = Depends(get_current_user),
    query_service: QueryService = Depends()
):
    """Save a query for future reference."""
    
    success = query_service.save_query(
        query_id=query_id,
        user_id=user["user_id"],
        tenant_id=user["tenant_id"],
        title=title
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Query not found"
        )
    
    return {"message": "Query saved successfully"}


@router.post("/{query_id}/feedback")
async def provide_query_feedback(
    query_id: UUID,
    feedback_data: QueryFeedbackRequest,
    user: dict = Depends(get_current_user),
    query_service: QueryService = Depends()
):
    """Provide feedback and rating for a query."""
    
    success = query_service.rate_query(
        query_id=query_id,
        user_id=user["user_id"],
        tenant_id=user["tenant_id"],
        rating=feedback_data.rating,
        feedback=feedback_data.feedback
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Query not found"
        )
    
    # Also handle helpful citations if provided
    if feedback_data.helpful_citations:
        for citation_id in feedback_data.helpful_citations:
            query_service.citation_repo.rate_citation(citation_id, 5)  # Mark as helpful
    
    return {"message": "Feedback submitted successfully"}


@router.get("/analytics/summary")
async def get_query_analytics(
    days: int = 30,
    user: dict = Depends(get_current_user),
    query_service: QueryService = Depends()
):
    """Get query analytics summary for the user."""
    
    try:
        analytics = query_service.get_query_analytics(
            user_id=user["user_id"],
            tenant_id=user["tenant_id"],
            days=days
        )
        return analytics
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve analytics"
        )


# Conversation endpoints
@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    conversation_data: ConversationCreate,
    user: dict = Depends(get_current_user),
    query_service: QueryService = Depends()
):
    """Create a new conversation for contextual queries."""
    
    try:
        conversation = query_service.create_conversation(
            user_id=user["user_id"],
            tenant_id=user["tenant_id"],
            conversation_data=conversation_data
        )
        return conversation
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create conversation"
        )


@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    include_archived: bool = False,
    user: dict = Depends(get_current_user),
    query_service: QueryService = Depends()
):
    """Get user's conversations."""
    
    try:
        conversations = query_service.get_user_conversations(
            user_id=user["user_id"],
            tenant_id=user["tenant_id"],
            include_archived=include_archived
        )
        return conversations
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve conversations"
        )


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: UUID,
    user: dict = Depends(get_current_user),
    query_service: QueryService = Depends()
):
    """Get a specific conversation with its queries."""
    
    # Get conversation
    conversation = query_service.conversation_repo.get_by_id(str(conversation_id))
    if not conversation or conversation.user_id != user["user_id"] or conversation.tenant_id != user["tenant_id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Get queries in conversation
    queries = query_service.get_user_queries(
        user_id=user["user_id"],
        tenant_id=user["tenant_id"],
        conversation_id=conversation_id
    )
    
    from app.schemas.query import ConversationResponse
    response = ConversationResponse.from_orm(conversation)
    response.queries = queries
    
    return response


@router.put("/conversations/{conversation_id}")
async def update_conversation(
    conversation_id: UUID,
    title: Optional[str] = None,
    description: Optional[str] = None,
    is_archived: Optional[bool] = None,
    user: dict = Depends(get_current_user),
    query_service: QueryService = Depends()
):
    """Update conversation metadata."""
    
    conversation = query_service.conversation_repo.get_by_id(str(conversation_id))
    if not conversation or conversation.user_id != user["user_id"] or conversation.tenant_id != user["tenant_id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Update fields
    update_data = {}
    if title is not None:
        update_data["title"] = title
    if description is not None:
        update_data["description"] = description
    if is_archived is not None:
        update_data["is_archived"] = is_archived
    
    if update_data:
        updated_conversation = query_service.conversation_repo.update(str(conversation_id), update_data)
        if updated_conversation:
            from app.schemas.query import ConversationResponse
            return ConversationResponse.from_orm(updated_conversation)
    
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="No valid updates provided"
    )


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: UUID,
    user: dict = Depends(get_current_user),
    query_service: QueryService = Depends()
):
    """Delete a conversation and all its queries."""
    
    conversation = query_service.conversation_repo.get_by_id(str(conversation_id))
    if not conversation or conversation.user_id != user["user_id"] or conversation.tenant_id != user["tenant_id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    success = query_service.conversation_repo.delete(str(conversation_id))
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete conversation"
        )
    
    return {"message": "Conversation deleted successfully"}


# Saved searches endpoints
@router.post("/saved-searches", response_model=SavedSearchResponse)
async def create_saved_search(
    search_data: SavedSearchCreate,
    user: dict = Depends(get_current_user),
    query_service: QueryService = Depends()
):
    """Create a new saved search."""
    
    try:
        search_dict = search_data.dict()
        search_dict.update({
            "tenant_id": user["tenant_id"],
            "user_id": user["user_id"]
        })
        
        saved_search = query_service.saved_search_repo.create(search_dict)
        from app.schemas.query import SavedSearchResponse
        return SavedSearchResponse.from_orm(saved_search)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create saved search"
        )


@router.get("/saved-searches", response_model=List[SavedSearchResponse])
async def get_saved_searches(
    category: Optional[str] = None,
    public_only: bool = False,
    user: dict = Depends(get_current_user),
    query_service: QueryService = Depends()
):
    """Get user's saved searches."""
    
    try:
        if public_only:
            searches = query_service.saved_search_repo.get_public_searches(
                tenant_id=user["tenant_id"]
            )
        elif category:
            searches = query_service.saved_search_repo.search_by_category(
                user_id=user["user_id"],
                tenant_id=user["tenant_id"],
                category=category
            )
        else:
            searches = query_service.saved_search_repo.get_by_user_id(
                user_id=user["user_id"],
                tenant_id=user["tenant_id"]
            )
        
        from app.schemas.query import SavedSearchResponse
        return [SavedSearchResponse.from_orm(search) for search in searches]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve saved searches"
        )


@router.post("/saved-searches/{search_id}/execute", response_model=QueryResponse)
async def execute_saved_search(
    search_id: UUID,
    variables: Optional[dict] = None,
    user: dict = Depends(get_current_user),
    query_service: QueryService = Depends()
):
    """Execute a saved search with optional variable substitution."""
    
    saved_search = query_service.saved_search_repo.get_by_id(str(search_id))
    if not saved_search:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved search not found"
        )
    
    # Check access
    if saved_search.user_id != user["user_id"] and not saved_search.is_public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to saved search"
        )
    
    try:
        # Substitute variables in query template
        query_text = saved_search.query_template
        if variables:
            for key, value in variables.items():
                query_text = query_text.replace(f"{{{key}}}", str(value))
        
        # Create query
        from app.schemas.query import QueryCreate
        from app.models.query import QueryScope
        query_data = QueryCreate(
            query=query_text,
            scope=QueryScope(saved_search.scope),
            scope_ids=saved_search.scope_ids
        )
        
        # Execute query
        result = await query_service.create_query(
            user_id=user["user_id"],
            tenant_id=user["tenant_id"],
            query_data=query_data
        )
        
        # Update saved search statistics
        query_service.saved_search_repo.update_run_stats(search_id)
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to execute saved search"
        )
