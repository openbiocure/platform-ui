"""
Role and Permission management CLI commands
"""
import click
import sys
import os
from typing import Optional

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..'))

from app.models.permissions import Role, Permission
from app.models.tenant import Tenant
from app.core.database import get_db
from app.services.permission_service import PermissionService

@click.group()
def roles_group():
    """Role management commands"""
    pass

@roles_group.command()
@click.option('--tenant', required=True, help='Tenant slug or ID')
@click.option('--name', required=True, help='Role name')
@click.option('--description', help='Role description')
@click.option('--system-role', is_flag=True, help='Mark as system role')
@click.option('--verbose', '-v', is_flag=True, help='Enable verbose output')
def create(tenant: str, name: str, description: Optional[str], system_role: bool, verbose: bool):
    """Create a new role"""
    try:
        db = next(get_db())
        
        # Find tenant
        tenant_obj = db.query(Tenant).filter(
            (Tenant.slug == tenant) | (Tenant.id == tenant)
        ).first()
        
        if not tenant_obj:
            click.echo(f"❌ Tenant '{tenant}' not found")
            sys.exit(1)
        
        # Check if role already exists
        existing_role = db.query(Role).filter(
            Role.name == name,
            Role.tenant_id == tenant_obj.id
        ).first()
        
        if existing_role:
            click.echo(f"❌ Role '{name}' already exists in tenant '{tenant_obj.name}'")
            sys.exit(1)
        
        # Create role
        permission_service = PermissionService(db)
        role = permission_service.create_role(
            tenant_id=str(tenant_obj.id),
            name=name,
            description=description,
            is_system_role=system_role
        )
        
        if not role:
            click.echo("❌ Failed to create role")
            sys.exit(1)
        
        if verbose:
            click.echo(f"✅ Role created successfully:")
            click.echo(f"  ID: {role.id}")
            click.echo(f"  Name: {role.name}")
            click.echo(f"  Description: {role.description or 'None'}")
            click.echo(f"  Tenant: {tenant_obj.name}")
            click.echo(f"  System Role: {role.is_system_role}")
        else:
            click.echo(f"✅ Role '{name}' created successfully in tenant '{tenant_obj.name}'")
            
    except Exception as e:
        click.echo(f"❌ Failed to create role: {e}")
        sys.exit(1)

@roles_group.command()
@click.option('--tenant', help='Filter by tenant slug or ID')
@click.option('--system-role', is_flag=True, help='Show only system roles')
@click.option('--active', is_flag=True, help='Show only active roles')
@click.option('--verbose', '-v', is_flag=True, help='Enable verbose output')
def list(tenant: Optional[str], system_role: bool, active: bool, verbose: bool):
    """List all roles"""
    try:
        db = next(get_db())
        
        # Build query
        query = db.query(Role)
        
        if tenant:
            tenant_obj = db.query(Tenant).filter(
                (Tenant.slug == tenant) | (Tenant.id == tenant)
            ).first()
            if tenant_obj:
                query = query.filter(Role.tenant_id == tenant_obj.id)
            else:
                click.echo(f"❌ Tenant '{tenant}' not found")
                sys.exit(1)
        
        if system_role:
            query = query.filter(Role.is_system_role == True)
        
        if active:
            query = query.filter(Role.is_active == True)
        
        roles = query.all()
        
        if not roles:
            click.echo("📭 No roles found")
            return
        
        click.echo(f"👑 Found {len(roles)} roles:")
        
        for role in roles:
            tenant_obj = db.query(Tenant).filter(Tenant.id == role.tenant_id).first()
            
            if verbose:
                click.echo(f"  👑 {role.name}")
                click.echo(f"     Description: {role.description or 'None'}")
                click.echo(f"     Tenant: {tenant_obj.name if tenant_obj else 'Unknown'}")
                click.echo(f"     System Role: {role.is_system_role}")
                click.echo(f"     Active: {role.is_active}")
                click.echo(f"     Users: {len(role.users)}")
                click.echo(f"     Permissions: {len(role.permissions)}")
                click.echo("     ---")
            else:
                tenant_name = tenant_obj.name if tenant_obj else 'Unknown'
                system_icon = "🔧" if role.is_system_role else "👤"
                status = "✅" if role.is_active else "❌"
                click.echo(f"  {status} {system_icon} {role.name} @ {tenant_name} ({len(role.permissions)} permissions)")
                
    except Exception as e:
        click.echo(f"❌ Failed to list roles: {e}")
        sys.exit(1)

