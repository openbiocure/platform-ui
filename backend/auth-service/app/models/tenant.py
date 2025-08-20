from sqlalchemy import Column, String, DateTime, UUID, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID as pg_UUID
from sqlalchemy.orm import relationship
from ..core.database import Base
import uuid

class Tenant(Base):
    """
    Tenant model for multi-tenant SaaS architecture
    Represents organizations/customers using the platform
    """
    __tablename__ = "tenants"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    login_mode = Column(String, nullable=False, default="email")  # email, sso, hybrid
    default_idp_id = Column(pg_UUID(as_uuid=True), ForeignKey("identity_providers.id"), nullable=True)
    settings = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<Tenant(id={self.id}, name={self.name}, slug={self.slug})>"

class TenantUser(Base):
    """
    Many-to-many relationship between tenants and users with roles
    Implements tenant isolation at the user level
    """
    __tablename__ = "tenant_users"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(pg_UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    user_id = Column(pg_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String, nullable=False, default="member")  # admin, member, viewer
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<TenantUser(tenant_id={self.tenant_id}, user_id={self.user_id}, role={self.role})>"
