from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.repositories.user_repository import UserRepository
from app.repositories.tenant_repository import TenantRepository

class AuthDelegator:
    """Business logic delegator for authentication operations"""
    
    def __init__(self, user_repo: UserRepository, tenant_repo: TenantRepository):
        self.user_repo = user_repo
        self.tenant_repo = tenant_repo
    
    def validate_login_credentials(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """Validate login credentials and return user data if valid"""
        user = self.user_repo.get_by_email(email)
        
        if not user:
            return None
            
        if not user.is_active:
            raise ValueError("Account is disabled")
            
        if not verify_password(password, user.hashed_password):
            return None
            
        # Update last login
        self.user_repo.update_last_login(user.id)
        
        # Get tenant info
        tenant = self.tenant_repo.get_by_id(user.tenant_id)
        if not tenant or not tenant.is_active:
            raise ValueError("Tenant is disabled")
            
        return {
            "user": user,
            "tenant": tenant
        }
    
    def create_user_tokens(self, user_id: str, tenant_id: str) -> Dict[str, Any]:
        """Create access and refresh tokens for user"""
        token_data = {"sub": user_id, "tenant_id": tenant_id}
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": 30 * 60  # 30 minutes
        }
    
    def validate_registration_data(self, email: str, password: str, name: str) -> Dict[str, Any]:
        """Validate registration data and return processed data"""
        if self.user_repo.email_exists(email):
            raise ValueError("Email already registered")
            
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters")
            
        if not name or len(name.strip()) < 2:
            raise ValueError("Name must be at least 2 characters")
            
        return {
            "email": email.lower().strip(),
            "hashed_password": get_password_hash(password),
            "name": name.strip(),
            "is_active": True,
            "email_verified": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    
    def determine_user_tenant(self, user_type: str = "individual") -> str:
        """Determine which tenant a new user should belong to"""
        if user_type == "individual":
            # Get or create default individual tenant
            default_tenant = self.tenant_repo.get_by_slug("default")
            if default_tenant:
                return default_tenant.id
        
        # Fallback - create logic for tenant assignment
        active_tenants = self.tenant_repo.get_active_tenants()
        if active_tenants:
            return active_tenants[0].id
            
        raise ValueError("No active tenant available for user registration")
