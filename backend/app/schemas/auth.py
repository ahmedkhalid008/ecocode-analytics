import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole


class UserRegister(BaseModel):
    email: EmailStr = Field(..., description="User's work email address")
    password: str = Field(..., min_length=8, description="User password (min 8 characters)")
    org_name: str = Field(..., min_length=2, max_length=255, description="Organization name")
    org_slug: str = Field(..., min_length=2, max_length=100, description="Organization URL slug")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Token expiration duration in seconds")


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    org_id: Optional[str] = None


class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    role: UserRole
    is_active: bool
    org_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
