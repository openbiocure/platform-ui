"""
Tenant management CLI commands using existing services
"""
import click
import sys
import os
from typing import Optional

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))

from app.services.tenant_service import TenantService
from app.core.database import get_db
from app.models.tenant import Tenant
from shared.repositories.repository_factory import RepositoryFactory

@click.group()
def tenants_group():
    """Tenant management commands"""
    pass

@tenants_group.command()
@click.option('--name', required=True, help='Tenant name')
@click.option('--slug', required=True, help='Tenant slug (unique identifier)')
@click.option('--type', default='organization', type=click.Choice(['organization', 'individual', 'research_institution']), help='Tenant type')
@click.option('--description', help='Tenant description')

@click.option('--active', is_flag=True, default=True, help='Set tenant as active')
@click.option('--verbose', '-v', is_flag=True, help='Enable verbose output')
def create(name: str, slug: str, type: str, description: Optional[str], active: bool, verbose: bool):
    """Create a new tenant"""
    try:
        # Get database session and repository factory
        db = next(get_db())
        repo_factory = RepositoryFactory(db)
        tenant_service = TenantService(repo_factory)
        
        # Check if tenant already exists
        existing_tenant = db.query(Tenant).filter(
            (Tenant.slug == slug) | (Tenant.name == name)
        ).first()
        
        if existing_tenant:
            click.echo(f"❌ Tenant with slug '{slug}' or name '{name}' already exists")
            sys.exit(1)
        

        
        # Create tenant using repository
        tenant_data = {
            "name": name,
            "slug": slug,
            "type": type,
            "description": description,

            "is_active": active
        }
        
        tenant = tenant_service.tenant_repo.create(tenant_data)
        
        if verbose:
            click.echo(f"✅ Tenant created successfully:")
            click.echo(f"  ID: {tenant.id}")
            click.echo(f"  Name: {tenant.name}")
            click.echo(f"  Slug: {tenant.slug}")
            click.echo(f"  Type: {tenant.type}")
            click.echo(f"  Description: {tenant.description or 'None'}")

            click.echo(f"  Active: {tenant.is_active}")
        else:
            click.echo(f"✅ Tenant '{name}' ({slug}) created successfully")
            
    except Exception as e:
        click.echo(f"❌ Failed to create tenant: {e}")
        sys.exit(1)

@tenants_group.command()
@click.option('--type', help='Filter by tenant type')
@click.option('--active', is_flag=True, help='Show only active tenants')
@click.option('--verbose', '-v', is_flag=True, help='Enable verbose output')
def list(type: Optional[str], active: bool, verbose: bool):
    """List all tenants"""
    try:
        db = next(get_db())
        repo_factory = RepositoryFactory(db)
        tenant_service = TenantService(repo_factory)
        
        # Build query using repository
        query = db.query(Tenant)
        
        if type:
            query = query.filter(Tenant.type == type)
        
        if active:
            query = query.filter(Tenant.is_active == True)
        
        tenants = query.all()
        
        if not tenants:
            click.echo("📭 No tenants found")
            return
        
        click.echo(f"🏢 Found {len(tenants)} tenants:")
        
        for tenant in tenants:
            if verbose:
                click.echo(f"  🏢 {tenant.name}")
                click.echo(f"     Slug: {tenant.slug}")
                click.echo(f"     Type: {tenant.type}")
                click.echo(f"     Description: {tenant.description or 'None'}")
                click.echo(f"     Active: {tenant.is_active}")

                click.echo("     ---")
            else:
                status = "✅" if tenant.is_active else "❌"
                click.echo(f"  {status} {tenant.name} ({tenant.slug}) - {tenant.type}")
                
    except Exception as e:
        click.echo(f"❌ Failed to list tenants: {e}")
        sys.exit(1)

@tenants_group.command()
@click.option('--slug', required=True, help='Tenant slug to deactivate')
@click.option('--force', is_flag=True, help='Force deactivation without confirmation')
def deactivate(slug: str, force: bool):
    """Deactivate a tenant"""
    try:
        db = next(get_db())
        repo_factory = RepositoryFactory(db)
        tenant_service = TenantService(repo_factory)
        
        tenant = db.query(Tenant).filter(Tenant.slug == slug).first()
        if not tenant:
            click.echo(f"❌ Tenant with slug '{slug}' not found")
            sys.exit(1)
        
        if not force:
            if not click.confirm(f"Are you sure you want to deactivate tenant '{tenant.name}' ({slug})?"):
                click.echo("❌ Deactivation cancelled")
                return
        
        # Use service method for deactivation
        if tenant_service.tenant_repo.update(tenant.id, {"is_active": False}):
            click.echo(f"✅ Tenant '{tenant.name}' ({slug}) deactivated successfully")
        else:
            click.echo(f"❌ Failed to deactivate tenant '{slug}'")
            sys.exit(1)
        
    except Exception as e:
        click.echo(f"❌ Failed to deactivate tenant: {e}")
        sys.exit(1)

@tenants_group.command()
@click.option('--slug', required=True, help='Tenant slug to activate')
def activate(slug: str):
    """Activate a tenant"""
    try:
        db = next(get_db())
        repo_factory = RepositoryFactory(db)
        tenant_service = TenantService(repo_factory)
        
        tenant = db.query(Tenant).filter(Tenant.slug == slug).first()
        if not tenant:
            click.echo(f"❌ Tenant with slug '{slug}' not found")
            sys.exit(1)
        
        # Use service method for activation
        if tenant_service.tenant_repo.update(tenant.id, {"is_active": True}):
            click.echo(f"✅ Tenant '{tenant.name}' ({slug}) activated successfully")
        else:
            click.echo(f"❌ Failed to activate tenant '{slug}'")
            sys.exit(1)
        
    except Exception as e:
        click.echo(f"❌ Failed to activate tenant: {e}")
        sys.exit(1)
