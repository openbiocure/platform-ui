from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import json
import logging
from datetime import datetime
from pathlib import Path

class EventProducer(ABC):
    """Abstract event producer that can be implemented with different backends"""
    
    @abstractmethod
    async def publish(self, topic: str, event: Dict[str, Any], key: Optional[str] = None) -> bool:
        """Publish an event to a topic"""
        pass
    
    @abstractmethod
    async def close(self):
        """Cleanup resources"""
        pass

class InMemoryEventProducer(EventProducer):
    """Simple in-memory producer for development/testing"""
    
    def __init__(self):
        self.events = []
        self.logger = logging.getLogger(__name__)
    
    async def publish(self, topic: str, event: Dict[str, Any], key: Optional[str] = None) -> bool:
        """Store event in memory and log it"""
        event_record = {
            "topic": topic,
            "key": key,
            "event": event,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.events.append(event_record)
        self.logger.info(f"Event published to {topic}: {json.dumps(event, default=str)}")
        return True
    
    async def close(self):
        """No cleanup needed for in-memory"""
        pass
    
    def get_events(self, topic: Optional[str] = None):
        """Get events for debugging"""
        if topic:
            return [e for e in self.events if e["topic"] == topic]
        return self.events

class FileEventProducer(EventProducer):
    """File-based producer for simple persistent events"""
    
    def __init__(self, base_path: str = "/tmp/events"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(exist_ok=True)
        self.logger = logging.getLogger(__name__)
    
    async def publish(self, topic: str, event: Dict[str, Any], key: Optional[str] = None) -> bool:
        """Write event to topic-specific file"""
        try:
            topic_file = self.base_path / f"{topic}.jsonl"
            event_record = {
                "key": key,
                "event": event,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            with open(topic_file, "a") as f:
                f.write(json.dumps(event_record, default=str) + "\n")
            
            self.logger.info(f"Event written to {topic_file}: {key}")
            return True
        except Exception as e:
            self.logger.error(f"Failed to write event to file: {e}")
            return False
    
    async def close(self):
        """No cleanup needed for file"""
        pass

class KafkaEventProducer(EventProducer):
    """Kafka producer (future implementation)"""
    
    def __init__(self, bootstrap_servers: str, **config):
        self.bootstrap_servers = bootstrap_servers
        self.config = config
        self.producer = None
        # TODO: Initialize Kafka producer when aiokafka is added
    
    async def publish(self, topic: str, event: Dict[str, Any], key: Optional[str] = None) -> bool:
        """Publish to Kafka (placeholder for now)"""
        # TODO: Implement when Kafka is added
        raise NotImplementedError("Kafka producer not yet implemented")
    
    async def close(self):
        """Close Kafka producer"""
        # TODO: Implement when Kafka is added
        pass
