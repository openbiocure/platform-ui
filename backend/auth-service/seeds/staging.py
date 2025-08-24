#!/usr/bin/env python3
"""
Staging seed data for OpenBioCure Platform
Clean RBAC-based system without old feature system
"""

STAGING_USERS = [
    {
        "email": "staging-admin@openbiocure.com",
        "password": "staging123",
        "name": "Staging Admin",
        "type": "organization_admin",
        "tenant_name": "OpenBioCure Staging"
    },
    {
        "email": "staging-researcher@openbiocure.com",
        "password": "staging123",
        "name": "Staging Researcher",
        "type": "organization_member",
        "tenant_name": "OpenBioCure Staging"
    },
    {
        "email": "staging-user@openbiocure.com",
        "password": "staging123",
        "name": "Staging User",
        "type": "individual",
        "tenant_name": "OpenBioCure Staging"
    }
]

STAGING_TENANTS = [
    {
        "name": "OpenBioCure Staging",
        "slug": "openbiocure-staging",
        "type": "organization",
        "description": "Staging environment for OpenBioCure",
        "settings": {
            "max_users": 100,
            "billing_plan": "staging"
        }
    }
]
