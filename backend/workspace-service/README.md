# 📁 Workspace Service - Central RAG Orchestrator

## Overview

The Workspace Service serves as the **central RAG (Retrieval-Augmented Generation) orchestrator** and **intelligent heart** of the OpenBioCure platform. It provides **private-only document management** with AI-powered research assistance, while coordinating data from all platform services to deliver unified research insights.

### Key Principle: Tenant-Isolated Workspace Privacy

- **Workspace documents remain always private** to the uploader unless explicitly added to a Project
- **Projects are the only collaborative surface** for document sharing
- **Complete tenant isolation** ensures no cross-tenant data access
- **Vector stores are tenant-scoped**: `ws:userId`, `proj:projectId`, `global:tenantId`

## Architecture

### Vector Store Hierarchy (Tenant-Isolated)

1. **Private Vector Store (`ws:userId`)**: User's private documents and research
2. **Project Vector Store (`proj:projectId`)**: Shared project documents (within tenant)
3. **Global Vector Store (`global:tenantId`)**: Tenant-wide public knowledge base
4. **Metadata Database**: Access control lists (ACL), user preferences, and query routing

### Core Components

- **RAG Orchestrator**: Central coordinator for retrieval-augmented generation
- **Document Management**: Multi-format upload with version control and MinIO storage
- **Vector Processing**: Elasticsearch-based semantic search with tenant isolation
- **Query Routing**: Intelligent routing to appropriate vector stores based on scope
- **Cross-Service Integration**: Orchestrates data from project, analytics, and AI services
- **Permission Management**: Enforces ACL at vector store and service level

## Features

### 🤖 AI-Powered Research
- **Natural Language Queries**: Ask research questions across your documents
- **Cross-Service Orchestration**: Combines workspace, project, and analytics data
- **Phase-Aware AI**: Adapts assistance based on current research phase
- **Intelligent Citations**: Provides source attribution with relevance scoring

### 📄 Document Management
- **Multi-Format Support**: PDF, DOC, DOCX, TXT, HTML, XML, CSV, JSON
- **Version Control**: Track document evolution with change descriptions
- **Private by Default**: All documents start private with optional project sharing
- **MinIO Storage**: Scalable object storage with versioned paths

### 🔍 Intelligent Search
- **Vector Similarity**: Semantic search across document embeddings
- **Scope-Based Routing**: Search private, project, or global knowledge bases
- **Re-ranking**: Advanced relevance scoring for better results
- **Conversation Context**: Maintain context across multiple queries

### 🔐 Security & Privacy
- **Tenant Isolation**: Complete separation between tenants
- **Private Workspaces**: User documents never leak to other users
- **Project-Only Sharing**: Controlled collaboration through project service
- **Vector Store ACL**: Permission enforcement at query time

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Elasticsearch 8+
- MinIO (S3-compatible storage)
- Redis 7+
- Apache Kafka (optional, for events)

### Installation

1. **Clone and navigate to workspace service:**
   ```bash
   cd backend/workspace-service
   ```

2. **Create virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize database:**
   ```bash
   # Run database migrations
   alembic upgrade head
   ```

6. **Start the service:**
   ```bash
   python main.py
   ```

### Development Setup

For development with auto-reload:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8004
```

## API Endpoints

### Document Management
```http
POST   /api/workspace/documents              # Upload document
GET    /api/workspace/documents              # List documents
GET    /api/workspace/documents/{id}         # Get document
PUT    /api/workspace/documents/{id}         # Update metadata
DELETE /api/workspace/documents/{id}         # Delete document
POST   /api/workspace/documents/{id}/share   # Share with project
```

### RAG Queries
```http
POST   /api/workspace/queries                # Ask question
GET    /api/workspace/queries                # Get query history
GET    /api/workspace/queries/{id}           # Get specific query
POST   /api/workspace/queries/{id}/save      # Save query
POST   /api/workspace/queries/{id}/feedback  # Rate query
```

### Dashboard Aggregation
```http
GET    /api/workspace/dashboard              # Unified dashboard
GET    /api/workspace/dashboard/insights     # AI insights
GET    /api/workspace/dashboard/trends       # Research trends
GET    /api/workspace/dashboard/projects     # Project summaries
```

### Vector Store Management
```http
GET    /api/workspace/vectors/stats          # Vector store statistics
POST   /api/workspace/vectors/search         # Direct vector search
GET    /api/workspace/vectors/health         # Health check
POST   /api/workspace/vectors/reindex        # Trigger reindexing
```

## Configuration

### Environment Variables

Key configuration options in `.env`:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/workspace_db

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# MinIO
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key

# AI/ML
EMBEDDINGS_MODEL=sentence-transformers/all-MiniLM-L6-v2
OPENAI_API_KEY=your_openai_key

# Service URLs
AUTH_SERVICE_URL=http://localhost:8001
PROJECT_SERVICE_URL=http://localhost:8002
ANALYTICS_SERVICE_URL=http://localhost:8003
```

