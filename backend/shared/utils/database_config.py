import yaml
import os
from typing import Dict, Any
from pathlib import Path

class DatabaseConfig:
    """
    Utility class to load database configuration from YAML file
    Provides centralized database configuration for all microservices
    """
    
    def __init__(self, config_path: str = None):
        if config_path is None:
            # Default to shared/database/config.yaml
            config_path = Path(__file__).parent.parent / "database" / "config.yaml"
        
        self.config_path = config_path
        self._config = None
    
    def load_config(self) -> Dict[str, Any]:
        """Load database configuration from YAML file"""
        if self._config is None:
            with open(self.config_path, 'r') as file:
                self._config = yaml.safe_load(file)
        return self._config
    
    def get_database_url(self, service_name: str) -> str:
        """
        Get database URL for specific service
        
        Args:
            service_name: 'auth', 'analytics', or 'main'
        
        Returns:
            PostgreSQL connection URL
        """
        config = self.load_config()
        db_config = config['database']
        
        # Override with environment variables if available
        host = os.getenv('DB_HOST', db_config['host'])
        port = os.getenv('DB_PORT', db_config['port'])
        username = os.getenv('DB_USERNAME', db_config['username'])
        password = os.getenv('DB_PASSWORD', db_config['password'])
        
        # Get database name for service
        db_name = db_config['databases'].get(service_name, f'openbiocure_{service_name}')
        db_name = os.getenv('DB_NAME', db_name)
        
        return f"postgresql://{username}:{password}@{host}:{port}/{db_name}"
    
    def get_pool_config(self) -> Dict[str, Any]:
        """Get connection pool configuration"""
        config = self.load_config()
        return config['database']['pool']
    
    def get_ssl_config(self) -> Dict[str, Any]:
        """Get SSL configuration"""
        config = self.load_config()
        return config['database']['ssl']

# Global instance
db_config = DatabaseConfig()
