"""
Permission Service for RBAC + ABAC + OPA integration
"""
from typing import Dict, List, Optional, Any, Tuple
from sqlalchemy.orm import Session
from app.models.permissions import Role, Permission, TenantSecurityPolicy
from app.models.user import User
from app.models.tenant import Tenant
import json
import logging

logger = logging.getLogger(__name__)

class PermissionService:
    """Service for managing and checking user permissions"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def check_permission(self, user: User, resource: str, action: str, context: Dict[str, Any] = None) -> bool:
        """
        Check if user has permission to perform action on resource
        
        Args:
            user: User object
            resource: Resource type (e.g., "publications", "workspace")
            action: Action to perform (e.g., "read", "write", "delete")
            context: Additional context for ABAC evaluation
            
        Returns:
            bool: True if permission granted, False otherwise
        """
        try:
            # 1. Check RBAC permissions
            rbac_allowed = self._check_rbac(user, resource, action)
            if not rbac_allowed:
                logger.info(f"RBAC denied: User {user.id} cannot {action} {resource}")
                return False
            
            # 2. Check ABAC conditions
            abac_allowed = self._check_abac(user, resource, action, context or {})
            if not abac_allowed:
                logger.info(f"ABAC denied: User {user.id} cannot {action} {resource} due to context")
                return False
            
            # 3. Check OPA policies if configured
            if self._has_opa_policies(user.tenant):
                opa_allowed = self._check_opa(user, resource, action, context or {})
                if not opa_allowed:
                    logger.info(f"OPA denied: User {user.id} cannot {action} {resource}")
                    return False
            
            logger.info(f"Permission granted: User {user.id} can {action} {resource}")
            return True
            
        except Exception as e:
            logger.error(f"Error checking permission: {e}")
            return False
    
    def _check_rbac(self, user: User, resource: str, action: str) -> bool:
        """Check Role-Based Access Control permissions"""
        try:
            # Get user's role and permissions
            if not user.role:
                logger.warning(f"User {user.id} has no role assigned")
                return False
            
            # Check if role is active
            if not user.role.is_active:
                logger.warning(f"User {user.id} has inactive role {user.role.name}")
                return False
            
            # Check permissions for this role
            permissions = self.db.query(Permission).filter(
                Permission.role_id == user.role.id,
                Permission.resource == resource,
                Permission.action == action,
                Permission.is_active == True
            ).all()
            
            return len(permissions) > 0
            
        except Exception as e:
            logger.error(f"Error checking RBAC: {e}")
            return False
    
    def _check_abac(self, user: User, resource: str, action: str, context: Dict[str, Any]) -> bool:
        """Check Attribute-Based Access Control conditions"""
        try:
            # Get user's role permissions with conditions
            permissions = self.db.query(Permission).filter(
                Permission.role_id == user.role.id,
                Permission.resource == resource,
                Permission.action == action,
                Permission.is_active == True,
                Permission.conditions.isnot(None)
            ).all()
            
            if not permissions:
                # No ABAC conditions, default to allow
                return True
            
            # Evaluate each permission's conditions
            for permission in permissions:
                if self._evaluate_conditions(user, permission.conditions, context):
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking ABAC: {e}")
            return False
    
    def _evaluate_conditions(self, user: User, conditions: Dict[str, Any], context: Dict[str, Any]) -> bool:
        """Evaluate ABAC conditions against user and context"""
        try:
            if not conditions:
                return True
            
            # Example conditions structure:
            # {
            #     "user_tenant_match": "user.tenant_id == resource.tenant_id",
            #     "project_membership": "user.id in resource.project.members"
            # }
            
            for condition_name, condition_value in conditions.items():
                if not self._evaluate_single_condition(user, condition_name, condition_value, context):
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error evaluating conditions: {e}")
            return False
    
    def _evaluate_single_condition(self, user: User, condition_name: str, condition_value: Any, context: Dict[str, Any]) -> bool:
        """Evaluate a single ABAC condition"""
        try:
            if condition_name == "user_tenant_match":
                return user.tenant_id == context.get("resource_tenant_id")
            

            
            elif condition_name == "project_membership":
                project_id = context.get("project_id")
                if not project_id:
                    return False
                return any(m.project_id == project_id for m in user.project_memberships)
            
            elif condition_name == "resource_owner":
                resource_owner_id = context.get("resource_owner_id")
                return user.id == resource_owner_id
            
            elif condition_name == "time_based":
                # Example: Only allow access during business hours
                import datetime
                now = datetime.datetime.now()
                return 9 <= now.hour <= 17
            
            # Default to True for unknown conditions
            return True
            
        except Exception as e:
            logger.error(f"Error evaluating condition {condition_name}: {e}")
            return False
    
    def _has_opa_policies(self, tenant: Tenant) -> bool:
        """Check if tenant has OPA policies configured"""
        try:
            policies = self.db.query(TenantSecurityPolicy).filter(
                TenantSecurityPolicy.tenant_id == tenant.id,
                TenantSecurityPolicy.policy_type == "opa",
                TenantSecurityPolicy.is_active == True
            ).count()
            
            return policies > 0
            
        except Exception as e:
            logger.error(f"Error checking OPA policies: {e}")
            return False
    
    def _check_opa(self, user: User, resource: str, action: str, context: Dict[str, Any]) -> bool:
        """Check Open Policy Agent policies"""
        try:
            # This is a placeholder for OPA integration
            # In production, you would:
            # 1. Query OPA with user, resource, action, and context
            # 2. Get policy decision
            # 3. Return the decision
            
            # For now, return True (allow) if OPA is not fully implemented
            logger.info(f"OPA check placeholder: User {user.id} {action} {resource}")
            return True
            
        except Exception as e:
            logger.error(f"Error checking OPA: {e}")
            return False
    
    def get_user_permissions(self, user: User) -> List[Dict[str, Any]]:
        """Get all permissions for a user"""
        try:
            if not user.role:
                return []
            
            permissions = self.db.query(Permission).filter(
                Permission.role_id == user.role.id,
                Permission.is_active == True
            ).all()
            
            return [
                {
                    "resource": p.resource,
                    "action": p.action,
                    "conditions": p.conditions
                }
                for p in permissions
            ]
            
        except Exception as e:
            logger.error(f"Error getting user permissions: {e}")
            return []
    
    def create_role(self, tenant_id: str, name: str, description: str = None, is_system_role: bool = False) -> Optional[Role]:
        """Create a new role for a tenant"""
        try:
            role = Role(
                name=name,
                description=description,
                tenant_id=tenant_id,
                is_system_role=is_system_role
            )
            
            self.db.add(role)
            self.db.commit()
            self.db.refresh(role)
            
            return role
            
        except Exception as e:
            logger.error(f"Error creating role: {e}")
            self.db.rollback()
            return None
    
    def add_permission_to_role(self, role_id: str, resource: str, action: str, conditions: Dict[str, Any] = None) -> Optional[Permission]:
        """Add a permission to a role"""
        try:
            permission = Permission(
                resource=resource,
                action=action,
                conditions=conditions,
                role_id=role_id
            )
            
            self.db.add(permission)
            self.db.commit()
            self.db.refresh(permission)
            
            return permission
            
        except Exception as e:
            logger.error(f"Error adding permission: {e}")
            self.db.rollback()
            return None
    
    def create_default_roles(self, tenant_id: str) -> bool:
        """Create default roles for a new tenant"""
        try:
            # Scholar role
            scholar_role = self.create_role(
                tenant_id=tenant_id,
                name="scholar",
                description="Research scientist with access to publications and workspace",
                is_system_role=True
            )
            
            if scholar_role:
                # Add scholar permissions
                self.add_permission_to_role(scholar_role.id, "publications", "read")
                self.add_permission_to_role(scholar_role.id, "publications", "search")
                self.add_permission_to_role(scholar_role.id, "workspace", "read", {"project_membership": True})
                self.add_permission_to_role(scholar_role.id, "workspace", "write", {"project_membership": True})
                self.add_permission_to_role(scholar_role.id, "projects", "create")
                self.add_permission_to_role(scholar_role.id, "projects", "read", {"user_tenant_match": True})
                self.add_permission_to_role(scholar_role.id, "projects", "update", {"project_membership": True})
            
            # Tenant Admin role
            admin_role = self.create_role(
                tenant_id=tenant_id,
                name="tenant_admin",
                description="Tenant administrator with full access",
                is_system_role=True
            )
            
            if admin_role:
                # Add admin permissions
                self.add_permission_to_role(admin_role.id, "users", "manage")
                self.add_permission_to_role(admin_role.id, "roles", "manage")
                self.add_permission_to_role(admin_role.id, "security_policies", "manage")
                self.add_permission_to_role(admin_role.id, "all", "read", {"user_tenant_match": True})
                self.add_permission_to_role(admin_role.id, "all", "write", {"user_tenant_match": True})
            
            # Clinician role
            clinician_role = self.create_role(
                tenant_id=tenant_id,
                name="clinician",
                description="Medical professional with clinical data access",
                is_system_role=True
            )
            
            if clinician_role:
                # Add clinician permissions
                self.add_permission_to_role(clinician_role.id, "clinical_data", "read")
                self.add_permission_to_role(clinician_role.id, "patient_notes", "write")
                self.add_permission_to_role(clinician_role.id, "medical_records", "read")
            
            return True
            
        except Exception as e:
            logger.error(f"Error creating default roles: {e}")
            return False
