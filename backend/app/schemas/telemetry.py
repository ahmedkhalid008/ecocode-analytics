from datetime import datetime
from typing import List, Union
from pydantic import BaseModel, Field


class TelemetryPayload(BaseModel):
    workload_name: str = Field(..., min_length=1, max_length=255, description="Name of the workload or function")
    workload_category: str = Field(..., min_length=1, max_length=100, description="Category: Algorithms, ETL Pipelines, Model Training, etc.")
    department: str = Field(..., min_length=1, max_length=100, description="Department: AI/ML, Data Eng, Software Eng, etc.")
    execution_time_sec: float = Field(..., ge=0.0, description="Total execution time in seconds")
    cpu_power_watt: float = Field(..., ge=0.0, description="Average CPU power draw in Watts")
    energy_consumed_kwh: float = Field(..., ge=0.0, description="Energy consumed in kWh")
    co2_emitted_grams: float = Field(..., ge=0.0, description="Carbon dioxide emitted in grams")
    ram_usage_mb: float = Field(..., ge=0.0, description="Peak RAM usage in Megabytes")
    host_os: str = Field(..., min_length=1, max_length=100, description="Host OS architecture/name")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="ISO 8601 timestamp of execution")


class TelemetryBatchIngest(BaseModel):
    items: List[TelemetryPayload] = Field(..., min_length=1, description="List of telemetry log entries to ingest")


class TelemetryIngestResponse(BaseModel):
    status: str = "success"
    ingested_count: int
    current_month_runs: int
    monthly_run_limit: int
