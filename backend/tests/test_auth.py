from datetime import datetime, timedelta, timezone

from app.db import SessionLocal
from app.models import MagicLinkToken, User
from app.security import hash_token


def _signup_and_consume(client, capture_tokens, email):
    r = client.post("/api/auth/signup", json={"email": email})
    assert r.status_code == 204
    raw = capture_tokens[email]
    r = client.post("/api/auth/magic-link/consume", json={"token": raw})
    assert r.status_code == 200
    return r.json()["access_token"]


def test_signup_emits_magic_link_and_creates_user(client, capture_tokens):
    r = client.post("/api/auth/signup", json={"email": "alice@example.com"})
    assert r.status_code == 204
    assert "alice@example.com" in capture_tokens

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "alice@example.com").one()
        assert user.email_verified_at is None
        token = db.query(MagicLinkToken).filter(MagicLinkToken.user_id == user.id).one()
        assert token.purpose == "signup"
        assert token.token_hash == hash_token(capture_tokens["alice@example.com"])
    finally:
        db.close()


def test_magic_link_consume_returns_jwt_and_verifies_email(client, capture_tokens):
    token = _signup_and_consume(client, capture_tokens, "bob@example.com")
    assert token

    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    body = r.json()
    assert body["email"] == "bob@example.com"
    assert body["email_verified"] is True
    assert body["has_password"] is False
    assert body["profile_complete"] is False


def test_magic_link_cannot_be_reused(client, capture_tokens):
    client.post("/api/auth/signup", json={"email": "carol@example.com"})
    raw = capture_tokens["carol@example.com"]
    r1 = client.post("/api/auth/magic-link/consume", json={"token": raw})
    assert r1.status_code == 200
    r2 = client.post("/api/auth/magic-link/consume", json={"token": raw})
    assert r2.status_code == 400
    assert "already been used" in r2.json()["detail"].lower()


def test_expired_magic_link_rejected(client, capture_tokens):
    client.post("/api/auth/signup", json={"email": "dan@example.com"})
    raw = capture_tokens["dan@example.com"]
    db = SessionLocal()
    try:
        rec = db.query(MagicLinkToken).filter(MagicLinkToken.token_hash == hash_token(raw)).one()
        rec.expires_at = datetime.now(timezone.utc) - timedelta(minutes=1)
        db.commit()
    finally:
        db.close()
    r = client.post("/api/auth/magic-link/consume", json={"token": raw})
    assert r.status_code == 400
    assert "expired" in r.json()["detail"].lower()


def test_set_password_and_login(client, capture_tokens):
    token = _signup_and_consume(client, capture_tokens, "eve@example.com")
    r = client.post(
        "/api/auth/password",
        json={"password": "supersecret123"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 204

    r = client.post("/api/auth/login", json={"email": "eve@example.com", "password": "supersecret123"})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_password_login_fails_with_wrong_password(client, capture_tokens):
    token = _signup_and_consume(client, capture_tokens, "frank@example.com")
    client.post(
        "/api/auth/password",
        json={"password": "abc12345"},
        headers={"Authorization": f"Bearer {token}"},
    )
    r = client.post("/api/auth/login", json={"email": "frank@example.com", "password": "wrong"})
    assert r.status_code == 401


def test_password_login_blocked_before_verification(client, capture_tokens):
    client.post("/api/auth/signup", json={"email": "gina@example.com"})
    # Set password without consuming the link first — but you can't, since /password needs auth.
    # Instead: directly insert a password and try password login.
    db = SessionLocal()
    try:
        u = db.query(User).filter(User.email == "gina@example.com").one()
        from app.security import hash_password

        u.password_hash = hash_password("hello1234")
        db.commit()
    finally:
        db.close()
    r = client.post("/api/auth/login", json={"email": "gina@example.com", "password": "hello1234"})
    assert r.status_code == 403


def test_magic_link_request_does_not_leak_account_existence(client, capture_tokens):
    r = client.post("/api/auth/magic-link/request", json={"email": "ghost@example.com"})
    assert r.status_code == 204
    assert "ghost@example.com" not in capture_tokens


def test_admin_email_auto_promoted_on_signup(client, capture_tokens):
    token = _signup_and_consume(client, capture_tokens, "admin@example.com")
    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.json()["is_admin"] is True
