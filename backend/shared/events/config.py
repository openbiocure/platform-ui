import os
from typing import Dict, Any
from .producer import EventProducer, InMemoryEventProducer, FileEventProducer, KafkaEventProducer

class EventConfig:
    """Configuration for event producers"""
    
    @staticmethod
    def get_producer_config() -> Dict[str, Any]:
        """Get producer configuration from environment"""
        return {
            "type": os.getenv("EVENT_PRODUCER_TYPE", "memory"),  # memory, file, kafka
            "file_base_path": os.getenv("EVENT_FILE_PATH", "/tmp/events"),
            "kafka_servers": os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092"),
            "kafka_config": {
                "compression_type": os.getenv("KAFKA_COMPRESSION", "gzip"),
                "batch_size": int(os.getenv("KAFKA_BATCH_SIZE", "16384")),
                "linger_ms": int(os.getenv("KAFKA_LINGER_MS", "10"))
            }
        }
    
    @staticmethod
    def create_producer() -> EventProducer:
        """Factory method to create the configured producer"""
        config = EventConfig.get_producer_config()
        producer_type = config["type"]
        
        if producer_type == "memory":
            return InMemoryEventProducer()
        elif producer_type == "file":
            return FileEventProducer(config["file_base_path"])
        elif producer_type == "kafka":
            return KafkaEventProducer(
                config["kafka_servers"],
                **config["kafka_config"]
            )
        else:
            raise ValueError(f"Unknown producer type: {producer_type}")

# Global producer instance (singleton pattern)
_producer: EventProducer = None

async def get_event_producer() -> EventProducer:
    """Get the global event producer instance"""
    global _producer
    if _producer is None:
        _producer = EventConfig.create_producer()
    return _producer

async def close_event_producer():
    """Close the global event producer"""
    global _producer
    if _producer:
        await _producer.close()
        _producer = None
