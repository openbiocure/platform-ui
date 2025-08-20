from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_
import uuid

from ..models.tenant import Tenant, TenantUser
from ..models.user import User
from ..schemas.tenant import TenantCreate, TenantResponse
from .audit_service import AuditService

class TenantService:
    """
    Tenant management service for multi-tenant operations
    Handles tenant creation, user assignment, and access control
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.audit = AuditService(db)
    
    async def create_tenant(self, tenant_data: TenantCreate, creator_user_id: str) -> TenantResponse:
        """
        Create new tenant with admin user assignment
        """
        # Check if tenant slug already exists
        existing_tenant = self.db.query(Tenant).filter(Tenant.slug == tenant_data.slug).first()
        if existing_tenant:
            raise ValueError("Tenant slug already exists")
        
        # Create tenant
        new_tenant = Tenant(
            name=tenant_data.name,
            slug=tenant_data.slug,
            login_mode=tenant_data.login_mode,
            settings=tenant_data.settings
        )
        
        self.db.add(new_tenant)
        self.db.commit()
        self.db.refresh(new_tenant)
        
        # Add creator as admin
        tenant_user = TenantUser(
            tenant_id=new_tenant.id,
            user_id=creator_user_id,
            role="admin"
        )
        
        self.db.add(tenant_user)
        self.db.commit()
        
        # Log tenant creation
        await self.audit.log_security_event(
            tenant_id=str(new_tenant.id),
            event_type="tenant_management",
            action="tenant_created",
            severity="low",
            user_id=uuid.UUID(creator_user_id),
            correlation_id=str(uuid.uuid4()),
            details={"tenant_name": new_tenant.name, "tenant_slug": new_tenant.slug}
        )
        
        return TenantResponse(
            id=str(new_tenant.id),
            name=new_tenant.name,
            slug=new_tenant.slug,
            login_mode=new_tenant.login_mode,
            settings=new_tenant.settings,
            created_at=new_tenant.created_at,
            updated_at=new_tenant.updated_at
        )
    
    async def get_user_tenants(self, user_id: str) -> List[dict]:
        """
        Get all tenants for a user with their roles
        """
        memberships = self.db.query(TenantUser, Tenant).join(
            Tenant, TenantUser.tenant_id == Tenant.id
        ).filter(TenantUser.user_id == user_id).all()
        
        return [
            {
                "tenant_id": str(tenant.id),
                "tenant_name": tenant.name,
                "tenant_slug": tenant.slug,
                "role": membership.role,
                "joined_at": membership.created_at
            }
            for membership, tenant in memberships
        ]
    
    async def add_user_to_tenant(
        self, 
        tenant_id: str, 
        user_id: str, 
        role: str, 
        admin_user_id: str
    ) -> bool:
        """
        Add user to tenant with specified role
        """
        # Verify admin has permission
        admin_membership = self.db.query(TenantUser).filter(
            and_(
                TenantUser.tenant_id == tenant_id,
                TenantUser.user_id == admin_user_id,
                TenantUser.role == "admin"
            )
        ).first()
        
        if not admin_membership:
            return False
        
        # Check if user already in tenant
        existing_membership = self.db.query(TenantUser).filter(
            and_(TenantUser.tenant_id == tenant_id, TenantUser.user_id == user_id)
        ).first()
        
        if existing_membership:
            return False
        
        # Add user to tenant
        tenant_user = TenantUser(
            tenant_id=tenant_id,
            user_id=user_id,
            role=role
        )
        
        self.db.add(tenant_user)
        self.db.commit()
        
        # Log user addition
        await self.audit.log_security_event(
            tenant_id=tenant_id,
            event_type="tenant_management",
            action="user_added_to_tenant",
            severity="low",
            user_id=uuid.UUID(admin_user_id),
            correlation_id=str(uuid.uuid4()),
            details={"added_user_id": user_id, "role": role}
        )
        
        return True
    
    async def validate_tenant_access(self, user_id: str, tenant_id: str) -> Optional[str]:
        """
        Validate user has access to tenant and return role
        """
        membership = self.db.query(TenantUser).filter(
            and_(TenantUser.user_id == user_id, TenantUser.tenant_id == tenant_id)
        ).first()
        
        return membership.role if membership else None
