"""
Production database seeds
Minimal, secure seeds for production environment
"""
import os
from secrets import token_urlsafe

def generate_secure_password():
    """Generate a secure random password for production"""
    return token_urlsafe(32)

PRODUCTION_USERS = [
    {
        "email": os.getenv("PROD_ADMIN_EMAIL", "admin@openbiocure.com"),
        "password": os.getenv("PROD_ADMIN_PASSWORD") or generate_secure_password(),
        "name": "System Administrator",
        "type": "organization_admin", 
        "tenant_name": "OpenBioCure",
        "features": ["full_access", "admin_panel", "user_management", "tenant_management", "system_admin"]
    }
]

PRODUCTION_TENANTS = [
    {
        "name": "OpenBioCure",
        "slug": "openbiocure",
        "type": "organization",
        "description": "OpenBioCure main organization",
        "settings": {
            "max_users": 10000,
            "features": ["all"],
            "billing_plan": "enterprise"
        }
    }
]

# Print generated passwords for admin reference
def print_production_credentials():
    """Print production credentials for secure storage"""
    for user in PRODUCTION_USERS:
        if not os.getenv("PROD_ADMIN_PASSWORD"):
            print(f"Generated password for {user['email']}: {user['password']}")
            print("⚠️  IMPORTANT: Store this password securely and set PROD_ADMIN_PASSWORD environment variable")
            print("🔒 Password will be hashed in database - this is your only chance to see it")
            print("-" * 80)