@roles_group.command()
@click.option('--role-id', required=True, help='Role ID to add permission to')
@click.option('--resource', required=True, help='Resource type (e.g., publications, workspace)')
@click.option('--action', required=True, help='Action (e.g., read, write, delete)')
@click.option('--conditions', help='ABAC conditions as JSON string')
@click.option('--verbose', '-v', is_flag=True, help='Enable verbose output')
def add_permission(role_id: str, resource: str, action: str, conditions: Optional[str], verbose: bool):
    """Add a permission to a role"""
    try:
        db = next(get_db())
        
        # Find role
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role:
            click.echo(f"❌ Role with ID '{role_id}' not found")
            sys.exit(1)
        
        # Parse conditions if provided
        conditions_dict = None
        if conditions:
            try:
                import json
                conditions_dict = json.loads(conditions)
            except json.JSONDecodeError:
                click.echo("❌ Invalid JSON format for conditions")
                sys.exit(1)
        
        # Add permission
        permission_service = PermissionService(db)
        permission = permission_service.add_permission_to_role(
            role_id=role_id,
            resource=resource,
            action=action,
            conditions=conditions_dict
        )
        
        if not permission:
            click.echo("❌ Failed to add permission")
            sys.exit(1)
        
        if verbose:
            click.echo(f"✅ Permission added successfully:")
            click.echo(f"  ID: {permission.id}")
            click.echo(f"  Resource: {permission.resource}")
            click.echo(f"  Action: {permission.action}")
            click.echo(f"  Role: {role.name}")
            click.echo(f"  Conditions: {permission.conditions or 'None'}")
        else:
            click.echo(f"✅ Permission '{action} {resource}' added to role '{role.name}'")
            
    except Exception as e:
        click.echo(f"❌ Failed to add permission: {e}")
        sys.exit(1)

@roles_group.command()
@click.option('--role-id', required=True, help='Role ID to show permissions for')
@click.option('--verbose', '-v', is_flag=True, help='Enable verbose output')
def permissions(role_id: str, verbose: bool):
    """Show permissions for a specific role"""
    try:
        db = next(get_db())
        
        # Find role
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role:
            click.echo(f"❌ Role with ID '{role_id}' not found")
            sys.exit(1)
        
        permissions = db.query(Permission).filter(
            Permission.role_id == role_id,
            Permission.is_active == True
        ).all()
        
        if not permissions:
            click.echo(f"📭 No permissions found for role '{role.name}'")
            return
        
        click.echo(f"🔐 Permissions for role '{role.name}':")
        
        for permission in permissions:
            if verbose:
                click.echo(f"  🔐 {permission.resource}.{permission.action}")
                click.echo(f"     Conditions: {permission.conditions or 'None'}")
                click.echo(f"     Active: {permission.is_active}")
                click.echo("     ---")
            else:
                conditions_str = f" [{permission.conditions}]" if permission.conditions else ""
                click.echo(f"  🔐 {permission.resource}.{permission.action}{conditions_str}")
                
    except Exception as e:
        click.echo(f"❌ Failed to show permissions: {e}")
        sys.exit(1)

@roles_group.command()
@click.option('--tenant', required=True, help='Tenant slug or ID')
def create_defaults(tenant: str):
    """Create default roles for a tenant"""
    try:
        db = next(get_db())
        
        # Find tenant
        tenant_obj = db.query(Tenant).filter(
            (Tenant.slug == tenant) | (Tenant.id == tenant)
        ).first()
        
        if not tenant_obj:
            click.echo(f"❌ Tenant '{tenant}' not found")
            sys.exit(1)
        
        # Create default roles
        permission_service = PermissionService(db)
        if permission_service.create_default_roles(str(tenant_obj.id)):
            click.echo(f"✅ Default roles created successfully for tenant '{tenant_obj.name}'")
            click.echo("  Created roles:")
            click.echo("    - scholar: Research scientist with publications and workspace access")
            click.echo("    - tenant_admin: Tenant administrator with full access")
            click.echo("    - clinician: Medical professional with clinical data access")
        else:
            click.echo("❌ Failed to create default roles")
            sys.exit(1)
            
    except Exception as e:
        click.echo(f"❌ Failed to create default roles: {e}")
        sys.exit(1)
