import asyncio
from collections.abc import Callable

from fastapi import Request
from fastapi.responses import StreamingResponse


class Broadcaster:
    """Fan-out for one SSE feed: holds the live subscriber queues for a
    single /whatever/stream endpoint and knows how to push the current
    snapshot to all of them, and to a newly-connected one. Shared by every
    "live list, pushed to everyone on every change" feed (/names, /lullabies)
    so that plumbing exists once instead of once per feed.
    """

    def __init__(self, snapshot_json: Callable[[], str]) -> None:
        self._snapshot_json = snapshot_json
        self._subscribers: list[asyncio.Queue] = []

    async def broadcast(self) -> None:
        payload = self._snapshot_json()
        for queue in self._subscribers:
            await queue.put(payload)

    async def stream(self, request: Request) -> StreamingResponse:
        # No identity token on the request here: browsers' EventSource can't
        # send custom headers, and every feed using this is a public read
        # anyway — nothing about it is per-identity.
        queue: asyncio.Queue = asyncio.Queue()
        self._subscribers.append(queue)

        async def event_stream():
            try:
                yield f"data: {self._snapshot_json()}\n\n"
                while not await request.is_disconnected():
                    try:
                        payload = await asyncio.wait_for(queue.get(), timeout=15)
                    except asyncio.TimeoutError:
                        continue
                    yield f"data: {payload}\n\n"
            finally:
                self._subscribers.remove(queue)

        return StreamingResponse(event_stream(), media_type="text/event-stream")
