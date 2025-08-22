from sqlalchemy import Column, String, Boolean, DateTime, UUID, JSON, Text, Integer
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID as pg_UUID
from ..core.database import Base
import uuid

class UserType(Base):
    """User type reference table"""
    __tablename__ = "user_types"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String, unique=True, nullable=False, index=True)  # individual, organization_admin
    name = Column(String, nullable=False)  # "Individual User", "Organization Admin"
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0)
    metadata = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<UserType(code={self.code}, name={self.name})>"

class TenantType(Base):
    """Tenant type reference table"""
    __tablename__ = "tenant_types"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String, unique=True, nullable=False, index=True)  # organization, trial, enterprise
    name = Column(String, nullable=False)  # "Organization", "Trial Account"
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0)
    default_settings = Column(JSON, default=dict)  # Default tenant settings for this type
    metadata = Column(JSON, default=dict)  # billing info, limits, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<TenantType(code={self.code}, name={self.name})>"

class Role(Base):
    """Role reference table for OPA integration"""
    __tablename__ = "roles"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String, unique=True, nullable=False, index=True)  # admin, member, viewer
    name = Column(String, nullable=False)  # "Administrator", "Member"
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_system_role = Column(Boolean, default=False, nullable=False)  # System vs custom roles
    sort_order = Column(Integer, default=0)
    permissions = Column(JSON, default=list)  # Base permissions for OPA
    metadata = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<Role(code={self.code}, name={self.name})>"

class FeatureCategory(Base):
    """Feature category reference table"""
    __tablename__ = "feature_categories"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String, unique=True, nullable=False, index=True)  # research, collaboration
    name = Column(String, nullable=False)  # "Research Tools", "Collaboration"
    description = Column(Text, nullable=True)
    icon = Column(String, nullable=True)  # Icon name/class for UI
    color = Column(String, nullable=True)  # Color code for UI
    is_active = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0)
    metadata = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<FeatureCategory(code={self.code}, name={self.name})>"

class AuditEventType(Base):
    """Audit event type reference table"""
    __tablename__ = "audit_event_types"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String, unique=True, nullable=False, index=True)  # authentication, authorization
    name = Column(String, nullable=False)  # "Authentication", "Authorization"
    description = Column(Text, nullable=True)
    severity_default = Column(String, nullable=False, default="medium")  # Default severity
    retention_days = Column(Integer, default=365)  # How long to keep these events
    is_active = Column(Boolean, default=True, nullable=False)
    metadata = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<AuditEventType(code={self.code}, name={self.name})>"
