"""
Document repository with tenant isolation and version management.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))

from backend.shared.repositories.base_repository import BaseRepository
from app.models.document import Document, DocumentVersion, DocumentPermission, DocumentAnalytics
from app.models.document import DocumentStatus, DocumentType
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc, asc, func
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime


class DocumentRepository(BaseRepository[Document]):
    """Repository for document management with tenant isolation."""
    
    def __init__(self, db: Session):
        super().__init__(db, Document)
    
    def get_by_user_id(self, user_id: UUID, tenant_id: UUID, skip: int = 0, limit: int = 100) -> List[Document]:
        """Get documents by user ID with tenant isolation."""
        return (
            self.db.query(Document)
            .filter(
                and_(
                    Document.uploader_id == user_id,
                    Document.tenant_id == tenant_id
                )
            )
            .options(joinedload(Document.versions))
            .order_by(desc(Document.updated_at))
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_project_id(self, project_id: UUID, tenant_id: UUID) -> List[Document]:
        """Get documents shared with a specific project (tenant-isolated)."""
        return (
            self.db.query(Document)
            .join(DocumentPermission)
            .filter(
                and_(
                    DocumentPermission.project_id == project_id,
                    Document.tenant_id == tenant_id,
                    DocumentPermission.is_active == True
                )
            )
            .options(joinedload(Document.versions))
            .order_by(desc(Document.updated_at))
            .all()
        )
    
    def search_documents(
        self, 
        user_id: UUID, 
        tenant_id: UUID,
        query: Optional[str] = None,
        document_type: Optional[DocumentType] = None,
        tags: Optional[List[str]] = None,
        status: Optional[DocumentStatus] = None,
        created_after: Optional[datetime] = None,
        created_before: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 100
    ) -> tuple[List[Document], int]:
        """Search documents with filters and tenant isolation."""
        
        base_query = (
            self.db.query(Document)
            .filter(
                and_(
                    Document.uploader_id == user_id,
                    Document.tenant_id == tenant_id
                )
            )
        )
        
        # Apply filters
        if query:
            search_filter = or_(
                Document.title.ilike(f"%{query}%"),
                Document.filename.ilike(f"%{query}%")
            )
            base_query = base_query.filter(search_filter)
        
        if document_type:
            base_query = base_query.filter(Document.document_type == document_type)
        
        if tags:
            # PostgreSQL JSON array contains check
            for tag in tags:
                base_query = base_query.filter(Document.tags.contains([tag]))
        
        if status:
            base_query = base_query.filter(Document.status == status)
        
        if created_after:
            base_query = base_query.filter(Document.created_at >= created_after)
        
        if created_before:
            base_query = base_query.filter(Document.created_at <= created_before)
        
        # Get total count
        total_count = base_query.count()
        
        # Apply pagination and ordering
        documents = (
            base_query
            .options(joinedload(Document.versions))
            .order_by(desc(Document.updated_at))
            .offset(skip)
            .limit(limit)
            .all()
        )
        
        return documents, total_count
    
    def get_by_id_with_tenant(self, document_id: UUID, tenant_id: UUID) -> Optional[Document]:
        """Get document by ID with tenant isolation."""
        return (
            self.db.query(Document)
            .filter(
                and_(
                    Document.id == document_id,
                    Document.tenant_id == tenant_id
                )
            )
            .options(
                joinedload(Document.versions),
                joinedload(Document.permissions)
            )
            .first()
        )
    
    def update_status(self, document_id: UUID, status: DocumentStatus, error: Optional[str] = None) -> bool:
        """Update document processing status."""
        update_data = {"status": status}
        if error:
            update_data["processing_error"] = error
        
        result = (
            self.db.query(Document)
            .filter(Document.id == document_id)
            .update(update_data)
        )
        self.db.commit()
        return result > 0
    
    def get_shared_documents(self, user_id: UUID, tenant_id: UUID) -> List[Document]:
        """Get documents shared with the user through projects."""
        return (
            self.db.query(Document)
            .join(DocumentPermission)
            .filter(
                and_(
                    Document.tenant_id == tenant_id,
                    DocumentPermission.is_active == True,
                    # Documents not owned by the user but shared with them
                    Document.uploader_id != user_id
                )
            )
            .options(joinedload(Document.versions))
            .order_by(desc(Document.updated_at))
            .all()
        )
    
    def get_processing_queue(self, limit: int = 50) -> List[Document]:
        """Get documents waiting for processing."""
        return (
            self.db.query(Document)
            .filter(
                or_(
                    Document.status == DocumentStatus.UPLOADING,
                    Document.status == DocumentStatus.PROCESSING
                )
            )
            .order_by(asc(Document.created_at))
            .limit(limit)
            .all()
        )
    
    def get_tenant_stats(self, tenant_id: UUID) -> Dict[str, Any]:
        """Get document statistics for a tenant."""
        stats = (
            self.db.query(
                func.count(Document.id).label('total_documents'),
                func.sum(Document.file_size).label('total_size'),
                func.count(Document.id).filter(Document.status == DocumentStatus.READY).label('ready_documents'),
                func.count(Document.id).filter(Document.status == DocumentStatus.PROCESSING).label('processing_documents'),
                func.count(Document.id).filter(Document.is_private == False).label('shared_documents')
            )
            .filter(Document.tenant_id == tenant_id)
            .first()
        )
        
        return {
            'total_documents': stats.total_documents or 0,
            'total_size_bytes': stats.total_size or 0,
            'ready_documents': stats.ready_documents or 0,
            'processing_documents': stats.processing_documents or 0,
            'shared_documents': stats.shared_documents or 0
        }


class DocumentVersionRepository(BaseRepository[DocumentVersion]):
    """Repository for document version management."""
    
    def __init__(self, db: Session):
        super().__init__(db, DocumentVersion)
    
    def get_by_document_id(self, document_id: UUID) -> List[DocumentVersion]:
        """Get all versions for a document."""
        return (
            self.db.query(DocumentVersion)
            .filter(DocumentVersion.document_id == document_id)
            .order_by(desc(DocumentVersion.version_number))
            .all()
        )
    
    def get_latest_version(self, document_id: UUID) -> Optional[DocumentVersion]:
        """Get the latest version of a document."""
        return (
            self.db.query(DocumentVersion)
            .filter(
                and_(
                    DocumentVersion.document_id == document_id,
                    DocumentVersion.is_latest == True
                )
            )
            .first()
        )
    
    def create_new_version(self, document_id: UUID, version_data: Dict[str, Any]) -> DocumentVersion:
        """Create a new version and update latest flags."""
        # Get the current latest version number
        latest_version = (
            self.db.query(DocumentVersion)
            .filter(DocumentVersion.document_id == document_id)
            .order_by(desc(DocumentVersion.version_number))
            .first()
        )
        
        next_version = (latest_version.version_number + 1) if latest_version else 1
        
        # Create new version
        version_data.update({
            'document_id': document_id,
            'version_number': next_version,
            'is_latest': True
        })
        
        new_version = DocumentVersion(**version_data)
        self.db.add(new_version)
        
        # Update previous versions to not be latest
        if latest_version:
            self.db.query(DocumentVersion).filter(
                and_(
                    DocumentVersion.document_id == document_id,
                    DocumentVersion.id != new_version.id
                )
            ).update({'is_latest': False})
        
        # Update document's latest version reference
        self.db.query(Document).filter(
            Document.id == document_id
        ).update({
            'latest_version_id': new_version.id,
            'version_count': next_version
        })
        
        self.db.commit()
        self.db.refresh(new_version)
        return new_version
    
    def update_embedding_status(self, version_id: UUID, status: str, error: Optional[str] = None) -> bool:
        """Update vector embedding status for a version."""
        update_data = {'embedding_status': status}
        if error:
            update_data['embedding_error'] = error
        
        result = (
            self.db.query(DocumentVersion)
            .filter(DocumentVersion.id == version_id)
            .update(update_data)
        )
        self.db.commit()
        return result > 0
    
    def get_pending_embeddings(self, limit: int = 50) -> List[DocumentVersion]:
        """Get versions waiting for embedding processing."""
        return (
            self.db.query(DocumentVersion)
            .filter(DocumentVersion.embedding_status == 'pending')
            .order_by(asc(DocumentVersion.created_at))
            .limit(limit)
            .all()
        )


class DocumentPermissionRepository(BaseRepository[DocumentPermission]):
    """Repository for document permission management."""
    
    def __init__(self, db: Session):
        super().__init__(db, DocumentPermission)
    
    def get_by_document_id(self, document_id: UUID) -> List[DocumentPermission]:
        """Get all permissions for a document."""
        return (
            self.db.query(DocumentPermission)
            .filter(DocumentPermission.document_id == document_id)
            .order_by(desc(DocumentPermission.created_at))
            .all()
        )
    
    def get_by_project_id(self, project_id: UUID) -> List[DocumentPermission]:
        """Get all document permissions for a project."""
        return (
            self.db.query(DocumentPermission)
            .filter(
                and_(
                    DocumentPermission.project_id == project_id,
                    DocumentPermission.is_active == True
                )
            )
            .options(joinedload(DocumentPermission.document))
            .order_by(desc(DocumentPermission.created_at))
            .all()
        )
    
    def create_project_permission(
        self, 
        document_id: UUID, 
        project_id: UUID, 
        granted_by: UUID,
        permission_type: str = "read"
    ) -> DocumentPermission:
        """Create a project-level permission for document sharing."""
        permission = DocumentPermission(
            document_id=document_id,
            project_id=project_id,
            permission_type=permission_type,
            granted_by=granted_by,
            is_active=True
        )
        
        self.db.add(permission)
        self.db.commit()
        self.db.refresh(permission)
        return permission
    
    def revoke_project_permission(self, document_id: UUID, project_id: UUID) -> bool:
        """Revoke project access to a document."""
        result = (
            self.db.query(DocumentPermission)
            .filter(
                and_(
                    DocumentPermission.document_id == document_id,
                    DocumentPermission.project_id == project_id
                )
            )
            .update({'is_active': False})
        )
        self.db.commit()
        return result > 0
    
    def check_project_access(self, document_id: UUID, project_id: UUID) -> Optional[DocumentPermission]:
        """Check if a project has access to a document."""
        return (
            self.db.query(DocumentPermission)
            .filter(
                and_(
                    DocumentPermission.document_id == document_id,
                    DocumentPermission.project_id == project_id,
                    DocumentPermission.is_active == True
                )
            )
            .first()
        )
    
    def get_unsync_permissions(self, limit: int = 50) -> List[DocumentPermission]:
        """Get permissions that need vector store synchronization."""
        return (
            self.db.query(DocumentPermission)
            .filter(
                and_(
                    DocumentPermission.is_active == True,
                    DocumentPermission.synced_to_project_store == False,
                    DocumentPermission.project_id.isnot(None)
                )
            )
            .limit(limit)
            .all()
        )
    
    def mark_synced(self, permission_id: UUID, success: bool = True, error: Optional[str] = None) -> bool:
        """Mark permission as synced to vector stores."""
        update_data = {'synced_to_project_store': success}
        if error:
            update_data['sync_error'] = error
        
        result = (
            self.db.query(DocumentPermission)
            .filter(DocumentPermission.id == permission_id)
            .update(update_data)
        )
        self.db.commit()
        return result > 0
