import asyncio
import functools
import inspect
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Callable, Any, Optional, Generator

from ecocode.config import get_config, init_tracker
from ecocode.hardware import HardwareSampler
from ecocode.dispatcher import get_dispatcher


def _create_telemetry_payload(
    workload_name: str,
    category: str,
    department: str,
    metrics: dict
) -> dict:
    """Helper formatting hardware sampler metrics into FastAPI TelemetryPayload schema."""
    return {
        "workload_name": workload_name,
        "workload_category": category,
        "department": department,
        "execution_time_sec": metrics["execution_time_sec"],
        "cpu_power_watt": metrics["cpu_power_watt"],
        "energy_consumed_kwh": metrics["energy_consumed_kwh"],
        "co2_emitted_grams": metrics["co2_emitted_grams"],
        "ram_usage_mb": metrics["ram_usage_mb"],
        "host_os": metrics["host_os"],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


def track_carbon(
    workload_name: Optional[str] = None,
    category: str = "Algorithms",
    department: str = "Software Eng",
    api_key: Optional[str] = None,
    api_url: Optional[str] = None
) -> Callable:
    """
    Decorator for measuring the carbon footprint, energy consumption, CPU power, and RAM usage
    of synchronous and asynchronous functions.

    Usage:
        @track_carbon(workload_name="sort_large_dataset", category="Algorithms", department="Data Eng")
        def process_data():
            ...

        @track_carbon(workload_name="async_model_inference", category="Model Training", department="AI/ML")
        async def run_inference():
            ...
    """
    if api_key or api_url:
        init_tracker(api_key=api_key, api_url=api_url)

    def decorator(func: Callable) -> Callable:
        target_name = workload_name or func.__name__

        if inspect.iscoroutinefunction(func):
            @functools.wraps(func)
            async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
                cfg = get_config()
                if not cfg.enabled:
                    return await func(*args, **kwargs)

                sampler = HardwareSampler()
                sampler.start()
                try:
                    return await func(*args, **kwargs)
                finally:
                    metrics = sampler.stop()
                    payload = _create_telemetry_payload(target_name, category, department, metrics)
                    get_dispatcher().enqueue(payload)

            return async_wrapper
        else:
            @functools.wraps(func)
            def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
                cfg = get_config()
                if not cfg.enabled:
                    return func(*args, **kwargs)

                sampler = HardwareSampler()
                sampler.start()
                try:
                    return func(*args, **kwargs)
                finally:
                    metrics = sampler.stop()
                    payload = _create_telemetry_payload(target_name, category, department, metrics)
                    get_dispatcher().enqueue(payload)

            return sync_wrapper

    return decorator


@contextmanager
def track_carbon_block(
    workload_name: str,
    category: str = "Algorithms",
    department: str = "Software Eng",
    api_key: Optional[str] = None,
    api_url: Optional[str] = None
) -> Generator[None, None, None]:
    """
    Context manager for measuring carbon footprint & power consumption of arbitrary code blocks.

    Usage:
        with track_carbon_block("image_resizing_batch", category="ETL Pipelines", department="Software Eng"):
            for img in images:
                resize(img)
    """
    if api_key or api_url:
        init_tracker(api_key=api_key, api_url=api_url)

    cfg = get_config()
    if not cfg.enabled:
        yield
        return

    sampler = HardwareSampler()
    sampler.start()
    try:
        yield
    finally:
        metrics = sampler.stop()
        payload = _create_telemetry_payload(workload_name, category, department, metrics)
        get_dispatcher().enqueue(payload)


class EcoCodeClient:
    """
    Facade client providing programmatic access to SDK initialization, manual log submission,
    and queue flushing.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        api_url: Optional[str] = None,
        batch_size: Optional[int] = None,
        flush_interval_sec: Optional[float] = None
    ) -> None:
        self.config = init_tracker(
            api_key=api_key,
            api_url=api_url,
            batch_size=batch_size,
            flush_interval_sec=flush_interval_sec
        )
        self.dispatcher = get_dispatcher()

    def record_event(
        self,
        workload_name: str,
        category: str,
        department: str,
        execution_time_sec: float,
        cpu_power_watt: float,
        energy_consumed_kwh: float,
        co2_emitted_grams: float,
        ram_usage_mb: float,
        host_os: str = "Python Application"
    ) -> None:
        """Manually records and enqueues a custom telemetry event."""
        payload = {
            "workload_name": workload_name,
            "workload_category": category,
            "department": department,
            "execution_time_sec": execution_time_sec,
            "cpu_power_watt": cpu_power_watt,
            "energy_consumed_kwh": energy_consumed_kwh,
            "co2_emitted_grams": co2_emitted_grams,
            "ram_usage_mb": ram_usage_mb,
            "host_os": host_os,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        self.dispatcher.enqueue(payload)

    def flush(self) -> None:
        """Flushes queued telemetry events immediately."""
        self.dispatcher.flush()

    def shutdown(self) -> None:
        """Flushes remaining metrics and stops background worker thread."""
        self.dispatcher.shutdown()
