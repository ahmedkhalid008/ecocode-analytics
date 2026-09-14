import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Float, DateTime, ForeignKey, Index, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.organization import Organization


class TelemetryLog(BaseModel):
    __tablename__ = "telemetry_logs"

    org_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    workload_name: Mapped[str] = mapped_column(String(255), nullable=False)
    workload_category: Mapped[str] = mapped_column(String(100), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    execution_time_sec: Mapped[float] = mapped_column(Float, nullable=False)
    cpu_power_watt: Mapped[float] = mapped_column(Float, nullable=False)
    energy_consumed_kwh: Mapped[float] = mapped_column(Float, nullable=False)
    co2_emitted_grams: Mapped[float] = mapped_column(Float, nullable=False)
    ram_usage_mb: Mapped[float] = mapped_column(Float, nullable=False)
    host_os: Mapped[str] = mapped_column(String(100), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="telemetry_logs")

    __table_args__ = (
        Index("ix_telemetry_logs_org_timestamp", "org_id", "timestamp"),
        Index("ix_telemetry_logs_org_department", "org_id", "department"),
    )

    def __repr__(self) -> str:
        return f"<TelemetryLog(id={self.id}, workload='{self.workload_name}', co2_g={self.co2_emitted_grams})>"
