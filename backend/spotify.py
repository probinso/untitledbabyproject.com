"""Thin wrapper around the pieces of the Spotify Web API this app needs:
searching tracks (an app-only Client Credentials token, no user context) and
adding a track to one specific playlist (a real Spotify account's own
authorization, obtained once via /spotify/authorize and kept as a refresh
token).
"""

import base64
import os
import random
import time
from pathlib import Path

import httpx

CLIENT_ID = os.environ.get("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.environ.get("SPOTIFY_CLIENT_SECRET")
PLAYLIST_ID = os.environ.get("SPOTIFY_PLAYLIST_ID")
REDIRECT_URI = os.environ.get("SPOTIFY_REDIRECT_URI", "http://localhost:8000/spotify/callback")
SCOPE = "playlist-modify-public playlist-modify-private"

# Stands in for a real search/add whenever SPOTIFY_CLIENT_ID/SECRET aren't
# set yet, so the page works end-to-end during setup instead of the search
# box just going dead. "stub:"-prefixed URIs are the tell, checked by
# is_stub_uri, that a pick never touched the real Spotify API.
STUB_SONGS = [
    {"uri": "stub:1", "title": "Twinkle, Twinkle, Little Star", "artist": "Traditional", "albumArt": None},
    {"uri": "stub:2", "title": "Brahms' Lullaby", "artist": "Johannes Brahms", "albumArt": None},
    {"uri": "stub:3", "title": "Hush, Little Baby", "artist": "Traditional", "albumArt": None},
    {"uri": "stub:4", "title": "Rock-a-bye Baby", "artist": "Traditional", "albumArt": None},
    {"uri": "stub:5", "title": "You Are My Sunshine", "artist": "Jimmie Davis", "albumArt": None},
    {"uri": "stub:6", "title": "Golden Slumbers", "artist": "The Beatles", "albumArt": None},
    {"uri": "stub:7", "title": "Clair de Lune", "artist": "Claude Debussy", "albumArt": None},
    {"uri": "stub:8", "title": "Weightless", "artist": "Marconi Union", "albumArt": None},
    {"uri": "stub:9", "title": "Dream a Little Dream of Me", "artist": "Ella Fitzgerald", "albumArt": None},
    {"uri": "stub:10", "title": "The Blue Danube", "artist": "Johann Strauss II", "albumArt": None},
]

# The refresh token authorizes this app to edit one person's playlist — it's
# config handed to us once by whoever owns that playlist, not request data,
# so (unlike the rest of this app's in-memory state) it's kept on disk and
# gitignored rather than lost on every backend restart.
TOKEN_FILE = Path(__file__).parent / ".spotify_refresh_token"

_app_token: str | None = None
_app_token_expires_at: float = 0.0

_user_token: str | None = None
_user_token_expires_at: float = 0.0


class SpotifyNotConfigured(Exception):
    """SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET / SPOTIFY_PLAYLIST_ID missing."""


class SpotifyNotAuthorized(Exception):
    """No one has completed the /spotify/authorize flow yet."""


def _require_client_credentials() -> None:
    if not CLIENT_ID or not CLIENT_SECRET:
        raise SpotifyNotConfigured("SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET are not set")


def _basic_auth_header() -> dict[str, str]:
    raw = f"{CLIENT_ID}:{CLIENT_SECRET}".encode()
    return {"Authorization": f"Basic {base64.b64encode(raw).decode()}"}


def _read_refresh_token() -> str | None:
    if TOKEN_FILE.exists():
        return TOKEN_FILE.read_text().strip() or None
    return None


def _write_refresh_token(token: str) -> None:
    TOKEN_FILE.write_text(token)


def is_authorized() -> bool:
    return _read_refresh_token() is not None


def authorize_url(state: str) -> str:
    _require_client_credentials()
    params = httpx.QueryParams(
        {
            "client_id": CLIENT_ID,
            "response_type": "code",
            "redirect_uri": REDIRECT_URI,
            "scope": SCOPE,
            "state": state,
        }
    )
    return f"https://accounts.spotify.com/authorize?{params}"


async def exchange_code(code: str) -> None:
    """Trades a one-time auth code for a refresh token and persists it —
    called once, from /spotify/callback, by whoever owns the playlist."""
    _require_client_credentials()
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://accounts.spotify.com/api/token",
            headers=_basic_auth_header(),
            data={"grant_type": "authorization_code", "code": code, "redirect_uri": REDIRECT_URI},
        )
        response.raise_for_status()
        payload = response.json()

    _write_refresh_token(payload["refresh_token"])
    global _user_token, _user_token_expires_at
    _user_token = payload["access_token"]
    _user_token_expires_at = time.time() + payload["expires_in"] - 30


async def _get_app_token() -> str:
    """Client Credentials token: app-only, no user context, used for search."""
    global _app_token, _app_token_expires_at
    _require_client_credentials()

    if _app_token and time.time() < _app_token_expires_at:
        return _app_token

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://accounts.spotify.com/api/token",
            headers=_basic_auth_header(),
            data={"grant_type": "client_credentials"},
        )
        response.raise_for_status()
        payload = response.json()

    _app_token = payload["access_token"]
    _app_token_expires_at = time.time() + payload["expires_in"] - 30
    return _app_token


async def _get_user_token() -> str:
    """Access token for the authorized playlist owner, refreshed as needed."""
    global _user_token, _user_token_expires_at
    _require_client_credentials()

    if _user_token and time.time() < _user_token_expires_at:
        return _user_token

    refresh_token = _read_refresh_token()
    if not refresh_token:
        raise SpotifyNotAuthorized("No Spotify authorization on file — visit /spotify/authorize")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://accounts.spotify.com/api/token",
            headers=_basic_auth_header(),
            data={"grant_type": "refresh_token", "refresh_token": refresh_token},
        )
        response.raise_for_status()
        payload = response.json()

    _user_token = payload["access_token"]
    _user_token_expires_at = time.time() + payload["expires_in"] - 30
    # Spotify occasionally rotates the refresh token on use.
    if payload.get("refresh_token"):
        _write_refresh_token(payload["refresh_token"])
    return _user_token


async def search_tracks(query: str, limit: int = 8) -> list[dict]:
    token = await _get_app_token()
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.spotify.com/v1/search",
            headers={"Authorization": f"Bearer {token}"},
            params={"q": query, "type": "track", "limit": limit},
        )
        response.raise_for_status()
        payload = response.json()

    return [
        {
            "uri": track["uri"],
            "title": track["name"],
            "artist": ", ".join(artist["name"] for artist in track["artists"]),
            "albumArt": track["album"]["images"][-1]["url"] if track["album"]["images"] else None,
        }
        for track in payload["tracks"]["items"]
    ]


async def add_track(uri: str) -> None:
    if not PLAYLIST_ID:
        raise SpotifyNotConfigured("SPOTIFY_PLAYLIST_ID is not set")

    token = await _get_user_token()
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://api.spotify.com/v1/playlists/{PLAYLIST_ID}/tracks",
            headers={"Authorization": f"Bearer {token}"},
            json={"uris": [uri]},
        )
        response.raise_for_status()


def is_stub_uri(uri: str) -> bool:
    return uri.startswith("stub:")


def stub_search(query: str, limit: int = 8) -> list[dict]:
    q = query.lower()
    matches = [s for s in STUB_SONGS if q in s["title"].lower() or q in s["artist"].lower()]
    if not matches:
        matches = random.sample(STUB_SONGS, min(limit, len(STUB_SONGS)))
    return matches[:limit]
