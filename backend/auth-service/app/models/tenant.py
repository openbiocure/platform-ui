from sqlalchemy import Column, String, DateTime, UUID, ForeignKey, JSON, Boolean
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
    tenant_type_id = Column(pg_UUID(as_uuid=True), ForeignKey("tenant_types.id"), nullable=False, index=True)
    description = Column(String, nullable=True)
    login_mode = Column(String, nullable=False, default="email")
    default_idp_id = Column(pg_UUID(as_uuid=True), ForeignKey("identity_providers.id"), nullable=True)
    settings = Column(JSON, default=dict)  # billing_plan, max_users, etc.
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    tenant_type = relationship("TenantType")
    users = relationship("User", back_populates="tenant")
    tenant_users = relationship("TenantUser", back_populates="tenant")
    
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
    role_id = Column(pg_UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    tenant = relationship("Tenant", back_populates="tenant_users")
    user = relationship("User", back_populates="tenant_roles")
    role = relationship("Role")
    
    def __repr__(self):
        return f"<TenantUser(tenant_id={self.tenant_id}, user_id={self.user_id}, role={self.role})>"