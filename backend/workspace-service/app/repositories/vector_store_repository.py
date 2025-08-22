"""
Vector store repository for Elasticsearch operations and metadata management.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))

from backend.shared.repositories.base_repository import BaseRepository
from app.models.vector_store import VectorStore, DocumentVector, VectorMetadata, VectorStoreAnalytics
from app.models.vector_store import VectorStoreType, VectorStoreHealth
from app.core.config import get_settings
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc, asc, func
from typing import List, Optional, Dict, Any, Tuple
from uuid import UUID
from datetime import datetime, timedelta
import logging
import json

try:
    from elasticsearch import Elasticsearch
    from elasticsearch.exceptions import NotFoundError, ConflictError
except ImportError:
    Elasticsearch = None
    NotFoundError = Exception
    ConflictError = Exception

logger = logging.getLogger(__name__)
settings = get_settings()


class ElasticsearchRepository:
    """Repository for Elasticsearch vector operations with tenant isolation."""
    
    def __init__(self):
        if Elasticsearch is None:
            raise ImportError("Elasticsearch not installed. Run: pip install elasticsearch")
        
        self.es = Elasticsearch([settings.elasticsearch_url])
        self.index_prefix = settings.elasticsearch_index_prefix
    
    def _get_index_name(self, store_id: str) -> str:
        """Generate Elasticsearch index name for a vector store."""
        # Format: openbiocure_ws_userid or openbiocure_proj_projectid
        safe_store_id = store_id.replace(":", "_")
        return f"{self.index_prefix}_{safe_store_id}"
    
    def create_index(self, store_id: str, mapping: Optional[Dict] = None) -> bool:
        """Create Elasticsearch index for a vector store."""
        index_name = self._get_index_name(store_id)
        
        default_mapping = {
            "mappings": {
                "properties": {
                    "document_id": {"type": "keyword"},
                    "document_version_id": {"type": "keyword"},
                    "chunk_id": {"type": "keyword"},
                    "content": {
                        "type": "text",
                        "analyzer": "standard"
                    },
                    "embedding": {
                        "type": "dense_vector",
                        "dims": 384,  # sentence-transformers/all-MiniLM-L6-v2 dimensions
                        "index": True,
                        "similarity": "cosine"
                    },
                    "metadata": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "text"},
                            "author": {"type": "keyword"},
                            "entities": {"type": "keyword"},
                            "keywords": {"type": "keyword"},
                            "topics": {"type": "keyword"},
                            "research_areas": {"type": "keyword"},
                            "page_number": {"type": "integer"},
                            "section_title": {"type": "text"},
                            "document_type": {"type": "keyword"},
                            "language": {"type": "keyword"}
                        }
                    },
                    "created_at": {"type": "date"},
                    "updated_at": {"type": "date"}
                }
            },
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0,
                "analysis": {
                    "analyzer": {
                        "biomedical_analyzer": {
                            "type": "custom",
                            "tokenizer": "standard",
                            "filter": ["lowercase", "stop", "snowball"]
                        }
                    }
                }
            }
        }
        
        final_mapping = mapping or default_mapping
        
        try:
            response = self.es.indices.create(
                index=index_name,
                body=final_mapping,
                ignore=400  # Ignore if index already exists
            )
            logger.info(f"Created Elasticsearch index: {index_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to create index {index_name}: {e}")
            return False
    
    def delete_index(self, store_id: str) -> bool:
        """Delete Elasticsearch index for a vector store."""
        index_name = self._get_index_name(store_id)
        
        try:
            self.es.indices.delete(index=index_name, ignore=[404])
            logger.info(f"Deleted Elasticsearch index: {index_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete index {index_name}: {e}")
            return False
    
    def index_document_vector(
        self, 
        store_id: str, 
        chunk_id: str,
        content: str,
        embedding: List[float],
        metadata: Dict[str, Any]
    ) -> bool:
        """Index a document vector in Elasticsearch."""
        index_name = self._get_index_name(store_id)
        
        doc = {
            "document_id": metadata.get("document_id"),
            "document_version_id": metadata.get("document_version_id"),
            "chunk_id": chunk_id,
            "content": content,
            "embedding": embedding,
            "metadata": metadata,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        try:
            response = self.es.index(
                index=index_name,
                id=chunk_id,
                body=doc
            )
            logger.debug(f"Indexed vector {chunk_id} in {index_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to index vector {chunk_id}: {e}")
            return False
    
    def search_vectors(
        self,
        store_ids: List[str],
        query_vector: List[float],
        limit: int = 10,
        similarity_threshold: float = 0.7,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Search for similar vectors across multiple stores."""
        if not store_ids:
            return []
        
        index_names = [self._get_index_name(store_id) for store_id in store_ids]
        
        # Build the query
        query = {
            "size": limit,
            "query": {
                "script_score": {
                    "query": {"match_all": {}},
                    "script": {
                        "source": "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                        "params": {"query_vector": query_vector}
                    },
                    "min_score": similarity_threshold + 1.0  # Adjust for script_score offset
                }
            },
            "sort": [
                {"_score": {"order": "desc"}}
            ]
        }
        
        # Add filters if provided
        if filters:
            filter_clauses = []
            for field, value in filters.items():
                if isinstance(value, list):
                    filter_clauses.append({"terms": {f"metadata.{field}": value}})
                else:
                    filter_clauses.append({"term": {f"metadata.{field}": value}})
            
            if filter_clauses:
                query["query"]["script_score"]["query"] = {
                    "bool": {"filter": filter_clauses}
                }
        
        results = []
        
        for index_name in index_names:
            try:
                response = self.es.search(
                    index=index_name,
                    body=query,
                    ignore=[404]
                )
                
                for hit in response.get("hits", {}).get("hits", []):
                    result = {
                        "chunk_id": hit["_id"],
                        "content": hit["_source"]["content"],
                        "similarity_score": hit["_score"] - 1.0,  # Remove script_score offset
                        "metadata": hit["_source"]["metadata"],
                        "document_id": hit["_source"]["document_id"],
                        "document_version_id": hit["_source"]["document_version_id"],
                        "store_id": next(sid for sid in store_ids if self._get_index_name(sid) == index_name)
                    }
                    results.append(result)
                    
            except Exception as e:
                logger.error(f"Failed to search index {index_name}: {e}")
                continue
        
        # Sort all results by similarity score and limit
        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results[:limit]
    
    def delete_document_vectors(self, store_id: str, document_id: UUID) -> bool:
        """Delete all vectors for a document from the store."""
        index_name = self._get_index_name(store_id)
        
        query = {
            "query": {
                "term": {"document_id": str(document_id)}
            }
        }
        
        try:
            response = self.es.delete_by_query(
                index=index_name,
                body=query,
                ignore=[404]
            )
            deleted_count = response.get("deleted", 0)
            logger.info(f"Deleted {deleted_count} vectors for document {document_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete vectors for document {document_id}: {e}")
            return False
    
    def get_index_stats(self, store_id: str) -> Dict[str, Any]:
        """Get statistics for an Elasticsearch index."""
        index_name = self._get_index_name(store_id)
        
        try:
            stats = self.es.indices.stats(index=index_name, ignore=[404])
            if index_name in stats.get("indices", {}):
                index_stats = stats["indices"][index_name]
                return {
                    "document_count": index_stats["total"]["docs"]["count"],
                    "size_in_bytes": index_stats["total"]["store"]["size_in_bytes"],
                    "health": "healthy"
                }
            else:
                return {"document_count": 0, "size_in_bytes": 0, "health": "not_found"}
        except Exception as e:
            logger.error(f"Failed to get stats for index {index_name}: {e}")
            return {"document_count": 0, "size_in_bytes": 0, "health": "error"}
    
    def health_check(self, store_id: str) -> Dict[str, Any]:
        """Check health of an Elasticsearch index."""
        index_name = self._get_index_name(store_id)
        
        try:
            health = self.es.cluster.health(index=index_name, wait_for_status="yellow", timeout="30s")
            exists = self.es.indices.exists(index=index_name)
            
            return {
                "exists": exists,
                "status": health.get("status", "unknown"),
                "active_shards": health.get("active_shards", 0),
                "relocating_shards": health.get("relocating_shards", 0),
                "initializing_shards": health.get("initializing_shards", 0),
                "unassigned_shards": health.get("unassigned_shards", 0),
                "healthy": health.get("status") in ["green", "yellow"]
            }
        except Exception as e:
            logger.error(f"Failed health check for index {index_name}: {e}")
            return {
                "exists": False,
                "status": "error",
                "healthy": False,
                "error": str(e)
            }


