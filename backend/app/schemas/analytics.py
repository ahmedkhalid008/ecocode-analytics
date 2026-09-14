from typing import List, Optional
from pydantic import BaseModel, Field


class AnalyticsSummary(BaseModel):
    total_co2_grams: float = Field(..., description="Total CO2 emitted in grams across filtered period")
    total_energy_kwh: float = Field(..., description="Total energy consumed in kWh across filtered period")
    total_cost_usd: float = Field(..., description="Estimated electricity cost in USD")
    estimated_savings_pct: float = Field(..., description="Estimated percentage carbon & cost savings achieved via optimization")
    total_runs: int = Field(..., description="Total telemetry runs recorded")


class WorkloadCO2Ranking(BaseModel):
    workload_name: str
    workload_category: str
    total_co2_grams: float
    total_energy_kwh: float
    total_runs: int
    avg_execution_time_sec: float


class DepartmentCO2Breakdown(BaseModel):
    department: str
    total_co2_grams: float
    total_energy_kwh: float
    total_runs: int
    percentage_of_total: float
