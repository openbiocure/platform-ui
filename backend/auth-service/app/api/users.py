from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.services.user_service import UserService
from app.schemas.user import UserResponse, UserUpdate
from app.dependencies import get_user_service

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/profile", response_model=UserResponse)
async def get_profile(user_id: str, user_service: UserService = Depends(get_user_service)):
    result = user_service.get_profile(user_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return result

@router.put("/profile")
async def update_profile(user_id: str, update_data: UserUpdate, user_service: UserService = Depends(get_user_service)):
    try:
        success = user_service.update_profile(user_id, update_data.dict(exclude_unset=True))
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return {"message": "Profile updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/tenant/{tenant_id}")
async def get_tenant_users(tenant_id: str, current_user_id: str, user_service: UserService = Depends(get_user_service)):
    try:
        return user_service.get_tenant_users(tenant_id, current_user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

@router.delete("/{user_id}")
async def deactivate_user(user_id: str, user_service: UserService = Depends(get_user_service)):
    success = user_service.deactivate_user(user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"message": "User deactivated successfully"}