import io
import logging
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from PIL import Image, UnidentifiedImageError

from app.config import get_settings
from app.deps import get_current_user
from app.models import User
from app.schemas import UploadResponse

settings = get_settings()
logger = logging.getLogger("networkz.uploads")
router = APIRouter(prefix="/uploads", tags=["uploads"])

MAX_BYTES = 2 * 1024 * 1024  # 2 MB
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_DIMENSION = 512


@router.post("/logo", response_model=UploadResponse)
async def upload_logo(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only JPG, PNG or WebP allowed")

    body = await file.read(MAX_BYTES + 1)
    if len(body) > MAX_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large (max 2 MB)")

    try:
        img = Image.open(io.BytesIO(body))
        img.load()
    except (UnidentifiedImageError, OSError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not a valid image")

    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA" if "A" in img.mode else "RGB")
    img.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.Resampling.LANCZOS)

    user_dir = Path(settings.upload_dir) / str(user.id)
    user_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.webp"
    out_path = user_dir / filename
    try:
        img.save(out_path, format="WEBP", quality=90, method=6)
    except Exception:
        logger.exception("Failed saving logo to %s", out_path)
        raise HTTPException(status_code=500, detail="Upload failed")

    rel_path = f"/uploads/{user.id}/{filename}"
    return UploadResponse(path=rel_path)
