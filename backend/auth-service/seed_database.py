#!/usr/bin/env python3
"""
Database seeding script for OpenBioCure authentication service

Usage:
    python seed_database.py                    # Seed based on APP_ENV
    python seed_database.py --env development  # Force specific environment
    python seed_database.py --force            # Force recreate existing users
    python seed_database.py --dry-run          # Show what would be created
"""

import os
import sys
import asyncio
import argparse
from datetime import datetime
from typing import List, Dict, Any

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.'))

try:
    # For development, create a simple database setup
    from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, JSON, Text
    from sqlalchemy.ext.declarative import declarative_base
    from sqlalchemy.orm import sessionmaker, Session
    from passlib.context import CryptContext
    from datetime import datetime
    import uuid
    
    # Database setup
    DATABASE_URL = "postgresql://postgres:postgres@172.16.14.112:5432/openbiocure_auth?gssencmode=disable"
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
    
    # Password hashing
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)
    
    def get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Installing required packages...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "sqlalchemy", "psycopg2-binary", "passlib[bcrypt]"])
    print("Please run the script again after installing dependencies")
    sys.exit(1)

# Simple User and Tenant models for seeding
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    type = Column(String, nullable=False, default="individual")
    tenant_id = Column(String, nullable=False)
    features = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Tenant(Base):
    __tablename__ = "tenants"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    type = Column(String, nullable=False)
    description = Column(Text)
    settings = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

def get_environment():
    """Get the current environment"""
    return os.getenv("APP_ENV", "development").lower()

def load_seeds(environment: str):
    """Load seed data for the specified environment"""
    try:
        if environment == "development":
            from seeds.development import DEVELOPMENT_USERS as users, DEVELOPMENT_TENANTS as tenants
        elif environment == "staging":
            from seeds.staging import STAGING_USERS as users, STAGING_TENANTS as tenants
        elif environment == "production":
            from seeds.production import PRODUCTION_USERS as users, PRODUCTION_TENANTS as tenants
            # Print production credentials if needed
            from seeds.production import print_production_credentials
            print_production_credentials()
        elif environment == "test":
            from seeds.test import TEST_USERS as users, TEST_TENANTS as tenants
        else:
            print(f"❌ Unknown environment: {environment}")
            return None, None
        
        return users, tenants
    except ImportError as e:
        print(f"❌ Failed to load seeds for {environment}: {e}")
        return None, None

