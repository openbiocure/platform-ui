from typing import Dict, Any
from app.repositories.user_repository import UserRepository
from app.repositories.tenant_repository import TenantRepository
from app.delegators.auth_delegator import AuthDelegator
from app.models.user import User
from app.models.tenant import Tenant
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../../shared'))
from shared.repositories.repository_factory import RepositoryFactory
from shared.events.producer import EventProducer
from shared.events.schemas import AuditEvent

class AuthService:
    """Clean auth service using repository pattern with auditing"""
    
    def __init__(self, repository_factory: RepositoryFactory, event_producer: EventProducer):
        self.user_repo = repository_factory.create_repository(UserRepository, User)
        self.tenant_repo = repository_factory.create_repository(TenantRepository, Tenant)
        self.delegator = AuthDelegator(self.user_repo, self.tenant_repo)
        self.event_producer = event_producer
    
    async def login(self, email: str, password: str, ip_address: str = None, user_agent: str = None) -> Dict[str, Any]:
        """Authenticate user and return tokens"""
        try:
            auth_data = self.delegator.validate_login_credentials(email, password)
            if not auth_data:
                # Audit failed login
                await self.event_producer.publish("audit.auth", AuditEvent(
                    service="auth-service",
                    action="login_failed",
                    resource_type="user",
                    event_type="auth",
                    severity="medium",
                    ip_address=ip_address,
                    user_agent=user_agent,
                    details={"email": email, "reason": "invalid_credentials"}
                ).dict())
                raise ValueError("Invalid credentials")
                
            user = auth_data["user"]
            tenant = auth_data["tenant"]
            
            tokens = self.delegator.create_user_tokens(user.id, tenant.id)
            
            # Audit successful login
            await self.event_producer.publish("audit.auth", AuditEvent(
                service="auth-service",
                tenant_id=tenant.id,
                user_id=user.id,
                action="login_success",
                resource_type="user",
                resource_id=user.id,
                event_type="auth",
                severity="low",
                ip_address=ip_address,
                user_agent=user_agent,
                details={"email": email}
            ).dict())
            
            return {
                **tokens,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "type": user.type
                },
                "tenant_id": tenant.id
            }
        except Exception as e:
            # Audit system error
            await self.event_producer.publish("audit.auth", AuditEvent(
                service="auth-service",
                action="login_error",
                resource_type="user",
                event_type="auth",
                severity="high",
                ip_address=ip_address,
                user_agent=user_agent,
                details={"email": email, "error": str(e)}
            ).dict())
            raise
    
    async def register(self, email: str, password: str, name: str, user_type: str = "individual") -> Dict[str, Any]:
        """Register new user"""
        try:
            user_data = self.delegator.validate_registration_data(email, password, name)
            tenant_id = self.delegator.determine_user_tenant(user_type)
            
            user_data.update({
                "tenant_id": tenant_id,
                "type": user_type
            })
            
            user = self.user_repo.create(user_data)
            tokens = self.delegator.create_user_tokens(user.id, tenant_id)
            
            # Audit user registration
            await self.event_producer.publish("audit.auth", AuditEvent(
                service="auth-service",
                tenant_id=tenant_id,
                user_id=user.id,
                action="user_registered",
                resource_type="user",
                resource_id=user.id,
                event_type="create",
                severity="medium",
                details={"email": email, "user_type": user_type}
            ).dict())
            
            return {
                **tokens,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "type": user.type
                },
                "tenant_id": tenant_id
            }
        except Exception as e:
            # Audit registration failure
            await self.event_producer.publish("audit.auth", AuditEvent(
                service="auth-service",
                action="registration_failed",
                resource_type="user",
                event_type="create",
                severity="medium",
                details={"email": email, "error": str(e)}
            ).dict())
            raise
    
    async def refresh_token(self, user_id: str, tenant_id: str) -> Dict[str, Any]:
        """Refresh user tokens"""
        result = self.delegator.create_user_tokens(user_id, tenant_id)
        
        # Audit token refresh
        await self.event_producer.publish("audit.auth", AuditEvent(
            service="auth-service",
            tenant_id=tenant_id,
            user_id=user_id,
            action="token_refreshed",
            resource_type="user",
            resource_id=user_id,
            event_type="auth",
            severity="low"
        ).dict())
        
        return result
    
    async def verify_token(self, user_id: str) -> Dict[str, Any]:
        """Verify token and return user data"""
        user = self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise ValueError("Invalid user")
            
        return {
            "user_id": user.id,
            "email": user.email,
            "tenant_id": user.tenant_id,
            "is_active": user.is_active
        }