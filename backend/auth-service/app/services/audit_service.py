from typing import Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
import uuid

from ..models.audit import AuditLog

class AuditService:
    """
    Audit service for comprehensive security logging
    Implements tenant-scoped audit trails
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    async def log_security_event(
        self,
        tenant_id: Optional[str],
        event_type: str,
        action: str,
        severity: str,
        user_id: Optional[uuid.UUID] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        correlation_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> AuditLog:
        """
        Log security event with tenant context
        """
        audit_log = AuditLog(
            tenant_id=tenant_id,
            subject_type="user" if user_id else "system",
            subject_id=user_id,
            action=action,
            event_class=event_type,
            severity=severity,
            actor_user_id=user_id,
            request_id=correlation_id or str(uuid.uuid4()),
            source_service="auth-service",
            ip=ip_address,
            user_agent=user_agent,
            payload=details or {}
        )
        
        self.db.add(audit_log)
        self.db.commit()
        self.db.refresh(audit_log)
        
        return audit_log
    
    async def get_tenant_audit_logs(
        self,
        tenant_id: str,
        limit: int = 100,
        offset: int = 0,
        severity: Optional[str] = None,
        event_type: Optional[str] = None
    ) -> list[AuditLog]:
        """
        Get audit logs for specific tenant
        """
        query = self.db.query(AuditLog).filter(AuditLog.tenant_id == tenant_id)
        
        if severity:
            query = query.filter(AuditLog.severity == severity)
        
        if event_type:
            query = query.filter(AuditLog.event_class == event_type)
        
        return query.order_by(AuditLog.occurred_at.desc()).offset(offset).limit(limit).all()
