import os
from dataclasses import dataclass
from typing import Optional


@dataclass
class SDKConfig:
    """
    Configuration settings for the EcoCode Telemetry SDK.
    """
    api_url: str = "http://localhost:8000"
    api_key: Optional[str] = None
    batch_size: int = 10
    flush_interval_sec: float = 5.0
    carbon_intensity_g_kwh: float = 475.0  # Regional grid carbon intensity (gCO2/kWh)
    cpu_tdp_watts: float = 65.0            # Baseline CPU Thermal Design Power (Watts)
    enabled: bool = True

    @classmethod
    def from_env(cls) -> "SDKConfig":
        """
        Creates an SDKConfig instance populated from environment variables with sensible defaults.
        """
        api_url = os.getenv("ECOCODE_API_URL", "http://localhost:8000").rstrip("/")
        api_key = os.getenv("ECOCODE_API_KEY", None)
        
        try:
            batch_size = int(os.getenv("ECOCODE_BATCH_SIZE", "10"))
        except ValueError:
            batch_size = 10

        try:
            flush_interval_sec = float(os.getenv("ECOCODE_FLUSH_INTERVAL", "5.0"))
        except ValueError:
            flush_interval_sec = 5.0

        try:
            carbon_intensity = float(os.getenv("ECOCODE_CARBON_INTENSITY", "475.0"))
        except ValueError:
            carbon_intensity = 475.0

        try:
            cpu_tdp = float(os.getenv("ECOCODE_CPU_TDP", "65.0"))
        except ValueError:
            cpu_tdp = 65.0

        enabled_str = os.getenv("ECOCODE_ENABLED", "true").lower()
        enabled = enabled_str in ("true", "1", "yes", "on")

        return cls(
            api_url=api_url,
            api_key=api_key,
            batch_size=batch_size,
            flush_interval_sec=flush_interval_sec,
            carbon_intensity_g_kwh=carbon_intensity,
            cpu_tdp_watts=cpu_tdp,
            enabled=enabled
        )


# Global Singleton Configuration Instance
_global_config: SDKConfig = SDKConfig.from_env()


def get_config() -> SDKConfig:
    """Returns the active global SDK configuration instance."""
    return _global_config


def init_tracker(
    api_key: Optional[str] = None,
    api_url: Optional[str] = None,
    batch_size: Optional[int] = None,
    flush_interval_sec: Optional[float] = None,
    carbon_intensity_g_kwh: Optional[float] = None,
    cpu_tdp_watts: Optional[float] = None,
    enabled: Optional[bool] = None
) -> SDKConfig:
    """
    Initializes or updates the global EcoCode SDK configuration programmatically.

    Args:
        api_key: Organization API key starting with 'eco_live_'
        api_url: EcoCode API server base URL
        batch_size: Maximum telemetry events per HTTP batch payload
        flush_interval_sec: Seconds to wait before automatically flushing queued events
        carbon_intensity_g_kwh: Regional grid carbon intensity (gCO2 per kWh)
        cpu_tdp_watts: CPU Thermal Design Power rating (Watts)
        enabled: Enable or disable telemetry collection globally
    """
    global _global_config
    if api_key is not None:
        _global_config.api_key = api_key
    if api_url is not None:
        _global_config.api_url = api_url.rstrip("/")
    if batch_size is not None:
        _global_config.batch_size = batch_size
    if flush_interval_sec is not None:
        _global_config.flush_interval_sec = flush_interval_sec
    if carbon_intensity_g_kwh is not None:
        _global_config.carbon_intensity_g_kwh = carbon_intensity_g_kwh
    if cpu_tdp_watts is not None:
        _global_config.cpu_tdp_watts = cpu_tdp_watts
    if enabled is not None:
        _global_config.enabled = enabled

    return _global_config
