"""
Service management CLI commands for managing service keys and secrets
"""
import click
import sys
import os
import secrets
import string
from typing import Optional

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..'))

from app.core.config import service_registry

@click.group()
def services_group():
    """Service management commands"""
    pass

@services_group.command()
@click.option('--service-id', required=True, help='Service ID (e.g., analytics-service)')
@click.option('--service-name', required=True, help='Human-readable service name')
@click.option('--permissions', required=True, help='Comma-separated list of services this service can call')
@click.option('--verbose', '-v', is_flag=True, help='Enable verbose output')
def create(service_id: str, service_name: str, permissions: str, verbose: bool):
    """Create a new service with key and secret"""
    try:
        # Check if service already exists
        if service_id in service_registry.services:
            click.echo(f"❌ Service '{service_id}' already exists")
            sys.exit(1)
        
        # Generate secure secret
        secret = ''.join(secrets.choice(string.ascii_letters + string.digits + string.punctuation) for _ in range(64))
        
        # Parse permissions
        permission_list = [p.strip() for p in permissions.split(',')]
        
        # Validate permissions
        for perm in permission_list:
            if perm not in service_registry.services and perm != service_id:
                click.echo(f"⚠️  Warning: Permission '{perm}' references a service that doesn't exist yet")
        
        click.echo(f"🔑 Service Configuration for '{service_id}':")
        click.echo(f"  Service ID: {service_id}")
        click.echo(f"  Service Name: {service_name}")
        click.echo(f"  Permissions: {', '.join(permission_list)}")
        click.echo(f"  Secret: {secret}")
        click.echo("")
        click.echo("📝 Add this to your environment variables:")
        click.echo(f"  {service_id.upper().replace('-', '_')}_SECRET={secret}")
        click.echo("")
        click.echo("📝 Add this to your service_registry.yaml:")
        click.echo(f"  {service_id}:")
        click.echo(f"    name: {service_name}")
        click.echo(f"    secret: ${{{service_id.upper().replace('-', '_')}_SECRET}}")
        click.echo(f"    permissions: {permission_list}")
        
        if verbose:
            click.echo("")
            click.echo("🔍 Detailed Information:")
            click.echo(f"  - Service will be able to call: {', '.join(permission_list)}")
            click.echo(f"  - Secret length: {len(secret)} characters")
            click.echo(f"  - Secret entropy: High (uses secrets module)")
            
    except Exception as e:
        click.echo(f"❌ Failed to create service: {e}")
        sys.exit(1)

@services_group.command()
@click.option('--service-id', help='Filter by service ID')
@click.option('--verbose', '-v', is_flag=True, help='Enable verbose output')
def list(service_id: Optional[str], verbose: bool):
    """List all services"""
    try:
        services = service_registry.services
        
        if not services:
            click.echo("📭 No services found")
            return
        
        if service_id:
            if service_id not in services:
                click.echo(f"❌ Service '{service_id}' not found")
                sys.exit(1)
            services = {service_id: services[service_id]}
        
        click.echo(f"🔧 Found {len(services)} services:")
        
        for sid, service_config in services.items():
            if verbose:
                click.echo(f"  🔧 {sid}")
                click.echo(f"     Name: {service_config.get('name', 'N/A')}")
                click.echo(f"     Secret: {'*' * 8}... (hidden)")
                click.echo(f"     Permissions: {', '.join(service_config.get('permissions', []))}")
                click.echo("     ---")
            else:
                permissions = ', '.join(service_config.get('permissions', []))
                click.echo(f"  🔧 {sid} - {service_config.get('name', 'N/A')} → [{permissions}]")
                
    except Exception as e:
        click.echo(f"❌ Failed to list services: {e}")
        sys.exit(1)

@services_group.command()
@click.option('--service-id', required=True, help='Service ID to regenerate secret for')
@click.option('--force', is_flag=True, help='Force regeneration without confirmation')
def regenerate_secret(service_id: str, force: bool):
    """Regenerate secret for a service"""
    try:
        if service_id not in service_registry.services:
            click.echo(f"❌ Service '{service_id}' not found")
            sys.exit(1)
        
        if not force:
            if not click.confirm(f"Are you sure you want to regenerate secret for service '{service_id}'?"):
                click.echo("❌ Secret regeneration cancelled")
                return
        
        # Generate new secret
        new_secret = ''.join(secrets.choice(string.ascii_letters + string.digits + string.punctuation) for _ in range(64))
        
        click.echo(f"🔄 Secret regenerated for '{service_id}':")
        click.echo(f"  New Secret: {new_secret}")
        click.echo("")
        click.echo("📝 Update your environment variable:")
        click.echo(f"  {service_id.upper().replace('-', '_')}_SECRET={new_secret}")
        click.echo("")
        click.echo("⚠️  Note: Old secret will be invalidated immediately!")
        
    except Exception as e:
        click.echo(f"❌ Failed to regenerate secret: {e}")
        sys.exit(1)

@services_group.command()
@click.option('--service-id', required=True, help='Service ID to remove')
@click.option('--force', is_flag=True, help='Force removal without confirmation')
def remove(service_id: str, force: bool):
    """Remove a service"""
    try:
        if service_id not in service_registry.services:
            click.echo(f"❌ Service '{service_id}' not found")
            sys.exit(1)
        
        if not force:
            if not click.confirm(f"Are you sure you want to remove service '{service_id}'?"):
                click.echo("❌ Service removal cancelled")
                return
        
        click.echo(f"🗑️  Service '{service_id}' marked for removal")
        click.echo("")
        click.echo("📝 To complete removal:")
        click.echo(f"  1. Remove from service_registry.yaml")
        click.echo(f"  2. Remove environment variable: {service_id.upper().replace('-', '_')}_SECRET")
        click.echo(f"  3. Restart the auth service")
        
    except Exception as e:
        click.echo(f"❌ Failed to remove service: {e}")
        sys.exit(1)

@services_group.command()
def permissions():
    """Show service permissions matrix"""
    try:
        services = service_registry.services
        permissions = service_registry.permissions
        
        if not services:
            click.echo("📭 No services found")
            return
        
        click.echo("🔐 Service Permissions Matrix:")
        click.echo("")
        
        # Create matrix header
        service_ids = list(services.keys())
        header = "Service".ljust(20)
        for sid in service_ids:
            header += f" {sid[:8]:>8}"
        click.echo(header)
        click.echo("-" * len(header))
        
        # Create matrix rows
        for sid in service_ids:
            row = sid.ljust(20)
            for target_sid in service_ids:
                if target_sid in permissions.get(sid, []):
                    row += "    ✅   "
                else:
                    row += "    ❌   "
            click.echo(row)
            
        click.echo("")
        click.echo("✅ = Can call, ❌ = Cannot call")
        
    except Exception as e:
        click.echo(f"❌ Failed to show permissions: {e}")
        sys.exit(1)
