import yaml
from pathlib import Path
from typing import Dict, Any, Optional
import os

class ServiceRegistry:
    """Shared service registry for loading service configurations"""
    
    def __init__(self, config_path: Optional[str] = None):
        self.config_path = config_path
        self._services = None
        self._config = None
    
    def load_services_config(self, config_file: str = "services.yaml") -> Dict[str, str]:
        """Load services configuration from YAML file"""
        if self.config_path:
            config_path = Path(self.config_path) / config_file
        else:
            # Use config relative to this file (same directory)
            config_path = Path(__file__).parent / config_file
        
        if not config_path.exists():
            raise FileNotFoundError(f"Service config not found: {config_path}")
            
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
        
        self._config = config
        self._services = {name: service["url"] for name, service in config["services"].items()}
        return self._services
    
    def get_service_url(self, service_name: str) -> str:
        """Get URL for a specific service"""
        if not self._services:
            self.load_services_config()
        
        if service_name not in self._services:
            raise ValueError(f"Service '{service_name}' not found in registry")
        
        return self._services[service_name]
    
    def get_service_config(self, service_name: str) -> Dict[str, Any]:
        """Get full configuration for a specific service"""
        if not self._config:
            self.load_services_config()
        
        if service_name not in self._config["services"]:
            raise ValueError(f"Service '{service_name}' not found in registry")
        
        return self._config["services"][service_name]
    
    def get_all_services(self) -> Dict[str, str]:
        """Get all service URLs"""
        if not self._services:
            self.load_services_config()
        return self._services
    
    def get_cors_config(self) -> Dict[str, Any]:
        """Get CORS configuration"""
        if not self._config:
            self.load_services_config()
        return self._config.get("cors", {})
    
    @classmethod
    def from_env(cls, env_var: str = "SERVICE_CONFIG_PATH") -> "ServiceRegistry":
        """Create service registry from environment variable"""
        config_path = os.getenv(env_var)
        return cls(config_path)

# Default global instance
default_registry = ServiceRegistry()
