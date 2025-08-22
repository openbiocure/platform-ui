"""
Test database seeds
Specific users and data for automated testing
"""

TEST_USERS = [
    {
        "email": "test.admin@test.com",
        "password": "TestAdmin123!",
        "name": "Test Administrator",
        "type": "organization_admin",
        "tenant_name": "Test Org",
        "features": ["full_access", "admin_panel"]
    },
    {
        "email": "test.user@test.com", 
        "password": "TestUser123!",
        "name": "Test User",
        "type": "individual",
        "tenant_name": "Test Individual",
        "features": ["basic_research"]
    },
    {
        "email": "test.researcher@test.com",
        "password": "TestResearcher123!",
        "name": "Test Researcher",
        "type": "organization_member",
        "tenant_name": "Test Org",
        "features": ["research_tools", "ai_assistant"]
    },
    {
        "email": "test.invalid@test.com",
        "password": "TestInvalid123!",
        "name": "Test Invalid User",
        "type": "individual",
        "tenant_name": "Test Individual", 
        "features": [],
        "is_active": False  # Inactive user for testing
    },
    # Users with special characters for edge case testing
    {
        "email": "test+special@test.com",
        "password": "TestSpecial123!",
        "name": "Test Special Characters",
        "type": "individual",
        "tenant_name": "Test Individual",
        "features": ["basic_research"]
    },
    {
        "email": "test.unicode@test.com",
        "password": "TestUnicode123!",
        "name": "Test Unicode 测试用户",
        "type": "individual", 
        "tenant_name": "Test Individual",
        "features": ["basic_research"]
    }
]

TEST_TENANTS = [
    {
        "name": "Test Org",
        "slug": "test-org",
        "type": "organization",
        "description": "Test organization for automated testing",
        "settings": {
            "max_users": 50,
            "features": ["basic", "research"],
            "billing_plan": "test"
        }
    },
    {
        "name": "Test Individual",
        "slug": "test-individual",
        "type": "individual", 
        "description": "Test tenant for individual users",
        "settings": {
            "max_users": 1,
            "features": ["basic"],
            "billing_plan": "individual"
        }
    },
    {
        "name": "Test Empty",
        "slug": "test-empty",
        "type": "trial",
        "description": "Empty test tenant",
        "settings": {
            "max_users": 0,
            "features": [],
            "billing_plan": "trial"
        }
    }
]
