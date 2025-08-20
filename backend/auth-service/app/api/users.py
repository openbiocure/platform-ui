from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..core.security import security
from ..models.user import User
from ..schemas.user import UserResponse, UserUpdate
from ..services.tenant_service import TenantService

router = APIRouter(prefix="/users", tags=["users"])
security_scheme = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> dict:
    """Get current authenticated user from JWT token"""
    token = credentials.credentials
    payload = security.verify_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "user": user,
        "tenant_id": payload.get("tenant_id"),
        "role": payload.get("role"),
        "correlation_id": payload.get("correlation_id")
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user information with tenant context
    """
    user = current_user["user"]
    tenant_service = TenantService(db)
    
    # Get user's tenant memberships
    tenants = await tenant_service.get_user_tenants(str(user.id))
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at,
        tenants=tenants
    )

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user information
    """
    user = current_user["user"]
    
    # Update user fields
    if user_update.email is not None:
        user.email = user_update.email
    if user_update.username is not None:
        user.username = user_update.username
    if user_update.full_name is not None:
        user.full_name = user_update.full_name
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    
    db.commit()
    db.refresh(user)
    
    # Get updated tenant memberships
    tenant_service = TenantService(db)
    tenants = await tenant_service.get_user_tenants(str(user.id))
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at,
        tenants=tenants
    )
