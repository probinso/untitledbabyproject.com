import json

import httpx
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse, Response, StreamingResponse
from pydantic import BaseModel

import spotify
from blobstore import BlobStore, InMemoryBlobStore
from broadcaster import Broadcaster

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_token(x_identity_token: str = Header(...)) -> str:
    """Every request that identifies its caller does so the same way: an
    X-Identity-Token header, computed client-side (see
    frontend/src/identity.ts) — the backend never sees the raw identity.
    """
    return x_identity_token


class Entry(BaseModel):
    """Anything stored carries the token of who submitted it."""

    token: str


class GuestbookSubmission(BaseModel):
    name: str
    message: str


class GuestbookEntry(Entry):
    name: str
    message: str


entries_by_token: dict[str, GuestbookEntry] = {}


@app.get("/guestbook")
def get_entry(token: str = Depends(get_token)) -> GuestbookEntry | None:
    return entries_by_token.get(token)


@app.post("/guestbook")
def submit_entry(submission: GuestbookSubmission, token: str = Depends(get_token)) -> GuestbookEntry:
    entry = GuestbookEntry(token=token, name=submission.name, message=submission.message)
    entries_by_token[entry.token] = entry
    return entry


class NameSubmission(BaseModel):
    name: str


class NameTally(BaseModel):
    name: str
    count: int


votes_by_name: dict[str, set[str]] = {}
name_order: list[str] = []


def current_tallies() -> list[NameTally]:
    return [NameTally(name=name, count=len(votes_by_name[name])) for name in reversed(name_order)]


def tallies_json() -> str:
    return json.dumps([tally.model_dump() for tally in current_tallies()])


names_feed = Broadcaster(tallies_json)


@app.get("/names")
def list_names() -> list[NameTally]:
    return current_tallies()


@app.post("/names")
async def submit_name(submission: NameSubmission, token: str = Depends(get_token)) -> NameTally:
    tokens = votes_by_name.setdefault(submission.name, set())

    # The token is an idempotency key: a repeat vote is dropped before it
    # touches anything, so it doesn't bump the name to "most recent" either.
    if token in tokens:
        return NameTally(name=submission.name, count=len(tokens))

    tokens.add(token)
    if submission.name in name_order:
        name_order.remove(submission.name)
    name_order.append(submission.name)

    await names_feed.broadcast()
    return NameTally(name=submission.name, count=len(tokens))


@app.get("/names/stream")
async def stream_names(request: Request) -> StreamingResponse:
    return await names_feed.stream(request)


class VideoEntry(Entry):
    category: str
    digest: str


videos_by_token: dict[str, dict[str, VideoEntry]] = {}
video_blobs: BlobStore = InMemoryBlobStore()


@app.get("/videos")
def get_video(category: str, token: str = Depends(get_token)) -> VideoEntry | None:
    return videos_by_token.get(token, {}).get(category)


@app.post("/videos")
async def submit_video(
    category: str = Form(...),
    digest: str = Form(...),
    video: UploadFile = File(...),
    token: str = Depends(get_token),
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


class LullabySubmission(BaseModel):
    uri: str
    title: str
    artist: str


class LullabyTally(BaseModel):
    uri: str
    title: str
    artist: str
    count: int


lullabies_by_uri: dict[str, LullabySubmission] = {}
votes_by_lullaby: dict[str, set[str]] = {}
lullaby_order: list[str] = []


def current_lullabies() -> list[LullabyTally]:
    return [
        LullabyTally(
            uri=uri,
            title=lullabies_by_uri[uri].title,
            artist=lullabies_by_uri[uri].artist,
            count=len(votes_by_lullaby[uri]),
        )
        for uri in reversed(lullaby_order)
    ]


def lullabies_json() -> str:
    return json.dumps([tally.model_dump() for tally in current_lullabies()])


lullabies_feed = Broadcaster(lullabies_json)


@app.get("/lullabies")
def list_lullabies() -> list[LullabyTally]:
    return current_lullabies()


@app.get("/lullabies/playlist")
def get_lullaby_playlist() -> dict[str, str | None]:
    """The playlist ID isn't secret (it's meant to be shared as a link) —
    unlike the client secret/refresh token, it's fine to hand back as-is."""
    url = f"https://open.spotify.com/playlist/{spotify.PLAYLIST_ID}" if spotify.PLAYLIST_ID else None
    return {"url": url}


@app.get("/lullabies/search")
async def search_lullabies(q: str) -> list[dict]:
    if not q.strip():
        return []
    # Falling back to a stub list when Spotify isn't configured yet lives
    # inside spotify.search itself, same as spotify.add_track absorbing the
    # stub case below — this endpoint doesn't need to know which happened.
    return await spotify.search(q)


@app.post("/lullabies")
async def submit_lullaby(submission: LullabySubmission, token: str = Depends(get_token)) -> LullabyTally:
    votes = votes_by_lullaby.setdefault(submission.uri, set())

    # The token is an idempotency key, same as /names: a repeat suggestion
    # from the same visitor doesn't add the track to Spotify again or bump
    # its position, it just no-ops back to the current tally.
    if token not in votes:
        if submission.uri not in lullabies_by_uri:
            try:
                await spotify.add_track(submission.uri)
            except (spotify.SpotifyNotConfigured, spotify.SpotifyNotAuthorized) as exc:
                raise HTTPException(status_code=503, detail=str(exc)) from exc
            except httpx.HTTPStatusError as exc:
                raise HTTPException(status_code=502, detail="Spotify rejected the track") from exc

        votes.add(token)
        lullabies_by_uri[submission.uri] = submission
        if submission.uri in lullaby_order:
            lullaby_order.remove(submission.uri)
        lullaby_order.append(submission.uri)

        await lullabies_feed.broadcast()

    entry = lullabies_by_uri[submission.uri]
    return LullabyTally(uri=entry.uri, title=entry.title, artist=entry.artist, count=len(votes))


@app.get("/lullabies/stream")
async def stream_lullabies(request: Request) -> StreamingResponse:
    return await lullabies_feed.stream(request)


@app.get("/spotify/authorize")
def spotify_authorize() -> RedirectResponse:
    """One-time setup: whoever owns the target playlist visits this to grant
    this app permission to add tracks to it. Not part of the regular visitor
    flow — nothing links to it from the app itself."""
    return RedirectResponse(spotify.authorize_url(state="untitledbaby"))


@app.get("/spotify/callback")
async def spotify_callback(code: str) -> HTMLResponse:
    await spotify.exchange_code(code)
    return HTMLResponse("<p>Spotify authorized. You can close this tab.</p>")
