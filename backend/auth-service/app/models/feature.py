from sqlalchemy import Column, String, Boolean, DateTime, UUID, JSON, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID as pg_UUID
from sqlalchemy.orm import relationship
from ..core.database import Base
from .enums import FeatureCategory, FeatureCategoryEnum, TenantRole, TenantRoleEnum, TenantType, TenantTypeEnum
import uuid

class Feature(Base):
    """
    Feature definition model
    Defines available features in the system
    """
    __tablename__ = "features"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False, index=True)  # ai_assistant, advanced_analytics
    display_name = Column(String, nullable=False)  # "AI Assistant", "Advanced Analytics"
    description = Column(Text, nullable=True)
    category = Column(FeatureCategoryEnum, nullable=False, default=FeatureCategory.GENERAL)
    is_active = Column(Boolean, default=True, nullable=False)
    requires_tenant_permission = Column(Boolean, default=True, nullable=False)
    metadata = Column(JSON, default=dict)  # pricing, dependencies, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<Feature(id={self.id}, name={self.name}, display_name={self.display_name})>"

class RoleFeature(Base):
    """
    Many-to-many relationship between roles and features
    Defines which features are available for each role
    """
    __tablename__ = "role_features"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role = Column(TenantRoleEnum, nullable=False, index=True)
    feature_id = Column(pg_UUID(as_uuid=True), ForeignKey("features.id"), nullable=False)
    tenant_type = Column(TenantTypeEnum, nullable=True)  # null = all types
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    feature = relationship("Feature")
    
    def __repr__(self):
        return f"<RoleFeature(role={self.role}, feature_id={self.feature_id})>"

class UserFeatureOverride(Base):
    """
    User-specific feature overrides
    Allows granting/revoking specific features per user
    """
    __tablename__ = "user_feature_overrides"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(pg_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    feature_id = Column(pg_UUID(as_uuid=True), ForeignKey("features.id"), nullable=False)
    tenant_id = Column(pg_UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    is_granted = Column(Boolean, nullable=False)  # True = grant, False = revoke
    granted_by = Column(pg_UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reason = Column(Text, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    feature = relationship("Feature")
    tenant = relationship("Tenant")
    granted_by_user = relationship("User", foreign_keys=[granted_by])
    
    def __repr__(self):
        return f"<UserFeatureOverride(user_id={self.user_id}, feature_id={self.feature_id}, granted={self.is_granted})>"
