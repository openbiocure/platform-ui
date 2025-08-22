"""
Query and conversation repository with tenant isolation.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))

from backend.shared.repositories.base_repository import BaseRepository
from app.models.query import Query, Conversation, Citation, SavedSearch
from app.models.query import QueryScope, QueryStatus
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc, asc, func
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta


class QueryRepository(BaseRepository[Query]):
    """Repository for query management with tenant isolation."""
    
    def __init__(self, db: Session):
        super().__init__(db, Query)
    
    def get_by_user_id(
        self, 
        user_id: UUID, 
        tenant_id: UUID, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[Query]:
        """Get queries by user ID with tenant isolation."""
        return (
            self.db.query(Query)
            .filter(
                and_(
                    Query.user_id == user_id,
                    Query.tenant_id == tenant_id
                )
            )
            .options(joinedload(Query.citations))
            .order_by(desc(Query.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_conversation_id(self, conversation_id: UUID, tenant_id: UUID) -> List[Query]:
        """Get all queries in a conversation with tenant isolation."""
        return (
            self.db.query(Query)
            .filter(
                and_(
                    Query.conversation_id == conversation_id,
                    Query.tenant_id == tenant_id
                )
            )
            .options(joinedload(Query.citations))
            .order_by(asc(Query.created_at))
            .all()
        )
    
    def get_saved_queries(self, user_id: UUID, tenant_id: UUID) -> List[Query]:
        """Get user's saved queries with tenant isolation."""
        return (
            self.db.query(Query)
            .filter(
                and_(
                    Query.user_id == user_id,
                    Query.tenant_id == tenant_id,
                    Query.is_saved == True
                )
            )
            .options(joinedload(Query.citations))
            .order_by(desc(Query.created_at))
            .all()
        )
    
    def search_queries(
        self,
        user_id: UUID,
        tenant_id: UUID,
        query_text: Optional[str] = None,
        scope: Optional[QueryScope] = None,
        status: Optional[QueryStatus] = None,
        conversation_id: Optional[UUID] = None,
        created_after: Optional[datetime] = None,
        created_before: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 100
    ) -> tuple[List[Query], int]:
        """Search queries with filters and tenant isolation."""
        
        base_query = (
            self.db.query(Query)
            .filter(
                and_(
                    Query.user_id == user_id,
                    Query.tenant_id == tenant_id
                )
            )
        )
        
        # Apply filters
        if query_text:
            search_filter = or_(
                Query.query.ilike(f"%{query_text}%"),
                Query.answer.ilike(f"%{query_text}%")
            )
            base_query = base_query.filter(search_filter)
        
        if scope:
            base_query = base_query.filter(Query.scope == scope)
        
        if status:
            base_query = base_query.filter(Query.status == status)
        
        if conversation_id:
            base_query = base_query.filter(Query.conversation_id == conversation_id)
        
        if created_after:
            base_query = base_query.filter(Query.created_at >= created_after)
        
        if created_before:
            base_query = base_query.filter(Query.created_at <= created_before)
        
        # Get total count
        total_count = base_query.count()
        
        # Apply pagination and ordering
        queries = (
            base_query
            .options(joinedload(Query.citations))
            .order_by(desc(Query.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )
        
        return queries, total_count
    
    def update_status(self, query_id: UUID, status: QueryStatus, error: Optional[str] = None) -> bool:
        """Update query processing status."""
        update_data = {"status": status}
        if error:
            update_data["processing_error"] = error
        
        result = (
            self.db.query(Query)
            .filter(Query.id == query_id)
            .update(update_data)
        )
        self.db.commit()
        return result > 0
    
    def update_answer(
        self, 
        query_id: UUID, 
        answer: str, 
        confidence: float,
        processing_metrics: Dict[str, Any]
    ) -> bool:
        """Update query with answer and processing metrics."""
        update_data = {
            "answer": answer,
            "confidence": confidence,
            "status": QueryStatus.COMPLETED,
            **processing_metrics
        }
        
        result = (
            self.db.query(Query)
            .filter(Query.id == query_id)
            .update(update_data)
        )
        self.db.commit()
        return result > 0
    
    def get_pending_queries(self, limit: int = 50) -> List[Query]:
        """Get queries waiting for processing."""
        return (
            self.db.query(Query)
            .filter(
                or_(
                    Query.status == QueryStatus.PENDING,
                    Query.status == QueryStatus.PROCESSING
                )
            )
            .order_by(asc(Query.created_at))
            .limit(limit)
            .all()
        )
    
    def get_popular_queries(
        self, 
        tenant_id: UUID, 
        days: int = 30, 
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get popular queries for the tenant in the last N days."""
        since_date = datetime.utcnow() - timedelta(days=days)
        
        popular = (
            self.db.query(
                Query.query,
                func.count(Query.id).label('count'),
                func.avg(Query.confidence).label('avg_confidence'),
                func.avg(Query.user_rating).label('avg_rating')
            )
            .filter(
                and_(
                    Query.tenant_id == tenant_id,
                    Query.created_at >= since_date,
                    Query.status == QueryStatus.COMPLETED
                )
            )
            .group_by(Query.query)
            .order_by(desc('count'))
            .limit(limit)
            .all()
        )
        
        return [
            {
                'query': result.query,
                'count': result.count,
                'avg_confidence': float(result.avg_confidence or 0),
                'avg_rating': float(result.avg_rating or 0)
            }
            for result in popular
        ]
    
    def get_user_analytics(
        self, 
        user_id: UUID, 
        tenant_id: UUID, 
        days: int = 30
    ) -> Dict[str, Any]:
        """Get query analytics for a user."""
        since_date = datetime.utcnow() - timedelta(days=days)
        
        stats = (
            self.db.query(
                func.count(Query.id).label('total_queries'),
                func.avg(Query.total_time).label('avg_response_time'),
                func.avg(Query.confidence).label('avg_confidence'),
                func.avg(Query.user_rating).label('avg_rating'),
                func.count(Query.id).filter(Query.is_saved == True).label('saved_queries')
            )
            .filter(
                and_(
                    Query.user_id == user_id,
                    Query.tenant_id == tenant_id,
                    Query.created_at >= since_date
                )
            )
            .first()
        )
        
        scope_distribution = (
            self.db.query(
                Query.scope,
                func.count(Query.id).label('count')
            )
            .filter(
                and_(
                    Query.user_id == user_id,
                    Query.tenant_id == tenant_id,
                    Query.created_at >= since_date
                )
            )
            .group_by(Query.scope)
            .all()
        )
        
        return {
            'total_queries': stats.total_queries or 0,
            'avg_response_time': float(stats.avg_response_time or 0),
            'avg_confidence': float(stats.avg_confidence or 0),
            'avg_rating': float(stats.avg_rating or 0),
            'saved_queries': stats.saved_queries or 0,
            'scope_distribution': {result.scope: result.count for result in scope_distribution}
        }


class ConversationRepository(BaseRepository[Conversation]):
    """Repository for conversation management with tenant isolation."""
    
    def __init__(self, db: Session):
        super().__init__(db, Conversation)
    
    def get_by_user_id(
        self, 
        user_id: UUID, 
        tenant_id: UUID, 
        include_archived: bool = False,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Conversation]:
        """Get conversations by user ID with tenant isolation."""
        query = (
            self.db.query(Conversation)
            .filter(
                and_(
                    Conversation.user_id == user_id,
                    Conversation.tenant_id == tenant_id
                )
            )
        )
        
        if not include_archived:
            query = query.filter(Conversation.is_archived == False)
        
        return (
            query
            .options(joinedload(Conversation.queries))
            .order_by(desc(Conversation.last_activity))
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_active_conversations(self, user_id: UUID, tenant_id: UUID) -> List[Conversation]:
        """Get active conversations for a user."""
        return (
            self.db.query(Conversation)
            .filter(
                and_(
                    Conversation.user_id == user_id,
                    Conversation.tenant_id == tenant_id,
                    Conversation.is_active == True,
                    Conversation.is_archived == False
                )
            )
            .order_by(desc(Conversation.last_activity))
            .all()
        )
    
    def update_activity(self, conversation_id: UUID) -> bool:
        """Update last activity timestamp."""
        result = (
            self.db.query(Conversation)
            .filter(Conversation.id == conversation_id)
            .update({'last_activity': datetime.utcnow()})
        )
        self.db.commit()
        return result > 0
    
    def increment_query_count(self, conversation_id: UUID) -> bool:
        """Increment query count for conversation."""
        conversation = self.get_by_id(conversation_id)
        if conversation:
            conversation.query_count += 1
            self.db.commit()
            return True
        return False
    
    def get_shared_conversations(self, tenant_id: UUID, limit: int = 20) -> List[Conversation]:
        """Get conversations shared within the tenant."""
        return (
            self.db.query(Conversation)
            .filter(
                and_(
                    Conversation.tenant_id == tenant_id,
                    Conversation.is_shared == True,
                    Conversation.is_archived == False
                )
            )
            .order_by(desc(Conversation.last_activity))
            .limit(limit)
            .all()
        )


class CitationRepository(BaseRepository[Citation]):
    """Repository for citation management."""
    
    def __init__(self, db: Session):
        super().__init__(db, Citation)
    
    def get_by_query_id(self, query_id: UUID) -> List[Citation]:
        """Get all citations for a query."""
        return (
            self.db.query(Citation)
            .filter(Citation.query_id == query_id)
            .order_by(asc(Citation.rank_position))
            .all()
        )
    
    def get_by_document_id(self, document_id: UUID, limit: int = 100) -> List[Citation]:
        """Get all citations referencing a document."""
        return (
            self.db.query(Citation)
            .filter(Citation.document_id == document_id)
            .order_by(desc(Citation.created_at))
            .limit(limit)
            .all()
        )
    
    def create_citations(self, query_id: UUID, citations_data: List[Dict[str, Any]]) -> List[Citation]:
        """Create multiple citations for a query."""
        citations = []
        for data in citations_data:
            data['query_id'] = query_id
            citation = Citation(**data)
            self.db.add(citation)
            citations.append(citation)
        
        self.db.commit()
        for citation in citations:
            self.db.refresh(citation)
        
        return citations
    
    def mark_clicked(self, citation_id: UUID) -> bool:
        """Mark citation as clicked by user."""
        result = (
            self.db.query(Citation)
            .filter(Citation.id == citation_id)
            .update({'clicked': True})
        )
        self.db.commit()
        return result > 0
    
    def rate_citation(self, citation_id: UUID, rating: int) -> bool:
        """Rate citation helpfulness (1-5)."""
        result = (
            self.db.query(Citation)
            .filter(Citation.id == citation_id)
            .update({'helpful_rating': rating})
        )
        self.db.commit()
        return result > 0
    
    def get_document_citation_stats(self, document_id: UUID) -> Dict[str, Any]:
        """Get citation statistics for a document."""
        stats = (
            self.db.query(
                func.count(Citation.id).label('total_citations'),
                func.avg(Citation.relevance_score).label('avg_relevance'),
                func.avg(Citation.helpful_rating).label('avg_rating'),
                func.count(Citation.id).filter(Citation.clicked == True).label('clicked_citations')
            )
            .filter(Citation.document_id == document_id)
            .first()
        )
        
        return {
            'total_citations': stats.total_citations or 0,
            'avg_relevance': float(stats.avg_relevance or 0),
            'avg_rating': float(stats.avg_rating or 0),
            'clicked_citations': stats.clicked_citations or 0,
            'click_rate': (stats.clicked_citations / stats.total_citations * 100) if stats.total_citations else 0
        }


class SavedSearchRepository(BaseRepository[SavedSearch]):
    """Repository for saved search management."""
    
    def __init__(self, db: Session):
        super().__init__(db, SavedSearch)
    
    def get_by_user_id(
        self, 
        user_id: UUID, 
        tenant_id: UUID, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[SavedSearch]:
        """Get saved searches by user ID with tenant isolation."""
        return (
            self.db.query(SavedSearch)
            .filter(
                and_(
                    SavedSearch.user_id == user_id,
                    SavedSearch.tenant_id == tenant_id
                )
            )
            .order_by(desc(SavedSearch.last_used))
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_public_searches(self, tenant_id: UUID, limit: int = 50) -> List[SavedSearch]:
        """Get public saved searches within the tenant."""
        return (
            self.db.query(SavedSearch)
            .filter(
                and_(
                    SavedSearch.tenant_id == tenant_id,
                    SavedSearch.is_public == True
                )
            )
            .order_by(desc(SavedSearch.run_count))
            .limit(limit)
            .all()
        )
    
    def get_scheduled_searches(self, limit: int = 100) -> List[SavedSearch]:
        """Get searches scheduled for automatic execution."""
        now = datetime.utcnow()
        return (
            self.db.query(SavedSearch)
            .filter(
                and_(
                    SavedSearch.auto_run_frequency.isnot(None),
                    SavedSearch.next_run <= now
                )
            )
            .order_by(asc(SavedSearch.next_run))
            .limit(limit)
            .all()
        )
    
    def update_run_stats(self, search_id: UUID, rating: Optional[float] = None) -> bool:
        """Update execution statistics for a saved search."""
        search = self.get_by_id(search_id)
        if search:
            search.run_count += 1
            search.last_run = datetime.utcnow()
            search.last_used = datetime.utcnow()
            
            if rating and search.run_count > 0:
                # Calculate running average
                current_avg = search.avg_result_rating or 0
                new_avg = ((current_avg * (search.run_count - 1)) + rating) / search.run_count
                search.avg_result_rating = new_avg
            
            # Calculate next run if scheduled
            if search.auto_run_frequency:
                if search.auto_run_frequency == "daily":
                    search.next_run = datetime.utcnow() + timedelta(days=1)
                elif search.auto_run_frequency == "weekly":
                    search.next_run = datetime.utcnow() + timedelta(weeks=1)
                elif search.auto_run_frequency == "monthly":
                    search.next_run = datetime.utcnow() + timedelta(days=30)
            
            self.db.commit()
            return True
        return False
    
    def search_by_category(
        self, 
        user_id: UUID, 
        tenant_id: UUID, 
        category: str
    ) -> List[SavedSearch]:
        """Get saved searches by category."""
        return (
            self.db.query(SavedSearch)
            .filter(
                and_(
                    SavedSearch.user_id == user_id,
                    SavedSearch.tenant_id == tenant_id,
                    SavedSearch.category == category
                )
            )
            .order_by(desc(SavedSearch.last_used))
            .all()
        )
