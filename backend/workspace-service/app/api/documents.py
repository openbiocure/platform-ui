"""
Document management API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from typing import List, Optional
from uuid import UUID

from app.services.document_service import DocumentService
from app.schemas.document import (
    DocumentResponse,
    DocumentUploadResponse,
    DocumentSearchRequest,
    DocumentSearchResponse,
    DocumentUpdate,
    DocumentPermissionCreate
)

router = APIRouter()


# Mock dependency for getting current user - would be replaced with actual auth
async def get_current_user() -> dict:
    return {
        "user_id": UUID("550e8400-e29b-41d4-a716-446655440000"),
        "tenant_id": UUID("550e8400-e29b-41d4-a716-446655440001"),
        "email": "scholar@example.com"
    }


@router.post("/", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    document_type: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),  # JSON string of tags
    change_description: Optional[str] = Form(None),
    existing_document_id: Optional[UUID] = Form(None),
    user: dict = Depends(get_current_user),
    document_service: DocumentService = Depends()
):
    """
    Upload a new document or new version of existing document.
    
    For new documents, leave existing_document_id empty.
    For new versions, provide the existing_document_id.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required"
        )
    
    try:
        # Parse tags if provided
        parsed_tags = []
        if tags:
            import json
            try:
                parsed_tags = json.loads(tags)
            except json.JSONDecodeError:
                parsed_tags = [tag.strip() for tag in tags.split(",")]
        
        # Create document data
        from app.schemas.document import DocumentUploadRequest
        document_data = DocumentUploadRequest(
            change_description=change_description,
            tags=parsed_tags
        )
        
        # Upload document
        result = await document_service.upload_document(
            user_id=user["user_id"],
            tenant_id=user["tenant_id"],
            file=file.file,
            filename=file.filename,
            mime_type=file.content_type,
            document_data=document_data,
            existing_document_id=existing_document_id
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
            detail="Failed to upload document"
        )


@router.get("/", response_model=DocumentSearchResponse)
async def get_documents(
    query: Optional[str] = None,
    document_type: Optional[str] = None,
    tags: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 10,
    offset: int = 0,
    user: dict = Depends(get_current_user),
    document_service: DocumentService = Depends()
):
    """Get user's documents with optional search and filtering."""
    
    try:
        # Parse tags if provided
        parsed_tags = None
        if tags:
            parsed_tags = [tag.strip() for tag in tags.split(",")]
        
        # Create search request
        search_request = DocumentSearchRequest(
            query=query,
            document_type=document_type,
            tags=parsed_tags,
            status=status,
            limit=limit,
            offset=offset
        )
        
        # Get documents
        documents, total_count = document_service.get_user_documents(
            user_id=user["user_id"],
            tenant_id=user["tenant_id"],
            search_request=search_request
        )
        
        return DocumentSearchResponse(
            documents=documents,
            total_count=total_count,
            limit=limit,
            offset=offset,
            has_more=offset + limit < total_count
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve documents"
        )


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: UUID,
    user: dict = Depends(get_current_user),
    document_service: DocumentService = Depends()
):
    """Get a specific document by ID."""
    
    document = document_service.get_document_by_id(
        document_id=document_id,
        user_id=user["user_id"],
        tenant_id=user["tenant_id"]
    )
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return document


@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: UUID,
    update_data: DocumentUpdate,
    user: dict = Depends(get_current_user),
    document_service: DocumentService = Depends()
):
    """Update document metadata."""
    
    document = document_service.update_document(
        document_id=document_id,
        user_id=user["user_id"],
        tenant_id=user["tenant_id"],
        update_data=update_data
    )
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied"
        )
    
    return document


@router.delete("/{document_id}")
async def delete_document(
    document_id: UUID,
    user: dict = Depends(get_current_user),
    document_service: DocumentService = Depends()
):
    """Delete a document and all its versions."""
    
    success = document_service.delete_document(
        document_id=document_id,
        user_id=user["user_id"],
        tenant_id=user["tenant_id"]
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied"
        )
    
    return {"message": "Document deleted successfully"}


