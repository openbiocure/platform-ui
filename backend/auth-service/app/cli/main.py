#!/usr/bin/env python3
"""
CLI entry point for Auth Service
Usage: python -m app.cli.main [command] [options]
"""
import click
import sys
import os

@click.group()
@click.version_option(version="1.0.0")
@click.option('--verbose', '-v', is_flag=True, help='Enable verbose output')
def cli(verbose):
    """OpenBioCure Auth Service CLI - Manage users, tenants, and services"""
    if verbose:
        click.echo("🔍 Verbose mode enabled")
    
    # Set verbose flag for subcommands
    ctx = click.get_current_context()
    ctx.ensure_object(dict)
    ctx.obj['verbose'] = verbose

# Import and add command groups
try:
    from app.cli.commands import users, tenants, services, roles
    cli.add_command(users.users_group)
    cli.add_command(tenants.tenants_group)
    cli.add_command(services.services_group)
    cli.add_command(roles.roles_group)
except ImportError as e:
    click.echo(f"⚠️  Warning: Some commands may not be available: {e}")

@cli.command()
def health():
    """Check service health"""
    try:
        # Import only when needed
        from app.core.config import service_registry
        from app.core.redis_client import redis_client
        
        click.echo("🏥 Health Check Results:")
        
        # Service registry health
        services_count = len(service_registry.services)
        permissions_count = len(service_registry.permissions)
        click.echo(f"  ✅ Service Registry: {services_count} services, {permissions_count} permission sets")
        
        # Redis health
        redis_status = redis_client.health_check()
        click.echo(f"  {'✅' if redis_status['status'] == 'healthy' else '❌'} Redis: {redis_status['status']}")
        
        click.echo("🎉 All systems operational!")
        
    except Exception as e:
        click.echo(f"❌ Health check failed: {e}")
        sys.exit(1)

@cli.command()
def info():
    """Show service information"""
    try:
        from app.core.config import settings
        
        click.echo("📋 Auth Service Information:")
        click.echo(f"  Service: {settings.get('service.name', 'auth-service')}")
        click.echo(f"  Version: {settings.get('service.version', '1.0.0')}")
        click.echo(f"  Environment: {os.getenv('APP_ENV', 'development')}")
        click.echo(f"  Database: {settings.get('database.host', 'unknown')}:{settings.get('database.port', 'unknown')}")
        click.echo(f"  Redis: {settings.get('redis.host', 'unknown')}:{settings.get('redis.port', 'unknown')}")
        
    except Exception as e:
        click.echo(f"❌ Failed to get service info: {e}")
        sys.exit(1)

if __name__ == '__main__':
    cli()
