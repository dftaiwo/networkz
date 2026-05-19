import os
import tempfile

import pytest

# Configure environment BEFORE importing app modules so settings pick it up.
# We force-set (not setdefault) so the test environment is deterministic even
# when the host or container has different values in .env.
_TMP_DIR = tempfile.mkdtemp(prefix="networkz-test-")
os.environ["DATABASE_URL"] = "sqlite:///./_pytest_networkz.db"
os.environ["UPLOAD_DIR"] = _TMP_DIR
os.environ["JWT_SECRET"] = "test-secret-32-bytes-XXXXXXXXXXXXX"
os.environ["ADMIN_EMAILS"] = "admin@example.com"
os.environ["FRONTEND_URL"] = "http://localhost:5173"
os.environ["SMTP_HOST"] = "localhost"
os.environ["SMTP_PORT"] = "1025"

from fastapi.testclient import TestClient  # noqa: E402

from app.config import get_settings  # noqa: E402

# Refresh cached settings to pick up env overrides above
get_settings.cache_clear()

from app.db import Base, SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402
from app import routers  # noqa: E402,F401 — ensure routers are loaded
from app.models import MagicLinkToken, Profile, User  # noqa: E402


@pytest.fixture(autouse=True)
def _isolate_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db():
    s = SessionLocal()
    try:
        yield s
    finally:
        s.close()


@pytest.fixture
def no_email(monkeypatch):
    """Replace the background email send with a no-op so tests don't hit SMTP."""
    from app.routers import auth as auth_router

    monkeypatch.setattr(auth_router, "_send_link_safely", lambda *a, **kw: None)
    yield


def fetch_latest_raw_token(email: str, db) -> str:
    """Tests can't read raw tokens (only the hash is stored), so we monkey-patch the issuer.
    See `capture_tokens` fixture."""
    raise RuntimeError("use capture_tokens fixture")


@pytest.fixture
def capture_tokens(monkeypatch):
    """Intercept the magic-link issuer to expose raw tokens to the test."""
    bag = {}
    from app.routers import auth as auth_router

    original = auth_router._issue_magic_link

    def wrapper(db, user, purpose):
        raw = original(db, user, purpose)
        bag[user.email] = raw
        return raw

    monkeypatch.setattr(auth_router, "_issue_magic_link", wrapper)
    monkeypatch.setattr(auth_router, "_send_link_safely", lambda *a, **kw: None)
    return bag
