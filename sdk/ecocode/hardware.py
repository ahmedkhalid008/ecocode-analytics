import time
import platform
import psutil
from typing import Dict, Any

from ecocode.config import get_config


class HardwareSampler:
    """
    Cross-platform sampler for measuring CPU utilization, RAM usage, execution time,
    estimated power draw (Watts), energy consumed (kWh), and carbon emitted (gCO2).
    """

    def __init__(self) -> None:
        self._process = psutil.Process()
        self._start_time: float = 0.0
        self._end_time: float = 0.0
        self._start_cpu_times: Any = None

    def start(self) -> None:
        """Starts timing and CPU sampling."""
        self._start_time = time.perf_counter()
        try:
            self._start_cpu_times = self._process.cpu_times()
        except Exception:
            self._start_cpu_times = None

    def stop(self) -> Dict[str, Any]:
        """
        Stops sampling and calculates energy & carbon metrics.

        Returns a dictionary containing:
            - execution_time_sec: float
            - cpu_power_watt: float
            - energy_consumed_kwh: float
            - co2_emitted_grams: float
            - ram_usage_mb: float
            - host_os: str
        """
        self._end_time = time.perf_counter()
        execution_time_sec = max(self._end_time - self._start_time, 0.0001)

        cfg = get_config()

        # Calculate CPU utilization ratio
        cpu_percent = 0.0
        try:
            if self._start_cpu_times:
                end_cpu_times = self._process.cpu_times()
                user_delta = end_cpu_times.user - self._start_cpu_times.user
                system_delta = end_cpu_times.system - self._start_cpu_times.system
                cpu_time_used = user_delta + system_delta
                cpu_percent = (cpu_time_used / execution_time_sec) * 100.0
            else:
                cpu_percent = psutil.cpu_percent(interval=None)
        except Exception:
            cpu_percent = 25.0  # Fallback estimate

        # Cap CPU percentage between 5% baseline idle and 100% per core
        cpu_percent = max(min(cpu_percent, 100.0 * psutil.cpu_count(logical=True)), 5.0)

        # Estimate CPU power draw in Watts: (Utilization % * TDP) + Baseline idle draw
        # Normalize CPU ratio across available logical cores
        num_cores = max(psutil.cpu_count(logical=True) or 1, 1)
        core_utilization_ratio = min(cpu_percent / (100.0 * num_cores), 1.0)
        
        # Baseline idle TDP draw is ~15% of max TDP; active draw scales with core utilization ratio
        idle_power = cfg.cpu_tdp_watts * 0.15
        active_power = cfg.cpu_tdp_watts * 0.85 * max(core_utilization_ratio, 0.10)
        cpu_power_watt = round(idle_power + active_power, 4)

        # Calculate Energy in kWh: (Watts * Seconds) / (1000 * 3600)
        energy_consumed_kwh = round((cpu_power_watt * execution_time_sec) / (1000.0 * 3600.0), 9)

        # Calculate Carbon in Grams: Energy (kWh) * Carbon Intensity (gCO2/kWh)
        co2_emitted_grams = round(energy_consumed_kwh * cfg.carbon_intensity_g_kwh, 6)

        # Peak process memory usage in Megabytes (RSS)
        ram_usage_mb = 0.0
        try:
            memory_info = self._process.memory_info()
            ram_usage_mb = round(memory_info.rss / (1024.0 * 1024.0), 2)
        except Exception:
            ram_usage_mb = 0.0

        # Detect Host Operating System & CPU Architecture
        try:
            host_os = f"{platform.system()} {platform.release()} ({platform.machine()})"
        except Exception:
            host_os = "Unknown OS"

        return {
            "execution_time_sec": round(execution_time_sec, 6),
            "cpu_power_watt": cpu_power_watt,
            "energy_consumed_kwh": energy_consumed_kwh,
            "co2_emitted_grams": co2_emitted_grams,
            "ram_usage_mb": ram_usage_mb,
            "host_os": host_os
        }