class VectorStoreRepository(BaseRepository[VectorStore]):
    """Repository for vector store metadata management."""
    
    def __init__(self, db: Session):
        super().__init__(db, VectorStore)
        self.es_repo = ElasticsearchRepository()
    
    def create_store(
        self, 
        store_type: VectorStoreType, 
        namespace: str, 
        tenant_id: UUID,
        name: str,
        description: Optional[str] = None
    ) -> VectorStore:
        """Create a new vector store with proper ID format."""
        # Generate store ID based on type and namespace
        if store_type == VectorStoreType.PRIVATE:
            store_id = f"ws:{namespace}"
        elif store_type == VectorStoreType.PROJECT:
            store_id = f"proj:{namespace}"
        elif store_type == VectorStoreType.GLOBAL:
            store_id = f"global:{namespace}"
        else:
            raise ValueError(f"Invalid store type: {store_type}")
        
        # Create Elasticsearch index
        index_created = self.es_repo.create_index(store_id)
        if not index_created:
            raise RuntimeError(f"Failed to create Elasticsearch index for store {store_id}")
        
        # Create database record
        store_data = {
            'id': store_id,
            'store_type': store_type,
            'namespace': namespace,
            'tenant_id': tenant_id,
            'name': name,
            'description': description,
            'embedding_model': settings.embeddings_model,
            'chunk_size': settings.max_chunk_size,
            'chunk_overlap': settings.chunk_overlap,
            'similarity_threshold': settings.similarity_threshold,
            'elasticsearch_index': self.es_repo._get_index_name(store_id)
        }
        
        store = VectorStore(**store_data)
        self.db.add(store)
        self.db.commit()
        self.db.refresh(store)
        
        logger.info(f"Created vector store: {store_id}")
        return store
    
    def get_by_tenant_id(self, tenant_id: UUID) -> List[VectorStore]:
        """Get all vector stores for a tenant."""
        return (
            self.db.query(VectorStore)
            .filter(VectorStore.tenant_id == tenant_id)
            .order_by(asc(VectorStore.store_type), asc(VectorStore.created_at))
            .all()
        )
    
    def get_user_stores(self, user_id: UUID, tenant_id: UUID) -> Dict[str, VectorStore]:
        """Get vector stores accessible to a user."""
        stores = {}
        
        # Private store
        private_store = (
            self.db.query(VectorStore)
            .filter(
                and_(
                    VectorStore.id == f"ws:{user_id}",
                    VectorStore.tenant_id == tenant_id
                )
            )
            .first()
        )
        if private_store:
            stores['private'] = private_store
        
        # Global store for tenant
        global_store = (
            self.db.query(VectorStore)
            .filter(
                and_(
                    VectorStore.id == f"global:{tenant_id}",
                    VectorStore.tenant_id == tenant_id
                )
            )
            .first()
        )
        if global_store:
            stores['global'] = global_store
        
        return stores
    
    def get_project_stores(self, project_ids: List[UUID], tenant_id: UUID) -> List[VectorStore]:
        """Get vector stores for specific projects."""
        store_ids = [f"proj:{project_id}" for project_id in project_ids]
        
        return (
            self.db.query(VectorStore)
            .filter(
                and_(
                    VectorStore.id.in_(store_ids),
                    VectorStore.tenant_id == tenant_id
                )
            )
            .all()
        )
    
    def update_stats(self, store_id: str) -> bool:
        """Update vector store statistics from Elasticsearch."""
        store = self.get_by_id(store_id)
        if not store:
            return False
        
        # Get stats from Elasticsearch
        es_stats = self.es_repo.get_index_stats(store_id)
        
        # Update database record
        store.vector_count = es_stats.get('document_count', 0)
        store.last_health_check = datetime.utcnow()
        
        if es_stats.get('health') == 'healthy':
            store.health = VectorStoreHealth.HEALTHY
        else:
            store.health = VectorStoreHealth.DEGRADED
        
        self.db.commit()
        return True
    
    def perform_health_check(self, store_id: str) -> Dict[str, Any]:
        """Perform comprehensive health check on a vector store."""
        store = self.get_by_id(store_id)
        if not store:
            return {"healthy": False, "error": "Store not found"}
        
        # Check Elasticsearch index health
        es_health = self.es_repo.health_check(store_id)
        
        # Update store health status
        if es_health.get('healthy', False):
            store.health = VectorStoreHealth.HEALTHY
        else:
            store.health = VectorStoreHealth.UNHEALTHY
        
        store.last_health_check = datetime.utcnow()
        self.db.commit()
        
        # Get document vector count from database
        vector_count = (
            self.db.query(func.count(DocumentVector.id))
            .filter(DocumentVector.vector_store_id == store_id)
            .scalar()
        )
        
        return {
            "store_id": store_id,
            "healthy": es_health.get('healthy', False),
            "elasticsearch": es_health,
            "database_vector_count": vector_count,
            "elasticsearch_doc_count": es_health.get('active_shards', 0),
            "last_check": store.last_health_check
        }
    
    def delete_store(self, store_id: str) -> bool:
        """Delete a vector store and its Elasticsearch index."""
        store = self.get_by_id(store_id)
        if not store:
            return False
        
        # Delete Elasticsearch index
        es_deleted = self.es_repo.delete_index(store_id)
        
        # Delete database records
        self.db.delete(store)
        self.db.commit()
        
        logger.info(f"Deleted vector store: {store_id} (ES: {es_deleted})")
        return True


