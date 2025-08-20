from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import uuid
from jose import JWTError, jwt
from passlib.context import CryptContext
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
import secrets
import base64
from .config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class SecurityManager:
    """
    Handles multi-tenant security operations including:
    - JWT token management with tenant context
    - Password hashing and verification
    - Diffie-Hellman key exchange
    - Tenant-scoped session management
    """
    
    def __init__(self):
        self.algorithm = settings.ALGORITHM
        self.secret_key = settings.SECRET_KEY
        
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Hash password with bcrypt"""
        return pwd_context.hash(password)
    
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """
        Create JWT access token with tenant context
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "jti": str(uuid.uuid4()),  # JWT ID for tracking
            "type": "access"
        })
        
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def create_refresh_token(self, data: Dict[str, Any]) -> str:
        """
        Create JWT refresh token with tenant context
        """
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "jti": str(uuid.uuid4()),
            "type": "refresh"
        })
        
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verify JWT token and return payload with tenant context
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError:
            return None
    
    def generate_correlation_id(self) -> str:
        """Generate UUID for request correlation"""
        return str(uuid.uuid4())
    
    def generate_session_key(self, tenant_id: str) -> str:
        """
        Generate tenant-specific session key for encryption
        """
        # Generate random key material
        key_material = secrets.token_bytes(32)
        
        # Derive tenant-specific key using HKDF
        tenant_salt = tenant_id.encode('utf-8')
        hkdf = HKDF(
            algorithm=hashes.SHA256(),
            length=32,
            salt=tenant_salt,
            info=b'openbiocure-session-key'
        )
        
        session_key = hkdf.derive(key_material)
        return base64.b64encode(session_key).decode('utf-8')
    
    def validate_tenant_context(self, token_payload: Dict[str, Any], required_tenant_id: str) -> bool:
        """
        Validate that token contains valid tenant context
        """
        token_tenant_id = token_payload.get('tenant_id')
        if not token_tenant_id:
            return False
        
        return token_tenant_id == required_tenant_id

# Global security manager instance
security = SecurityManager()
