from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from typing import List, Optional
from datetime import datetime, timedelta
import time

from app.core.database import get_db
from app.models.analytics_event import AnalyticsEvent
from app.schemas.analytics import (
    AnalyticsEventCreate, 
    AnalyticsEventBatch, 
    AnalyticsEventResponse,
    BatchProcessResponse,
    AnalyticsStatsResponse
)
from app.api.websocket import manager

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])

@router.post("/batch", response_model=BatchProcessResponse)
async def process_event_batch(
    batch: AnalyticsEventBatch,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Process a batch of analytics events"""
    start_time = time.time()
    processed_events = 0
    failed_events = 0
    
    try:
        for event_data in batch.events:
            try:
                # Create database record
                db_event = AnalyticsEvent(
                    event_id=event_data.event_id,
                    tenant_id=event_data.tenant_id,
                    user_id=event_data.user_id,
                    session_id=event_data.session_id,
                    event_name=event_data.event_name,
                    event_category=event_data.event_category,
                    properties=event_data.properties,
                    timestamp=datetime.fromtimestamp(event_data.timestamp / 1000),
                    page_url=event_data.page_url,
                    referrer=event_data.referrer,
                    user_agent=event_data.user_agent,
                    device_info=event_data.device_info.dict(),
                    correlation_id=event_data.correlation_id,
                    batch_id=batch.batch_id,
                    created_at=datetime.utcnow(),
                    processed_at=datetime.utcnow()
                )
                
                db.add(db_event)
                processed_events += 1
                
            except Exception as e:
                print(f"Failed to process event {event_data.event_id}: {e}")
                failed_events += 1
        
        # Commit all events in the batch
        db.commit()
        
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        # Notify connected clients about batch processing (background task)
        background_tasks.add_task(
            notify_batch_processed,
            batch.tenant_id,
            batch.batch_id,
            processed_events,
            failed_events
        )
        
        return BatchProcessResponse(
            batch_id=batch.batch_id,
            processed_events=processed_events,
            failed_events=failed_events,
            processing_time_ms=processing_time_ms,
            message=f"Successfully processed {processed_events} events"
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Batch processing failed: {str(e)}")

@router.post("/events", response_model=AnalyticsEventResponse)
async def create_event(
    event: AnalyticsEventCreate,
    db: Session = Depends(get_db)
):
    """Create a single analytics event"""
    try:
        db_event = AnalyticsEvent(
            event_id=event.event_id,
            tenant_id=event.tenant_id,
            user_id=event.user_id,
            session_id=event.session_id,
            event_name=event.event_name,
            event_category=event.event_category,
            properties=event.properties,
            timestamp=datetime.fromtimestamp(event.timestamp / 1000),
            page_url=event.page_url,
            referrer=event.referrer,
            user_agent=event.user_agent,
            device_info=event.device_info.dict(),
            correlation_id=event.correlation_id,
            created_at=datetime.utcnow(),
            processed_at=datetime.utcnow()
        )
        
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
        
        return AnalyticsEventResponse.from_orm(db_event)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create event: {str(e)}")

@router.get("/events", response_model=List[AnalyticsEventResponse])
async def get_events(
    tenant_id: str = Query(..., description="Tenant ID"),
    user_id: Optional[str] = Query(None, description="User ID filter"),
    event_name: Optional[str] = Query(None, description="Event name filter"),
    event_category: Optional[str] = Query(None, description="Event category filter"),
    start_date: Optional[datetime] = Query(None, description="Start date filter"),
    end_date: Optional[datetime] = Query(None, description="End date filter"),
    limit: int = Query(100, ge=1, le=1000, description="Number of events to return"),
    offset: int = Query(0, ge=0, description="Number of events to skip"),
    db: Session = Depends(get_db)
):
    """Get analytics events with filtering"""
    try:
        query = db.query(AnalyticsEvent).filter(AnalyticsEvent.tenant_id == tenant_id)
        
        # Apply filters
        if user_id:
            query = query.filter(AnalyticsEvent.user_id == user_id)
        
        if event_name:
            query = query.filter(AnalyticsEvent.event_name == event_name)
            
        if event_category:
            query = query.filter(AnalyticsEvent.event_category == event_category)
            
        if start_date:
            query = query.filter(AnalyticsEvent.timestamp >= start_date)
            
        if end_date:
            query = query.filter(AnalyticsEvent.timestamp <= end_date)
        
        # Order by timestamp (newest first) and apply pagination
        events = query.order_by(desc(AnalyticsEvent.timestamp)).offset(offset).limit(limit).all()
        
        return [AnalyticsEventResponse.from_orm(event) for event in events]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve events: {str(e)}")

@router.get("/stats", response_model=AnalyticsStatsResponse)
async def get_analytics_stats(
    tenant_id: str = Query(..., description="Tenant ID"),
    period_hours: int = Query(24, ge=1, le=8760, description="Period in hours"),
    db: Session = Depends(get_db)
):
    """Get analytics statistics for a tenant"""
    try:
        # Calculate time range
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=period_hours)
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Total events count
        total_events = db.query(func.count(AnalyticsEvent.id)).filter(
            AnalyticsEvent.tenant_id == tenant_id
        ).scalar() or 0
        
        # Events today
        events_today = db.query(func.count(AnalyticsEvent.id)).filter(
            and_(
                AnalyticsEvent.tenant_id == tenant_id,
                AnalyticsEvent.timestamp >= today_start
            )
        ).scalar() or 0
        
        # Active sessions (unique session_ids in the period)
        active_sessions = db.query(func.count(func.distinct(AnalyticsEvent.session_id))).filter(
            and_(
                AnalyticsEvent.tenant_id == tenant_id,
                AnalyticsEvent.timestamp >= start_time
            )
        ).scalar() or 0
        
        # Top events in the period
        top_events_query = db.query(
            AnalyticsEvent.event_name,
            func.count(AnalyticsEvent.id).label('count')
        ).filter(
            and_(
                AnalyticsEvent.tenant_id == tenant_id,
                AnalyticsEvent.timestamp >= start_time
            )
        ).group_by(AnalyticsEvent.event_name).order_by(desc('count')).limit(10)
        
        top_events = [
            {"event_name": row.event_name, "count": row.count}
            for row in top_events_query.all()
        ]
        
        # Error events count
        error_events = db.query(func.count(AnalyticsEvent.id)).filter(
            and_(
                AnalyticsEvent.tenant_id == tenant_id,
                AnalyticsEvent.event_category == 'error',
                AnalyticsEvent.timestamp >= start_time
            )
        ).scalar() or 0
        
        # Calculate error rate
        period_events = db.query(func.count(AnalyticsEvent.id)).filter(
            and_(
                AnalyticsEvent.tenant_id == tenant_id,
                AnalyticsEvent.timestamp >= start_time
            )
        ).scalar() or 0
        
        error_rate = (error_events / period_events * 100) if period_events > 0 else 0.0
        
        # Average processing time (simulated for now)
        avg_processing_time_ms = 15.5  # This would be calculated from actual processing times
        
        return AnalyticsStatsResponse(
            total_events=total_events,
            events_today=events_today,
            active_sessions=active_sessions,
            top_events=top_events,
            error_rate=round(error_rate, 2),
            avg_processing_time_ms=avg_processing_time_ms
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve stats: {str(e)}")

@router.get("/dashboard")
async def get_dashboard_data(
    tenant_id: str = Query(..., description="Tenant ID"),
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard data"""
    try:
        # Get various time periods
        now = datetime.utcnow()
        last_24h = now - timedelta(hours=24)
        last_7d = now - timedelta(days=7)
        last_30d = now - timedelta(days=30)
        
        # Events by day (last 7 days)
        daily_events = db.query(
            func.date(AnalyticsEvent.timestamp).label('date'),
            func.count(AnalyticsEvent.id).label('count')
        ).filter(
            and_(
                AnalyticsEvent.tenant_id == tenant_id,
                AnalyticsEvent.timestamp >= last_7d
            )
        ).group_by(func.date(AnalyticsEvent.timestamp)).order_by('date').all()
        
        # Events by category (last 30 days)
        category_events = db.query(
            AnalyticsEvent.event_category,
            func.count(AnalyticsEvent.id).label('count')
        ).filter(
            and_(
                AnalyticsEvent.tenant_id == tenant_id,
                AnalyticsEvent.timestamp >= last_30d
            )
        ).group_by(AnalyticsEvent.event_category).order_by(desc('count')).all()
        
        # Device types (last 30 days)
        device_types = db.query(
            func.json_extract_path_text(AnalyticsEvent.device_info, 'device_type').label('device_type'),
            func.count(AnalyticsEvent.id).label('count')
        ).filter(
            and_(
                AnalyticsEvent.tenant_id == tenant_id,
                AnalyticsEvent.timestamp >= last_30d
            )
        ).group_by('device_type').order_by(desc('count')).all()
        
        # Active users (last 24h)
        active_users_24h = db.query(func.count(func.distinct(AnalyticsEvent.user_id))).filter(
            and_(
                AnalyticsEvent.tenant_id == tenant_id,
                AnalyticsEvent.timestamp >= last_24h
            )
        ).scalar() or 0
        
        return {
            "tenant_id": tenant_id,
            "generated_at": now.isoformat(),
            "summary": {
                "active_users_24h": active_users_24h,
                "total_events_7d": sum(row.count for row in daily_events),
                "websocket_connections": manager.get_active_connections_count(tenant_id)
            },
            "daily_events": [
                {"date": row.date.isoformat(), "count": row.count}
                for row in daily_events
            ],
            "category_breakdown": [
                {"category": row.event_category or "uncategorized", "count": row.count}
                for row in category_events
            ],
            "device_breakdown": [
                {"device_type": row.device_type or "unknown", "count": row.count}
                for row in device_types
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve dashboard data: {str(e)}")

@router.get("/connections")
async def get_connection_stats():
    """Get WebSocket connection statistics"""
    return manager.get_connection_stats()

async def notify_batch_processed(tenant_id: str, batch_id: str, processed: int, failed: int):
    """Background task to notify clients about batch processing"""
    await manager.send_to_tenant({
        "type": "batch_processed",
        "batch_id": batch_id,
        "processed_events": processed,
        "failed_events": failed,
        "timestamp": int(datetime.now().timestamp() * 1000)
    }, tenant_id)
