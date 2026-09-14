from typing import List, Union, Any
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.deps import get_async_db, get_current_org_context
from app.models.organization import Organization
from app.models.subscription import Subscription
from app.models.telemetry_log import TelemetryLog
from app.schemas.telemetry import (
    TelemetryPayload,
    TelemetryBatchIngest,
    TelemetryIngestResponse
)

router = APIRouter(prefix="/telemetry", tags=["Telemetry Ingestion"])


@router.post("/ingest", response_model=TelemetryIngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_telemetry(
    payload: Union[TelemetryBatchIngest, TelemetryPayload, List[TelemetryPayload]] = Body(...),
    org: Organization = Depends(get_current_org_context),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    """
    High-throughput asynchronous telemetry ingestion endpoint.
    Accepts single or batch telemetry log payloads from SDKs or pipelines.
    Validates organization subscription quota before bulk inserting log entries.
    """
    # Normalize input payloads to a list of TelemetryPayload
    items: List[TelemetryPayload] = []
    if isinstance(payload, TelemetryBatchIngest):
        items = payload.items
    elif isinstance(payload, list):
        items = payload
    elif isinstance(payload, TelemetryPayload):
        items = [payload]
    else:
        items = [TelemetryPayload(**payload)]

    if not items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payload contains no telemetry log items"
        )

    items_count = len(items)

    # Lock & query organization subscription to verify quota
    sub_stmt = (
        select(Subscription)
        .where(Subscription.org_id == org.id)
        .with_for_update()
    )
    sub_result = await db.execute(sub_stmt)
    subscription = sub_result.scalar_one_or_none()

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Active subscription not found for organization"
        )

    if subscription.current_month_runs + items_count > subscription.monthly_run_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Monthly telemetry run quota exceeded. "
                f"Used: {subscription.current_month_runs}/{subscription.monthly_run_limit}. "
                f"Attempted: {items_count}. Please upgrade your subscription."
            )
        )

    # Bulk insert telemetry logs
    telemetry_objects = [
        TelemetryLog(
            org_id=org.id,
            workload_name=item.workload_name,
            workload_category=item.workload_category,
            department=item.department,
            execution_time_sec=item.execution_time_sec,
            cpu_power_watt=item.cpu_power_watt,
            energy_consumed_kwh=item.energy_consumed_kwh,
            co2_emitted_grams=item.co2_emitted_grams,
            ram_usage_mb=item.ram_usage_mb,
            host_os=item.host_os,
            timestamp=item.timestamp
        )
        for item in items
    ]
    db.add_all(telemetry_objects)

    # Atomically update current month run count
    subscription.current_month_runs += items_count

    await db.commit()

    return TelemetryIngestResponse(
        status="success",
        ingested_count=items_count,
        current_month_runs=subscription.current_month_runs,
        monthly_run_limit=subscription.monthly_run_limit
    )
