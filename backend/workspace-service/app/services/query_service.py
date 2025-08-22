"""
Query service and RAG orchestrator for intelligent research assistance.
"""

from typing import List, Optional, Dict, Any, Tuple
from uuid import UUID
from datetime import datetime
import logging
import asyncio
import time

from app.repositories.query_repository import (
    QueryRepository, 
    ConversationRepository, 
    CitationRepository,
    SavedSearchRepository
)
from app.repositories.vector_store_repository import VectorStoreRepository, DocumentVectorRepository
from app.models.query import Query, QueryScope, QueryStatus
from app.schemas.query import (
    QueryCreate, 
    QueryResponse, 
    ConversationCreate,
    ConversationResponse,
    CitationResponse
)
from app.core.config import get_settings
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)
settings = get_settings()


class RAGOrchestrator:
    """
    Central RAG (Retrieval-Augmented Generation) orchestrator.
    Manages query routing, vector retrieval, and LLM synthesis with tenant isolation.
    """
    
    def __init__(
        self,
        vector_store_repo: VectorStoreRepository,
        document_vector_repo: DocumentVectorRepository
    ):
        self.vector_store_repo = vector_store_repo
        self.document_vector_repo = document_vector_repo
    
    async def process_query(
        self,
        query: str,
        user_id: UUID,
        tenant_id: UUID,
        scope: QueryScope,
        scope_ids: Optional[List[UUID]] = None,
        conversation_id: Optional[UUID] = None
    ) -> Dict[str, Any]:
        """
        Process a natural language query with RAG orchestration.
        
        Args:
            query: Natural language query
            user_id: User making the query
            tenant_id: Tenant ID for isolation
            scope: Query scope (private, project, global, multi)
            scope_ids: Project IDs for project scope
            conversation_id: Conversation context
        
        Returns:
            Dict containing answer, citations, and processing metadata
        """
        start_time = time.time()
        
        logger.info(f"Processing query for user {user_id}, scope: {scope}")
        
        try:
            # 1. Route query to appropriate vector stores
            store_ids = await self._route_query_to_stores(
                user_id=user_id,
                tenant_id=tenant_id,
                scope=scope,
                scope_ids=scope_ids
            )
            
            if not store_ids:
                return {
                    'answer': "I don't have access to any documents to answer your question.",
                    'citations': [],
                    'confidence': 0.0,
                    'processing_time': time.time() - start_time,
                    'vector_stores_queried': []
                }
            
            # 2. Generate query embedding
            query_vector = await self._generate_query_embedding(query)
            
            # 3. Retrieve relevant documents
            retrieval_start = time.time()
            similar_vectors = self.document_vector_repo.search_similar(
                store_ids=store_ids,
                query_vector=query_vector,
                limit=settings.max_results_limit,
                similarity_threshold=settings.similarity_threshold
            )
            retrieval_time = time.time() - retrieval_start
            
            if not similar_vectors:
                return {
                    'answer': "I couldn't find any relevant documents to answer your question.",
                    'citations': [],
                    'confidence': 0.0,
                    'retrieval_time': retrieval_time,
                    'synthesis_time': 0.0,
                    'processing_time': time.time() - start_time,
                    'vector_stores_queried': store_ids
                }
            
            # 4. Re-rank results for better relevance
            ranked_vectors = await self._rerank_results(query, similar_vectors)
            
            # 5. Generate answer with LLM synthesis
            synthesis_start = time.time()
            answer_data = await self._synthesize_answer(
                query=query,
                context_vectors=ranked_vectors[:10],  # Top 10 results for synthesis
                conversation_context=conversation_id
            )
            synthesis_time = time.time() - synthesis_start
            
            # 6. Create citations
            citations = self._create_citations(ranked_vectors[:10])
            
            total_time = time.time() - start_time
            
            result = {
                'answer': answer_data['answer'],
                'confidence': answer_data['confidence'],
                'citations': citations,
                'retrieval_time': retrieval_time,
                'synthesis_time': synthesis_time,
                'processing_time': total_time,
                'vector_stores_queried': store_ids,
                'services_called': ['vector-store', 'llm-service'],
                'cited_documents_count': len(set(v[0].document_id for v in ranked_vectors[:10]))
            }
            
            logger.info(f"Query processed successfully in {total_time:.2f}s")
            return result
            
        except Exception as e:
            logger.error(f"Query processing failed: {e}")
            return {
                'answer': "I encountered an error while processing your question. Please try again.",
                'citations': [],
                'confidence': 0.0,
                'processing_time': time.time() - start_time,
                'error': str(e)
            }
    
    async def _route_query_to_stores(
        self,
        user_id: UUID,
        tenant_id: UUID,
        scope: QueryScope,
        scope_ids: Optional[List[UUID]] = None
    ) -> List[str]:
        """Route query to appropriate vector stores based on scope."""
        
        store_ids = []
        
        if scope == QueryScope.PRIVATE:
            # Query private workspace only
            private_store_id = f"ws:{user_id}"
            store_ids.append(private_store_id)
            
        elif scope == QueryScope.PROJECT:
            # Query specific project stores
            if scope_ids:
                for project_id in scope_ids:
                    project_store_id = f"proj:{project_id}"
                    store_ids.append(project_store_id)
            
        elif scope == QueryScope.GLOBAL:
            # Query tenant global store
            global_store_id = f"global:{tenant_id}"
            store_ids.append(global_store_id)
            
        elif scope == QueryScope.MULTI:
            # Query all accessible stores
            # Private store
            store_ids.append(f"ws:{user_id}")
            
            # User's project stores (would need project service integration)
            user_projects = await self._get_user_projects(user_id, tenant_id)
            for project_id in user_projects:
                store_ids.append(f"proj:{project_id}")
            
            # Global tenant store
            store_ids.append(f"global:{tenant_id}")
        
        # Verify stores exist and are healthy
        verified_stores = []
        for store_id in store_ids:
            store = self.vector_store_repo.get_by_id(store_id)
            if store and store.is_active:
                verified_stores.append(store_id)
        
        return verified_stores
    
    async def _generate_query_embedding(self, query: str) -> List[float]:
        """Generate embedding for the query text."""
        # This would use sentence-transformers or OpenAI embeddings
        # For now, return a mock embedding
        logger.debug(f"Generating embedding for query: {query[:50]}...")
        
        # Mock embedding with 384 dimensions (sentence-transformers/all-MiniLM-L6-v2)
        import random
        embedding = [random.random() for _ in range(384)]
        return embedding
    
    async def _rerank_results(
        self, 
        query: str, 
        similar_vectors: List[Tuple[Any, float]]
    ) -> List[Tuple[Any, float]]:
        """Re-rank retrieval results for better relevance."""
        # For now, just return the original ranking
        # In a real implementation, this would use cross-encoders or other re-ranking models
        logger.debug(f"Re-ranking {len(similar_vectors)} results")
        return similar_vectors
    
    async def _synthesize_answer(
        self,
        query: str,
        context_vectors: List[Tuple[Any, float]],
        conversation_context: Optional[UUID] = None
    ) -> Dict[str, Any]:
        """Synthesize answer using LLM with retrieved context."""
        
        # Prepare context from retrieved vectors
        context_texts = []
        for vector, score in context_vectors:
            context_texts.append(f"[Score: {score:.3f}] {vector.content}")
        
        combined_context = "\n\n".join(context_texts)
        
        # Build prompt for LLM
        prompt = self._build_synthesis_prompt(query, combined_context, conversation_context)
        
        # Generate answer (mock implementation)
        logger.debug("Synthesizing answer with LLM")
        
        # Mock answer generation
        answer = f"Based on the available documents, {query.lower()} appears to be related to the research materials in your workspace. The documents contain relevant information that addresses your question."
        confidence = min(0.9, max(0.3, sum(score for _, score in context_vectors) / len(context_vectors)))
        
        return {
            'answer': answer,
            'confidence': confidence,
            'context_used': len(context_vectors),
            'prompt_tokens': len(prompt.split()),
            'response_tokens': len(answer.split())
        }
    
    def _build_synthesis_prompt(
        self,
        query: str,
        context: str,
        conversation_context: Optional[UUID] = None
    ) -> str:
        """Build prompt for LLM synthesis."""
        
        system_prompt = """You are an AI research assistant helping scholars analyze their documents. 
        Provide accurate, helpful answers based on the provided context. 
        Cite specific sources when possible and acknowledge limitations if the context is insufficient."""
        
        user_prompt = f"""
        Question: {query}
        
        Context from documents:
        {context}
        
        Please provide a comprehensive answer based on the context above. 
        If the context doesn't contain enough information, say so clearly.
        """
        
        return f"{system_prompt}\n\n{user_prompt}"
    
    def _create_citations(self, ranked_vectors: List[Tuple[Any, float]]) -> List[Dict[str, Any]]:
        """Create citation objects from ranked vectors."""
        citations = []
        
        for rank, (vector, score) in enumerate(ranked_vectors, 1):
            citation = {
                'document_id': str(vector.document_id),
                'document_version_id': str(vector.document_version_id) if vector.document_version_id else None,
                'chunk_id': vector.chunk_id,
                'content': vector.content[:500] + "..." if len(vector.content) > 500 else vector.content,
                'relevance_score': score,
                'rank_position': rank,
                'source_type': self._determine_source_type(vector.vector_store_id),
                'vector_store_id': vector.vector_store_id,
                'page_number': vector.page_number,
                'section_title': vector.section_title
            }
            citations.append(citation)
        
        return citations
    
    def _determine_source_type(self, store_id: str) -> str:
        """Determine source type from store ID."""
        if store_id.startswith("ws:"):
            return "private"
        elif store_id.startswith("proj:"):
            return "project"
        elif store_id.startswith("global:"):
            return "global"
        else:
            return "unknown"
    
    async def _get_user_projects(self, user_id: UUID, tenant_id: UUID) -> List[UUID]:
        """Get project IDs that user has access to."""
        # This would integrate with project service
        # For now, return empty list
        logger.debug(f"Getting projects for user {user_id}")
        return []


