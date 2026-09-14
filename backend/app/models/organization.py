import enum
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.api_key import APIKey
    from app.models.subscription import Subscription
    from app.models.telemetry_log import TelemetryLog


class OrgTier(str, enum.Enum):
    STARTER = "STARTER"
    GROWTH = "GROWTH"
    ENTERPRISE = "ENTERPRISE"


class Organization(BaseModel):
    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    tier: Mapped[OrgTier] = mapped_column(
        Enum(OrgTier, name="org_tier"),
        default=OrgTier.STARTER,
        nullable=False
    )

    # Relationships
    users: Mapped[List["User"]] = relationship(
        "User",
        back_populates="organization",
        cascade="all, delete-orphan"
    )
    api_keys: Mapped[List["APIKey"]] = relationship(
        "APIKey",
        back_populates="organization",
        cascade="all, delete-orphan"
    )
    subscription: Mapped[Optional["Subscription"]] = relationship(
        "Subscription",
        back_populates="organization",
        uselist=False,
        cascade="all, delete-orphan"
    )
    telemetry_logs: Mapped[List["TelemetryLog"]] = relationship(
        "TelemetryLog",
        back_populates="organization",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Organization(id={self.id}, slug='{self.slug}', tier='{self.tier}')>"
