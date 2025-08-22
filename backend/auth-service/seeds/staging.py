"""
Staging database seeds
Realistic data for staging environment testing
"""
import os

STAGING_USERS = [
    {
        "email": "admin@staging.openbiocure.com",
        "password": os.getenv("STAGING_ADMIN_PASSWORD", "StagingAdmin2024!"),
        "name": "Staging Administrator",
        "type": "organization_admin",
        "tenant_name": "OpenBioCure Staging",
        "features": ["full_access", "admin_panel", "user_management"]
    },
    {
        "email": "qa@staging.openbiocure.com",
        "password": os.getenv("STAGING_QA_PASSWORD", "QATester2024!"),
        "name": "QA Tester",
        "type": "organization_member", 
        "tenant_name": "OpenBioCure Staging",
        "features": ["research_tools", "testing_tools", "ai_assistant"]
    },
    {
        "email": "researcher1@staging.openbiocure.com",
        "password": "ResearchStaging123!",
        "name": "Dr. Research Scientist",
        "type": "organization_member",
        "tenant_name": "OpenBioCure Staging", 
        "features": ["research_tools", "ai_assistant", "data_analysis"]
    },
    {
        "email": "demo@staging.openbiocure.com",
        "password": "DemoStaging123!",
        "name": "Demo Account",
        "type": "individual",
        "tenant_name": "Demo Staging",
        "features": ["basic_research", "ai_assistant_limited"]
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
            "features": ["all"],
            "billing_plan": "enterprise"
        }
    },
    {
        "name": "Demo Staging", 
        "slug": "demo-staging",
        "type": "trial",
        "description": "Demo tenant for staging testing",
        "settings": {
            "max_users": 10,
            "features": ["basic"],
            "billing_plan": "trial"
        }
    }
]
