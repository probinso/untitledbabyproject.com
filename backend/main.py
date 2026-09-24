import asyncio
import json

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel

from blobstore import BlobStore, InMemoryBlobStore

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Submission(BaseModel):
    """Anything a visitor sends in carries the token identifying who they are.

    The token is computed client-side (see frontend/src/identity.ts) — the
    backend never sees or handles the raw identity itself.
    """

    token: str


class Entry(BaseModel):
    """Anything stored carries the token of who submitted it."""

    token: str


class GuestbookSubmission(Submission):
    name: str
    message: str


class GuestbookEntry(Entry):
    name: str
    message: str


entries_by_token: dict[str, GuestbookEntry] = {}


@app.get("/guestbook")
def get_entry(token: str) -> GuestbookEntry | None:
    return entries_by_token.get(token)


@app.post("/guestbook")
def submit_entry(submission: GuestbookSubmission) -> GuestbookEntry:
    entry = GuestbookEntry(
        token=submission.token,
        name=submission.name,
        message=submission.message,
    )
    entries_by_token[entry.token] = entry
    return entry


class NameSubmission(Submission):
    name: str


class NameTally(BaseModel):
    name: str
    count: int


votes_by_name: dict[str, set[str]] = {}
name_order: list[str] = []
subscribers: list[asyncio.Queue] = []


def current_tallies() -> list[NameTally]:
    return [NameTally(name=name, count=len(votes_by_name[name])) for name in reversed(name_order)]


def tallies_json() -> str:
    return json.dumps([tally.model_dump() for tally in current_tallies()])


async def broadcast_tallies() -> None:
    payload = tallies_json()
    for queue in subscribers:
        await queue.put(payload)


@app.get("/names")
def list_names() -> list[NameTally]:
    return current_tallies()


@app.post("/names")
async def submit_name(submission: NameSubmission) -> NameTally:
    tokens = votes_by_name.setdefault(submission.name, set())

    # The token is an idempotency key: a repeat vote is dropped before it
    # touches anything, so it doesn't bump the name to "most recent" either.
    if submission.token in tokens:
        return NameTally(name=submission.name, count=len(tokens))

    tokens.add(submission.token)
    if submission.name in name_order:
        name_order.remove(submission.name)
    name_order.append(submission.name)

    await broadcast_tallies()
    return NameTally(name=submission.name, count=len(tokens))


@app.get("/names/stream")
async def stream_names(request: Request) -> StreamingResponse:
    queue: asyncio.Queue = asyncio.Queue()
    subscribers.append(queue)

    async def event_stream():
        try:
            yield f"data: {tallies_json()}\n\n"
            while not await request.is_disconnected():
                try:
                    payload = await asyncio.wait_for(queue.get(), timeout=15)
                except asyncio.TimeoutError:
                    continue
                yield f"data: {payload}\n\n"
        finally:
            subscribers.remove(queue)

    return StreamingResponse(event_stream(), media_type="text/event-stream")


class VideoEntry(Entry):
    category: str
    digest: str


videos_by_token: dict[str, dict[str, VideoEntry]] = {}
video_blobs: BlobStore = InMemoryBlobStore()


@app.get("/videos")
def get_video(token: str, category: str) -> VideoEntry | None:
    return videos_by_token.get(token, {}).get(category)


@app.post("/videos")
async def submit_video(
    token: str = Form(...),
    category: str = Form(...),
    digest: str = Form(...),
    video: UploadFile = File(...),
) -> VideoEntry:
    # The digest is client-computed and trusted as-is (no re-hash check),
    # matching the no-validation stance the rest of this API already takes.
    content_type = video.content_type or "application/octet-stream"
    video_blobs.put(digest, await video.read(), content_type)

    entry = VideoEntry(token=token, category=category, digest=digest)
    videos_by_token.setdefault(entry.token, {})[category] = entry
    return entry


@app.get("/videos/blob/{digest}")
def get_video_blob(digest: str) -> Response:
    blob = video_blobs.get(digest)
    if blob is None:
        raise HTTPException(status_code=404)
    data, content_type = blob
    return Response(content=data, media_type=content_type)
