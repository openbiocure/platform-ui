#!/usr/bin/env python3
"""
Production seed data for OpenBioCure Platform
Clean RBAC-based system without old feature system
"""

PRODUCTION_USERS = [
    {
        "email": "admin@openbiocure.com",
        "password": "CHANGE_ME_IN_PRODUCTION",
        "name": "System Administrator",
        "type": "organization_admin",
        "tenant_name": "OpenBioCure Production"
    }
]

PRODUCTION_TENANTS = [
    {
        "name": "OpenBioCure Production",
        "slug": "openbiocure-production",
        "type": "enterprise",
        "description": "Production environment for OpenBioCure",
        "settings": {
            "max_users": 10000,
            "billing_plan": "enterprise"
        }
    }
]

def print_production_credentials():
    """Print production credentials for reference"""
    print("\n🚨 PRODUCTION CREDENTIALS:")
    print("=" * 50)
    print("⚠️  IMPORTANT: Change these passwords immediately!")
    print("=" * 50)
    for user in PRODUCTION_USERS:
        print(f"Email: {user['email']}")
        print(f"Password: {user['password']}")
        print(f"Name: {user['name']}")
        print("-" * 30)