def create_tables():
    """Create database tables if they don't exist"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables ensured")
    except Exception as e:
        print(f"❌ Failed to create tables: {e}")
        return False
    return True

def seed_tenants(db: Session, tenants_data: List[Dict[str, Any]], force: bool = False, dry_run: bool = False):
    """Seed tenants into the database"""
    created_tenants = {}
    
    for tenant_data in tenants_data:
        tenant_slug = tenant_data["slug"]
        
        if dry_run:
            print(f"🔍 Would create tenant: {tenant_data['name']} ({tenant_slug})")
            created_tenants[tenant_data["name"]] = {"id": "dry-run-id", "slug": tenant_slug}
            continue
        
        # Check if tenant already exists
        existing_tenant = db.query(Tenant).filter(Tenant.slug == tenant_slug).first()
        
        if existing_tenant and not force:
            print(f"⚠️  Tenant {tenant_data['name']} already exists, skipping...")
            created_tenants[tenant_data["name"]] = {
                "id": existing_tenant.id, 
                "slug": existing_tenant.slug
            }
            continue
        
        if existing_tenant and force:
            print(f"🔄 Updating existing tenant: {tenant_data['name']}")
            # Update existing tenant
            existing_tenant.name = tenant_data["name"]
            existing_tenant.type = tenant_data["type"]
            existing_tenant.description = tenant_data["description"]
            existing_tenant.settings = tenant_data["settings"]
            existing_tenant.updated_at = datetime.utcnow()
            db.commit()
            created_tenants[tenant_data["name"]] = {
                "id": existing_tenant.id,
                "slug": existing_tenant.slug
            }
        else:
            try:
                # Create new tenant
                tenant = Tenant(
                    name=tenant_data["name"],
                    slug=tenant_slug,
                    type=tenant_data["type"],
                    description=tenant_data["description"],
                    settings=tenant_data["settings"],
                    is_active=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                
                db.add(tenant)
                db.commit()
                db.refresh(tenant)
                
                print(f"✅ Created tenant: {tenant_data['name']} ({tenant_slug})")
                created_tenants[tenant_data["name"]] = {
                    "id": tenant.id,
                    "slug": tenant.slug
                }
                
            except Exception as e:
                print(f"❌ Failed to create tenant {tenant_data['name']}: {e}")
                db.rollback()
    
    return created_tenants

def seed_users(db: Session, users_data: List[Dict[str, Any]], tenants_map: Dict[str, Dict], force: bool = False, dry_run: bool = False):
    """Seed users into the database"""
    for user_data in users_data:
        user_email = user_data["email"]
        
        if dry_run:
            print(f"🔍 Would create user: {user_data['name']} ({user_email})")
            continue
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_email).first()
        
        if existing_user and not force:
            print(f"⚠️  User {user_email} already exists, skipping...")
            continue
        
        # Get tenant info
        tenant_name = user_data.get("tenant_name", "OpenBioCure")
        tenant_info = tenants_map.get(tenant_name)
        
        if not tenant_info:
            print(f"❌ Tenant '{tenant_name}' not found for user {user_email}")
            continue
        
        try:
            if existing_user and force:
                print(f"🔄 Updating existing user: {user_email}")
                # Update existing user
                existing_user.name = user_data["name"]
                existing_user.type = user_data["type"]
                existing_user.tenant_id = tenant_info["id"]
                existing_user.features = user_data["features"]
                existing_user.is_active = user_data.get("is_active", True)
                existing_user.updated_at = datetime.utcnow()
                # Only update password if provided and different
                if "password" in user_data:
                    existing_user.hashed_password = get_password_hash(user_data["password"])
                db.commit()
            else:
                # Create new user
                user = User(
                    email=user_email,
                    name=user_data["name"],
                    hashed_password=get_password_hash(user_data["password"]),
                    type=user_data["type"],
                    tenant_id=tenant_info["id"],
                    features=user_data["features"],
                    is_active=user_data.get("is_active", True),
                    email_verified=True,  # Auto-verify seed users
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                
                db.add(user)
                db.commit()
                db.refresh(user)
                
                print(f"✅ Created user: {user_data['name']} ({user_email})")
                
        except Exception as e:
            print(f"❌ Failed to create user {user_email}: {e}")
            db.rollback()

def main():
    parser = argparse.ArgumentParser(description="Seed OpenBioCure database")
    parser.add_argument("--env", choices=["development", "staging", "production", "test"], 
                       help="Environment to seed (overrides APP_ENV)")
    parser.add_argument("--force", action="store_true", 
                       help="Force update existing users and tenants")
    parser.add_argument("--dry-run", action="store_true",
                       help="Show what would be created without making changes")
    parser.add_argument("--users-only", action="store_true",
                       help="Only seed users, skip tenants")
    parser.add_argument("--tenants-only", action="store_true", 
                       help="Only seed tenants, skip users")
    
    args = parser.parse_args()
    
    # Determine environment
    environment = args.env or get_environment()
    
    print(f"🌱 OpenBioCure Database Seeding")
    print(f"📍 Environment: {environment}")
    print(f"🔄 Force update: {args.force}")
    print(f"🔍 Dry run: {args.dry_run}")
    print("-" * 50)
    
    # Load seed data
    users_data, tenants_data = load_seeds(environment)
    if not users_data and not tenants_data:
        return
    
    if args.dry_run:
        print("🔍 DRY RUN - No changes will be made")
        print("-" * 50)
    
    # Create tables
    if not args.dry_run and not create_tables():
        return
    
    # Get database session
    if not args.dry_run:
        db = next(get_db())
    else:
        db = None
    
    try:
        tenants_map = {}
        
        # Seed tenants
        if not args.users_only and tenants_data:
            print("🏢 Seeding tenants...")
            tenants_map = seed_tenants(db, tenants_data, args.force, args.dry_run)
            print()
        
        # Seed users
        if not args.tenants_only and users_data:
            if not tenants_map and not args.dry_run:
                # Load existing tenants if we didn't just create them
                existing_tenants = db.query(Tenant).all()
                for tenant in existing_tenants:
                    tenants_map[tenant.name] = {"id": tenant.id, "slug": tenant.slug}
            
            print("👥 Seeding users...")
            seed_users(db, users_data, tenants_map, args.force, args.dry_run)
            print()
        
        if args.dry_run:
            print("🔍 Dry run completed - no changes made")
        else:
            print("✅ Database seeding completed successfully!")
            
        # Show summary
        if not args.dry_run:
            tenant_count = db.query(Tenant).count()
            user_count = db.query(User).count()
            print(f"📊 Database summary: {tenant_count} tenants, {user_count} users")
            
            # Show login credentials for development
            if environment == "development":
                print("\n🔑 Development Login Credentials:")
                print("-" * 40)
                for user in users_data:
                    print(f"Email: {user['email']}")
                    print(f"Password: {user['password']}")
                    print(f"Role: {user['type']}")
                    print("-" * 40)
        
    except Exception as e:
        print(f"❌ Seeding failed: {e}")
        if db:
            db.rollback()
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
