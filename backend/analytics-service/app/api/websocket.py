from fastapi import WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Set
import json
import asyncio
import uuid
from datetime import datetime

from app.core.database import get_db
from app.models.analytics_event import AnalyticsEvent
from app.schemas.analytics import AnalyticsEventCreate, WebSocketMessage, HeartbeatMessage

class ConnectionManager:
    def __init__(self):
        # Active connections: {tenant_id: {connection_id: websocket}}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        # Connection metadata: {connection_id: {tenant_id, user_id, connected_at}}
        self.connection_metadata: Dict[str, Dict] = {}

    async def connect(self, websocket: WebSocket, tenant_id: str, user_id: str = None):
        """Accept WebSocket connection and register it"""
        await websocket.accept()
        
        connection_id = str(uuid.uuid4())
        
        # Initialize tenant connections if not exists
        if tenant_id not in self.active_connections:
            self.active_connections[tenant_id] = {}
        
        # Store connection
        self.active_connections[tenant_id][connection_id] = websocket
        self.connection_metadata[connection_id] = {
            "tenant_id": tenant_id,
            "user_id": user_id,
            "connected_at": datetime.utcnow(),
            "last_heartbeat": datetime.utcnow()
        }
        
        print(f"📡 WebSocket connected: {connection_id} (tenant: {tenant_id}, user: {user_id})")
        
        # Send welcome message
        await self.send_personal_message({
            "type": "connection_established",
            "connection_id": connection_id,
            "tenant_id": tenant_id,
            "timestamp": int(datetime.now().timestamp() * 1000)
        }, connection_id)
        
        return connection_id

    def disconnect(self, connection_id: str):
        """Remove connection"""
        if connection_id in self.connection_metadata:
            metadata = self.connection_metadata[connection_id]
            tenant_id = metadata["tenant_id"]
            
            # Remove from active connections
            if tenant_id in self.active_connections:
                self.active_connections[tenant_id].pop(connection_id, None)
                
                # Clean up empty tenant connections
                if not self.active_connections[tenant_id]:
                    del self.active_connections[tenant_id]
            
            # Remove metadata
            del self.connection_metadata[connection_id]
            
            print(f"📡 WebSocket disconnected: {connection_id} (tenant: {tenant_id})")

    async def send_personal_message(self, message: dict, connection_id: str):
        """Send message to specific connection"""
        if connection_id in self.connection_metadata:
            metadata = self.connection_metadata[connection_id]
            tenant_id = metadata["tenant_id"]
            
            if tenant_id in self.active_connections and connection_id in self.active_connections[tenant_id]:
                websocket = self.active_connections[tenant_id][connection_id]
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    print(f"Failed to send message to {connection_id}: {e}")
                    self.disconnect(connection_id)

    async def send_to_tenant(self, message: dict, tenant_id: str):
        """Send message to all connections in a tenant"""
        if tenant_id in self.active_connections:
            disconnected_connections = []
            
            for connection_id, websocket in self.active_connections[tenant_id].items():
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    print(f"Failed to send message to {connection_id}: {e}")
                    disconnected_connections.append(connection_id)
            
            # Clean up disconnected connections
            for connection_id in disconnected_connections:
                self.disconnect(connection_id)

    async def broadcast(self, message: dict):
        """Send message to all active connections"""
        for tenant_id in list(self.active_connections.keys()):
            await self.send_to_tenant(message, tenant_id)

    def get_active_connections_count(self, tenant_id: str = None) -> int:
        """Get count of active connections"""
        if tenant_id:
            return len(self.active_connections.get(tenant_id, {}))
        else:
            return sum(len(connections) for connections in self.active_connections.values())

    def get_connection_stats(self) -> dict:
        """Get connection statistics"""
        total_connections = self.get_active_connections_count()
        tenant_stats = {
            tenant_id: len(connections) 
            for tenant_id, connections in self.active_connections.items()
        }
        
        return {
            "total_connections": total_connections,
            "tenant_connections": tenant_stats,
            "active_tenants": len(self.active_connections)
        }

# Global connection manager
manager = ConnectionManager()

async def process_analytics_event(event_data: dict, db: Session, connection_id: str):
    """Process analytics event received via WebSocket"""
    try:
        # Validate event data
        event = AnalyticsEventCreate(**event_data)
        
        # Create database record
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
            created_at=datetime.utcnow()
        )
        
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
        
        # Send acknowledgment
        await manager.send_personal_message({
            "type": "event_processed",
            "event_id": event.event_id,
            "status": "success",
            "timestamp": int(datetime.now().timestamp() * 1000)
        }, connection_id)
        
        return True
        
    except Exception as e:
        print(f"Failed to process analytics event: {e}")
        
        # Send error response
        await manager.send_personal_message({
            "type": "event_error",
            "error": str(e),
            "timestamp": int(datetime.now().timestamp() * 1000)
        }, connection_id)
        
        return False

async def handle_heartbeat(connection_id: str):
    """Handle heartbeat message"""
    if connection_id in manager.connection_metadata:
        manager.connection_metadata[connection_id]["last_heartbeat"] = datetime.utcnow()
        
        await manager.send_personal_message({
            "type": "heartbeat_ack",
            "timestamp": int(datetime.now().timestamp() * 1000)
        }, connection_id)

async def websocket_endpoint(websocket: WebSocket, tenant_id: str, user_id: str = None, db: Session = Depends(get_db)):
    """Main WebSocket endpoint for analytics"""
    connection_id = await manager.connect(websocket, tenant_id, user_id)
    
    try:
        while True:
            # Receive message
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                message_type = message.get("type", "unknown")
                
                if message_type == "heartbeat":
                    await handle_heartbeat(connection_id)
                    
                elif message_type == "analytics_event":
                    event_data = message.get("data", {})
                    await process_analytics_event(event_data, db, connection_id)
                    
                elif message_type == "ping":
                    await manager.send_personal_message({
                        "type": "pong",
                        "timestamp": int(datetime.now().timestamp() * 1000)
                    }, connection_id)
                    
                else:
                    print(f"Unknown message type: {message_type}")
                    
            except json.JSONDecodeError as e:
                await manager.send_personal_message({
                    "type": "error",
                    "message": f"Invalid JSON: {str(e)}",
                    "timestamp": int(datetime.now().timestamp() * 1000)
                }, connection_id)
                
    except WebSocketDisconnect:
        manager.disconnect(connection_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(connection_id)

# Background task to clean up stale connections
async def cleanup_stale_connections():
    """Remove connections that haven't sent heartbeat in a while"""
    while True:
        try:
            current_time = datetime.utcnow()
            stale_connections = []
            
            for connection_id, metadata in manager.connection_metadata.items():
                last_heartbeat = metadata.get("last_heartbeat")
                if last_heartbeat:
                    time_diff = (current_time - last_heartbeat).total_seconds()
                    if time_diff > 300:  # 5 minutes without heartbeat
                        stale_connections.append(connection_id)
            
            # Disconnect stale connections
            for connection_id in stale_connections:
                manager.disconnect(connection_id)
                print(f"Cleaned up stale connection: {connection_id}")
                
        except Exception as e:
            print(f"Error in cleanup task: {e}")
        
        # Run cleanup every 60 seconds
        await asyncio.sleep(60)
