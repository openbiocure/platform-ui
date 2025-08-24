"""
Reference data for seeding lookup tables
Used by all environments (dev, staging, prod)
"""

# User Types Reference Data
USER_TYPES = [
    {
        "code": "individual",
        "name": "Individual User",
        "description": "Individual researcher or user",
        "sort_order": 1,
        "metadata": {
            "default_permissions": ["read_own_profile", "update_own_profile"],
            "max_collaborations": 5
        }
    },
    {
        "code": "organization_admin",
        "name": "Organization Administrator", 
        "description": "Administrator with full tenant management rights",
        "sort_order": 2,
        "metadata": {
            "default_permissions": ["manage_tenant", "manage_users", "view_analytics"],
            "max_collaborations": -1  # Unlimited
        }
    },
    {
        "code": "organization_member",
        "name": "Organization Member",
        "description": "Standard organization member with collaboration rights",
        "sort_order": 3,
        "metadata": {
            "default_permissions": ["collaborate", "view_tenant_users"],
            "max_collaborations": 20
        }
    },
    {
        "code": "system_admin",
        "name": "System Administrator",
        "description": "System-wide administrator (OpenBioCure staff)",
        "sort_order": 4,
        "metadata": {
            "default_permissions": ["system_admin", "manage_all_tenants"],
            "max_collaborations": -1,
            "is_internal": True
        }
    }
]

# Tenant Types Reference Data
TENANT_TYPES = [
    {
        "code": "trial",
        "name": "Trial Account",
        "description": "Free trial account with limited features",
        "sort_order": 1,
        "default_settings": {
            "max_users": 3,
            "max_projects": 2,
            "storage_gb": 1,
            "trial_days": 14
        },
        "metadata": {
            "billing_required": False,
            "upgrade_paths": ["organization", "academic"]
        }
    },
    {
        "code": "organization",
        "name": "Organization",
        "description": "Standard organization account",
        "sort_order": 2,
        "default_settings": {
            "max_users": 50,
            "max_projects": 20,
            "storage_gb": 100
        },
        "metadata": {
            "billing_required": True,
            "upgrade_paths": ["enterprise"]
        }
    },
    {
        "code": "academic",
        "name": "Academic Institution",
        "description": "Academic/research institution with special pricing",
        "sort_order": 3,
        "default_settings": {
            "max_users": 200,
            "max_projects": 50,
            "storage_gb": 500
        },
        "metadata": {
            "billing_required": True,
            "requires_verification": True,
            "discount_percent": 50
        }
    },
    {
        "code": "enterprise",
        "name": "Enterprise",
        "description": "Large enterprise account with custom features",
        "sort_order": 4,
        "default_settings": {
            "max_users": -1,  # Unlimited
            "max_projects": -1,
            "storage_gb": -1
        },
        "metadata": {
            "billing_required": True,
            "custom_sso": True,
            "dedicated_support": True
        }
    }
]

# Roles Reference Data (for OPA integration)
ROLES = [
    {
        "code": "owner",
        "name": "Owner",
        "description": "Tenant owner with full administrative rights",
        "is_system_role": True,
        "sort_order": 1,
        "permissions": [
            "tenant:*",
            "user:*", 
            "role:*",
            "billing:*",
            "settings:*"
        ],
        "metadata": {
            "cannot_be_removed": True,
            "max_per_tenant": 1
        }
    },
    {
        "code": "admin",
        "name": "Administrator",
        "description": "Administrator with user and content management rights",
        "is_system_role": True,
        "sort_order": 2,
        "permissions": [
            "user:create",
            "user:read",
            "user:update",
            "user:delete",
            "content:*",
            "analytics:read"
        ],
        "metadata": {
            "can_invite_users": True
        }
    },
    {
        "code": "member",
        "name": "Member",
        "description": "Standard member with content access and collaboration",
        "is_system_role": True,
        "sort_order": 3,
        "permissions": [
            "content:create",
            "content:read",
            "content:update",
            "collaboration:*",
            "profile:update"
        ],
        "metadata": {
            "can_create_projects": True
        }
    },
    {
        "code": "viewer",
        "name": "Viewer",
        "description": "Read-only access to shared content",
        "is_system_role": True,
        "sort_order": 4,
        "permissions": [
            "content:read",
            "profile:read",
            "profile:update"
        ],
        "metadata": {
            "read_only": True
        }
    }
]



# Audit Event Types Reference Data
AUDIT_EVENT_TYPES = [
    {
        "code": "authentication",
        "name": "Authentication",
        "description": "User login, logout, and authentication events",
        "severity_default": "low",
        "retention_days": 90
    },
    {
        "code": "authorization",
        "name": "Authorization",
        "description": "Permission checks and access control events",
        "severity_default": "medium", 
        "retention_days": 180
    },
    {
        "code": "user_management",
        "name": "User Management",
        "description": "User creation, updates, and role changes",
        "severity_default": "medium",
        "retention_days": 365
    },
    {
        "code": "data_access",
        "name": "Data Access",
        "description": "Data read, write, and modification events",
        "severity_default": "low",
        "retention_days": 365
    },
    {
        "code": "security",
        "name": "Security Events",
        "description": "Security-related events and violations",
        "severity_default": "high",
        "retention_days": 2555  # 7 years
    },
    {
        "code": "system_admin",
        "name": "System Administration",
        "description": "System-level administrative actions",
        "severity_default": "high",
        "retention_days": 2555
    }
]
