import enum
import uuid
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel
from app.models.organization import OrgTier

if TYPE_CHECKING:
    from app.models.organization import Organization


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PAST_DUE = "PAST_DUE"
    CANCELED = "CANCELED"
    TRIALING = "TRIALING"


class Subscription(BaseModel):
    __tablename__ = "subscriptions"

    org_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    stripe_customer_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    stripe_subscription_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    plan_tier: Mapped[OrgTier] = mapped_column(
        Enum(OrgTier, name="subscription_plan_tier"),
        default=OrgTier.STARTER,
        nullable=False
    )
    monthly_run_limit: Mapped[int] = mapped_column(Integer, default=10000, nullable=False)
    current_month_runs: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[SubscriptionStatus] = mapped_column(
        Enum(SubscriptionStatus, name="subscription_status"),
        default=SubscriptionStatus.ACTIVE,
        nullable=False
    )

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="subscription")

    def __repr__(self) -> str:
        return f"<Subscription(id={self.id}, org_id={self.org_id}, plan='{self.plan_tier}', status='{self.status}')>"
