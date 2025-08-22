from typing import Protocol
from sqlalchemy.orm import Session
from abc import ABC, abstractmethod

class UnitOfWork(ABC):
    """Unit of Work pattern to manage database transactions"""
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.rollback()
        else:
            self.commit()
    
    @abstractmethod
    def commit(self):
        """Commit the transaction"""
        pass
    
    @abstractmethod
    def rollback(self):
        """Rollback the transaction"""
        pass

class SqlAlchemyUnitOfWork(UnitOfWork):
    """SQLAlchemy implementation of Unit of Work"""
    
    def __init__(self, session: Session):
        self._session = session
    
    def commit(self):
        self._session.commit()
    
    def rollback(self):
        self._session.rollback()
    
    @property
    def session(self) -> Session:
        return self._session
