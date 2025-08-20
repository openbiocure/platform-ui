#!/usr/bin/env python3
"""
Simple working auth endpoints for testing frontend integration
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt
import bcrypt
import uuid

# Simple FastAPI app for testing
app = FastAPI(title="Simple Auth Service", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
SECRET_KEY = "openbiocure-test-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# In-memory user storage (for testing only)
users_db = {}

# Pydantic models
class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: str
    password: str
    name: str
    type: str = "individual"

class User(BaseModel):
    id: str
    email: str
    name: str
    type: str = "individual"
    tenant: str = "default"
    features: list = ["basic_research"]
    createdAt: str
    lastLoginAt: str = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 3600
    user: User

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_user_dict(email: str, name: str, user_type: str = "individual") -> User:
    user_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    return User(
        id=user_id,
        email=email,
        name=name,
        type=user_type,
        tenant="default",
        features=["basic_research", "ai_assistant"] if user_type == "individual" else ["full_access"],
        createdAt=now,
        lastLoginAt=now
    )

# Routes
@app.get("/")
async def root():
    return {
        "service": "simple-auth-service",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    return {
        "service": "simple-auth-service",
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "in-memory",
        "features": {
            "registration": True,
            "login": True,
            "jwt_tokens": True,
            "password_hashing": True
        }
    }

@app.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    """Register a new user"""
    # Check if user already exists
    if user_data.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user
    user = create_user_dict(user_data.email, user_data.name, user_data.type)
    
    # Store user
    users_db[user_data.email] = {
        "user": user,
        "password": hashed_password
    }
    
    # Create tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "tenant": user.tenant},
        expires_delta=access_token_expires
    )
    
    refresh_token = create_access_token(
        data={"sub": user.id, "type": "refresh"},
        expires_delta=timedelta(days=7)
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user
    )

@app.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login user with email and password"""
    # Check if user exists
    user_data = users_db.get(credentials.email)
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(credentials.password, user_data["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = user_data["user"]
    
    # Update last login
    user.lastLoginAt = datetime.utcnow().isoformat()
    
    # Create tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "tenant": user.tenant},
        expires_delta=access_token_expires
    )
    
    refresh_token = create_access_token(
        data={"sub": user.id, "type": "refresh"},
        expires_delta=timedelta(days=7)
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user
    )

@app.get("/auth/verify")
async def verify_token(token: str = Depends(lambda: "dummy")):
    """Verify JWT token"""
    return {
        "valid": True,
        "message": "Token verification endpoint - implement JWT verification here"
    }

@app.post("/auth/logout")
async def logout():
    """Logout user"""
    return {"message": "Successfully logged out"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
