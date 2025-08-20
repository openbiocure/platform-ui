from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import uuid

from ..models.user import User
from ..models.tenant import Tenant, TenantUser
from ..core.security import security
from ..core.config import settings
from ..schemas.auth import UserLogin, UserRegister, TokenResponse, TenantContext
from .audit_service import AuditService

class AuthService:
    """
    Authentication service implementing multi-tenant security
    Handles login, registration, token management with tenant context
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.audit = AuditService(db)
    
    async def authenticate_user(self, login_data: UserLogin, ip_address: str, user_agent: str) -> Optional[TokenResponse]:
        """
        Authenticate user with tenant context validation
        """
        correlation_id = login_data.correlation_id or str(uuid.uuid4())
        
        # Find user by email
        user = self.db.query(User).filter(User.email == login_data.email).first()
        if not user or not security.verify_password(login_data.password, user.password_hash):
            # Log failed authentication attempt
            await self.audit.log_security_event(
                tenant_id=None,
                event_type="authentication",
                action="login_failed",
                severity="medium",
                user_id=user.id if user else None,
                ip_address=ip_address,
                user_agent=user_agent,
                correlation_id=correlation_id,
                details={"email": login_data.email, "reason": "invalid_credentials"}
            )
            return None
        
        # Check if user is active
        if not user.is_active:
            await self.audit.log_security_event(
                tenant_id=None,
                event_type="authentication",
                action="login_blocked",
                severity="high",
                user_id=user.id,
                ip_address=ip_address,
                user_agent=user_agent,
                correlation_id=correlation_id,
                details={"reason": "user_inactive"}
            )
            return None
        
        # Get user's tenant memberships
        tenant_memberships = self.db.query(TenantUser, Tenant).join(
            Tenant, TenantUser.tenant_id == Tenant.id
        ).filter(TenantUser.user_id == user.id).all()
        
        if not tenant_memberships:
            await self.audit.log_security_event(
                tenant_id=None,
                event_type="authorization",
                action="no_tenant_access",
                severity="medium",
                user_id=user.id,
                ip_address=ip_address,
                user_agent=user_agent,
                correlation_id=correlation_id,
                details={"reason": "no_tenant_membership"}
            )
            return None
        
        # Determine tenant context
        target_tenant = None
        if login_data.tenant_slug:
            # User specified tenant
            for membership, tenant in tenant_memberships:
                if tenant.slug == login_data.tenant_slug:
                    target_tenant = (membership, tenant)
                    break
        else:
            # Use first available tenant
            target_tenant = tenant_memberships[0]
        
        if not target_tenant:
            await self.audit.log_security_event(
                tenant_id=None,
                event_type="authorization",
                action="tenant_access_denied",
                severity="medium",
                user_id=user.id,
                ip_address=ip_address,
                user_agent=user_agent,
                correlation_id=correlation_id,
                details={"requested_tenant": login_data.tenant_slug}
            )
            return None
        
        membership, tenant = target_tenant
        
        # Create JWT tokens with tenant context
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "username": user.username,
            "tenant_id": str(tenant.id),
            "tenant_slug": tenant.slug,
            "role": membership.role,
            "correlation_id": correlation_id
        }
        
        access_token = security.create_access_token(token_data)
        refresh_token = security.create_refresh_token(token_data)
        
        # Generate tenant-specific session key
        session_key = security.generate_session_key(str(tenant.id))
        
        # Log successful authentication
        await self.audit.log_security_event(
            tenant_id=str(tenant.id),
            event_type="authentication",
            action="login_success",
            severity="low",
            user_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent,
            correlation_id=correlation_id,
            details={"tenant_slug": tenant.slug, "role": membership.role}
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            tenant_context=TenantContext(
                tenant_id=str(tenant.id),
                tenant_slug=tenant.slug,
                role=membership.role
            ),
            session_key=session_key,
            correlation_id=correlation_id
        )
    
    async def register_user(self, register_data: UserRegister, ip_address: str, user_agent: str) -> Optional[TokenResponse]:
        """
        Register new user with optional tenant assignment
        """
        correlation_id = str(uuid.uuid4())
        
        # Check if user already exists
        existing_user = self.db.query(User).filter(
            or_(User.email == register_data.email, User.username == register_data.username)
        ).first()
        
        if existing_user:
            await self.audit.log_security_event(
                tenant_id=None,
                event_type="authentication",
                action="registration_failed",
                severity="low",
                user_id=None,
                ip_address=ip_address,
                user_agent=user_agent,
                correlation_id=correlation_id,
                details={"email": register_data.email, "reason": "user_exists"}
            )
            return None
        
        # Create new user
        hashed_password = security.get_password_hash(register_data.password)
        new_user = User(
            email=register_data.email,
            username=register_data.username,
            full_name=register_data.full_name,
            password_hash=hashed_password
        )
        
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)
        
        # If tenant specified, add user to tenant
        tenant = None
        if register_data.tenant_slug:
            tenant = self.db.query(Tenant).filter(Tenant.slug == register_data.tenant_slug).first()
            if tenant:
                tenant_user = TenantUser(
                    tenant_id=tenant.id,
                    user_id=new_user.id,
                    role="member"
                )
                self.db.add(tenant_user)
                self.db.commit()
        
        # Log successful registration
        await self.audit.log_security_event(
            tenant_id=str(tenant.id) if tenant else None,
            event_type="authentication",
            action="user_registered",
            severity="low",
            user_id=new_user.id,
            ip_address=ip_address,
            user_agent=user_agent,
            correlation_id=correlation_id,
            details={"tenant_slug": register_data.tenant_slug}
        )
        
        # If user was added to tenant, create login response
        if tenant:
            return await self.authenticate_user(
                UserLogin(
                    email=register_data.email,
                    password=register_data.password,
                    tenant_slug=register_data.tenant_slug,
                    correlation_id=correlation_id
                ),
                ip_address,
                user_agent
            )
        
        return None
    
    async def refresh_token(self, refresh_token: str, tenant_id: str) -> Optional[TokenResponse]:
        """
        Refresh access token with tenant validation
        """
        payload = security.verify_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            return None
        
        # Validate tenant context
        if not security.validate_tenant_context(payload, tenant_id):
            return None
        
        # Get user and tenant info
        user_id = payload.get("sub")
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            return None
        
        # Verify tenant membership
        membership = self.db.query(TenantUser, Tenant).join(
            Tenant, TenantUser.tenant_id == Tenant.id
        ).filter(
            and_(TenantUser.user_id == user.id, Tenant.id == tenant_id)
        ).first()
        
        if not membership:
            return None
        
        tenant_user, tenant = membership
        
        # Create new tokens
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "username": user.username,
            "tenant_id": str(tenant.id),
            "tenant_slug": tenant.slug,
            "role": tenant_user.role,
            "correlation_id": str(uuid.uuid4())
        }
        
        access_token = security.create_access_token(token_data)
        new_refresh_token = security.create_refresh_token(token_data)
        session_key = security.generate_session_key(str(tenant.id))
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            tenant_context=TenantContext(
                tenant_id=str(tenant.id),
                tenant_slug=tenant.slug,
                role=tenant_user.role
            ),
            session_key=session_key,
            correlation_id=token_data["correlation_id"]
        )
