from typing import Optional, List
from sqlalchemy.orm import Session
import sys
import os
sys.path.append('/Users/mohammad_shehab/develop/openbiocure-platform-ui/backend/shared')
from repositories.base_repository import BaseRepository
from app.models.user import User

class UserRepository(BaseRepository[User]):
    """User repository with specific user operations"""
    
    def __init__(self, db: Session, model=User):
        super().__init__(db, model)
    
    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_by_tenant(self, tenant_id: str, skip: int = 0, limit: int = 100) -> List[User]:
        """Get users by tenant"""
        return self.db.query(User).filter(User.tenant_id == tenant_id).offset(skip).limit(limit).all()
    
    def get_active_users(self, tenant_id: str = None) -> List[User]:
        """Get active users, optionally filtered by tenant"""
        query = self.db.query(User).filter(User.is_active == True)
        if tenant_id:
            query = query.filter(User.tenant_id == tenant_id)
        return query.all()
    
    def email_exists(self, email: str) -> bool:
        """Check if email already exists"""
        return self.db.query(User).filter(User.email == email).first() is not None
    
    def update_last_login(self, user_id: str) -> bool:
        """Update user's last login timestamp"""
        from datetime import datetime
        user = self.get_by_id(user_id)
        if user:
            user.last_login = datetime.utcnow()
            self.db.commit()
            return True
        return False
