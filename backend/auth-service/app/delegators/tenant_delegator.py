from typing import Dict, Any, Optional
from datetime import datetime
from app.repositories.tenant_repository import TenantRepository

class TenantDelegator:
    """Business logic delegator for tenant operations"""
    
    def __init__(self, tenant_repo: TenantRepository):
        self.tenant_repo = tenant_repo
    
    def create_tenant(self, tenant_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create tenant with validation"""
        name = tenant_data.get("name", "").strip()
        slug = tenant_data.get("slug", "").lower().strip()
        
        if not name or len(name) < 3:
            raise ValueError("Tenant name must be at least 3 characters")
            
        if not slug:
            slug = self._generate_slug(name)
            
        if self.tenant_repo.slug_exists(slug):
            raise ValueError("Tenant slug already exists")
            
        processed_data = {
            "name": name,
            "slug": slug,
            "type": tenant_data.get("type", "organization"),
            "description": tenant_data.get("description", ""),
            "settings": tenant_data.get("settings", {}),
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        tenant = self.tenant_repo.create(processed_data)
        return self.sanitize_tenant_data(tenant)
    
    def get_tenant_details(self, tenant_id: str) -> Optional[Dict[str, Any]]:
        """Get tenant with additional computed details"""
        tenant = self.tenant_repo.get_by_id(tenant_id)
        if not tenant:
            return None
            
        return {
            **self.sanitize_tenant_data(tenant),
            "features": self._get_tenant_features(tenant),
            "limits": self._get_tenant_limits(tenant)
        }
    
    def update_tenant(self, tenant_id: str, update_data: Dict[str, Any]) -> bool:
        """Update tenant with business rules"""
        tenant = self.tenant_repo.get_by_id(tenant_id)
        if not tenant:
            return False
            
        allowed_fields = ["name", "description", "settings", "type"]
        filtered_data = {k: v for k, v in update_data.items() if k in allowed_fields}
        
        # Slug change validation
        if "slug" in update_data:
            new_slug = update_data["slug"].lower().strip()
            if new_slug != tenant.slug and self.tenant_repo.slug_exists(new_slug):
                raise ValueError("Slug already in use")
            filtered_data["slug"] = new_slug
            
        filtered_data["updated_at"] = datetime.utcnow()
        
        return self.tenant_repo.update(tenant_id, filtered_data) is not None
    
    def sanitize_tenant_data(self, tenant) -> Dict[str, Any]:
        """Remove sensitive data from tenant object"""
        return {
            "id": tenant.id,
            "name": tenant.name,
            "slug": tenant.slug,
            "type": tenant.type,
            "description": tenant.description,
            "settings": tenant.settings,
            "is_active": tenant.is_active,
            "created_at": tenant.created_at
        }
    
    def _generate_slug(self, name: str) -> str:
        """Generate URL-friendly slug from name"""
        import re
        slug = re.sub(r'[^a-zA-Z0-9\s-]', '', name.lower())
        slug = re.sub(r'[\s-]+', '-', slug).strip('-')
        return slug
    
    def _get_tenant_features(self, tenant) -> List[str]:
        """Get available features for tenant"""
        if not tenant.settings:
            return ["basic"]
            
        return tenant.settings.get("features", ["basic"])
    
    def _get_tenant_limits(self, tenant) -> Dict[str, Any]:
        """Get tenant limits and quotas"""
        if not tenant.settings:
            return {"max_users": 10, "storage_gb": 1}
            
        return {
            "max_users": tenant.settings.get("max_users", 10),
            "storage_gb": tenant.settings.get("storage_gb", 1)
        }
