from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.services.tenant_service import TenantService
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../shared'))
from shared.repositories.repository_factory import RepositoryFactory
from shared.repositories.unit_of_work import SqlAlchemyUnitOfWork
from shared.events.config import get_event_producer
from shared.events.producer import EventProducer

def get_repository_factory(db: Session = Depends(get_db)) -> RepositoryFactory:
    """Internal dependency - not exposed to API"""
    return RepositoryFactory(db)

def get_unit_of_work(db: Session = Depends(get_db)) -> SqlAlchemyUnitOfWork:
    """Internal dependency for transaction management"""
    return SqlAlchemyUnitOfWork(db)

async def get_event_producer_dep() -> EventProducer:
    """Get event producer for auditing and logging"""
    return await get_event_producer()

# Service dependencies - these are what the API layer should use
async def get_auth_service(
    repo_factory: RepositoryFactory = Depends(get_repository_factory),
    event_producer: EventProducer = Depends(get_event_producer_dep)
) -> AuthService:
    """Get configured auth service"""
    return AuthService(repo_factory, event_producer)

async def get_user_service(
    repo_factory: RepositoryFactory = Depends(get_repository_factory),
    event_producer: EventProducer = Depends(get_event_producer_dep)
) -> UserService:
    """Get configured user service"""
    return UserService(repo_factory, event_producer)

async def get_tenant_service(
    repo_factory: RepositoryFactory = Depends(get_repository_factory),
    event_producer: EventProducer = Depends(get_event_producer_dep)
) -> TenantService:
    """Get configured tenant service"""
    return TenantService(repo_factory, event_producer)