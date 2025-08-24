# OpenBioCure Auth Service CLI

## Overview

The OpenBioCure Auth Service CLI provides command-line tools for managing users, tenants, roles, and services in the authentication system. This CLI is built using Click and integrates with the RBAC (Role-Based Access Control) system.

## Installation

The CLI is part of the auth service and requires the following dependencies:
- Python 3.9+
- Click
- SQLAlchemy
- psycopg2-binary

## Usage

### Basic Command Structure

```bash
# From the auth-service directory
python -m app.cli.main [COMMAND] [OPTIONS]

# Or using the CLI entry point
python cli.py [COMMAND] [OPTIONS]
```

### Available Command Groups

#### 1. Users Management

**Create User**
```bash
python cli.py users create \
  --email "user@example.com" \
  --password "securepassword" \
  --name "User Full Name" \
  --type "individual" \
  --tenant "tenant-slug" \
  --active \
  --email-verified
```

**List Users**
```bash
python cli.py users list
python cli.py users list --tenant "tenant-slug"
python cli.py users list --type "individual"
python cli.py users list --active
python cli.py users list --verbose
```

**Delete User**
```bash
python cli.py users delete --email "user@example.com"
```

#### 2. Tenants Management

**Create Tenant**
```bash
python cli.py tenants create \
  --name "Organization Name" \
  --slug "org-slug" \
  --type "organization" \
  --description "Organization description" \
  --active
```

**List Tenants**
```bash
python cli.py tenants list
python cli.py tenants list --type "organization"
python cli.py tenants list --active
python cli.py tenants list --verbose
```

**Update Tenant**
```bash
python cli.py tenants update --slug "org-slug" --name "New Name"
```

**Delete Tenant**
```bash
python cli.py tenants delete --slug "org-slug"
```

#### 3. Roles Management

**Create Role**
```bash
python cli.py roles create \
  --name "role-name" \
  --description "Role description" \
  --tenant "tenant-slug"
```

**List Roles**
```bash
python cli.py roles list
python cli.py roles list --tenant "tenant-slug"
```

**Add Permission to Role**
```bash
python cli.py roles add-permission \
  --role "role-name" \
  --tenant "tenant-slug" \
  --resource "workspace" \
  --action "read"
```

**List Role Permissions**
```bash
python cli.py roles permissions --role "role-name" --tenant "tenant-slug"
```

**Create Default Roles**
```bash
python cli.py roles create-defaults --tenant "tenant-slug"
```

#### 4. Services Management

**Create Service**
```bash
python cli.py services create \
  --service-id "service-name" \
  --service-name "Service Display Name" \
  --permissions "auth-service,analytics-service"
```

**List Services**
```bash
python cli.py services list
```

**Show Service Permissions Matrix**
```bash
python cli.py services permissions
```

**Regenerate Service Secret**
```bash
python cli.py services regenerate-secret --service-id "service-name"
```

**Remove Service**
```bash
python cli.py services remove --service-id "service-name"
```

## Command Options

### Global Options
- `--verbose, -v`: Enable verbose output
- `--help`: Show help message

### User Type Options
- `individual`: Basic user account
- `organization_member`: Member of an organization
- `organization_admin`: Administrator of an organization

### Tenant Type Options
- `organization`: Full organization account
- `trial`: Trial account with limitations
- `enterprise`: Enterprise account
- `academic`: Academic institution account

## Examples

### Create a Complete User Setup

```bash
# 1. Create tenant
python cli.py tenants create \
  --name "Research Lab" \
  --slug "research-lab" \
  --type "organization" \
  --description "Research laboratory organization"

# 2. Create default roles for the tenant
python cli.py roles create-defaults --tenant "research-lab"

# 3. Create a user
python cli.py users create \
  --email "researcher@research-lab.com" \
  --password "secure123" \
  --name "Dr. Researcher" \
  --type "organization_member" \
  --tenant "research-lab" \
  --active \
  --email-verified
```

### Manage Service-to-Service Authentication

```bash
# Create a service for inter-service communication
python cli.py services create \
  --service-id "workspace-service" \
  --service-name "Workspace Service" \
  --permissions "auth-service,analytics-service"

# The CLI will output the service secret and configuration
# Add these to your environment variables and service registry
```

## RBAC System Integration

The CLI integrates with the RBAC system to provide:

- **Role-based permissions**: Users are assigned roles that determine their access
- **Tenant isolation**: Users can only access resources within their tenant
- **Service authentication**: Services can authenticate with each other using secrets
- **Permission management**: Fine-grained control over what users can do

## Configuration

The CLI reads configuration from:
- Environment variables
- `config.yaml` file
- `service_registry.yaml` file
- Database connection settings

## Error Handling

The CLI provides clear error messages for:
- Database connection issues
- Validation errors
- Permission denied errors
- Missing dependencies

## Development

### Adding New Commands

To add new CLI commands:

1. Create a new command file in `app/cli/commands/`
2. Import and register it in `app/cli/main.py`
3. Follow the existing command structure and patterns

### Testing Commands

```bash
# Test command help
python cli.py --help
python cli.py users --help
python cli.py users create --help

# Test with verbose output
python cli.py users list --verbose
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database credentials in environment variables
   - Verify database is running and accessible

2. **Import Errors**
   - Ensure virtual environment is activated
   - Check that all dependencies are installed

3. **Permission Denied**
   - Verify user has appropriate role and permissions
   - Check tenant isolation settings

### Debug Mode

Enable verbose output to see detailed information:
```bash
python cli.py [COMMAND] --verbose
```

## Security Notes

- Passwords are hashed using bcrypt before storage
- Service secrets are generated securely
- All database operations use parameterized queries
- Tenant isolation is enforced at the database level

## Support

For issues or questions:
1. Check the verbose output for detailed error messages
2. Verify database connectivity and configuration
3. Ensure all required dependencies are installed
4. Check the service logs for additional information
