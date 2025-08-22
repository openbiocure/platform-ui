"""
Development database seeds
Simple passwords for easy development and testing
"""

DEVELOPMENT_USERS = [
    {
        "email": "admin@openbiocure.com",
        "password": "admin123",
        "name": "Admin User",
        "type": "organization_admin",
        "tenant_name": "OpenBioCure",
        "features": ["full_access", "admin_panel", "user_management", "tenant_management"]
    },
    {
        "email": "researcher@openbiocure.com", 
        "password": "researcher123",
        "name": "Senior Researcher",
        "type": "organization_member",
        "tenant_name": "OpenBioCure",
        "features": ["research_tools", "ai_assistant", "data_analysis", "collaboration"]
    },
    {
        "email": "demo@demo.com",
        "password": "demo123",
        "name": "Demo User", 
        "type": "individual",
        "tenant_name": "Demo",
        "features": ["basic_research", "ai_assistant_limited"]
    },
    {
        "email": "test@test.com",
        "password": "test123456",
        "name": "Test User",
        "type": "individual", 
        "tenant_name": "Test",
        "features": ["basic_research"]
    },
    {
        "email": "scholar@university.edu",
        "password": "scholar123",
        "name": "Dr. Jane Scholar",
        "type": "organization_member",
        "tenant_name": "University Research",
        "features": ["research_tools", "publication_tools", "collaboration"]
    },
    {
        "email": "student@university.edu",
        "password": "student123", 
        "name": "John Student",
        "type": "individual",
        "tenant_name": "University Research",
        "features": ["basic_research", "learning_tools"]
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
            "features": ["all"],
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
            "features": ["basic"],
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
            "features": ["basic"],
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
            "features": ["research", "collaboration", "publications"],
            "billing_plan": "academic"
        }
    }
]