class DocumentVectorRepository(BaseRepository[DocumentVector]):
    """Repository for document vector management."""
    
    def __init__(self, db: Session):
        super().__init__(db, DocumentVector)
        self.es_repo = ElasticsearchRepository()
    
    def create_vectors(
        self,
        store_id: str,
        document_id: UUID,
        document_version_id: UUID,
        chunks: List[Dict[str, Any]]
    ) -> List[DocumentVector]:
        """Create document vectors and index them in Elasticsearch."""
        vectors = []
        
        for i, chunk_data in enumerate(chunks):
            # Create database record
            vector_data = {
                'vector_store_id': store_id,
                'document_id': document_id,
                'document_version_id': document_version_id,
                'chunk_id': f"{document_version_id}_{i}",
                'chunk_index': i,
                'content': chunk_data['content'],
                'elasticsearch_doc_id': f"{document_version_id}_{i}",
                'word_count': len(chunk_data['content'].split()),
                'char_count': len(chunk_data['content']),
                'page_number': chunk_data.get('page_number'),
                'section_title': chunk_data.get('section_title')
            }
            
            vector = DocumentVector(**vector_data)
            self.db.add(vector)
            vectors.append(vector)
            
            # Index in Elasticsearch
            metadata = {
                'document_id': str(document_id),
                'document_version_id': str(document_version_id),
                'page_number': chunk_data.get('page_number'),
                'section_title': chunk_data.get('section_title'),
                **chunk_data.get('metadata', {})
            }
            
            self.es_repo.index_document_vector(
                store_id=store_id,
                chunk_id=vector.chunk_id,
                content=chunk_data['content'],
                embedding=chunk_data['embedding'],
                metadata=metadata
            )
        
        self.db.commit()
        for vector in vectors:
            self.db.refresh(vector)
        
        logger.info(f"Created {len(vectors)} vectors for document {document_id}")
        return vectors
    
    def get_by_document_id(self, document_id: UUID) -> List[DocumentVector]:
        """Get all vectors for a document."""
        return (
            self.db.query(DocumentVector)
            .filter(DocumentVector.document_id == document_id)
            .options(joinedload(DocumentVector.metadata))
            .order_by(asc(DocumentVector.chunk_index))
            .all()
        )
    
    def get_by_store_id(self, store_id: str, limit: int = 100) -> List[DocumentVector]:
        """Get vectors from a specific store."""
        return (
            self.db.query(DocumentVector)
            .filter(DocumentVector.vector_store_id == store_id)
            .options(joinedload(DocumentVector.metadata))
            .order_by(desc(DocumentVector.created_at))
            .limit(limit)
            .all()
        )
    
    def delete_document_vectors(self, document_id: UUID) -> bool:
        """Delete all vectors for a document from database and Elasticsearch."""
        # Get all vectors for the document
        vectors = self.get_by_document_id(document_id)
        
        # Group by store to delete from Elasticsearch
        stores_to_clean = set()
        for vector in vectors:
            stores_to_clean.add(vector.vector_store_id)
        
        # Delete from Elasticsearch
        for store_id in stores_to_clean:
            self.es_repo.delete_document_vectors(store_id, document_id)
        
        # Delete from database
        deleted_count = (
            self.db.query(DocumentVector)
            .filter(DocumentVector.document_id == document_id)
            .delete()
        )
        
        self.db.commit()
        logger.info(f"Deleted {deleted_count} vectors for document {document_id}")
        return deleted_count > 0
    
    def search_similar(
        self,
        store_ids: List[str],
        query_vector: List[float],
        limit: int = 10,
        similarity_threshold: float = 0.7,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Tuple[DocumentVector, float]]:
        """Search for similar vectors and return with database objects."""
        # Search in Elasticsearch
        es_results = self.es_repo.search_vectors(
            store_ids=store_ids,
            query_vector=query_vector,
            limit=limit,
            similarity_threshold=similarity_threshold,
            filters=filters
        )
        
        if not es_results:
            return []
        
        # Get chunk IDs
        chunk_ids = [result['chunk_id'] for result in es_results]
        
        # Fetch database objects
        vectors = (
            self.db.query(DocumentVector)
            .filter(DocumentVector.chunk_id.in_(chunk_ids))
            .options(joinedload(DocumentVector.metadata))
            .all()
        )
        
        # Create mapping for quick lookup
        vector_map = {vector.chunk_id: vector for vector in vectors}
        
        # Combine results with similarity scores
        results = []
        for es_result in es_results:
            chunk_id = es_result['chunk_id']
            if chunk_id in vector_map:
                results.append((
                    vector_map[chunk_id],
                    es_result['similarity_score']
                ))
        
        return results
