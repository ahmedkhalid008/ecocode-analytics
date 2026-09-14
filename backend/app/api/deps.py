import hashlib
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, AsyncGenerator
import bcrypt
import jwt
from fastapi import Depends, HTTPException, Security, status, Header
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.api_key import APIKey
from app.models.organization import Organization

# Security schemes
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)
http_bearer = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Hashes a plaintext password using standard bcrypt with 72-byte truncation safety."""
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plaintext password against a stored bcrypt hash."""
    pwd_bytes = plain_password.encode("utf-8")[:72]
    hashed_bytes = hashed_password.encode("utf-8")
    try:
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False


def create_access_token(subject: str, org_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a signed JWT access token containing subject (user_id) and org_id claims."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "sub": str(subject),
        "org_id": str(org_id),
        "exp": expire
    }
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI async dependency yielding an AsyncSession."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def get_current_user(
    db: AsyncSession = Depends(get_async_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> User:
    """
    FastAPI dependency validating the JWT token and returning the active User object.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except (jwt.PyJWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    stmt = select(User).where(User.id == uuid.UUID(user_id))
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account is deactivated"
        )
    return user


async def validate_api_key(
    db: AsyncSession = Depends(get_async_db),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    bearer_auth: Optional[HTTPAuthorizationCredentials] = Security(http_bearer)
) -> Organization:
    """
    FastAPI dependency validating an API Key provided in 'X-API-Key' or 'Authorization: Bearer eco_live_...' header.
    Computes SHA-256 hash, verifies active status, updates last_used_at, and returns the associated Organization.
    """
    raw_key: Optional[str] = x_api_key

    if not raw_key and bearer_auth:
        raw_key = bearer_auth.credentials

    if not raw_key or not raw_key.startswith("eco_live_"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid API key format. API key must start with 'eco_live_'"
        )

    # Compute SHA-256 hash of the provided raw key
    key_hash = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()

    # Query active API key
    stmt = select(APIKey).where(APIKey.key_hash == key_hash, APIKey.is_active == True)
    result = await db.execute(stmt)
    api_key_obj = result.scalar_one_or_none()

    if not api_key_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked API Key"
        )

    # Update last_used_at timestamp asynchronously
    api_key_obj.last_used_at = datetime.now(timezone.utc)
    await db.commit()

    # Fetch associated organization
    org_stmt = select(Organization).where(Organization.id == api_key_obj.org_id)
    org_result = await db.execute(org_stmt)
    org = org_result.scalar_one_or_none()

    if not org:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Associated organization not found"
        )
    return org


async def get_current_org_context(
    db: AsyncSession = Depends(get_async_db),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    bearer_auth: Optional[HTTPAuthorizationCredentials] = Security(http_bearer)
) -> Organization:
    """
    Flexible auth dependency allowing endpoints to accept either an API Key (SDK ingestion)
    or a JWT Token (Web UI dashboard). Returns the resolved Organization.
    """
    # 1. Check for API key first
    raw_key: Optional[str] = x_api_key
    if not raw_key and bearer_auth and bearer_auth.credentials.startswith("eco_live_"):
        raw_key = bearer_auth.credentials

    if raw_key and raw_key.startswith("eco_live_"):
        return await validate_api_key(db=db, x_api_key=raw_key, bearer_auth=None)

    # 2. Fall back to JWT bearer authentication
    if bearer_auth and bearer_auth.credentials:
        try:
            user = await get_current_user(db=db, token=bearer_auth.credentials)
            org_stmt = select(Organization).where(Organization.id == user.org_id)
            org_result = await db.execute(org_stmt)
            org = org_result.scalar_one_or_none()
            if org:
                return org
        except HTTPException:
            pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication failed. Provide a valid Bearer JWT token or 'eco_live_' API key"
    )