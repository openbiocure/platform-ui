from sqlalchemy import Column, String, DateTime, UUID, ForeignKey, Boolean, JSON
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID as pg_UUID
from ..core.database import Base
import uuid

class IdentityProvider(Base):
    """
    Identity Provider configuration for OAuth/SAML/OIDC
    Supports multiple identity providers per tenant
    """
    __tablename__ = "identity_providers"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kind = Column(String, nullable=False)  # oauth2, saml, oidc
    name = Column(String, nullable=False)
    issuer = Column(String, nullable=False)
    auth_url = Column(String, nullable=False)
    token_url = Column(String, nullable=False)
    jwks_url = Column(String, nullable=True)
    sso_url = Column(String, nullable=True)
    slo_url = Column(String, nullable=True)
    cert_pem = Column(String, nullable=True)
    client_id = Column(String, nullable=False)
    client_secret = Column(String, nullable=False)
    metadata_xml = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<IdentityProvider(id={self.id}, name={self.name}, kind={self.kind})>"

class TenantIdentityProvider(Base):
    """
    Links tenants to their configured identity providers
    Enables tenant-specific SSO configuration
    """
    __tablename__ = "tenant_identity_providers"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(pg_UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    idp_id = Column(pg_UUID(as_uuid=True), ForeignKey("identity_providers.id"), nullable=False)
    login_policy = Column(String, nullable=False, default="optional")  # required, optional, disabled
    jit_provisioning = Column(Boolean, default=False)  # Just-in-time user creation
    scim_enabled = Column(Boolean, default=False)  # SCIM user provisioning
    attribute_mapping = Column(JSON, default=dict)  # Map IdP attributes to user fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<TenantIdentityProvider(tenant_id={self.tenant_id}, idp_id={self.idp_id})>"

class TenantLoginDomain(Base):
    """
    Domain-based tenant routing for secure login
    Maps email domains to tenants and identity providers
    """
    __tablename__ = "tenant_login_domains"
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(pg_UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    domain = Column(String, nullable=False, index=True)  # e.g., "university.edu"
    idp_id = Column(pg_UUID(as_uuid=True), ForeignKey("identity_providers.id"), nullable=False)
    
    def __repr__(self):
        return f"<TenantLoginDomain(domain={self.domain}, tenant_id={self.tenant_id})>"
