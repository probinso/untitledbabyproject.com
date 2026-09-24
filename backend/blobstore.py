from typing import Protocol


class BlobStore(Protocol):
    def put(self, digest: str, data: bytes, content_type: str) -> None: ...
    def get(self, digest: str) -> tuple[bytes, str] | None: ...


class InMemoryBlobStore:
    """Placeholder for a real flat-file or object store, indexed by content digest."""

    def __init__(self) -> None:
        self._blobs: dict[str, tuple[bytes, str]] = {}

    def put(self, digest: str, data: bytes, content_type: str) -> None:
        self._blobs[digest] = (data, content_type)

    def get(self, digest: str) -> tuple[bytes, str] | None:
        return self._blobs.get(digest)
