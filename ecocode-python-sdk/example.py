import time
import logging
from ecocode import track_carbon, EcoCodeClient

# Enable debug logging to verify telemetry output
logging.basicConfig(level=logging.DEBUG)

API_KEY = "eco_live_ICG0ptnKDyNB9M7QkRVob-2jIlwOD9rJVNUoy2k1qtw"

print("==================================================")
print("  EcoCode Python SDK - Interactive Telemetry Test")
print("==================================================")

# 1. Test standard decorator
@track_carbon(
    api_key=API_KEY,
    algo_name="Quicksort Benchmark",
    department="Software Eng",
    category="Algorithms"
)
def run_quicksort_benchmark():
    print("[>] Running Quicksort calculation...")
    arr = [x for x in range(2_000_000, 0, -1)]
    arr.sort()
    time.sleep(0.1)
    print(f"  [+] Processed and sorted {len(arr):,} elements.")

# 2. Test EcoCodeClient facade instance
client = EcoCodeClient(
    api_key=API_KEY,
    department="Data Engineering"
)

@client.track(algo_name="ETL Pipeline Batch", category="ETL Pipelines")
def run_etl_pipeline():
    print("[>] Running ETL pipeline batch...")
    data = [x ** 2 for x in range(1_000_000)]
    time.sleep(0.15)
    print(f"  [+] Processed {len(data):,} dataset records.")

if __name__ == "__main__":
    print("\n1. Executing decorated Quicksort function...")
    run_quicksort_benchmark()

    print("\n2. Executing client-tracked ETL Pipeline function...")
    run_etl_pipeline()

    print("\n3. Manually logging custom telemetry event...")
    client.log_telemetry(algo_name="Manual Aggregation Job", execution_time_sec=0.25)

    print("\n[Complete] All functions executed cleanly! Giving background threads a moment to finish dispatching...")
    time.sleep(1.0)
    print("[OK] Test completed successfully!")
