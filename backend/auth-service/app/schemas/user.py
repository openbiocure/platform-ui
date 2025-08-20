from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
import uuid

class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    full_name: str = Field(..., min_length=2, max_length=100, description="Full name")

class UserCreate(UserBase):
    """User creation schema"""
    password: str = Field(..., min_length=8, description="Password")

class UserUpdate(BaseModel):
    """User update schema"""
    email: Optional[EmailStr] = Field(None, description="User email address")
    username: Optional[str] = Field(None, min_length=3, max_length=50, description="Username")
    full_name: Optional[str] = Field(None, min_length=2, max_length=100, description="Full name")
    is_active: Optional[bool] = Field(None, description="User active status")

class UserResponse(UserBase):
    """User response schema with tenant context"""
    id: str = Field(..., description="User UUID")
    is_active: bool = Field(..., description="User active status")
    created_at: datetime = Field(..., description="User creation time")
    updated_at: datetime = Field(..., description="User last update time")
    tenants: List[dict] = Field(default_factory=list, description="User's tenant memberships")
    
    class Config:
        from_attributes = True
