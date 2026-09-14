import hashlib
import secrets
import uuid
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.deps import get_async_db, get_current_user
from app.models.user import User
from app.models.api_key import APIKey
from app.schemas.api_key import APIKeyCreate, APIKeyCreatedResponse, APIKeyResponse

router = APIRouter(prefix="/keys", tags=["API Keys"])


@router.post("", response_model=APIKeyCreatedResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    payload: APIKeyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    """
    Generates a new API Key for the user's organization.
    The full plaintext key is returned ONLY once in the response. Store it securely.
    """
    random_secret = secrets.token_urlsafe(32)
    full_key = f"eco_live_{random_secret}"
    key_prefix = full_key[:12]  # e.g., "eco_live_ab12"
    key_hash = hashlib.sha256(full_key.encode("utf-8")).hexdigest()

    api_key_obj = APIKey(
        org_id=current_user.org_id,
        key_prefix=key_prefix,
        key_hash=key_hash,
        label=payload.label,
        is_active=True
    )
    db.add(api_key_obj)
    await db.commit()
    await db.refresh(api_key_obj)

    return APIKeyCreatedResponse(
        id=api_key_obj.id,
        key_prefix=api_key_obj.key_prefix,
        full_key=full_key,
        label=api_key_obj.label,
        created_at=api_key_obj.created_at
    )


@router.get("", response_model=List[APIKeyResponse])
async def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    """
    Lists all API Keys belonging to the user's organization.
    """
    stmt = (
        select(APIKey)
        .where(APIKey.org_id == current_user.org_id)
        .order_by(APIKey.created_at.desc())
    )
    result = await db.execute(stmt)
    keys = result.scalars().all()
    return keys


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_api_key(
    key_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> None:
    """
    Revokes (deactivates) an API Key by ID for the user's organization.
    """
    stmt = select(APIKey).where(APIKey.id == key_id, APIKey.org_id == current_user.org_id)
    result = await db.execute(stmt)
    api_key_obj = result.scalar_one_or_none()

    if not api_key_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API Key not found or does not belong to your organization"
        )

    api_key_obj.is_active = False
    await db.commit()
    return None
