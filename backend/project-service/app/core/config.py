"""
Project Service Configuration
"""
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv(
        "PROJECT_DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/openbiocure_projects?gssencmode=disable"
    )
    
    # Service
    SERVICE_NAME: str = "project-service"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Event System
    EVENT_PRODUCER_TYPE: str = os.getenv("EVENT_PRODUCER_TYPE", "memory")
    EVENT_FILE_PATH: str = os.getenv("EVENT_FILE_PATH", "/tmp/events")
    KAFKA_BOOTSTRAP_SERVERS: str = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
    
    # AI Services (for research insights)
    AI_SERVICE_URL: str = os.getenv("AI_SERVICE_URL", "http://localhost:8004")
    ENABLE_AI_INSIGHTS: bool = os.getenv("ENABLE_AI_INSIGHTS", "true").lower() == "true"
    
    class Config:
        env_file = ".env"

settings = Settings()
