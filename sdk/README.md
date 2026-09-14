# EcoCode Analytics Python Client SDK (`ecocode`)

> Code-level carbon telemetry and green FinOps for Python applications.

`ecocode` is a lightweight, zero-overhead Python client library that measures real-time execution duration, CPU utilization, active power draw (Watts), energy consumption (kWh), peak memory usage (MB), and carbon dioxide emissions (gCO2) for individual functions and arbitrary code blocks.

Telemetry logs are automatically buffered and asynchronously streamed in non-blocking batches to the **EcoCode Analytics** ingestion API.

---

## Installation

```bash
pip install ecocode
```

Or install in editable mode for development:

```bash
pip install -e sdk/
```

---

## Quickstart

### 1. Environment Configuration

Set your API Key and EcoCode API endpoint as environment variables:

```bash
export ECOCODE_API_KEY="eco_live_your_secret_api_key_here"
export ECOCODE_API_URL="http://localhost:8000"
```

Or initialize programmatically in your application entry point:

```python
from ecocode import init_tracker

init_tracker(
    api_key="eco_live_your_secret_api_key_here",
    api_url="http://localhost:8000"
)
```

---

### 2. Instrumenting Functions (`@track_carbon`)

Use the `@track_carbon` decorator to instrument synchronous (`def`) or asynchronous (`async def`) functions:

```python
import time
import asyncio
from ecocode import track_carbon

# Instrumenting a synchronous function
@track_carbon(
    workload_name="quicksort_large_dataset",
    category="Algorithms",
    department="Software Eng"
)
def sort_data(items: list) -> list:
    return sorted(items)

# Instrumenting an asynchronous function
@track_carbon(
    workload_name="train_transformer_batch",
    category="Model Training",
    department="AI/ML"
)
async def train_model():
    await asyncio.sleep(0.5)
```

---

### 3. Instrumenting Code Blocks (`track_carbon_block`)

Use the `track_carbon_block` context manager to measure arbitrary code blocks or inline loops:

```python
from ecocode import track_carbon_block

def run_pipeline():
    # Code outside tracking block...

    with track_carbon_block(
        workload_name="etl_customer_segmentation",
        category="ETL Pipelines",
        department="Data Eng"
    ):
        # Heavy data transformation loop
        for i in range(1_000_000):
            _ = i ** 2
```

---

## Advanced Configuration Options

| Parameter | Environment Variable | Default | Description |
|---|---|---|---|
| `api_url` | `ECOCODE_API_URL` | `http://localhost:8000` | EcoCode ingestion server base URL |
| `api_key` | `ECOCODE_API_KEY` | `None` | Tenant API Key starting with `eco_live_` |
| `batch_size` | `ECOCODE_BATCH_SIZE` | `10` | Maximum telemetry logs sent per HTTP request |
| `flush_interval_sec` | `ECOCODE_FLUSH_INTERVAL` | `5.0` | Maximum seconds between automatic queue flushes |
| `carbon_intensity_g_kwh` | `ECOCODE_CARBON_INTENSITY` | `475.0` | Regional grid carbon intensity (gCO2/kWh) |
| `cpu_tdp_watts` | `ECOCODE_CPU_TDP` | `65.0` | Baseline CPU Thermal Design Power (Watts) |
| `enabled` | `ECOCODE_ENABLED` | `true` | Set to `false` to disable telemetry globally |

---

## Non-Blocking Architecture & Resilience guarantees

1. **Zero Thread-Blocking**: Hardware sampling and HTTP queue dispatches take place in an isolated, low-priority daemon background thread.
2. **Process Exit Hook**: An `atexit` hook ensures all in-memory queued metrics are cleanly flushed when your Python application shuts down.
3. **Fail-Safe Operation**: If the EcoCode ingestion API is offline or returns an error, the SDK logs a local warning without interrupting your application logic or throwing unhandled exceptions.

---

## License

MIT License - Copyright (c) 2026 EcoCode Analytics.
