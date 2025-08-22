from sqlalchemy import Column, String, Integer, DateTime, Text, JSON, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

Base = declarative_base()

class AnalyticsEvent(Base):
    """Analytics events table for storing user interactions and system events"""
    __tablename__ = "analytics_events"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Event identification
    event_id = Column(String(255), nullable=False, unique=True, index=True)
    correlation_id = Column(String(255), nullable=True, index=True)
    
    # Tenant and user context
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    session_id = Column(String(255), nullable=True, index=True)
    
    # Event details
    event_name = Column(String(255), nullable=False, index=True)
    event_category = Column(String(100), nullable=True, index=True)
    properties = Column(JSON, nullable=True)
    
    # Timing
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    
    # Web context
    page_url = Column(Text, nullable=True)
    referrer = Column(Text, nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Device information
    device_info = Column(JSON, nullable=True)
    
    # Batch processing
    batch_id = Column(String(255), nullable=True, index=True)
    processed_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<AnalyticsEvent(id={self.id}, event_name={self.event_name}, tenant_id={self.tenant_id})>"

# Create performance indexes
Index('idx_analytics_events_tenant_timestamp', AnalyticsEvent.tenant_id, AnalyticsEvent.timestamp)
Index('idx_analytics_events_user_timestamp', AnalyticsEvent.user_id, AnalyticsEvent.timestamp)
Index('idx_analytics_events_session_timestamp', AnalyticsEvent.session_id, AnalyticsEvent.timestamp)
Index('idx_analytics_events_category_timestamp', AnalyticsEvent.event_category, AnalyticsEvent.timestamp)

# Composite indexes for common queries
Index('idx_analytics_events_tenant_user_timestamp', AnalyticsEvent.tenant_id, AnalyticsEvent.user_id, AnalyticsEvent.timestamp)
Index('idx_analytics_events_tenant_category_timestamp', AnalyticsEvent.tenant_id, AnalyticsEvent.event_category, AnalyticsEvent.timestamp)
