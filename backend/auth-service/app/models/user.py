from sqlalchemy import Column, String, Boolean, DateTime, UUID, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID as pg_UUID
from sqlalchemy.orm import relationship
from ..core.database import Base
import uuid

class User(Base):
    """
    User model following the database schema
    Represents individual users across all tenants
    """
    __tablename__ = "users"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    user_type_id = Column(pg_UUID(as_uuid=True), ForeignKey("user_types.id"), nullable=False)
    tenant_id = Column(pg_UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    email_verified = Column(Boolean, default=False, nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user_type = relationship("UserType")
    tenant = relationship("Tenant", back_populates="users")
    tenant_roles = relationship("TenantUser", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, username={self.username})>"