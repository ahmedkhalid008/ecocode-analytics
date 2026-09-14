import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class APIKeyCreate(BaseModel):
    label: str = Field(..., min_length=1, max_length=255, description="Label for the API Key (e.g. CI/CD Ingestion Pipeline)")


class APIKeyCreatedResponse(BaseModel):
    id: uuid.UUID
    key_prefix: str
    full_key: str = Field(..., description="Full plaintext API Key - MUST be saved immediately. Will not be shown again.")
    label: str
    created_at: datetime

    model_config = {"from_attributes": True}


class APIKeyResponse(BaseModel):
    id: uuid.UUID
    key_prefix: str
    label: str
    is_active: bool
    created_at: datetime
    last_used_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
