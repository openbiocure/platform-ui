from typing import Optional, List
from sqlalchemy.orm import Session
from shared import BaseRepository
from app.models.tenant import Tenant

class TenantRepository(BaseRepository[Tenant]):
    """Tenant repository with specific tenant operations"""
    
    def __init__(self, db: Session, model=Tenant):
        super().__init__(db, model)
    
    def get_by_slug(self, slug: str) -> Optional[Tenant]:
        """Get tenant by slug"""
        return self.db.query(Tenant).filter(Tenant.slug == slug).first()
    
    def get_active_tenants(self) -> List[Tenant]:
        """Get all active tenants"""
        return self.db.query(Tenant).filter(Tenant.is_active == True).all()
    
    def slug_exists(self, slug: str) -> bool:
        """Check if slug already exists"""
        return self.db.query(Tenant).filter(Tenant.slug == slug).first() is not None
    
    def get_by_type(self, tenant_type: str) -> List[Tenant]:
        """Get tenants by type"""
        return self.db.query(Tenant).filter(Tenant.type == tenant_type).all()
