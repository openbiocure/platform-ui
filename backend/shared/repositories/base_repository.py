from abc import ABC, abstractmethod
from typing import TypeVar, Generic, List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.ext.declarative import DeclarativeMeta

T = TypeVar('T', bound=DeclarativeMeta)

class BaseRepository(Generic[T], ABC):
    """Base repository pattern implementation for all services"""
    
    def __init__(self, db: Session, model: type[T]):
        self.db = db
        self.model = model
    
    def create(self, obj_data: Dict[str, Any]) -> T:
        """Create a new record"""
        db_obj = self.model(**obj_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
    
    def get_by_id(self, obj_id: str) -> Optional[T]:
        """Get record by ID"""
        return self.db.query(self.model).filter(self.model.id == obj_id).first()
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        """Get all records with pagination"""
        return self.db.query(self.model).offset(skip).limit(limit).all()
    
    def update(self, obj_id: str, obj_data: Dict[str, Any]) -> Optional[T]:
        """Update record by ID"""
        db_obj = self.get_by_id(obj_id)
        if not db_obj:
            return None
        
        for field, value in obj_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
    
    def delete(self, obj_id: str) -> bool:
        """Delete record by ID"""
        db_obj = self.get_by_id(obj_id)
        if not db_obj:
            return False
        
        self.db.delete(db_obj)
        self.db.commit()
        return True
    
    def exists(self, obj_id: str) -> bool:
        """Check if record exists"""
        return self.db.query(self.model).filter(self.model.id == obj_id).first() is not None
    
    def count(self) -> int:
        """Count all records"""
        return self.db.query(self.model).count()
