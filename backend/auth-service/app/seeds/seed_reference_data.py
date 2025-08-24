#!/usr/bin/env python3
"""
Seed reference data (lookup tables) for the auth service
Run this first before seeding any environment-specific data
"""
import sys
import os
from sqlalchemy.orm import Session
from datetime import datetime

# Add the parent directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

try:
    from core.database import SessionLocal, engine
    from models.reference_tables import (
        UserType, TenantType, Role, AuditEventType
    )
    from seeds.reference_data import (
        USER_TYPES, TENANT_TYPES, ROLES, AUDIT_EVENT_TYPES
    )
except ImportError as e:
    print(f"Import error: {e}")
    print("Please run this script from the auth-service directory")
    sys.exit(1)

def seed_reference_table(db: Session, model_class, data_list: list, name: str):
    """Generic function to seed reference tables"""
    print(f"Seeding {name}...")
    
    for item_data in data_list:
        # Check if item already exists
        existing = db.query(model_class).filter(model_class.code == item_data["code"]).first()
        
        if existing:
            print(f"  ✓ {item_data['code']} already exists")
            # Update existing item
            for key, value in item_data.items():
                if hasattr(existing, key):
                    setattr(existing, key, value)
            existing.updated_at = datetime.utcnow()
        else:
            # Create new item
            new_item = model_class(**item_data)
            db.add(new_item)
            print(f"  + Created {item_data['code']}")
    
    db.commit()
    print(f"✅ {name} seeding complete\n")

def main():
    """Main seeding function"""
    print("🌱 Starting reference data seeding...")
    print("=" * 50)
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Seed all reference tables in order
        seed_reference_table(db, UserType, USER_TYPES, "User Types")
        seed_reference_table(db, TenantType, TENANT_TYPES, "Tenant Types") 
        seed_reference_table(db, Role, ROLES, "Roles")

        seed_reference_table(db, AuditEventType, AUDIT_EVENT_TYPES, "Audit Event Types")
        
        print("🎉 All reference data seeded successfully!")
        
        # Print summary
        print("\nSummary:")
        print(f"  User Types: {db.query(UserType).count()}")
        print(f"  Tenant Types: {db.query(TenantType).count()}")
        print(f"  Roles: {db.query(Role).count()}")

        print(f"  Audit Event Types: {db.query(AuditEventType).count()}")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
