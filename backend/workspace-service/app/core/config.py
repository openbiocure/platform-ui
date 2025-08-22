"""
Configuration settings for workspace service.
"""

from pydantic import BaseSettings, Field
from typing import Optional, List
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings."""
    
    # Service Configuration
    service_name: str = "workspace-service"
    service_version: str = "1.0.0"
    debug: bool = Field(default=False, env="DEBUG")
    
    # API Configuration  
    api_host: str = Field(default="0.0.0.0", env="API_HOST")
    api_port: int = Field(default=8004, env="API_PORT")
    api_prefix: str = "/api/workspace"
    
    # Database Configuration
    database_url: str = Field(..., env="DATABASE_URL")
    database_pool_size: int = Field(default=10, env="DATABASE_POOL_SIZE")
    database_pool_overflow: int = Field(default=20, env="DATABASE_POOL_OVERFLOW")
    
    # Vector Store Configuration
    elasticsearch_url: str = Field(..., env="ELASTICSEARCH_URL")
    elasticsearch_index_prefix: str = Field(default="openbiocure", env="ELASTICSEARCH_INDEX_PREFIX")
    
    # File Storage Configuration
    minio_endpoint: str = Field(..., env="MINIO_ENDPOINT")
    minio_access_key: str = Field(..., env="MINIO_ACCESS_KEY")
    minio_secret_key: str = Field(..., env="MINIO_SECRET_KEY")
    minio_secure: bool = Field(default=True, env="MINIO_SECURE")
    minio_workspace_bucket: str = Field(default="workspace-documents", env="MINIO_WORKSPACE_BUCKET")
    
    # Cache Configuration
    redis_url: str = Field(..., env="REDIS_URL")
    cache_ttl: int = Field(default=3600, env="CACHE_TTL")  # 1 hour
    
    # Event Bus Configuration
    kafka_bootstrap_servers: str = Field(..., env="KAFKA_BOOTSTRAP_SERVERS")
    kafka_group_id: str = Field(default="workspace-service", env="KAFKA_GROUP_ID")
    
    # AI/ML Configuration
    embeddings_model: str = Field(default="sentence-transformers/all-MiniLM-L6-v2", env="EMBEDDINGS_MODEL")
    openai_api_key: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    anthropic_api_key: Optional[str] = Field(default=None, env="ANTHROPIC_API_KEY")
    max_chunk_size: int = Field(default=1000, env="MAX_CHUNK_SIZE")
    chunk_overlap: int = Field(default=100, env="CHUNK_OVERLAP")
    
    # Service Integration URLs
    auth_service_url: str = Field(..., env="AUTH_SERVICE_URL")
    project_service_url: str = Field(..., env="PROJECT_SERVICE_URL")
    analytics_service_url: str = Field(..., env="ANALYTICS_SERVICE_URL")
    ai_service_url: str = Field(default="", env="AI_SERVICE_URL")
    
    # Security Configuration
    secret_key: str = Field(..., env="SECRET_KEY")
    algorithm: str = Field(default="HS256", env="ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # Processing Configuration
    max_file_size: int = Field(default=100 * 1024 * 1024, env="MAX_FILE_SIZE")  # 100MB
    supported_formats: List[str] = Field(
        default=["pdf", "doc", "docx", "txt", "html", "xml", "csv", "json"],
        env="SUPPORTED_FORMATS"
    )
    processing_timeout: int = Field(default=300, env="PROCESSING_TIMEOUT")  # 5 minutes
    
    # Query Configuration
    max_query_length: int = Field(default=1000, env="MAX_QUERY_LENGTH")
    default_results_limit: int = Field(default=10, env="DEFAULT_RESULTS_LIMIT")
    max_results_limit: int = Field(default=100, env="MAX_RESULTS_LIMIT")
    similarity_threshold: float = Field(default=0.7, env="SIMILARITY_THRESHOLD")
    
    # Monitoring Configuration
    enable_metrics: bool = Field(default=True, env="ENABLE_METRICS")
    metrics_port: int = Field(default=8005, env="METRICS_PORT")
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Vector store configuration
PRIVATE_VECTOR_STORE_PREFIX = "ws"
PROJECT_VECTOR_STORE_PREFIX = "proj"
GLOBAL_VECTOR_STORE_PREFIX = "global"

# Document processing configuration
SUPPORTED_MIME_TYPES = {
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/plain": "txt",
    "text/html": "html",
    "application/xml": "xml",
    "text/xml": "xml",
    "text/csv": "csv",
    "application/json": "json",
}

    # Query scope definitions
QUERY_SCOPES = {
    "private": "Personal workspace documents only (ws:userId)",
    "project": "Project documents and collaboration data (proj:projectId)", 
    "global": "Tenant-wide knowledge base and public research (global:tenantId)",
    "multi": "Cross-scope intelligent routing with tenant isolation"
}

# Tenant isolation configuration
TENANT_ISOLATION = {
    "enforce_boundaries": True,
    "cross_tenant_queries": False,
    "global_store_scope": "tenant",  # Global stores are per-tenant, not platform-wide
    "audit_cross_tenant_access": True
}
