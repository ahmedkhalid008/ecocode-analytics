# EcoCode Python Client SDK (`ecocode`)

> Lightweight Code-Level Carbon Telemetry & Green FinOps SDK for Python.

`ecocode` allows software engineering teams to measure, profile, and stream function-level carbon footprint ($gCO_2$), energy consumption ($kWh$), and CPU power ($W$) in real-time with zero overhead.

---

## 🚀 Quick Installation

```bash
pip install ecocode-telemetry
```

---

## ⚡ 3-Line Quickstart

```python
from ecocode import track_carbon

@track_carbon(api_key="eco_live_YOUR_API_KEY", algo_name="dataset_processing", department="Data Eng")
def process_data():
    return [x ** 2 for x in range(1_000_000)]

process_data()
```

---

## 💡 How It Works

1. **High-Precision Timing**: Measures execution runtime using high-precision `time.perf_counter()`.
2. **Energy & Carbon Estimation**:
   - Energy ($kWh$): $\frac{65.0 \times \text{runtime\_sec}}{3,600,000}$
   - Carbon ($gCO_2$): $\text{energy\_kwh} \times 450.0$
3. **Non-Blocking Telemetry Ingestion**: Asynchronously streams telemetry via background daemon threads to EcoCode Analytics cloud.
4. **Resilient & Fail-Safe**: Catches all connection exceptions to guarantee zero application runtime interruption.

---

## 🎛️ Advanced Usage with `EcoCodeClient`

```python
from ecocode import EcoCodeClient

client = EcoCodeClient(
    api_key="eco_live_YOUR_API_KEY",
    department="AI / ML",
    endpoint="https://ecocode-backend-si2i.onrender.com/api/v1/telemetry/ingest"
)

# Use client decorator
@client.track(algo_name="neural_net_batch_inference")
def run_model():
    # Model inference code
    pass

# Or manually log telemetry events
client.log_telemetry(algo_name="custom_job", execution_time_sec=0.45)
```

---

## 📄 License

MIT © [Khalid Ahmed Tepu](https://github.com/ahmedkhalid008)
