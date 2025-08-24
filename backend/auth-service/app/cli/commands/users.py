"""
User management CLI commands using existing UserService
"""
import click
import sys
import os
from typing import Optional

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))

from app.services.user_service import UserService
from app.core.database import get_db
from app.models.user import User
from app.models.tenant import Tenant
from app.core.security import get_password_hash
from shared.repositories.repository_factory import RepositoryFactory

@click.group()
def users_group():
    """User management commands"""
    pass

@users_group.command()
@click.option('--email', required=True, help='User email address')
@click.option('--password', required=True, help='User password')
@click.option('--name', required=True, help='User full name')
@click.option('--type', default='individual', type=click.Choice(['individual', 'organization_member', 'organization_admin']), help='User type')
@click.option('--tenant', required=True, help='Tenant slug or ID')

@click.option('--active', is_flag=True, default=True, help='Set user as active')
@click.option('--email-verified', is_flag=True, default=False, help='Mark email as verified')
@click.option('--verbose', '-v', is_flag=True, help='Enable verbose output')
def create(email: str, password: str, name: str, type: str, tenant: str, active: bool, email_verified: bool, verbose: bool):
    """Create a new user"""
    try:
        # Get database session and repository factory
        db = next(get_db())
        repo_factory = RepositoryFactory(db)
        user_service = UserService(repo_factory)
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            click.echo(f"❌ User with email {email} already exists")
            sys.exit(1)
        
        # Find tenant
        tenant_obj = db.query(Tenant).filter(
            (Tenant.slug == tenant) | (Tenant.id == tenant)
        ).first()
        
        if not tenant_obj:
            click.echo(f"❌ Tenant '{tenant}' not found")
            sys.exit(1)
        
        # Find or create default role for user type
        if type == "organization_admin":
            role_name = "tenant_admin"
        elif type == "organization_member":
            role_name = "scholar"
        else:
            role_name = "scholar"
        
        role = db.query(Role).filter(
            Role.name == role_name,
            Role.tenant_id == tenant_obj.id
        ).first()
        
        if not role:
            click.echo(f"❌ Default role '{role_name}' not found for tenant. Creating default roles...")
            from app.services.permission_service import PermissionService
            permission_service = PermissionService(db)
            if not permission_service.create_default_roles(str(tenant_obj.id)):
                click.echo("❌ Failed to create default roles")
                sys.exit(1)
            role = db.query(Role).filter(
                Role.name == role_name,
                Role.tenant_id == tenant_obj.id
            ).first()
        
        # Create user using repository
        user_data = {
            "email": email,
            "hashed_password": get_password_hash(password),
            "name": name,
            "role_id": role.id,
            "tenant_id": tenant_obj.id,
            "is_active": active,
            "email_verified": email_verified
        }
        
        user = user_service.user_repo.create(user_data)
        
        if verbose:
            click.echo(f"✅ User created successfully:")
            click.echo(f"  ID: {user.id}")
            click.echo(f"  Email: {user.email}")
            click.echo(f"  Name: {user.name}")
            click.echo(f"  Role: {role.name}")
            click.echo(f"  Tenant: {tenant_obj.name}")
            click.echo(f"  Active: {user.is_active}")
            click.echo(f"  Email Verified: {user.email_verified}")
        else:
            click.echo(f"✅ User {email} created successfully with role '{role.name}'")
            
    except Exception as e:
        click.echo(f"❌ Failed to create user: {e}")
        sys.exit(1)

@users_group.command()
@click.option('--tenant', help='Filter by tenant slug or ID')
@click.option('--type', help='Filter by user type')
@click.option('--active', is_flag=True, help='Show only active users')
@click.option('--verbose', '-v', is_flag=True, help='Enable verbose output')
def list(tenant: Optional[str], type: Optional[str], active: bool, verbose: bool):
    """List all users"""
    try:
        db = next(get_db())
        repo_factory = RepositoryFactory(db)
        user_service = UserService(repo_factory)
        
        # Build query using repository
        query = db.query(User)
        
        if tenant:
            tenant_obj = db.query(Tenant).filter(
                (Tenant.slug == tenant) | (Tenant.id == tenant)
            ).first()
            if tenant_obj:
                query = query.filter(User.tenant_id == tenant_obj.id)
            else:
                click.echo(f"❌ Tenant '{tenant}' not found")
                sys.exit(1)
        
        if type:
            query = query.filter(User.type == type)
        
        if active:
            query = query.filter(User.is_active == True)
        
        users = query.all()
        
        if not users:
            click.echo("📭 No users found")
            return
        
        click.echo(f"👥 Found {len(users)} users:")
        
        for user in users:
            if verbose:
                tenant_obj = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
                role_obj = db.query(Role).filter(Role.id == user.role_id).first()
                click.echo(f"  📧 {user.email}")
                click.echo(f"     Name: {user.name}")
                click.echo(f"     Role: {role_obj.name if role_obj else 'Unknown'}")
                click.echo(f"     Tenant: {tenant_obj.name if tenant_obj else 'Unknown'}")
                click.echo(f"     Active: {user.is_active}")
                click.echo(f"     Email Verified: {user.email_verified}")
                click.echo("     ---")
            else:
                tenant_obj = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
                role_obj = db.query(Role).filter(Role.id == user.role_id).first()
                tenant_name = tenant_obj.name if tenant_obj else 'Unknown'
                role_name = role_obj.name if role_obj else 'Unknown'
                status = "✅" if user.is_active else "❌"
                click.echo(f"  {status} {user.email} ({user.name}) - {role_name} @ {tenant_name}")
                
    except Exception as e:
        click.echo(f"❌ Failed to list users: {e}")
        sys.exit(1)

@users_group.command()
@click.option('--email', required=True, help='User email to delete')
@click.option('--force', is_flag=True, help='Force deletion without confirmation')
def delete(email: str, force: bool):
    """Delete a user"""
    try:
        db = next(get_db())
        repo_factory = RepositoryFactory(db)
        user_service = UserService(repo_factory)
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            click.echo(f"❌ User with email {email} not found")
            sys.exit(1)
        
        if not force:
            if not click.confirm(f"Are you sure you want to delete user {email}?"):
                click.echo("❌ Deletion cancelled")
                return
        
        # Use service method for deactivation instead of deletion
        if user_service.deactivate_user(str(user.id)):
            click.echo(f"✅ User {email} deactivated successfully")
        else:
            click.echo(f"❌ Failed to deactivate user {email}")
            sys.exit(1)
        
    except Exception as e:
        click.echo(f"❌ Failed to delete user: {e}")
        sys.exit(1)
