import os
import sys
import time
import json
import logging
import platform
import threading
from datetime import datetime, timezone
from typing import Callable, Any, Optional

try:
    import requests
except ImportError:
    requests = None

# Optional psutil fallback for system metrics
try:
    import psutil
except ImportError:
    psutil = None

logger = logging.getLogger("ecocode")


def _get_system_metrics() -> tuple[float, str]:
    """
    Extract RAM usage in MB and host OS details safely.
    Falls back gracefully if psutil is not available.
    """
    ram_mb = 128.0
    host_os = f"{platform.system()} {platform.release()}"

    if psutil:
        try:
            process = psutil.Process(os.getpid())
            ram_mb = round(process.memory_info().rss / (1024 * 1024), 2)
        except Exception:
            pass

    return ram_mb, host_os


def _dispatch_telemetry_async(
    endpoint: str,
    api_key: str,
    payload: dict,
    timeout: float = 2.0
) -> None:
    """
    Background worker thread function to dispatch HTTP POST telemetry.
    Catches all exceptions to ensure zero interruption to target application runtime.
    """
    try:
        headers = {
            "Content-Type": "application/json",
            "X-API-Key": api_key,
            "User-Agent": "EcoCode-Python-SDK/0.1.0"
        }

        if requests is not None:
            response = requests.post(endpoint, json=payload, headers=headers, timeout=timeout)
            if response.status_code in (200, 201):
                logger.debug(f"[EcoCode] Telemetry ingested successfully: {response.status_code}")
            else:
                logger.debug(f"[EcoCode] Backend response HTTP {response.status_code}: {response.text}")
        else:
            import urllib.request
            req = urllib.request.Request(
                endpoint,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                logger.debug(f"[EcoCode] Fallback urllib ingest success: {resp.status}")
    except Exception as err:
        logger.debug(f"[EcoCode] Failed to dispatch telemetry payload: {err}")


def track_carbon(
    api_key: str,
    algo_name: Optional[str] = None,
    department: str = "Engineering",
    category: str = "Algorithms",
    endpoint: str = "https://ecocode-backend-si2i.onrender.com/api/v1/telemetry/ingest",
    timeout: float = 2.0
) -> Callable:
    """
    Decorator for tracking execution runtime, estimating power (65W TDP), energy (kWh),
    and CO2 emissions (gCO2), non-blockingly dispatching telemetry to EcoCode Analytics.

    Usage:
        @track_carbon(api_key="eco_live_...", algo_name="quicksort_benchmark", department="Data Eng")
        def run_pipeline():
            ...
    """
    def decorator(func: Callable) -> Callable:
        target_workload = algo_name or func.__name__

        def wrapper(*args: Any, **kwargs: Any) -> Any:
            start_time = time.perf_counter()
            
            # Execute original wrapped function
            try:
                result = func(*args, **kwargs)
            finally:
                end_time = time.perf_counter()
                execution_time_sec = end_time - start_time
                execution_time_ms = execution_time_sec * 1000.0

                # 1. Calculate energy consumption in kWh: (65.0 * (execution_time_ms / 1000.0)) / (3.6e6)
                cpu_power_watt = 65.0
                energy_kwh = (cpu_power_watt * (execution_time_ms / 1000.0)) / 3.6e6

                # 2. Calculate CO2 emissions in grams: energy_kwh * 450.0
                co2_grams = energy_kwh * 450.0

                # 3. Read CPU/RAM metrics
                ram_mb, host_os = _get_system_metrics()

                # 4. Construct telemetry payload matching backend API schema
                payload = {
                    "workload_name": target_workload,
                    "workload_category": category,
                    "department": department,
                    "execution_time_sec": round(execution_time_sec, 6),
                    "cpu_power_watt": cpu_power_watt,
                    "energy_consumed_kwh": float(f"{energy_kwh:.8f}"),
                    "co2_emitted_grams": float(f"{co2_grams:.6f}"),
                    "ram_usage_mb": ram_mb,
                    "host_os": host_os,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }

                # 5. Asynchronously dispatch in a background daemon thread
                if api_key:
                    thread = threading.Thread(
                        target=_dispatch_telemetry_async,
                        args=(endpoint, api_key, payload, timeout),
                        daemon=True
                    )
                    thread.start()

            return result

        return wrapper

    return decorator


class EcoCodeClient:
    """
    Official EcoCode Python Client for programmatic setup and telemetry logging.
    """

    def __init__(
        self,
        api_key: str,
        department: str = "Engineering",
        endpoint: str = "https://ecocode-backend-si2i.onrender.com/api/v1/telemetry/ingest",
        timeout: float = 2.0
    ):
        self.api_key = api_key
        self.department = department
        self.endpoint = endpoint
        self.timeout = timeout

    def track(
        self,
        algo_name: Optional[str] = None,
        department: Optional[str] = None,
        category: str = "Algorithms"
    ) -> Callable:
        """
        Decorator method using client configuration defaults.
        """
        return track_carbon(
            api_key=self.api_key,
            algo_name=algo_name,
            department=department or self.department,
            category=category,
            endpoint=self.endpoint,
            timeout=self.timeout
        )

    def log_telemetry(
        self,
        algo_name: str,
        execution_time_sec: float,
        category: str = "Algorithms",
        department: Optional[str] = None,
        cpu_power_watt: float = 65.0
    ) -> None:
        """
        Manually dispatch a telemetry event without using a decorator.
        """
        execution_time_ms = execution_time_sec * 1000.0
        energy_kwh = (cpu_power_watt * (execution_time_ms / 1000.0)) / 3.6e6
        co2_grams = energy_kwh * 450.0
        ram_mb, host_os = _get_system_metrics()

        payload = {
            "workload_name": algo_name,
            "workload_category": category,
            "department": department or self.department,
            "execution_time_sec": round(execution_time_sec, 6),
            "cpu_power_watt": cpu_power_watt,
            "energy_consumed_kwh": float(f"{energy_kwh:.8f}"),
            "co2_emitted_grams": float(f"{co2_grams:.6f}"),
            "ram_usage_mb": ram_mb,
            "host_os": host_os,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        thread = threading.Thread(
            target=_dispatch_telemetry_async,
            args=(self.endpoint, self.api_key, payload, self.timeout),
            daemon=True
        )
        thread.start()