### Vector Store Configuration

Vector stores are automatically created with tenant isolation:
- **Private**: `ws:{userId}` - Personal documents
- **Project**: `proj:{projectId}` - Project collaboration
- **Global**: `global:{tenantId}` - Tenant knowledge base

## Usage Examples

### Upload and Query Documents

```python
import httpx

# Upload document
with open("research_paper.pdf", "rb") as f:
    response = httpx.post(
        "http://localhost:8004/api/workspace/documents",
        files={"file": f},
        data={"document_type": "research_paper", "tags": "cancer,immunotherapy"}
    )

# Ask question
response = httpx.post(
    "http://localhost:8004/api/workspace/queries",
    json={
        "query": "What are the latest developments in cancer immunotherapy?",
        "scope": "private"
    }
)
```

### Cross-Service Dashboard Query

```python
# Get unified dashboard with project and analytics data
response = httpx.get("http://localhost:8004/api/workspace/dashboard")
dashboard_data = response.json()

print(f"Documents: {dashboard_data['quick_stats']['documents_count']}")
print(f"Active Projects: {dashboard_data['quick_stats']['active_projects']}")
print(f"Recent Insights: {len(dashboard_data['ai_insights'])}")
```

## Technology Stack

### Core Technologies
- **FastAPI**: Modern Python web framework
- **PostgreSQL**: Relational database for metadata
- **Elasticsearch**: Vector search and document indexing
- **MinIO**: S3-compatible object storage
- **Redis**: Caching and session management
- **SQLAlchemy**: ORM with repository pattern

### AI/ML Stack
- **sentence-transformers**: Document embedding generation
- **OpenAI/Anthropic**: LLM integration for synthesis
- **spaCy/NLTK**: Text processing and entity extraction
- **scikit-learn**: Additional ML utilities

### Integration
- **Apache Kafka**: Event streaming (optional)
- **httpx**: HTTP client for service communication
- **Pydantic**: Data validation and serialization

## Development

### Project Structure

```
workspace-service/
├── app/
│   ├── api/              # API endpoints
│   ├── core/             # Configuration and database
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   ├── repositories/     # Data access layer
│   └── integrations/     # External service clients
├── tests/                # Test suite
├── main.py              # FastAPI application
└── requirements.txt     # Dependencies
```

### Key Design Patterns

- **Repository Pattern**: Clean data access abstraction
- **Service Layer**: Business logic separation
- **Dependency Injection**: Testable, modular architecture
- **Event-Driven**: Async processing with Kafka integration

### Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_document_service.py
```

## Deployment

### Docker Deployment

```bash
# Build image
docker build -t workspace-service .

# Run with docker-compose
docker-compose up workspace-service
```

### Kubernetes Deployment

Helm charts available in `deployments/openbiocure-platform/`:

```bash
helm install workspace-service ./deployments/openbiocure-platform \
  --set workspace.enabled=true
```

## Monitoring

### Health Checks

- Service health: `GET /health`
- Vector store health: `GET /api/workspace/vectors/health`
- Database health: Built into application startup

### Metrics

- Prometheus metrics on port 8005 (if enabled)
- Query performance tracking
- Document processing rates
- Vector store statistics

## Security

### Tenant Isolation

- **Database**: All queries filtered by `tenant_id`
- **Vector Stores**: Tenant-specific Elasticsearch indices
- **File Storage**: MinIO bucket policies enforce isolation
- **APIs**: JWT token validation with tenant checks

### Data Protection

- **Encryption**: AES-256 for vector embeddings
- **Access Control**: Role-based permissions
- **Audit Logging**: Comprehensive audit trail
- **GDPR Compliance**: Data retention and deletion policies

## Integration with Other Services

### Auth Service
- JWT token validation
- User and tenant information
- Permission verification

### Project Service
- Project membership verification
- Document sharing coordination
- Collaboration context

### Analytics Service
- Usage pattern analysis
- Research trend identification
- Performance metrics

### AI Service
- Research insight generation
- Content summarization
- Gap analysis

## Troubleshooting

### Common Issues

1. **Vector search not working**
   - Check Elasticsearch connection
   - Verify index creation and mapping
   - Check embedding model configuration

2. **Document upload fails**
   - Verify MinIO connection and credentials
   - Check file size limits
   - Validate supported file formats

3. **Cross-service queries failing**
   - Verify service URLs in configuration
   - Check network connectivity
   - Validate authentication tokens

### Logs

Check application logs for detailed error information:
```bash
tail -f workspace-service.log
```

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/workspace-enhancement`
3. Make changes with tests
4. Submit pull request

### Code Standards

- Follow PEP 8 for Python code
- Use type hints throughout
- Maintain >90% test coverage
- Document all public APIs

## License

This project is part of the OpenBioCure platform and follows the same licensing terms.

---

**The Workspace Service is the intelligent heart of OpenBioCure - enabling scholars to seamlessly interact with their research through AI-powered natural language queries while maintaining complete privacy and security.**
