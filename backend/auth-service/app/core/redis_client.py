"""
Redis client for caching and distributed session management
"""
import redis
import json
import pickle
from typing import Optional, Any, Dict
from datetime import timedelta
from .config import service_registry

class RedisClient:
    """Redis client for caching and distributed operations"""
    
    def __init__(self):
        self.redis_client = None
        self.connected = False
        self.connect()
    
    def connect(self):
        """Connect to Redis"""
        try:
            config = service_registry.get_redis_config()
            
            if config.get("cluster", {}).get("enabled"):
                # Redis Cluster mode
                self.redis_client = redis.RedisCluster(
                    startup_nodes=config["cluster"]["nodes"],
                    max_connections=config["max_connections"],
                    decode_responses=True,
                    max_redirects=config["cluster"]["max_redirects"]
                )
            else:
                # Single Redis instance
                self.redis_client = redis.Redis(
                    host=config["host"],
                    port=config["port"],
                    password=config["password"],
                    db=config["db"],
                    ssl=config["ssl"],
                    max_connections=config["max_connections"],
                    decode_responses=True
                )
            
            # Test connection
            self.redis_client.ping()
            self.connected = True
            print(f"✅ Redis connected: {config['host']}:{config['port']}")
            
        except Exception as e:
            print(f"❌ Redis connection failed: {e}")
            self.connected = False
            self.redis_client = None
    
    def is_connected(self) -> bool:
        """Check if Redis is connected"""
        if not self.connected or not self.redis_client:
            return False
        
        try:
            self.redis_client.ping()
            return True
        except:
            self.connected = False
            return False
    
    def set_service_token(self, service_id: str, token: str, ttl: int = 3600) -> bool:
        """Cache service authentication token"""
        if not self.is_connected():
            return False
        
        try:
            key = f"service_token:{service_id}"
            self.redis_client.setex(key, ttl, token)
            return True
        except Exception as e:
            print(f"Failed to cache service token: {e}")
            return False
    
    def get_service_token(self, service_id: str) -> Optional[str]:
        """Get cached service token"""
        if not self.is_connected():
            return None
        
        try:
            key = f"service_token:{service_id}"
            return self.redis_client.get(key)
        except Exception as e:
            print(f"Failed to get cached service token: {e}")
            return None
    
    def invalidate_service_token(self, service_id: str) -> bool:
        """Invalidate cached service token"""
        if not self.is_connected():
            return False
        
        try:
            key = f"service_token:{service_id}"
            self.redis_client.delete(key)
            return True
        except Exception as e:
            print(f"Failed to invalidate service token: {e}")
            return False
    
    def set_user_session(self, session_id: str, user_data: Dict[str, Any], ttl: int = 86400) -> bool:
        """Cache user session data"""
        if not self.is_connected():
            return False
        
        try:
            key = f"user_session:{session_id}"
            self.redis_client.setex(key, ttl, json.dumps(user_data))
            return True
        except Exception as e:
            print(f"Failed to cache user session: {e}")
            return False
    
    def get_user_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get cached user session data"""
        if not self.is_connected():
            return None
        
        try:
            key = f"user_session:{session_id}"
            data = self.redis_client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            print(f"Failed to get cached user session: {e}")
            return None
    
    def set_rate_limit(self, key: str, count: int, ttl: int = 60) -> bool:
        """Set rate limiting counter"""
        if not self.is_connected():
            return False
        
        try:
            redis_key = f"rate_limit:{key}"
            self.redis_client.setex(redis_key, ttl, count)
            return True
        except Exception as e:
            print(f"Failed to set rate limit: {e}")
            return False
    
    def increment_rate_limit(self, key: str, ttl: int = 60) -> Optional[int]:
        """Increment rate limiting counter"""
        if not self.is_connected():
            return None
        
        try:
            redis_key = f"rate_limit:{key}"
            count = self.redis_client.incr(redis_key)
            
            # Set expiry if this is the first increment
            if count == 1:
                self.redis_client.expire(redis_key, ttl)
            
            return count
        except Exception as e:
            print(f"Failed to increment rate limit: {e}")
            return None
    
    def get_rate_limit(self, key: str) -> Optional[int]:
        """Get current rate limit count"""
        if not self.is_connected():
            return None
        
        try:
            redis_key = f"rate_limit:{key}"
            count = self.redis_client.get(redis_key)
            return int(count) if count else 0
        except Exception as e:
            print(f"Failed to get rate limit: {e}")
            return None
    
    def health_check(self) -> Dict[str, Any]:
        """Check Redis health status"""
        try:
            if not self.is_connected():
                return {"status": "disconnected", "error": "Redis not connected"}
            
            # Test basic operations
            test_key = "health_check_test"
            self.redis_client.setex(test_key, 10, "test_value")
            value = self.redis_client.get(test_key)
            self.redis_client.delete(test_key)
            
            if value == "test_value":
                return {"status": "healthy", "message": "Redis operations working"}
            else:
                return {"status": "unhealthy", "error": "Redis operations failed"}
                
        except Exception as e:
            return {"status": "error", "error": str(e)}

# Global Redis client instance
redis_client = RedisClient()
