from enum import Enum
from sqlalchemy import Enum as SQLEnum

class UserType(str, Enum):
    """User type enumeration"""
    INDIVIDUAL = "individual"
    ORGANIZATION_ADMIN = "organization_admin"
    ORGANIZATION_MEMBER = "organization_member"
    SYSTEM_ADMIN = "system_admin"

class TenantType(str, Enum):
    """Tenant type enumeration"""
    ORGANIZATION = "organization"
    TRIAL = "trial"
    ENTERPRISE = "enterprise"
    ACADEMIC = "academic"

class TenantRole(str, Enum):
    """User role within a tenant"""
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"
    OWNER = "owner"

class LoginMode(str, Enum):
    """Tenant login mode"""
    EMAIL = "email"
    SSO = "sso"
    HYBRID = "hybrid"

class FeatureCategory(str, Enum):
    """Feature category enumeration"""
    RESEARCH = "research"
    COLLABORATION = "collaboration"
    ANALYTICS = "analytics"
    ADMINISTRATION = "administration"
    AI_TOOLS = "ai_tools"
    DATA_EXPORT = "data_export"
    GENERAL = "general"

class AuditSeverity(str, Enum):
    """Audit log severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AuditEventClass(str, Enum):
    """Audit event classifications"""
    AUTHENTICATION = "authentication"
    AUTHORIZATION = "authorization"
    DATA_ACCESS = "data_access"
    USER_MANAGEMENT = "user_management"
    SYSTEM_ADMIN = "system_admin"
    SECURITY = "security"

# SQLAlchemy enum types for database columns
UserTypeEnum = SQLEnum(UserType, name="user_type")
TenantTypeEnum = SQLEnum(TenantType, name="tenant_type")
TenantRoleEnum = SQLEnum(TenantRole, name="tenant_role")
LoginModeEnum = SQLEnum(LoginMode, name="login_mode")
FeatureCategoryEnum = SQLEnum(FeatureCategory, name="feature_category")
AuditSeverityEnum = SQLEnum(AuditSeverity, name="audit_severity")
AuditEventClassEnum = SQLEnum(AuditEventClass, name="audit_event_class")
