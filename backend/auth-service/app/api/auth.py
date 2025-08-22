from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.services.auth_service import AuthService
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.dependencies import get_auth_service

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, req: Request, auth_service: AuthService = Depends(get_auth_service)):
    try:
        return await auth_service.login(
            request.email, 
            request.password,
            ip_address=req.client.host,
            user_agent=req.headers.get("user-agent")
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest, auth_service: AuthService = Depends(get_auth_service)):
    try:
        return await auth_service.register(request.email, request.password, request.name, request.type or "individual")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/refresh")
async def refresh_token(user_id: str, tenant_id: str, auth_service: AuthService = Depends(get_auth_service)):
    try:
        return await auth_service.refresh_token(user_id, tenant_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@router.get("/verify")
async def verify_token(user_id: str, auth_service: AuthService = Depends(get_auth_service)):
    try:
        return await auth_service.verify_token(user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))