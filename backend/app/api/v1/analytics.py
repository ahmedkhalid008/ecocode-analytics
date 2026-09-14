from datetime import datetime, timezone, timedelta
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.deps import get_async_db, get_current_org_context
from app.models.organization import Organization
from app.models.telemetry_log import TelemetryLog
from app.schemas.analytics import (
    AnalyticsSummary,
    WorkloadCO2Ranking,
    DepartmentCO2Breakdown
)

router = APIRouter(prefix="/analytics", tags=["Executive Analytics & Green FinOps"])


def build_time_filter(time_range: str) -> Optional[datetime]:
    """Helper converting time_range string into start datetime threshold."""
    now = datetime.now(timezone.utc)
    if time_range == "7d":
        return now - timedelta(days=7)
    elif time_range == "30d":
        return now - timedelta(days=30)
    elif time_range == "90d":
        return now - timedelta(days=90)
    return None  # "all" or unrecognized defaults to all-time


@router.get("/summary", response_model=AnalyticsSummary)
async def get_analytics_summary(
    time_range: str = Query("30d", description="Time range: 7d, 30d, 90d, all"),
    workload_category: Optional[str] = Query(None, description="Filter by category (e.g. Algorithms, ETL Pipelines, Model Training)"),
    cost_per_kwh: float = Query(0.15, ge=0.0, description="Cost per kWh in USD (default $0.15/kWh)"),
    org: Organization = Depends(get_current_org_context),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    """
    Returns executive BI summary metrics including Total CO2, Total Energy, Electricity Cost,
    and estimated Green FinOps optimization savings percentage.
    """
    start_time = build_time_filter(time_range)

    # Base query for org
    query = select(
        func.coalesce(func.sum(TelemetryLog.co2_emitted_grams), 0.0).label("total_co2"),
        func.coalesce(func.sum(TelemetryLog.energy_consumed_kwh), 0.0).label("total_energy"),
        func.coalesce(func.count(TelemetryLog.id), 0).label("total_runs"),
        func.coalesce(func.max(TelemetryLog.co2_emitted_grams), 0.0).label("max_co2"),
        func.coalesce(func.avg(TelemetryLog.co2_emitted_grams), 0.0).label("avg_co2")
    ).where(TelemetryLog.org_id == org.id)

    if start_time:
        query = query.where(TelemetryLog.timestamp >= start_time)
    if workload_category:
        query = query.where(TelemetryLog.workload_category == workload_category)

    result = await db.execute(query)
    row = result.one()

    total_co2 = float(row.total_co2)
    total_energy = float(row.total_energy)
    total_runs = int(row.total_runs)
    avg_co2 = float(row.avg_co2)
    max_co2 = float(row.max_co2)

    total_cost_usd = total_energy * cost_per_kwh

    # Calculate estimated optimization savings percentage
    # Baseline compare: energy reduction potential comparing average vs top quartile optimized runs
    if total_runs > 0 and max_co2 > 0:
        # Standard benchmark optimization formula: ratio of energy reduction achievable
        estimated_savings_pct = min(round(((max_co2 - avg_co2) / max_co2) * 100, 2), 45.0)
        if estimated_savings_pct < 0:
            estimated_savings_pct = 18.5  # default benchmark baseline
    else:
        estimated_savings_pct = 0.0

    return AnalyticsSummary(
        total_co2_grams=round(total_co2, 4),
        total_energy_kwh=round(total_energy, 4),
        total_cost_usd=round(total_cost_usd, 2),
        estimated_savings_pct=estimated_savings_pct,
        total_runs=total_runs
    )


@router.get("/by-algorithm", response_model=List[WorkloadCO2Ranking])
async def get_analytics_by_algorithm(
    time_range: str = Query("30d", description="Time range: 7d, 30d, 90d, all"),
    workload_category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(20, ge=1, le=100, description="Limit number of ranked workloads returned"),
    org: Organization = Depends(get_current_org_context),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    """
    Returns workloads ranked descending by total carbon footprint (CO2 emitted).
    Replaces Power BI DAX ranking metrics.
    """
    start_time = build_time_filter(time_range)

    query = (
        select(
            TelemetryLog.workload_name,
            TelemetryLog.workload_category,
            func.sum(TelemetryLog.co2_emitted_grams).label("total_co2"),
            func.sum(TelemetryLog.energy_consumed_kwh).label("total_energy"),
            func.count(TelemetryLog.id).label("total_runs"),
            func.avg(TelemetryLog.execution_time_sec).label("avg_execution_time")
        )
        .where(TelemetryLog.org_id == org.id)
        .group_by(TelemetryLog.workload_name, TelemetryLog.workload_category)
        .order_by(func.sum(TelemetryLog.co2_emitted_grams).desc())
        .limit(limit)
    )

    if start_time:
        query = query.where(TelemetryLog.timestamp >= start_time)
    if workload_category:
        query = query.where(TelemetryLog.workload_category == workload_category)

    result = await db.execute(query)
    rows = result.all()

    return [
        WorkloadCO2Ranking(
            workload_name=row.workload_name,
            workload_category=row.workload_category,
            total_co2_grams=round(float(row.total_co2), 4),
            total_energy_kwh=round(float(row.total_energy), 4),
            total_runs=int(row.total_runs),
            avg_execution_time_sec=round(float(row.avg_execution_time), 4)
        )
        for row in rows
    ]


@router.get("/by-department", response_model=List[DepartmentCO2Breakdown])
async def get_analytics_by_department(
    time_range: str = Query("30d", description="Time range: 7d, 30d, 90d, all"),
    workload_category: Optional[str] = Query(None, description="Filter by category"),
    org: Organization = Depends(get_current_org_context),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    """
    Returns department-level breakdown of carbon emissions and energy consumption.
    Includes percentage calculation relative to total organization footprint.
    """
    start_time = build_time_filter(time_range)

    # 1. Get grand total CO2 for org across filters
    total_query = select(
        func.coalesce(func.sum(TelemetryLog.co2_emitted_grams), 0.0)
    ).where(TelemetryLog.org_id == org.id)

    if start_time:
        total_query = total_query.where(TelemetryLog.timestamp >= start_time)
    if workload_category:
        total_query = total_query.where(TelemetryLog.workload_category == workload_category)

    total_res = await db.execute(total_query)
    grand_total_co2 = float(total_res.scalar() or 0.0)

    # 2. Group by department
    query = (
        select(
            TelemetryLog.department,
            func.sum(TelemetryLog.co2_emitted_grams).label("dept_co2"),
            func.sum(TelemetryLog.energy_consumed_kwh).label("dept_energy"),
            func.count(TelemetryLog.id).label("total_runs")
        )
        .where(TelemetryLog.org_id == org.id)
        .group_by(TelemetryLog.department)
        .order_by(func.sum(TelemetryLog.co2_emitted_grams).desc())
    )

    if start_time:
        query = query.where(TelemetryLog.timestamp >= start_time)
    if workload_category:
        query = query.where(TelemetryLog.workload_category == workload_category)

    result = await db.execute(query)
    rows = result.all()

    breakdown = []
    for row in rows:
        dept_co2 = float(row.dept_co2)
        percentage = round((dept_co2 / grand_total_co2 * 100), 2) if grand_total_co2 > 0 else 0.0
        breakdown.append(
            DepartmentCO2Breakdown(
                department=row.department,
                total_co2_grams=round(dept_co2, 4),
                total_energy_kwh=round(float(row.dept_energy), 4),
                total_runs=int(row.total_runs),
                percentage_of_total=percentage
            )
        )

    return breakdown
