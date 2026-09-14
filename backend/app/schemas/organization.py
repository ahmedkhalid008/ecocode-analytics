import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.models.organization import OrgTier


class OrganizationResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    tier: OrgTier
    created_at: datetime

    model_config = {"from_attributes": True}


class OrganizationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
