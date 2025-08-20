# 🔐 Auth Service

Multi-tenant authentication and authorization microservice for OpenBioCure platform.

## Features

- **Multi-Tenant Authentication** - Secure tenant isolation and context validation
- **JWT Token Management** - Access and refresh tokens with tenant context
- **OAuth 2.0 Support** - Integration with external identity providers
- **Comprehensive Audit Logging** - Security event tracking per tenant
- **Role-Based Access Control** - Tenant-scoped user permissions
- **Session Management** - Secure session handling with encryption
- **Password Security** - bcrypt hashing with configurable rounds

## Security Implementation

Follows `docs/security.md` requirements:
- ✅ **Tenant Isolation** - Hard tenant boundaries at all layers
- ✅ **Multi-Tenant OAuth** - Tenant-aware authentication flows
- ✅ **Audit Logging** - Comprehensive security event tracking
- ✅ **Session Security** - Encrypted sessions with tenant context
- ✅ **JWT Security** - Tenant-scoped token validation

## API Endpoints

### Authentication
- `POST /auth/login` - User login with tenant context
- `POST /auth/register` - User registration with tenant assignment
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout and session cleanup
- `GET /auth/verify` - Token verification for other services

### Users
- `GET /users/me` - Get current user info with tenant context
- `PUT /users/me` - Update current user information

### Tenants
- `POST /tenants/` - Create new tenant (admin)
- `GET /tenants/my-tenants` - Get user's tenant memberships
- `POST /tenants/{tenant_id}/users/{user_id}` - Add user to tenant

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run the service:**
   ```bash
   python main.py
   ```

4. **Access the API:**
   - Service: http://localhost:8001
   - Docs: http://localhost:8001/docs
   - Health: http://localhost:8001/health

## Docker

```bash
docker build -t openbiocure-auth-service .
docker run -p 8001:8001 openbiocure-auth-service
```

## Database Schema

Implements the following tables from `database/database.mermaid`:
- `USERS` - User accounts
- `TENANTS` - Multi-tenant organizations
- `TENANT_USERS` - User-tenant relationships with roles
- `IDENTITY_PROVIDERS` - OAuth/SAML providers
- `TENANT_IDENTITY_PROVIDERS` - Tenant-specific IdP config
- `AUDIT_LOGS` - Security event logging
