from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.feature import Feature, RoleFeature, UserFeatureOverride
from app.models.user import User
from app.models.tenant import Tenant, TenantUser
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../../shared'))
from shared.repositories.repository_factory import RepositoryFactory

class FeatureService:
    """Service for managing user features based on roles and overrides"""
    
    def __init__(self, repository_factory: RepositoryFactory):
        self.db = repository_factory._session  # Direct access for complex queries
    
    def get_user_features(self, user_id: str, tenant_id: str) -> List[Dict[str, Any]]:
        """Get all features available to a user in a specific tenant"""
        
        # Get user's role in the tenant
        tenant_user = self.db.query(TenantUser).filter(
            TenantUser.user_id == user_id,
            TenantUser.tenant_id == tenant_id,
            TenantUser.is_active == True
        ).first()
        
        if not tenant_user:
            return []
        
        # Get tenant info for type-based features
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            return []
        
        # Get role-based features
        role_features = self._get_role_features(tenant_user.role, tenant.type)
        
        # Get user-specific overrides
        overrides = self._get_user_feature_overrides(user_id, tenant_id)
        
        # Combine and resolve features
        final_features = self._resolve_features(role_features, overrides)
        
        return final_features
    
    def _get_role_features(self, role: str, tenant_type: str) -> List[Feature]:
        """Get features available to a role for a tenant type"""
        query = self.db.query(Feature).join(RoleFeature).filter(
            RoleFeature.role == role,
            Feature.is_active == True
        )
        
        # Filter by tenant type if specified
        query = query.filter(
            (RoleFeature.tenant_type == tenant_type) | 
            (RoleFeature.tenant_type.is_(None))
        )
        
        return query.all()
    
    def _get_user_feature_overrides(self, user_id: str, tenant_id: str) -> List[UserFeatureOverride]:
        """Get user-specific feature overrides for a tenant"""
        from datetime import datetime
        
        return self.db.query(UserFeatureOverride).filter(
            UserFeatureOverride.user_id == user_id,
            UserFeatureOverride.tenant_id == tenant_id,
            (UserFeatureOverride.expires_at.is_(None)) |
            (UserFeatureOverride.expires_at > datetime.utcnow())
        ).all()
    
    def _resolve_features(self, role_features: List[Feature], overrides: List[UserFeatureOverride]) -> List[Dict[str, Any]]:
        """Resolve final feature list by applying overrides to role features"""
        
        # Start with role-based features
        feature_map = {f.id: f for f in role_features}
        
        # Apply overrides
        for override in overrides:
            if override.is_granted:
                # Grant feature (add if not present)
                if override.feature_id not in feature_map:
                    feature = self.db.query(Feature).filter(Feature.id == override.feature_id).first()
                    if feature and feature.is_active:
                        feature_map[override.feature_id] = feature
            else:
                # Revoke feature (remove if present)
                feature_map.pop(override.feature_id, None)
        
        # Convert to response format
        return [
            {
                "id": feature.id,
                "name": feature.name,
                "display_name": feature.display_name,
                "description": feature.description,
                "category": feature.category,
                "metadata": feature.metadata
            }
            for feature in feature_map.values()
        ]
    
    def has_feature(self, user_id: str, tenant_id: str, feature_name: str) -> bool:
        """Check if user has a specific feature in a tenant"""
        features = self.get_user_features(user_id, tenant_id)
        return any(f["name"] == feature_name for f in features)
    
    def grant_user_feature(self, user_id: str, tenant_id: str, feature_name: str, 
                          granted_by: str, reason: str = None, expires_at=None) -> bool:
        """Grant a specific feature to a user"""
        
        feature = self.db.query(Feature).filter(Feature.name == feature_name).first()
        if not feature:
            raise ValueError(f"Feature '{feature_name}' not found")
        
        # Remove existing override for this feature
        self.db.query(UserFeatureOverride).filter(
            UserFeatureOverride.user_id == user_id,
            UserFeatureOverride.tenant_id == tenant_id,
            UserFeatureOverride.feature_id == feature.id
        ).delete()
        
        # Add new grant override
        override = UserFeatureOverride(
            user_id=user_id,
            tenant_id=tenant_id,
            feature_id=feature.id,
            is_granted=True,
            granted_by=granted_by,
            reason=reason,
            expires_at=expires_at
        )
        
        self.db.add(override)
        self.db.commit()
        return True
    
    def revoke_user_feature(self, user_id: str, tenant_id: str, feature_name: str,
                           granted_by: str, reason: str = None) -> bool:
        """Revoke a specific feature from a user"""
        
        feature = self.db.query(Feature).filter(Feature.name == feature_name).first()
        if not feature:
            raise ValueError(f"Feature '{feature_name}' not found")
        
        # Remove existing override for this feature
        self.db.query(UserFeatureOverride).filter(
            UserFeatureOverride.user_id == user_id,
            UserFeatureOverride.tenant_id == tenant_id,
            UserFeatureOverride.feature_id == feature.id
        ).delete()
        
        # Add new revoke override
        override = UserFeatureOverride(
            user_id=user_id,
            tenant_id=tenant_id,
            feature_id=feature.id,
            is_granted=False,
            granted_by=granted_by,
            reason=reason
        )
        
        self.db.add(override)
        self.db.commit()
        return True