class QueryService:
    """Service for managing queries and conversations with tenant isolation."""
    
    def __init__(
        self,
        db: Session,
        query_repo: QueryRepository,
        conversation_repo: ConversationRepository,
        citation_repo: CitationRepository,
        saved_search_repo: SavedSearchRepository,
        rag_orchestrator: RAGOrchestrator
    ):
        self.db = db
        self.query_repo = query_repo
        self.conversation_repo = conversation_repo
        self.citation_repo = citation_repo
        self.saved_search_repo = saved_search_repo
        self.rag_orchestrator = rag_orchestrator
    
    async def create_query(
        self,
        user_id: UUID,
        tenant_id: UUID,
        query_data: QueryCreate
    ) -> QueryResponse:
        """Create and process a new query."""
        
        logger.info(f"Creating query for user {user_id}: {query_data.query[:50]}...")
        
        # Create query record
        query_dict = {
            'tenant_id': tenant_id,
            'user_id': user_id,
            'query': query_data.query,
            'scope': query_data.scope,
            'scope_ids': query_data.scope_ids or [],
            'conversation_id': query_data.conversation_id,
            'language': query_data.language,
            'status': QueryStatus.PROCESSING
        }
        
        query = Query(**query_dict)
        self.db.add(query)
        self.db.flush()  # Get query ID
        
        try:
            # Process query with RAG orchestrator
            result = await self.rag_orchestrator.process_query(
                query=query_data.query,
                user_id=user_id,
                tenant_id=tenant_id,
                scope=query_data.scope,
                scope_ids=query_data.scope_ids,
                conversation_id=query_data.conversation_id
            )
            
            # Update query with results
            query.answer = result['answer']
            query.confidence = result['confidence']
            query.status = QueryStatus.COMPLETED
            query.retrieval_time = result.get('retrieval_time', 0.0)
            query.synthesis_time = result.get('synthesis_time', 0.0)
            query.total_time = result.get('processing_time', 0.0)
            query.vector_stores_queried = result.get('vector_stores_queried', [])
            query.services_called = result.get('services_called', [])
            query.cited_documents_count = result.get('cited_documents_count', 0)
            
            # Create citations
            if result.get('citations'):
                citation_data = []
                for cite in result['citations']:
                    cite['query_id'] = query.id
                    citation_data.append(cite)
                
                self.citation_repo.create_citations(query.id, citation_data)
            
            # Update conversation activity
            if query_data.conversation_id:
                self.conversation_repo.update_activity(query_data.conversation_id)
                self.conversation_repo.increment_query_count(query_data.conversation_id)
            
            self.db.commit()
            self.db.refresh(query)
            
            logger.info(f"Query completed successfully: {query.id}")
            
        except Exception as e:
            logger.error(f"Query processing failed: {e}")
            query.status = QueryStatus.FAILED
            query.processing_error = str(e)
            self.db.commit()
            raise
        
        return QueryResponse.from_orm(query)
    
    def get_user_queries(
        self,
        user_id: UUID,
        tenant_id: UUID,
        conversation_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[QueryResponse]:
        """Get queries for a user with optional conversation filtering."""
        
        if conversation_id:
            queries = self.query_repo.get_by_conversation_id(conversation_id, tenant_id)
        else:
            queries = self.query_repo.get_by_user_id(user_id, tenant_id, skip, limit)
        
        return [QueryResponse.from_orm(query) for query in queries]
    
    def get_query_by_id(
        self,
        query_id: UUID,
        user_id: UUID,
        tenant_id: UUID
    ) -> Optional[QueryResponse]:
        """Get a specific query with access control."""
        
        query = self.query_repo.get_by_id(str(query_id))
        if not query or query.user_id != user_id or query.tenant_id != tenant_id:
            return None
        
        return QueryResponse.from_orm(query)
    
    def save_query(
        self,
        query_id: UUID,
        user_id: UUID,
        tenant_id: UUID,
        title: Optional[str] = None
    ) -> bool:
        """Save a query for future reference."""
        
        query = self.query_repo.get_by_id(str(query_id))
        if not query or query.user_id != user_id or query.tenant_id != tenant_id:
            return False
        
        query.is_saved = True
        if title:
            query.saved_title = title
        
        self.db.commit()
        return True
    
    def rate_query(
        self,
        query_id: UUID,
        user_id: UUID,
        tenant_id: UUID,
        rating: int,
        feedback: Optional[str] = None
    ) -> bool:
        """Rate a query and provide feedback."""
        
        if not 1 <= rating <= 5:
            return False
        
        query = self.query_repo.get_by_id(str(query_id))
        if not query or query.user_id != user_id or query.tenant_id != tenant_id:
            return False
        
        query.user_rating = rating
        if feedback:
            query.user_feedback = feedback
        
        self.db.commit()
        return True
    
    def create_conversation(
        self,
        user_id: UUID,
        tenant_id: UUID,
        conversation_data: ConversationCreate
    ) -> ConversationResponse:
        """Create a new conversation."""
        
        conversation_dict = {
            'tenant_id': tenant_id,
            'user_id': user_id,
            'title': conversation_data.title,
            'description': conversation_data.description,
            'primary_scope': conversation_data.primary_scope
        }
        
        conversation = self.conversation_repo.create(conversation_dict)
        return ConversationResponse.from_orm(conversation)
    
    def get_user_conversations(
        self,
        user_id: UUID,
        tenant_id: UUID,
        include_archived: bool = False
    ) -> List[ConversationResponse]:
        """Get conversations for a user."""
        
        conversations = self.conversation_repo.get_by_user_id(
            user_id=user_id,
            tenant_id=tenant_id,
            include_archived=include_archived
        )
        
        return [ConversationResponse.from_orm(conv) for conv in conversations]
    
    def get_query_analytics(
        self,
        user_id: UUID,
        tenant_id: UUID,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get query analytics for a user."""
        
        return self.query_repo.get_user_analytics(user_id, tenant_id, days)
