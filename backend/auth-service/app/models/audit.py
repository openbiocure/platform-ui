from sqlalchemy import Column, String, DateTime, UUID, ForeignKey, JSON, Text
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID as pg_UUID, INET
from ..core.database import Base
import uuid

class AuditLog(Base):
    """
    Comprehensive audit logging for security and compliance
    Tenant-scoped logging for multi-tenant isolation
    """
    __tablename__ = "audit_logs"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(pg_UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    subject_type = Column(Text, nullable=False)  # user, tenant, session, etc.
    subject_id = Column(pg_UUID(as_uuid=True), nullable=True)
    action = Column(Text, nullable=False)  # login, logout, create, update, delete
    event_class = Column(Text, nullable=False)  # authentication, authorization, data_access
    severity = Column(Text, nullable=False)  # low, medium, high, critical
    actor_user_id = Column(pg_UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    team_id = Column(pg_UUID(as_uuid=True), nullable=True)
    workspace_id = Column(pg_UUID(as_uuid=True), nullable=True)
    request_id = Column(Text, nullable=False)  # Correlation ID
    idempotency_key = Column(Text, nullable=True)
    source_service = Column(Text, nullable=False, default="auth-service")
    ip = Column(INET, nullable=True)
    user_agent = Column(Text, nullable=True)
    occurred_at = Column(DateTime(timezone=True), server_default=func.now())
    payload = Column(JSON, default=dict)  # Additional event data
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, tenant_id={self.tenant_id}, action={self.action})>"
