"""
Document service for managing document lifecycle with tenant isolation.
"""

from typing import List, Optional, Dict, Any, Tuple, BinaryIO
from uuid import UUID
from datetime import datetime
import logging
import hashlib
import os
from pathlib import Path

from app.repositories.document_repository import (
    DocumentRepository, 
    DocumentVersionRepository, 
    DocumentPermissionRepository
)
from app.models.document import Document, DocumentVersion, DocumentStatus, DocumentType
from app.schemas.document import (
    DocumentCreate, 
    DocumentUpdate, 
    DocumentResponse,
    DocumentSearchRequest,
    DocumentUploadResponse
)
from app.core.config import get_settings
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)
settings = get_settings()


class DocumentService:
    """Service for document management with version control and tenant isolation."""
    
    def __init__(
        self, 
        db: Session,
        document_repo: DocumentRepository,
        version_repo: DocumentVersionRepository,
        permission_repo: DocumentPermissionRepository
    ):
        self.db = db
        self.document_repo = document_repo
        self.version_repo = version_repo
        self.permission_repo = permission_repo
    
    async def upload_document(
        self,
        user_id: UUID,
        tenant_id: UUID,
        file: BinaryIO,
        filename: str,
        mime_type: str,
        document_data: Optional[DocumentCreate] = None,
        existing_document_id: Optional[UUID] = None
    ) -> DocumentUploadResponse:
        """
        Upload a new document or new version of existing document.
        
        Args:
            user_id: User uploading the document
            tenant_id: Tenant ID for isolation
            file: File binary data
            filename: Original filename
            mime_type: MIME type of file
            document_data: Document metadata
            existing_document_id: ID of existing document for versioning
        
        Returns:
            DocumentUploadResponse with document info and processing status
        """
        logger.info(f"Starting document upload for user {user_id}, file: {filename}")
        
        # Read file data and calculate hash
        file_data = file.read()
        file_size = len(file_data)
        file_hash = hashlib.sha256(file_data).hexdigest()
        
        # Validate file size
        if file_size > settings.max_file_size:
            raise ValueError(f"File size {file_size} exceeds maximum {settings.max_file_size}")
        
        # Extract file type
        file_type = self._extract_file_type(filename, mime_type)
        if file_type not in settings.supported_formats:
            raise ValueError(f"File type {file_type} not supported")
        
        try:
            if existing_document_id:
                # Creating new version
                document = await self._create_document_version(
                    existing_document_id=existing_document_id,
                    user_id=user_id,
                    tenant_id=tenant_id,
                    file_data=file_data,
                    filename=filename,
                    file_type=file_type,
                    file_size=file_size,
                    file_hash=file_hash,
                    mime_type=mime_type,
                    change_description=document_data.change_description if document_data else None
                )
            else:
                # Creating new document
                document = await self._create_new_document(
                    user_id=user_id,
                    tenant_id=tenant_id,
                    file_data=file_data,
                    filename=filename,
                    file_type=file_type,
                    file_size=file_size,
                    file_hash=file_hash,
                    mime_type=mime_type,
                    document_data=document_data
                )
            
            logger.info(f"Document upload completed: {document.id}")
            
            return DocumentUploadResponse(
                document=DocumentResponse.from_orm(document),
                processing_job_id=f"process_{document.id}",
                estimated_processing_time=self._estimate_processing_time(file_size, file_type)
            )
            
        except Exception as e:
            logger.error(f"Document upload failed: {e}")
            raise
    
    async def _create_new_document(
        self,
        user_id: UUID,
        tenant_id: UUID,
        file_data: bytes,
        filename: str,
        file_type: str,
        file_size: int,
        file_hash: str,
        mime_type: str,
        document_data: Optional[DocumentCreate] = None
    ) -> Document:
        """Create a new document with first version."""
        
        # Extract title from filename if not provided
        title = document_data.title if document_data else Path(filename).stem
        
        # Create document record
        doc_data = {
            'tenant_id': tenant_id,
            'uploader_id': user_id,
            'title': title,
            'filename': filename,
            'file_type': file_type,
            'file_size': file_size,
            'mime_type': mime_type,
            'status': DocumentStatus.PROCESSING
        }
        
        if document_data:
            doc_data.update({
                'document_type': document_data.document_type,
                'tags': document_data.tags
            })
        
        document = Document(**doc_data)
        self.db.add(document)
        self.db.flush()  # Get document ID
        
        # Create first version
        minio_path = self._generate_minio_path(user_id, document.id, filename, 1)
        version_data = {
            'document_id': document.id,
            'version_number': 1,
            'is_latest': True,
            'minio_path': minio_path,
            'minio_bucket': settings.minio_workspace_bucket,
            'file_size': file_size,
            'file_hash': file_hash,
            'embedding_status': 'pending'
        }
        
        version = DocumentVersion(**version_data)
        self.db.add(version)
        
        # Update document with latest version reference
        document.latest_version_id = version.id
        document.version_count = 1
        
        # Store file in MinIO (would be implemented with actual MinIO client)
        await self._store_file_in_minio(minio_path, file_data)
        
        self.db.commit()
        self.db.refresh(document)
        
        # Trigger background processing
        await self._trigger_document_processing(document.id, version.id)
        
        return document
    
    async def _create_document_version(
        self,
        existing_document_id: UUID,
        user_id: UUID,
        tenant_id: UUID,
        file_data: bytes,
        filename: str,
        file_type: str,
        file_size: int,
        file_hash: str,
        mime_type: str,
        change_description: Optional[str] = None
    ) -> Document:
        """Create a new version of an existing document."""
        
        # Get existing document with tenant check
        document = self.document_repo.get_by_id_with_tenant(existing_document_id, tenant_id)
        if not document:
            raise ValueError("Document not found or access denied")
        
        if document.uploader_id != user_id:
            raise ValueError("Only document owner can create new versions")
        
        # Get current latest version
        latest_version = self.version_repo.get_latest_version(document.id)
        next_version = latest_version.version_number + 1 if latest_version else 1
        
        # Create new version
        minio_path = self._generate_minio_path(user_id, document.id, filename, next_version)
        version_data = {
            'document_id': document.id,
            'version_number': next_version,
            'change_description': change_description,
            'is_latest': True,
            'minio_path': minio_path,
            'minio_bucket': settings.minio_workspace_bucket,
            'file_size': file_size,
            'file_hash': file_hash,
            'embedding_status': 'pending'
        }
        
        version = self.version_repo.create_new_version(document.id, version_data)
        
        # Update document metadata
        document.filename = filename
        document.file_type = file_type
        document.file_size = file_size
        document.mime_type = mime_type
        document.status = DocumentStatus.PROCESSING
        document.latest_version_id = version.id
        
        # Store file in MinIO
        await self._store_file_in_minio(minio_path, file_data)
        
        self.db.commit()
        self.db.refresh(document)
        
        # Trigger background processing
        await self._trigger_document_processing(document.id, version.id)
        
        return document
    
    def get_user_documents(
        self,
        user_id: UUID,
        tenant_id: UUID,
        search_request: Optional[DocumentSearchRequest] = None
    ) -> Tuple[List[DocumentResponse], int]:
        """Get documents for a user with optional search/filtering."""
        
        if search_request:
            documents, total = self.document_repo.search_documents(
                user_id=user_id,
                tenant_id=tenant_id,
                query=search_request.query,
                document_type=search_request.document_type,
                tags=search_request.tags,
                status=search_request.status,
                created_after=search_request.created_after,
                created_before=search_request.created_before,
                skip=search_request.offset,
                limit=search_request.limit
            )
        else:
            documents = self.document_repo.get_by_user_id(user_id, tenant_id)
            total = len(documents)
        
        document_responses = [DocumentResponse.from_orm(doc) for doc in documents]
        return document_responses, total
    
    def get_document_by_id(
        self,
        document_id: UUID,
        user_id: UUID,
        tenant_id: UUID
    ) -> Optional[DocumentResponse]:
        """Get a specific document with access control."""
        
        document = self.document_repo.get_by_id_with_tenant(document_id, tenant_id)
        if not document:
            return None
        
        # Check access permissions
        if document.uploader_id != user_id:
            # Check if user has access through project sharing
            # This would integrate with project service to verify membership
            has_access = await self._check_document_access(document_id, user_id)
            if not has_access:
                return None
        
        return DocumentResponse.from_orm(document)
    
    def update_document(
        self,
        document_id: UUID,
        user_id: UUID,
        tenant_id: UUID,
        update_data: DocumentUpdate
    ) -> Optional[DocumentResponse]:
        """Update document metadata."""
        
        document = self.document_repo.get_by_id_with_tenant(document_id, tenant_id)
        if not document or document.uploader_id != user_id:
            return None
        
        update_dict = update_data.dict(exclude_unset=True)
        if update_dict:
            for field, value in update_dict.items():
                setattr(document, field, value)
            
            self.db.commit()
            self.db.refresh(document)
        
        return DocumentResponse.from_orm(document)
    
    def delete_document(
        self,
        document_id: UUID,
        user_id: UUID,
        tenant_id: UUID
    ) -> bool:
        """Delete a document and all its versions."""
        
        document = self.document_repo.get_by_id_with_tenant(document_id, tenant_id)
        if not document or document.uploader_id != user_id:
            return False
        
        try:
            # Delete from vector stores (implemented in vector service)
            # await self.vector_service.delete_document_vectors(document_id)
            
            # Delete files from MinIO
            await self._delete_document_files(document)
            
            # Delete database records (cascade will handle versions and permissions)
            self.db.delete(document)
            self.db.commit()
            
            logger.info(f"Deleted document {document_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete document {document_id}: {e}")
            self.db.rollback()
            return False
    
    def share_document_with_project(
        self,
        document_id: UUID,
        project_id: UUID,
        user_id: UUID,
        tenant_id: UUID,
        permission_type: str = "read"
    ) -> bool:
        """Share document with a project."""
        
        # Verify document ownership
        document = self.document_repo.get_by_id_with_tenant(document_id, tenant_id)
        if not document or document.uploader_id != user_id:
            return False
        
        # Check if already shared
        existing_permission = self.permission_repo.check_project_access(document_id, project_id)
        if existing_permission:
            return True
        
        # Create permission
        permission = self.permission_repo.create_project_permission(
            document_id=document_id,
            project_id=project_id,
            granted_by=user_id,
            permission_type=permission_type
        )
        
        # Update document privacy status
        document.is_private = False
        self.db.commit()
        
        # Trigger vector store synchronization
        await self._sync_document_to_project_store(document_id, project_id)
        
        logger.info(f"Shared document {document_id} with project {project_id}")
        return True
    
    def revoke_document_sharing(
        self,
        document_id: UUID,
        project_id: UUID,
        user_id: UUID,
        tenant_id: UUID
    ) -> bool:
        """Revoke document sharing from project."""
        
        # Verify document ownership
        document = self.document_repo.get_by_id_with_tenant(document_id, tenant_id)
        if not document or document.uploader_id != user_id:
            return False
        
        # Revoke permission
        revoked = self.permission_repo.revoke_project_permission(document_id, project_id)
        
        if revoked:
            # Remove from project vector store
            await self._remove_document_from_project_store(document_id, project_id)
            
            # Check if document is still shared with other projects
            remaining_permissions = self.permission_repo.get_by_document_id(document_id)
            active_permissions = [p for p in remaining_permissions if p.is_active]
            
            if not active_permissions:
                document.is_private = True
                self.db.commit()
            
            logger.info(f"Revoked document {document_id} sharing from project {project_id}")
        
        return revoked
    
    # Helper methods
    
    def _extract_file_type(self, filename: str, mime_type: str) -> str:
        """Extract file type from filename or MIME type."""
        # Try MIME type first
        if mime_type in settings.SUPPORTED_MIME_TYPES:
            return settings.SUPPORTED_MIME_TYPES[mime_type]
        
        # Fall back to file extension
        extension = Path(filename).suffix.lower().lstrip('.')
        return extension if extension in settings.supported_formats else 'unknown'
    
    def _generate_minio_path(self, user_id: UUID, document_id: UUID, filename: str, version: int) -> str:
        """Generate MinIO storage path for document version."""
        safe_filename = "".join(c for c in filename if c.isalnum() or c in '._-')
        return f"ws-{user_id}/documents/{document_id}/v{version}_{safe_filename}"
    
    def _estimate_processing_time(self, file_size: int, file_type: str) -> int:
        """Estimate document processing time in seconds."""
        base_time = 30  # Base processing time
        size_factor = file_size / (1024 * 1024)  # MB
        
        # Different file types have different processing complexity
        type_multipliers = {
            'pdf': 2.0,
            'doc': 1.5,
            'docx': 1.5,
            'txt': 0.5,
            'html': 1.0,
            'json': 0.5,
            'csv': 0.8
        }
        
        multiplier = type_multipliers.get(file_type, 1.0)
        return int(base_time + (size_factor * 10 * multiplier))
    
    async def _store_file_in_minio(self, minio_path: str, file_data: bytes) -> bool:
        """Store file in MinIO. To be implemented with actual MinIO client."""
        # This would use the MinIO client to store the file
        # For now, just log the operation
        logger.info(f"Storing file at MinIO path: {minio_path}, size: {len(file_data)} bytes")
        return True
    
    async def _delete_document_files(self, document: Document) -> bool:
        """Delete all document files from MinIO."""
        # This would delete all versions of the document from MinIO
        logger.info(f"Deleting MinIO files for document: {document.id}")
        return True
    
    async def _trigger_document_processing(self, document_id: UUID, version_id: UUID) -> bool:
        """Trigger background document processing."""
        # This would trigger text extraction, vector generation, etc.
        logger.info(f"Triggering processing for document {document_id}, version {version_id}")
        return True
    
    async def _check_document_access(self, document_id: UUID, user_id: UUID) -> bool:
        """Check if user has access to document through project sharing."""
        # This would check project membership through project service
        logger.info(f"Checking document access for user {user_id}, document {document_id}")
        return False
    
    async def _sync_document_to_project_store(self, document_id: UUID, project_id: UUID) -> bool:
        """Sync document vectors to project vector store."""
        # This would copy vectors from private store to project store
        logger.info(f"Syncing document {document_id} to project {project_id} vector store")
        return True
    
    async def _remove_document_from_project_store(self, document_id: UUID, project_id: UUID) -> bool:
        """Remove document vectors from project vector store."""
        # This would remove vectors from project store
        logger.info(f"Removing document {document_id} from project {project_id} vector store")
        return True
