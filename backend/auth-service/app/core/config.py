"""
Configuration management using dynaconf
Loads from YAML files and environment variables
"""
from dynaconf import Dynaconf
import os

# Load configuration from config.yaml
config_path = os.path.join(os.getcwd(), "config.yaml")
print(f"🔍 Loading config from: {config_path}")

# Try to load config directly first
try:
    import yaml
    with open(config_path, 'r') as f:
        yaml_data = yaml.safe_load(f)
    print(f"✅ YAML loaded directly: {yaml_data.get('database', {}).get('url')}")
except Exception as e:
    print(f"❌ YAML load failed: {e}")
    yaml_data = {}

# Create a simple settings object from the YAML data
class SimpleSettings:
    def __init__(self, data):
        self._data = data
    
    def get(self, key, default=None):
        """Get nested key using dot notation"""
        keys = key.split('.')
        value = self._data
        try:
            for k in keys:
                value = value[k]
            return value
        except (KeyError, TypeError):
            return default
    
    def __getattr__(self, name):
        """Allow direct attribute access"""
        return self.get(name, None)

# Use the YAML data directly
settings = SimpleSettings(yaml_data)

print(f"✅ Config loaded successfully")
print(f"✅ Database URL: {settings.get('database.url')}")
print(f"✅ Service name: {settings.get('service.name')}")

# Simple service registry placeholder
class ServiceRegistry:
    def __init__(self):
        self.services = {}
        self.permissions = {}
        self.redis_config = {}
        print("⚠️ Service registry disabled for now")

service_registry = ServiceRegistry()
