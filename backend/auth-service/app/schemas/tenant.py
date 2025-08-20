from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class TenantBase(BaseModel):
    """Base tenant schema"""
    name: str = Field(..., min_length=2, max_length=100, description="Tenant name")
    slug: str = Field(..., min_length=2, max_length=50, description="Tenant slug")
    login_mode: str = Field(default="email", description="Login mode: email, sso, hybrid")

class TenantCreate(TenantBase):
    """Tenant creation schema"""
    settings: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Tenant settings")

class TenantResponse(TenantBase):
    """Tenant response schema"""
    id: str = Field(..., description="Tenant UUID")
    settings: Dict[str, Any] = Field(..., description="Tenant settings")
    created_at: datetime = Field(..., description="Tenant creation time")
    updated_at: datetime = Field(..., description="Tenant last update time")
    
    class Config:
        from_attributes = True
