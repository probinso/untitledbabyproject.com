"""Simulates real traffic on the Baby Names page: each simulated user holds
the /names/stream connection open for its whole lifetime (like a browser tab
left on the page) while separately submitting names on its own schedule —
same as a real visitor would.

Setup (locust isn't a project dependency, just a dev tool):
    uv run --with locust locust -f loadtest.py --host http://localhost:8000

Then open http://localhost:8089, set "Number of users" to 100, ramp up at
~10/s, and start. Watch for: failures on /names/stream (connections being
rejected/dropped) and rising response times on /names as load increases.
"""

import uuid

import gevent
from locust import HttpUser, between, task


class VisitorUser(HttpUser):
    wait_time = between(2, 6)

    def on_start(self):
        self.token = uuid.uuid4().hex
        # Runs in the background for this user's whole lifetime, independent
        # of the @task loop below — this is what actually holds 100
        # connections open at once, not just 100 requests in sequence.
        self._stream_greenlet = gevent.spawn(self._watch_stream)

    def on_stop(self):
        self._stream_greenlet.kill(block=False)

    def _watch_stream(self):
        with self.client.get("/names/stream", stream=True, name="/names/stream") as resp:
            for _ in resp.iter_lines():
                pass  # just stay connected and receive broadcasts

    @task
    def submit_name(self):
        self.client.post("/names", json={"token": self.token, "name": "loadtest"})
