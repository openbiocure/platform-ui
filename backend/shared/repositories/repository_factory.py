from typing import TypeVar, Type
from sqlalchemy.orm import Session
from .base_repository import BaseRepository

T = TypeVar('T')

class RepositoryFactory:
    """Factory to create repositories with injected dependencies"""
    
    def __init__(self, session: Session):
        self._session = session
    
    def create_repository(self, repository_class: Type[T], model_class) -> T:
        """Create a repository instance with injected session"""
        return repository_class(self._session, model_class)