@router.post("/{document_id}/versions")
async def upload_document_version(
    document_id: UUID,
    file: UploadFile = File(...),
    change_description: Optional[str] = Form(None),
    user: dict = Depends(get_current_user),
    document_service: DocumentService = Depends()
):
    """Upload a new version of an existing document."""
    
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required"
        )
    
    try:
        from app.schemas.document import DocumentUploadRequest
        document_data = DocumentUploadRequest(
            change_description=change_description
        )
        
        result = await document_service.upload_document(
            user_id=user["user_id"],
            tenant_id=user["tenant_id"],
            file=file.file,
            filename=file.filename,
            mime_type=file.content_type,
            document_data=document_data,
            existing_document_id=document_id
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
            detail="Failed to upload document version"
        )


@router.get("/{document_id}/versions")
async def get_document_versions(
    document_id: UUID,
    user: dict = Depends(get_current_user),
    document_service: DocumentService = Depends()
):
    """Get all versions of a document."""
    
    # First check if user has access to the document
    document = document_service.get_document_by_id(
        document_id=document_id,
        user_id=user["user_id"],
        tenant_id=user["tenant_id"]
    )
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Return versions from the document response
    return {
        "document_id": document_id,
        "versions": document.versions if hasattr(document, 'versions') else [],
        "latest_version_id": document.latest_version_id,
        "version_count": document.version_count
    }


@router.get("/{document_id}/download")
async def download_document(
    document_id: UUID,
    version: Optional[int] = None,
    user: dict = Depends(get_current_user),
    document_service: DocumentService = Depends()
):
    """Download a document file."""
    
    # Check access
    document = document_service.get_document_by_id(
        document_id=document_id,
        user_id=user["user_id"],
        tenant_id=user["tenant_id"]
    )
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Generate pre-signed download URL (would integrate with MinIO)
    download_url = f"https://minio.example.com/documents/{document_id}"
    if version:
        download_url += f"?version={version}"
    
    return {
        "download_url": download_url,
        "filename": document.filename,
        "file_size": document.file_size,
        "mime_type": document.mime_type,
        "expires_in": 3600  # 1 hour
    }


@router.post("/{document_id}/share")
async def share_document_with_project(
    document_id: UUID,
    permission_data: DocumentPermissionCreate,
    user: dict = Depends(get_current_user),
    document_service: DocumentService = Depends()
):
    """Share a document with a project."""
    
    if not permission_data.project_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project ID is required for sharing"
        )
    
    success = document_service.share_document_with_project(
        document_id=document_id,
        project_id=permission_data.project_id,
        user_id=user["user_id"],
        tenant_id=user["tenant_id"],
        permission_type=permission_data.permission_type
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or sharing failed"
        )
    
    return {"message": "Document shared successfully"}


@router.delete("/{document_id}/share/{project_id}")
async def revoke_document_sharing(
    document_id: UUID,
    project_id: UUID,
    user: dict = Depends(get_current_user),
    document_service: DocumentService = Depends()
):
    """Revoke document sharing from a project."""
    
    success = document_service.revoke_document_sharing(
        document_id=document_id,
        project_id=project_id,
        user_id=user["user_id"],
        tenant_id=user["tenant_id"]
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or revocation failed"
        )
    
    return {"message": "Document sharing revoked successfully"}


@router.post("/{document_id}/reprocess")
async def reprocess_document(
    document_id: UUID,
    version: Optional[int] = None,
    user: dict = Depends(get_current_user),
    document_service: DocumentService = Depends()
):
    """Trigger reprocessing of document for vector generation."""
    
    # Check access
    document = document_service.get_document_by_id(
        document_id=document_id,
        user_id=user["user_id"],
        tenant_id=user["tenant_id"]
    )
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    if document.uploader_id != user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only document owner can trigger reprocessing"
        )
    
    # Trigger reprocessing (would implement actual processing)
    processing_job_id = f"reprocess_{document_id}_{version or 'latest'}"
    
    return {
        "message": "Document reprocessing started",
        "job_id": processing_job_id,
        "estimated_time": 300  # 5 minutes
    }
