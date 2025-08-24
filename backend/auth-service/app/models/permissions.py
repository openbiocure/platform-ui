"""
Permission and Role models for RBAC + ABAC system
"""
from sqlalchemy import Column, String, Text, Boolean, Integer, JSON, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import uuid

from app.core.database import Base

class Role(Base):
    """Role model for RBAC system"""
    __tablename__ = "roles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    is_system_role = Column(Boolean, default=False)  # Built-in vs custom
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="roles")
    users = relationship("User", back_populates="role")
    permissions = relationship("Permission", back_populates="role", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Role(name='{self.name}', tenant_id='{self.tenant_id}')>"

class Permission(Base):
    """Permission model for fine-grained access control"""
    __tablename__ = "permissions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resource = Column(String(100), nullable=False, index=True)  # "publications", "workspace", "projects"
    action = Column(String(50), nullable=False, index=True)     # "read", "write", "delete", "create"
    conditions = Column(JSON, nullable=True)                    # ABAC conditions
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    role = relationship("Role", back_populates="permissions")
    
    def __repr__(self):
        return f"<Permission(resource='{self.resource}', action='{self.action}', role_id='{self.role_id}')>"

class TenantSecurityPolicy(Base):
    """Tenant-specific security policies for OPA integration"""
    __tablename__ = "tenant_security_policies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    policy_name = Column(String(200), nullable=False, index=True)
    policy_type = Column(String(50), nullable=False, index=True)  # "rbac", "abac", "opa"
    policy_content = Column(JSON, nullable=False)                 # Policy definition
    is_active = Column(Boolean, default=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="security_policies")
    creator = relationship("User", foreign_keys=[created_by])
    
    def __repr__(self):
        return f"<TenantSecurityPolicy(name='{self.policy_name}', type='{self.policy_type}', tenant_id='{self.tenant_id}')>"

class UserProjectMembership(Base):
    """User membership in projects for context-aware permissions"""
    __tablename__ = "user_project_memberships"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    project_id = Column(UUID(as_uuid=True), nullable=False, index=True)  # External project ID
    role = Column(String(50), nullable=False)  # "owner", "member", "viewer"
    joined_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", back_populates="project_memberships")
    
    def __repr__(self):
        return f"<UserProjectMembership(user_id='{self.user_id}', project_id='{self.project_id}', role='{self.role}')>"
