import atexit
import json
import logging
import queue
import threading
import time
from typing import List, Dict, Any, Optional

import requests

from ecocode.config import get_config

logger = logging.getLogger("ecocode")


class TelemetryDispatcher:
    """
    Asynchronous, non-blocking background telemetry dispatcher.
    Buffers telemetry payloads in an in-memory queue and flushes them
    via HTTP POST requests to the EcoCode API server in a worker thread.
    """

    def __init__(self) -> None:
        self._queue: queue.Queue[Dict[str, Any]] = queue.Queue(maxsize=10000)
        self._shutdown_event = threading.Event()
        self._worker_thread: Optional[threading.Thread] = None
        self._started = False
        self._lock = threading.Lock()

        # Register process exit hook to flush pending metrics cleanly
        atexit.register(self.shutdown)

    def _ensure_started(self) -> None:
        """Starts the daemon worker thread if not already running."""
        with self._lock:
            if not self._started:
                self._shutdown_event.clear()
                self._worker_thread = threading.Thread(
                    target=self._worker_loop,
                    name="EcoCodeTelemetryWorker",
                    daemon=True
                )
                self._worker_thread.start()
                self._started = True

    def enqueue(self, payload: Dict[str, Any]) -> None:
        """
        Enqueues a telemetry payload for background dispatch.
        Non-blocking: drops event with a warning if the queue is full.
        """
        cfg = get_config()
        if not cfg.enabled:
            return

        self._ensure_started()
        try:
            self._queue.put_nowait(payload)
        except queue.Full:
            logger.warning("[EcoCode SDK] Telemetry queue full (10,000 items). Dropping log event.")

    def flush(self) -> None:
        """Manually triggers a flush of all currently queued telemetry events."""
        items: List[Dict[str, Any]] = []
        while not self._queue.empty():
            try:
                items.append(self._queue.get_nowait())
                self._queue.task_done()
            except queue.Empty:
                break

        if items:
            self._send_batch(items)

    def _send_batch(self, items: List[Dict[str, Any]]) -> None:
        """Performs synchronous HTTP POST dispatch of a telemetry payload batch."""
        if not items:
            return

        cfg = get_config()
        if not cfg.api_key:
            logger.warning("[EcoCode SDK] Missing API Key. Set ECOCODE_API_KEY env var or call init_tracker(api_key=...).")
            return

        url = f"{cfg.api_url}/api/v1/telemetry/ingest"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {cfg.api_key}"
        }

        try:
            response = requests.post(url, json=items, headers=headers, timeout=5.0)
            if response.status_code not in (200, 201):
                logger.warning(
                    f"[EcoCode SDK] Failed to ingest {len(items)} telemetry logs. "
                    f"HTTP {response.status_code}: {response.text[:200]}"
                )
        except requests.RequestException as e:
            logger.warning(f"[EcoCode SDK] Telemetry API unreachable ({url}): {e}")
        except Exception as e:
            logger.warning(f"[EcoCode SDK] Unexpected error during telemetry dispatch: {e}")

    def _worker_loop(self) -> None:
        """Background worker thread loop batching and flushing telemetry logs."""
        last_flush_time = time.time()

        while not self._shutdown_event.is_set():
            cfg = get_config()
            batch: List[Dict[str, Any]] = []

            # Determine timeout until next scheduled flush
            time_since_flush = time.time() - last_flush_time
            timeout = max(cfg.flush_interval_sec - time_since_flush, 0.1)

            try:
                item = self._queue.get(timeout=timeout)
                batch.append(item)
                self._queue.task_done()

                # Gather additional items up to batch size
                while len(batch) < cfg.batch_size:
                    try:
                        next_item = self._queue.get_nowait()
                        batch.append(next_item)
                        self._queue.task_done()
                    except queue.Empty:
                        break

            except queue.Empty:
                pass

            # Flush batch if batch size reached or flush interval elapsed
            if batch or (time.time() - last_flush_time >= cfg.flush_interval_sec):
                if batch:
                    self._send_batch(batch)
                last_flush_time = time.time()

    def shutdown(self) -> None:
        """Shutdown hook flushing all pending events and joining the worker thread."""
        with self._lock:
            if not self._started:
                return
            self._shutdown_event.set()

        # Final flush of all remaining queued items
        self.flush()

        if self._worker_thread and self._worker_thread.is_alive():
            self._worker_thread.join(timeout=3.0)
        
        with self._lock:
            self._started = False


# Singleton Dispatcher Instance
_global_dispatcher = TelemetryDispatcher()


def get_dispatcher() -> TelemetryDispatcher:
    """Returns the global TelemetryDispatcher instance."""
    return _global_dispatcher
