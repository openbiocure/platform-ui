from typing import List, Dict, Any, Optional
from datetime import datetime
from app.repositories.user_repository import UserRepository
from app.repositories.tenant_repository import TenantRepository

class UserDelegator:
    """Business logic delegator for user operations"""
    
    def __init__(self, user_repo: UserRepository, tenant_repo: TenantRepository):
        self.user_repo = user_repo
        self.tenant_repo = tenant_repo
    
    def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get complete user profile with tenant information"""
        user = self.user_repo.get_by_id(user_id)
        if not user:
            return None
            
        tenant = self.tenant_repo.get_by_id(user.tenant_id)
        
        return {
            "user": user,
            "tenant": tenant,
            "permissions": self._get_user_permissions(user),

        }
    
    def update_user_profile(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        """Update user profile with business rules"""
        user = self.user_repo.get_by_id(user_id)
        if not user:
            return False
            
        # Apply business rules for updates
        allowed_fields = ["name", "email", "type"]
        filtered_data = {k: v for k, v in update_data.items() if k in allowed_fields}
        
        # Email change validation
        if "email" in filtered_data:
            new_email = filtered_data["email"].lower().strip()
            if new_email != user.email and self.user_repo.email_exists(new_email):
                raise ValueError("Email already in use")
            filtered_data["email"] = new_email
            filtered_data["email_verified"] = False  # Re-verify email
            
        filtered_data["updated_at"] = datetime.utcnow()
        
        return self.user_repo.update(user_id, filtered_data) is not None
    
    def get_tenant_users(self, tenant_id: str, current_user_id: str) -> List[Dict[str, Any]]:
        """Get users in the same tenant with permission checks"""
        # Verify current user belongs to this tenant
        current_user = self.user_repo.get_by_id(current_user_id)
        if not current_user or current_user.tenant_id != tenant_id:
            raise ValueError("Access denied to tenant users")
            
        users = self.user_repo.get_by_tenant(tenant_id)
        return [self._sanitize_user_data(user) for user in users]
    
    def _get_user_permissions(self, user) -> List[str]:
        """Determine user permissions based on type and tenant"""
        permissions = ["read_own_profile", "update_own_profile"]
        
        if user.type == "organization_admin":
            permissions.extend([
                "manage_tenant_users",
                "view_tenant_analytics", 
                "manage_tenant_settings"
            ])
        elif user.type == "organization_member":
            permissions.extend([
                "view_tenant_users",
                "collaborate_in_tenant"
            ])
            
        return permissions
    

    
    def _sanitize_user_data(self, user) -> Dict[str, Any]:
        """Remove sensitive data from user object"""
        return {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "type": user.type,
            "is_active": user.is_active,
            "created_at": user.created_at
        }
