#!/usr/bin/env python3
"""
Test seed data for OpenBioCure Platform
Clean RBAC-based system without old feature system
"""

TEST_USERS = [
    {
        "email": "test-admin@test.com",
        "password": "test123",
        "name": "Test Admin",
        "type": "organization_admin",
        "tenant_name": "TestOrg"
    },
    {
        "email": "test-user@test.com",
        "password": "test123",
        "name": "Test User",
        "type": "individual",
        "tenant_name": "TestOrg"
    },
    {
        "email": "test-researcher@test.com",
        "password": "test123",
        "name": "Test Researcher",
        "type": "organization_member",
        "tenant_name": "TestOrg"
    }
]

TEST_TENANTS = [
    {
        "name": "TestOrg",
        "slug": "testorg",
        "type": "organization",
        "description": "Test organization for automated testing",
        "settings": {
            "max_users": 10,
            "billing_plan": "test"
        }
    }
]
