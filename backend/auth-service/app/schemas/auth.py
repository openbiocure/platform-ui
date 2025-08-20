from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
import uuid

class TenantContext(BaseModel):
    """Tenant context for multi-tenant security"""
    tenant_id: str = Field(..., description="Tenant UUID")
    tenant_slug: str = Field(..., description="Tenant slug for routing")
    role: str = Field(..., description="User role within tenant")

class UserLogin(BaseModel):
    """User login request with tenant context"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="User password")
    tenant_slug: Optional[str] = Field(None, description="Tenant slug for login")
    correlation_id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))

class UserRegister(BaseModel):
    """User registration request"""
    email: EmailStr = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    full_name: str = Field(..., min_length=2, max_length=100, description="Full name")
    password: str = Field(..., min_length=8, description="Password")
    tenant_slug: Optional[str] = Field(None, description="Tenant to join")

class TokenResponse(BaseModel):
    """JWT token response with tenant context"""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration in seconds")
    tenant_context: TenantContext = Field(..., description="Tenant context")
    session_key: str = Field(..., description="Session encryption key")
    correlation_id: str = Field(..., description="Request correlation ID")

class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    refresh_token: str = Field(..., description="JWT refresh token")
    tenant_id: str = Field(..., description="Tenant UUID")

class SecureSession(BaseModel):
    """Secure session information with tenant context"""
    session_id: str = Field(..., description="Session UUID")
    tenant_id: str = Field(..., description="Tenant UUID")
    user_id: str = Field(..., description="User UUID")
    created_at: datetime = Field(..., description="Session creation time")
    expires_at: datetime = Field(..., description="Session expiration time")
    permissions: List[str] = Field(default_factory=list, description="Granted permissions")
    ip_address: Optional[str] = Field(None, description="Client IP address")
    
class OAuthCallback(BaseModel):
    """OAuth callback data"""
    code: str = Field(..., description="OAuth authorization code")
    state: str = Field(..., description="OAuth state parameter")
    tenant_slug: Optional[str] = Field(None, description="Tenant slug")
