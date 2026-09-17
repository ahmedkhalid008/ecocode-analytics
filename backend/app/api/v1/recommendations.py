from typing import List, Any
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.deps import get_async_db, get_current_org_context
from app.models.organization import Organization
from app.models.telemetry_log import TelemetryLog
from app.schemas.recommendations import RecommendationInsight

router = APIRouter(prefix="/recommendations", tags=["Smart Green FinOps Advisor"])


@router.get("/insights", response_model=List[RecommendationInsight])
async def get_recommendation_insights(
    org: Organization = Depends(get_current_org_context),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    """
    AI & Rule-Based Smart Green FinOps Advisor endpoint.
    Analyzes tenant telemetry logs to flag high-latency routines, memory spikes,
    and compute dollar waste with actionable code refactoring recommendations.
    """
    query = (
        select(
            TelemetryLog.workload_name,
            func.avg(TelemetryLog.execution_time_sec).label("avg_exec_sec"),
            func.max(TelemetryLog.ram_usage_mb).label("max_ram_mb"),
            func.count(TelemetryLog.id).label("total_runs"),
            func.sum(TelemetryLog.co2_emitted_grams).label("total_co2"),
            func.sum(TelemetryLog.energy_consumed_kwh).label("total_energy")
        )
        .where(TelemetryLog.org_id == org.id)
        .group_by(TelemetryLog.workload_name)
    )

    result = await db.execute(query)
    rows = result.all()

    insights: List[RecommendationInsight] = []
    rec_counter = 1

    for row in rows:
        workload_name = row.workload_name
        avg_exec_sec = float(row.avg_exec_sec or 0.0)
        avg_exec_ms = avg_exec_sec * 1000.0
        max_ram_mb = float(row.max_ram_mb or 0.0)
        total_runs = int(row.total_runs or 0)
        total_energy = float(row.total_energy or 0.0)

        # 1. High Latency Routines (average execution_time_ms > 1000ms)
        if avg_exec_ms > 1000.0:
            is_critical = avg_exec_ms > 3000.0
            severity = "CRITICAL" if is_critical else "WARNING"
            
            # Estimate monthly compute waste USD
            estimated_waste_usd = round(max((avg_exec_sec - 0.5) * total_runs * 0.00015 * 30, 12.50), 2)

            insights.append(
                RecommendationInsight(
                    id=f"rec-lat-{rec_counter}",
                    type="latency",
                    severity=severity,
                    algorithm_name=workload_name,
                    metric_value=f"{avg_exec_ms:.0f} ms avg",
                    title=f"High Latency Execution ({avg_exec_ms:.0f} ms)",
                    insight=f"Routine '{workload_name}' averages {avg_exec_ms:.0f}ms runtime across {total_runs} run(s), exceeding recommended 1000ms green threshold.",
                    action="Optimize algorithmic complexity (e.g. O(N²) → O(N log N)), add Redis result caching, or vectorize loops.",
                    potential_saving=f"~${estimated_waste_usd:.2f}/mo waste & -40% energy"
                )
            )
            rec_counter += 1

        # 2. Memory Spikes (max ram_usage_mb > 512MB)
        if max_ram_mb > 512.0:
            is_critical = max_ram_mb > 1024.0
            severity = "CRITICAL" if is_critical else "WARNING"
            saving_pct = min(round(((max_ram_mb - 256.0) / max_ram_mb) * 100), 75)

            insights.append(
                RecommendationInsight(
                    id=f"rec-mem-{rec_counter}",
                    type="memory",
                    severity=severity,
                    algorithm_name=workload_name,
                    metric_value=f"{max_ram_mb:.0f} MB max",
                    title=f"Memory Allocation Spike ({max_ram_mb:.0f} MB)",
                    insight=f"Peak RAM usage for '{workload_name}' reached {max_ram_mb:.0f} MB, creating memory leak and container OOM risks.",
                    action="Batch dataset processing into smaller chunks, use Python generators/iterators, and explicitly release buffers.",
                    potential_saving=f"Reduce memory footprint by ~{saving_pct}%"
                )
            )
            rec_counter += 1

    # 3. Fallback Healthy State if no inefficiencies detected
    if not insights:
        insights.append(
            RecommendationInsight(
                id="rec-healthy-01",
                type="healthy",
                severity="HEALTHY",
                algorithm_name="All Active Workloads",
                metric_value="Optimal (<1000ms, <512MB)",
                title="Green FinOps Execution Profile Healthy",
                insight="All instrumented services and functions are executing within optimal green performance boundaries.",
                action="No immediate code refactoring required. Continue monitoring real-time function telemetry.",
                potential_saving="0% Waste (Fully Optimized)"
            )
        )

    # Sort insights so CRITICAL items appear first, then WARNING, then HEALTHY
    severity_order = {"CRITICAL": 0, "WARNING": 1, "HEALTHY": 2, "INFO": 3}
    insights.sort(key=lambda x: severity_order.get(x.severity, 4))

    return insights
