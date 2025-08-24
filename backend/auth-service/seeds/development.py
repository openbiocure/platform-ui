#!/usr/bin/env python3
"""
Development seed data for OpenBioCure Platform
Clean RBAC-based system without old feature system
"""

DEVELOPMENT_USERS = [
    {
        "email": "admin@openbiocure.com",
        "password": "admin123",
        "name": "Admin User",
        "type": "organization_admin",
        "tenant_name": "OpenBioCure"
    },
    {
        "email": "researcher@openbiocure.com", 
        "password": "researcher123",
        "name": "Senior Researcher",
        "type": "organization_member",
        "tenant_name": "OpenBioCure"
    },
    {
        "email": "demo@demo.com",
        "password": "demo123",
        "name": "Demo User", 
        "type": "individual",
        "tenant_name": "Demo"
    },
    {
        "email": "test@test.com",
        "password": "test123456",
        "name": "Test User",
        "type": "individual", 
        "tenant_name": "Test"
    },
    {
        "email": "scholar@university.edu",
        "password": "scholar123",
        "name": "Dr. Jane Scholar",
        "type": "organization_member",
        "tenant_name": "University Research"
    },
    {
        "email": "student@university.edu",
        "password": "student123", 
        "name": "John Student",
        "type": "individual",
        "tenant_name": "University Research"
    }
]

DEVELOPMENT_TENANTS = [
    {
        "name": "OpenBioCure",
        "slug": "openbiocure",
        "type": "organization",
        "description": "Main OpenBioCure organization",
        "settings": {
            "max_users": 1000,
            "billing_plan": "enterprise"
        }
    },
    {
        "name": "Demo",
        "slug": "demo", 
        "type": "trial",
        "description": "Demo tenant for testing",
        "settings": {
            "max_users": 5,
            "billing_plan": "trial"
        }
    },
    {
        "name": "Test",
        "slug": "test",
        "type": "trial", 
        "description": "Test tenant for automated testing",
        "settings": {
            "max_users": 10,
            "billing_plan": "trial"
        }
    },
    {
        "name": "University Research",
        "slug": "university-research",
        "type": "organization",
        "description": "Academic research institution",
        "settings": {
            "max_users": 500,
            "billing_plan": "academic"
        }
    }
]
