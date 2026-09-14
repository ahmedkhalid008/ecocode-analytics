import time
import asyncio
import unittest
from unittest.mock import patch, MagicMock

from ecocode import (
    track_carbon,
    track_carbon_block,
    EcoCodeClient,
    init_tracker,
    HardwareSampler,
    get_dispatcher
)


class TestEcoCodeSDK(unittest.TestCase):

    def setUp(self) -> None:
        init_tracker(
            api_key="eco_live_testkey1234567890",
            api_url="http://localhost:8000",
            enabled=True
        )

    def test_hardware_sampler(self) -> None:
        sampler = HardwareSampler()
        sampler.start()
        time.sleep(0.05)  # Simulate work
        metrics = sampler.stop()

        self.assertGreater(metrics["execution_time_sec"], 0.0)
        self.assertGreater(metrics["cpu_power_watt"], 0.0)
        self.assertGreaterEqual(metrics["energy_consumed_kwh"], 0.0)
        self.assertGreaterEqual(metrics["co2_emitted_grams"], 0.0)
        self.assertIn("host_os", metrics)

    @patch("ecocode.tracker.get_dispatcher")
    def test_sync_track_carbon_decorator(self, mock_get_dispatcher: MagicMock) -> None:
        mock_dispatcher = MagicMock()
        mock_get_dispatcher.return_value = mock_dispatcher

        @track_carbon(workload_name="sync_test_func", category="Algorithms", department="Software Eng")
        def sample_sync_func(a: int, b: int) -> int:
            time.sleep(0.02)
            return a + b

        result = sample_sync_func(10, 20)
        self.assertEqual(result, 30)

        # Verify dispatcher enqueue was called once with valid payload
        mock_dispatcher.enqueue.assert_called_once()
        payload = mock_dispatcher.enqueue.call_args[0][0]
        self.assertEqual(payload["workload_name"], "sync_test_func")
        self.assertEqual(payload["workload_category"], "Algorithms")
        self.assertEqual(payload["department"], "Software Eng")

    @patch("ecocode.tracker.get_dispatcher")
    def test_async_track_carbon_decorator(self, mock_get_dispatcher: MagicMock) -> None:
        mock_dispatcher = MagicMock()
        mock_get_dispatcher.return_value = mock_dispatcher

        @track_carbon(workload_name="async_test_func", category="Model Training", department="AI/ML")
        async def sample_async_func(x: int) -> int:
            await asyncio.sleep(0.02)
            return x * 2

        result = asyncio.run(sample_async_func(5))
        self.assertEqual(result, 10)

        mock_dispatcher.enqueue.assert_called_once()
        payload = mock_dispatcher.enqueue.call_args[0][0]
        self.assertEqual(payload["workload_name"], "async_test_func")
        self.assertEqual(payload["workload_category"], "Model Training")
        self.assertEqual(payload["department"], "AI/ML")

    @patch("ecocode.tracker.get_dispatcher")
    def test_track_carbon_block_context_manager(self, mock_get_dispatcher: MagicMock) -> None:
        mock_dispatcher = MagicMock()
        mock_get_dispatcher.return_value = mock_dispatcher

        with track_carbon_block("etl_batch_processing", category="ETL Pipelines", department="Data Eng"):
            time.sleep(0.02)

        mock_dispatcher.enqueue.assert_called_once()
        payload = mock_dispatcher.enqueue.call_args[0][0]
        self.assertEqual(payload["workload_name"], "etl_batch_processing")
        self.assertEqual(payload["workload_category"], "ETL Pipelines")
        self.assertEqual(payload["department"], "Data Eng")

    @patch("ecocode.dispatcher.requests.post")
    def test_ecocode_client_manual_record_and_dispatch(self, mock_post: MagicMock) -> None:
        mock_post.return_value.status_code = 201

        client = EcoCodeClient(api_key="eco_live_manualtest", api_url="http://localhost:8000")
        client.record_event(
            workload_name="custom_workload",
            category="Algorithms",
            department="DevOps",
            execution_time_sec=1.5,
            cpu_power_watt=65.0,
            energy_consumed_kwh=0.000027,
            co2_emitted_grams=0.0128,
            ram_usage_mb=128.5
        )

        client.flush()

        mock_post.assert_called()
        call_kwargs = mock_post.call_args[1]
        sent_json = call_kwargs["json"]
        self.assertEqual(sent_json[0]["workload_name"], "custom_workload")
        self.assertEqual(sent_json[0]["co2_emitted_grams"], 0.0128)


if __name__ == "__main__":
    unittest.main()
