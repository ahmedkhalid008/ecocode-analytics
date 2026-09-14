import os
import sys
import time
import unittest
from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.main import app
from ecocode import track_carbon, track_carbon_block, init_tracker, get_dispatcher


class TestE2EIntegration(unittest.TestCase):
    """
    End-to-End integration test simulating the full telemetry flow:
    SDK Instrumentation -> Telemetry Ingestion API -> Executive Analytics BI Endpoint.
    """

    @classmethod
    def setUpClass(cls) -> None:
        cls.client = TestClient(app)

        # 1. Register tenant organization & user
        reg_payload = {
            "email": f"e2e_engineer_{int(time.time())}@ecocode.io",
            "password": "SecurePassword123!",
            "org_name": f"E2E FinOps Org {int(time.time())}",
            "org_slug": f"e2e-finops-{int(time.time())}"
        }
        reg_res = cls.client.post("/api/v1/auth/register", json=reg_payload)
        assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"

        # 2. Login to get JWT
        login_res = cls.client.post("/api/v1/auth/login", json={
            "email": reg_payload["email"],
            "password": reg_payload["password"]
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        cls.token = login_res.json()["access_token"]
        cls.headers = {"Authorization": f"Bearer {cls.token}"}

        # 3. Create API Key
        key_res = cls.client.post("/api/v1/keys", json={"label": "E2E Test SDK Key"}, headers=cls.headers)
        assert key_res.status_code == 201, f"API key creation failed: {key_res.text}"
        cls.api_key = key_res.json()["full_key"]

        # 4. Initialize EcoCode SDK
        init_tracker(
            api_key=cls.api_key,
            api_url="http://testserver",  # TestClient handler URL
            enabled=True
        )

    def test_e2e_telemetry_flow(self) -> None:
        # Intercept HTTP requests made by dispatcher and route them to TestClient
        def mock_send_batch(items):
            res = self.client.post(
                "/api/v1/telemetry/ingest",
                json=items,
                headers={"Authorization": f"Bearer {self.api_key}"}
            )
            self.assertEqual(res.status_code, 201, f"Ingest failed: {res.text}")
            data = res.json()
            self.assertEqual(data["status"], "success")
            self.assertGreater(data["ingested_count"], 0)

        dispatcher = get_dispatcher()
        dispatcher._send_batch = mock_send_batch

        # Instrument function call
        @track_carbon(workload_name="quicksort_benchmark", category="Algorithms", department="Software Eng")
        def run_benchmark():
            time.sleep(0.01)
            return [i * i for i in range(100)]

        run_benchmark()

        # Instrument block call
        with track_carbon_block("transformer_training_pass", category="Model Training", department="AI/ML"):
            time.sleep(0.01)

        # Flush SDK queue
        dispatcher.flush()

        # Query Executive Analytics Summary endpoint
        summary_res = self.client.get("/api/v1/analytics/summary", headers=self.headers)
        self.assertEqual(summary_res.status_code, 200)
        summary = summary_res.json()
        self.assertEqual(summary["total_runs"], 2)
        self.assertGreater(summary["total_co2_grams"], 0.0)
        self.assertGreater(summary["total_energy_kwh"], 0.0)

        # Query Workload Rankings
        algo_res = self.client.get("/api/v1/analytics/by-algorithm", headers=self.headers)
        self.assertEqual(algo_res.status_code, 200)
        rankings = algo_res.json()
        self.assertEqual(len(rankings), 2)

        # Query Department Breakdown
        dept_res = self.client.get("/api/v1/analytics/by-department", headers=self.headers)
        self.assertEqual(dept_res.status_code, 200)
        depts = dept_res.json()
        self.assertGreaterEqual(len(depts), 2)


if __name__ == "__main__":
    unittest.main()
