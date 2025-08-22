from typing import List, Dict, Any, Optional
from app.repositories.user_repository import UserRepository
from app.repositories.tenant_repository import TenantRepository
from app.delegators.user_delegator import UserDelegator
from app.models.user import User
from app.models.tenant import Tenant
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../../shared'))
from shared.repositories.repository_factory import RepositoryFactory

class UserService:
    """Clean user service using repository pattern"""
    
    def __init__(self, repository_factory: RepositoryFactory):
        self.user_repo = repository_factory.create_repository(UserRepository, User)
        self.tenant_repo = repository_factory.create_repository(TenantRepository, Tenant)
        self.delegator = UserDelegator(self.user_repo, self.tenant_repo)
    
    def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile with business logic"""
        return self.delegator.get_user_profile(user_id)
    
    def update_profile(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        """Update user profile"""
        return self.delegator.update_user_profile(user_id, update_data)
    
    def get_tenant_users(self, tenant_id: str, current_user_id: str) -> List[Dict[str, Any]]:
        """Get users in tenant"""
        return self.delegator.get_tenant_users(tenant_id, current_user_id)
    
    def deactivate_user(self, user_id: str) -> bool:
        """Deactivate user account"""
        return self.user_repo.update(user_id, {"is_active": False}) is not None