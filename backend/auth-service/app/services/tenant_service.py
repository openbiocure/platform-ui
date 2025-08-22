from typing import List, Dict, Any, Optional
from app.repositories.tenant_repository import TenantRepository
from app.delegators.tenant_delegator import TenantDelegator
from app.models.tenant import Tenant
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../../shared'))
from shared.repositories.repository_factory import RepositoryFactory

class TenantService:
    """Clean tenant service using repository pattern"""
    
    def __init__(self, repository_factory: RepositoryFactory):
        self.tenant_repo = repository_factory.create_repository(TenantRepository, Tenant)
        self.delegator = TenantDelegator(self.tenant_repo)
    
    def create_tenant(self, tenant_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new tenant"""
        return self.delegator.create_tenant(tenant_data)
    
    def get_tenant(self, tenant_id: str) -> Optional[Dict[str, Any]]:
        """Get tenant by ID"""
        return self.delegator.get_tenant_details(tenant_id)
    
    def update_tenant(self, tenant_id: str, update_data: Dict[str, Any]) -> bool:
        """Update tenant"""
        return self.delegator.update_tenant(tenant_id, update_data)
    
    def get_all_tenants(self) -> List[Dict[str, Any]]:
        """Get all active tenants"""
        tenants = self.tenant_repo.get_active_tenants()
        return [self.delegator.sanitize_tenant_data(tenant) for tenant in tenants]