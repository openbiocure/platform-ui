from pydantic_settings import BaseSettings
from typing import Optional
import os
import sys
from pathlib import Path

# Add shared utilities to path
shared_path = Path(__file__).parent.parent.parent.parent / "shared"
sys.path.append(str(shared_path))

try:
    from utils.database_config import db_config
except ImportError:
    db_config = None

class Settings(BaseSettings):
    # Basic service configuration
    SERVICE_NAME: str = "auth-service"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database Configuration
    DB_HOST: str = "172.16.14.112"
    DB_PORT: int = 5432
    DB_USERNAME: str = "postgres"
    DB_PASSWORD: str = "postgres"
    DB_NAME: str = "openbiocure_auth"
    
    @property
    def DATABASE_URL(self) -> str:
        # Try to load from YAML config first, then fall back to env vars
        if db_config:
            try:
                return db_config.get_database_url('auth')
            except:
                pass
        
        # Fallback to environment variables with connection parameters to fix GSSAPI issues
        return f"postgresql://{self.DB_USERNAME}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?gssencmode=disable"
    
    # JWT Configuration
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # OAuth Configuration
    OAUTH_CLIENT_ID: Optional[str] = None
    OAUTH_CLIENT_SECRET: Optional[str] = None
    OAUTH_REDIRECT_URI: str = "http://localhost:3000/auth/callback"
    
    # Security
    BCRYPT_ROUNDS: int = 12
    SESSION_EXPIRE_MINUTES: int = 30
    MAX_SESSIONS_PER_USER: int = 3
    
    # Multi-tenant security
    TENANT_ISOLATION_ENABLED: bool = True
    TENANT_KEY_ROTATION_HOURS: int = 48
    
    # Redis for session management
    REDIS_URL: str = "redis://localhost:6379"
    
    # CORS
    ALLOWED_ORIGINS: list = ["http://localhost:3000", "https://app.openbiocure.com"]
    
    class Config:
        env_file = "dev.env"
        env_file_encoding = 'utf-8'

settings = Settings()
