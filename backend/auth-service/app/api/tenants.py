from fastapi import APIRouter, Depends, HTTPException, status
from app.services.tenant_service import TenantService
from app.schemas.tenant import TenantResponse, TenantCreate, TenantUpdate
from app.dependencies import get_tenant_service

router = APIRouter(prefix="/tenants", tags=["tenants"])

@router.post("/", response_model=TenantResponse)
async def create_tenant(tenant_data: TenantCreate, tenant_service: TenantService = Depends(get_tenant_service)):
    try:
        return tenant_service.create_tenant(tenant_data.dict())
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{tenant_id}", response_model=TenantResponse)
async def get_tenant(tenant_id: str, tenant_service: TenantService = Depends(get_tenant_service)):
    result = tenant_service.get_tenant(tenant_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    return result

@router.put("/{tenant_id}")
async def update_tenant(tenant_id: str, update_data: TenantUpdate, tenant_service: TenantService = Depends(get_tenant_service)):
    try:
        success = tenant_service.update_tenant(tenant_id, update_data.dict(exclude_unset=True))
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
        return {"message": "Tenant updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/")
async def get_all_tenants(tenant_service: TenantService = Depends(get_tenant_service)):
    return tenant_service.get_all_tenants()