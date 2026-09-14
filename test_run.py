import time
from ecocode import track_carbon

API_KEY = "eco_live_ICG0ptnKDyNB9M7QkRVob-2jIlwOD9rJVNUoy2k1qtw"

@track_carbon(
    api_key=API_KEY,
    workload_name="Pandas Vectorized Ingestion",
    category="ETL Pipelines",
    department="Data Eng"
)
def run_etl():
    print("Running ETL Pipeline...")
    total = sum(i ** 2 for i in range(2_000_000))
    time.sleep(0.4)
    print("ETL Done!")

@track_carbon(
    api_key=API_KEY,
    workload_name="Neural Net Inference Batch",
    category="Model Training",
    department="AI / ML"
)
def run_ml():
    print("Running ML Batch...")
    data = [x * 0.5 for x in range(1_500_000)]
    time.sleep(0.6)
    print("ML Done!")

if __name__ == "__main__":
    run_etl()
    run_ml()
    print("Telemetry successfully dispatched!")
