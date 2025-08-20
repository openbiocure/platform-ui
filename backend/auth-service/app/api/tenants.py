from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..core.security import security
from ..schemas.tenant import TenantCreate, TenantResponse
from ..services.tenant_service import TenantService
from .users import get_current_user

router = APIRouter(prefix="/tenants", tags=["tenants"])
security_scheme = HTTPBearer()

@router.post("/", response_model=TenantResponse)
async def create_tenant(
    tenant_data: TenantCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create new tenant (admin operation)
    """
    tenant_service = TenantService(db)
    
    try:
        tenant = await tenant_service.create_tenant(tenant_data, str(current_user["user"].id))
        return tenant
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/my-tenants")
async def get_my_tenants(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all tenants for current user
    """
    tenant_service = TenantService(db)
    tenants = await tenant_service.get_user_tenants(str(current_user["user"].id))
    
    return {"tenants": tenants}

@router.post("/{tenant_id}/users/{user_id}")
async def add_user_to_tenant(
    tenant_id: str,
    user_id: str,
    role: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add user to tenant (admin only)
    """
    # Verify current user is admin of the tenant
    if current_user["role"] != "admin" or current_user["tenant_id"] != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    tenant_service = TenantService(db)
    success = await tenant_service.add_user_to_tenant(
        tenant_id, user_id, role, str(current_user["user"].id)
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to add user to tenant"
        )
    
    return {"message": "User added to tenant successfully"}
