# 🌱 **Database Seeding Guide**

## **Overview**

Database seeding is the process of populating your database with initial data for development, testing, staging, and production environments. This guide covers the complete seeding system implemented for OpenBioCure.

## **🏗️ Seeding Architecture**

### **1. Environment-Specific Seeds**

```
backend/auth-service/seeds/
├── __init__.py                 # Package initialization
├── development.py              # Development users & tenants
├── staging.py                  # Staging environment data  
├── production.py               # Production admin users only
└── test.py                     # Test users for automation
```

### **2. Seeding Scripts**

- **`seed_database.py`** - Full database seeding with models
- **`seed_simple.py`** - API-based seeding (no DB dependencies)

### **3. Make Commands**

```bash
# Environment-specific seeding
make seed-dev          # Development environment
make seed-staging      # Staging environment  
make seed-prod         # Production environment
make seed-test         # Test environment

# Advanced seeding options
make seed-force        # Overwrite existing data
make seed-dry-run      # Show what would be created
make seed-simple       # API-based seeding

# Database management
make reset-db          # Clean & reseed database
```

## **🌱 Seed Data Structure**

### **Development Users**

| Email | Password | Role | Features |
|-------|----------|------|----------|
| `admin@openbiocure.com` | `admin123456` | Organization Admin | Full access, admin panel, user management |
| `researcher@openbiocure.com` | `researcher123456` | Organization Member | Research tools, AI assistant, data analysis |
| `demo@demo.com` | `demo123456` | Individual | Basic research, limited AI assistant |
| `test@test.com` | `test123456` | Individual | Basic research |
| `scholar@university.edu` | `scholar123456` | Organization Member | Research tools, publication tools |

### **Development Tenants**

- **OpenBioCure** - Main organization (1000 users, enterprise plan)
- **Demo** - Trial tenant (5 users, trial plan)
- **Test** - Test tenant (10 users, trial plan)  
- **University Research** - Academic institution (500 users, academic plan)

## **🚀 Usage Examples**

### **Basic Development Seeding**

```bash
# Start auth service
cd backend
make start-dev

# Seed development data
make seed-dev
```

### **Production Seeding**

```bash
# Set secure admin password
export PROD_ADMIN_PASSWORD="your-secure-password-here"

# Seed production data
make seed-prod
```

### **Testing & CI/CD**

```bash
# Seed test data for automated testing
make seed-test

# Reset database for clean testing
make reset-db
```

### **API-Based Seeding (Simple)**

```bash
# For when database dependencies aren't available
make seed-simple
```

## **🔧 Configuration**

### **Environment Variables**

```bash
# Development
APP_ENV=development

# Staging  
APP_ENV=staging
STAGING_ADMIN_PASSWORD=secure-staging-password

# Production
APP_ENV=production
PROD_ADMIN_EMAIL=admin@yourcompany.com
PROD_ADMIN_PASSWORD=ultra-secure-production-password
```

### **Database Connection**

The seeding system uses the same database configuration as your auth service:

```python
DATABASE_URL = "postgresql://postgres:postgres@172.16.14.112:5432/openbiocure_auth?gssencmode=disable"
```

## **📝 Seed Data Examples**

### **User Seed Structure**

```python
{
    "email": "admin@openbiocure.com",
    "password": "admin123456",           # Plain text (will be hashed)
    "name": "Admin User",
    "type": "organization_admin",        # Role type
    "tenant_name": "OpenBioCure",       # Tenant assignment
    "features": [                       # User permissions
        "full_access", 
        "admin_panel", 
        "user_management"
    ]
}
```

### **Tenant Seed Structure**

```python
{
    "name": "OpenBioCure",
    "slug": "openbiocure",             # URL-friendly identifier
    "type": "organization",            # Tenant type
    "description": "Main OpenBioCure organization",
    "settings": {                      # Tenant configuration
        "max_users": 1000,
        "features": ["all"],
        "billing_plan": "enterprise"
    }
}
```

## **🔐 Security Best Practices**

### **Development**
- ✅ Simple, memorable passwords (`admin123456`)
- ✅ Well-known test accounts
- ✅ Clear documentation of credentials

### **Staging**
- ✅ Stronger passwords with special characters
- ✅ Environment variable configuration
- ✅ Realistic test data

### **Production**
- ✅ Auto-generated secure passwords
- ✅ Environment variable requirements
- ✅ Minimal admin accounts only
- ✅ Credential logging for secure storage

## **🚨 Troubleshooting**

### **Common Issues**

**1. Database Connection Failed**
```bash
❌ Import error: No module named 'psycopg2'

# Solution: Install dependencies
pip install psycopg2-binary sqlalchemy passlib[bcrypt]
```

**2. Auth Service Not Running**
```bash
❌ Cannot connect to auth service: Connection refused

# Solution: Start the service
make start-dev
# or
cd auth-service && python3 main.py
```

**3. User Already Exists**
```bash
⚠️ User admin@openbiocure.com already exists, skipping...

# This is normal - seeding is idempotent
```

**4. 404 API Errors**
```bash
❌ Failed to create user: HTTP 404

# Check if auth routes are properly configured
curl http://localhost:8001/health
```

### **Debug Commands**

```bash
# Check service health
curl http://localhost:8001/health | python3 -m json.tool

# Test manual user creation
curl -X POST http://localhost:8001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123456","name":"Test User"}'

# Dry run to see what would be created
make seed-dry-run
```

## **🎯 Integration with Development Workflow**

### **New Developer Setup**

```bash
# 1. Clone repository
git clone <repo-url>
cd openbiocure-platform-ui

# 2. Setup backend
cd backend
make setup
make start-dev

# 3. Seed development data
make seed-dev

# 4. Start frontend
cd ../frontend/app
npm install
npm start
```

### **Testing Pipeline**

```bash
# Reset to clean state
make reset-db

# Run tests with seeded data
make seed-test
npm test
```

### **Deployment Pipeline**

```bash
# Production deployment
export PROD_ADMIN_PASSWORD="$(openssl rand -base64 32)"
make seed-prod

# Log credentials securely
echo "Production admin password: $PROD_ADMIN_PASSWORD" | secure-store
```

## **📈 Advanced Features**

### **Custom Seed Files**

Create environment-specific seeds by adding new files to `/seeds/` directory:

```python
# seeds/demo.py
DEMO_USERS = [
    # Your custom demo users
]
```

### **Programmatic Seeding**

```python
from seeds.development import DEVELOPMENT_USERS
from seed_database import seed_users

# Custom seeding logic
db = get_database_session()
seed_users(db, DEVELOPMENT_USERS, force=True)
```

### **Multiple Environments**

```bash
# Override environment
APP_ENV=custom make seed-dev

# Custom database
DATABASE_URL=postgresql://user:pass@host:port/db make seed-dev
```

## **✅ Best Practices Summary**

1. **Environment Separation** - Different seeds per environment
2. **Password Security** - Simple for dev, secure for production  
3. **Idempotent Operations** - Safe to run multiple times
4. **Clear Documentation** - Document all test credentials
5. **Automated Integration** - Include in setup & deployment scripts
6. **Error Handling** - Graceful failures with helpful messages
7. **Dry Run Support** - Preview changes before applying
8. **Service Health Checks** - Verify service availability

---

**Next Steps:**
- Test the seeding system in your environment
- Customize seed data for your specific needs
- Integrate seeding into your CI/CD pipeline
- Add custom seed environments as needed
