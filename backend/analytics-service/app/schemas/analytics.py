from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

class DeviceInfo(BaseModel):
    screen_width: int
    screen_height: int
    viewport_width: int
    viewport_height: int
    device_type: str = Field(..., regex="^(desktop|tablet|mobile)$")
    browser: str
    browser_version: str
    os: str
    os_version: str
    language: str
    timezone: str

class AnalyticsEventCreate(BaseModel):
    event_id: str = Field(..., description="Unique event identifier")
    tenant_id: str = Field(..., description="Tenant identifier")
    user_id: str = Field(..., description="User identifier")
    session_id: str = Field(..., description="Session identifier")
    event_name: str = Field(..., description="Event name")
    event_category: str = Field(..., description="Event category")
    properties: Dict[str, Any] = Field(default_factory=dict, description="Custom properties")
    timestamp: int = Field(..., description="Unix timestamp")
    page_url: str = Field(..., description="Current page URL")
    referrer: str = Field(default="", description="Referrer URL")
    user_agent: str = Field(..., description="Browser user agent")
    device_info: DeviceInfo = Field(..., description="Device information")
    correlation_id: str = Field(..., description="Request correlation ID")

class AnalyticsEventBatch(BaseModel):
    events: List[AnalyticsEventCreate] = Field(..., description="List of analytics events")
    batch_id: str = Field(..., description="Batch identifier")
    timestamp: int = Field(..., description="Batch timestamp")
    tenant_id: str = Field(..., description="Tenant identifier")

class AnalyticsEventResponse(BaseModel):
    id: str
    event_id: str
    tenant_id: str
    user_id: str
    session_id: str
    event_name: str
    event_category: str
    properties: Dict[str, Any]
    timestamp: datetime
    created_at: datetime
    page_url: str
    referrer: str
    user_agent: str
    device_info: Dict[str, Any]
    correlation_id: str
    batch_id: Optional[str] = None
    processed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class BatchProcessResponse(BaseModel):
    batch_id: str
    processed_events: int
    failed_events: int
    processing_time_ms: int
    message: str

class WebSocketMessage(BaseModel):
    type: str = Field(..., description="Message type")
    data: Dict[str, Any] = Field(default_factory=dict, description="Message data")
    timestamp: int = Field(default_factory=lambda: int(datetime.now().timestamp() * 1000))
    correlation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class HeartbeatMessage(BaseModel):
    type: str = "heartbeat"
    timestamp: int = Field(default_factory=lambda: int(datetime.now().timestamp() * 1000))

class AnalyticsStatsResponse(BaseModel):
    total_events: int
    events_today: int
    active_sessions: int
    top_events: List[Dict[str, Any]]
    error_rate: float
    avg_processing_time_ms: float
