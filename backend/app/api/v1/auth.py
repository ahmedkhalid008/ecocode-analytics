from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.deps import (
    get_async_db,
    get_current_user,
    hash_password,
    verify_password,
    create_access_token
)
from app.core.config import settings
from app.models.organization import Organization, OrgTier
from app.models.user import User, UserRole
from app.models.subscription import Subscription, SubscriptionStatus
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    payload: UserRegister,
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    """
    Registers a new tenant organization along with an initial Admin user and default Starter subscription.
    """
    # Check if user email already exists
    existing_user_stmt = select(User).where(User.email == payload.email)
    user_result = await db.execute(existing_user_stmt)
    if user_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists"
        )

    # Check if organization slug already exists
    existing_org_stmt = select(Organization).where(Organization.slug == payload.org_slug)
    org_result = await db.execute(existing_org_stmt)
    if org_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An organization with this slug already exists"
        )

    # Create Organization
    org = Organization(
        name=payload.org_name,
        slug=payload.org_slug,
        tier=OrgTier.STARTER
    )
    db.add(org)
    await db.flush()  # Populates org.id

    # Create Admin User
    user = User(
        org_id=org.id,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=UserRole.ADMIN,
        is_active=True
    )
    db.add(user)

    # Create Default Starter Subscription
    subscription = Subscription(
        org_id=org.id,
        plan_tier=OrgTier.STARTER,
        monthly_run_limit=10000,
        current_month_runs=0,
        status=SubscriptionStatus.ACTIVE
    )
    db.add(subscription)

    await db.commit()
    await db.refresh(user)

    return user


@router.post("/login", response_model=Token)
async def login(
    payload: UserLogin,
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    """
    Authenticates user credentials and returns a JWT access token.
    """
    stmt = select(User).where(User.email == payload.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )

    expires_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
    access_token = create_access_token(
        subject=str(user.id),
        org_id=str(user.org_id),
        expires_delta=timedelta(minutes=expires_minutes)
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=expires_minutes * 60
    )


@router.get("/me", response_model=UserResponse)
async def read_current_user_profile(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Returns profile information for the authenticated user.
    """
    return current_user
