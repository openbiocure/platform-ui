from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel
import uuid

class BaseEvent(BaseModel):
    """Base event schema"""
    event_id: str = None
    timestamp: datetime = None
    service: str
    version: str = "1.0"
    correlation_id: Optional[str] = None
    
    def __init__(self, **data):
        if not data.get('event_id'):
            data['event_id'] = str(uuid.uuid4())
        if not data.get('timestamp'):
            data['timestamp'] = datetime.utcnow()
        super().__init__(**data)

class AuditEvent(BaseEvent):
    """Audit event for security and compliance"""
    tenant_id: Optional[str] = None
    user_id: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    event_type: str  # create, update, delete, access, auth
    severity: str = "medium"  # low, medium, high, critical
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    details: Dict[str, Any] = {}
    
class LogEvent(BaseEvent):
    """Application log event"""
    level: str  # debug, info, warning, error, critical
    message: str
    module: str
    function: Optional[str] = None
    line_number: Optional[int] = None
    exception: Optional[str] = None
    context: Dict[str, Any] = {}

class MetricEvent(BaseEvent):
    """Performance/business metric event"""
    metric_name: str
    metric_value: float
    metric_type: str  # counter, gauge, histogram, timer
    tags: Dict[str, str] = {}
    unit: Optional[str] = None
