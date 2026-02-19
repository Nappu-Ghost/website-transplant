from __future__ import annotations

import re
import secrets
from pathlib import Path
from typing import Optional, Tuple

from fastapi import HTTPException, UploadFile, status

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}

MAX_IMAGE_BYTES = 5 * 1024 * 1024  


def _backend_root_dir() -> Path:
    return Path(__file__).resolve().parents[2]


def uploads_root_dir() -> Path:
    return _backend_root_dir() / "instance" / "uploads"


_filename_safe_re = re.compile(r"[^a-zA-Z0-9._-]+")


def _safe_filename(name: str) -> str:
    name = name.strip().replace(" ", "_")
    name = _filename_safe_re.sub("_", name)
    if not name or name in {".", ".."}:
        name = "image"
    return name[:100]


async def validate_and_read_image(file: UploadFile) -> Tuple[bytes, str]:
    """Return (bytes, extension) after validating type and size."""
    if not file or not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file provided")

    content_type = (file.content_type or "").lower().strip()
    if content_type not in ALLOWED_CONTENT_TYPES:
        allowed = ", ".join(sorted(ALLOWED_CONTENT_TYPES.keys()))
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type. Allowed: {allowed}",
        )

    data = await file.read()
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty upload")
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image too large. Max allowed: {MAX_IMAGE_BYTES} bytes",
        )

    if content_type == "image/jpeg" and not (data.startswith(b"\xff\xd8\xff")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JPEG file")
    if content_type == "image/png" and not data.startswith(b"\x89PNG\r\n\x1a\n"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid PNG file")
    if content_type == "image/gif" and not (data.startswith(b"GIF87a") or data.startswith(b"GIF89a")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid GIF file")
    if content_type == "image/webp":
        if not (data.startswith(b"RIFF") and b"WEBP" in data[:16]):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid WEBP file")

    return data, ALLOWED_CONTENT_TYPES[content_type]


def save_entity_image(entity: str, entity_id: int, original_name: str, data: bytes, ext: str) -> str:
    entity = entity.lower().strip()
    if entity not in {"hotels", "rooms", "activities"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid entity type")

    base_dir = uploads_root_dir() / entity / str(entity_id)
    base_dir.mkdir(parents=True, exist_ok=True)

    safe = _safe_filename(Path(original_name).stem)
    token = secrets.token_urlsafe(8)
    filename = f"{safe}-{token}{ext}"
    path = base_dir / filename
    path.write_bytes(data)

    return f"/uploads/{entity}/{entity_id}/{filename}"


def delete_uploaded_file_if_managed(image_url: Optional[str]) -> None:
    if not image_url:
        return
    if not image_url.startswith("/uploads/"):
        return

    rel = image_url.lstrip("/")
    file_path = _backend_root_dir() / rel
    try:
        if file_path.exists() and file_path.is_file():
            file_path.unlink()
            parent = file_path.parent
            for _ in range(3):
                if parent == uploads_root_dir():
                    break
                try:
                    parent.rmdir()
                except OSError:
                    break
                parent = parent.parent
    except Exception:
        return
