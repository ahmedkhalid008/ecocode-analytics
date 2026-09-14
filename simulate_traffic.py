import time
# pyrefly: ignore [missing-import]
from ecocode import track_carbon

API_KEY = "eco_live_ICG0ptnKDyNB9M7QkRVob-2jIlwOD9rJVNUoy2k1qtw"

@track_carbon(api_key=API_KEY, workload_name="Docker Container Build", category="DevOps", department="Infrastructure")
def build_container():
    print("Simulating Docker build...")
    sum(i for i in range(5_000_000))
    time.sleep(0.5)

@track_carbon(api_key=API_KEY, workload_name="Next.js SSR Bundler", category="Web Engine", department="Frontend")
def compile_assets():
    print("Compiling SSR bundle...")
    [x * 2 for x in range(3_000_000)]
    time.sleep(0.3)

@track_carbon(api_key=API_KEY, workload_name="PostgreSQL Query Aggregator", category="Database", department="Backend")
def aggregate_queries():
    print("Running DB aggregations...")
    sum(i ** 3 for i in range(2_500_000))
    time.sleep(0.4)

if __name__ == "__main__":
    build_container()
    compile_assets()
    aggregate_queries()
    print("Multi-department telemetry dispatched successfully!")
