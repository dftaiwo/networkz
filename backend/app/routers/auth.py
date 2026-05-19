import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import get_db
from app.deps import get_current_user
from app.email import send_magic_link
from app.models import MagicLinkToken, Profile, User
from app.schemas import (
    LoginRequest,
    MagicLinkConsume,
    MagicLinkRequest,
    MeResponse,
    SetPasswordRequest,
    SignupRequest,
    TokenResponse,
)
from app.security import (
    create_jwt,
    hash_password,
    hash_token,
    make_token,
    verify_password,
)

settings = get_settings()
logger = logging.getLogger("networkz.auth")
router = APIRouter(prefix="/auth", tags=["auth"])


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _is_admin_email(email: str) -> bool:
    return email in settings.admin_emails_list


def _issue_magic_link(db: Session, user: User, purpose: str) -> str:
    raw = make_token()
    record = MagicLinkToken(
        user_id=user.id,
        token_hash=hash_token(raw),
        purpose=purpose,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.magic_link_ttl_minutes),
    )
    db.add(record)
    db.commit()
    return raw


def _send_link_safely(email: str, raw_token: str, purpose: str) -> None:
    """Send the link as a background task; swallow errors but always log."""
    import asyncio

    try:
        asyncio.run(send_magic_link(email=email, raw_token=raw_token, purpose=purpose))
    except Exception:
        logger.exception("Magic-link delivery failed (email=%s purpose=%s). Link: %s", email, purpose, raw_token)


@router.post("/signup", status_code=status.HTTP_204_NO_CONTENT)
def signup(
    payload: SignupRequest,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    email = _normalize_email(payload.email)
    user = db.query(User).filter(User.email == email).one_or_none()
    if user is None:
        user = User(email=email, is_admin=_is_admin_email(email))
        db.add(user)
        db.commit()
        db.refresh(user)
    elif _is_admin_email(email) and not user.is_admin:
        user.is_admin = True
        db.commit()

    purpose = "login" if user.email_verified_at else "signup"
    raw = _issue_magic_link(db, user, purpose)
    background.add_task(_send_link_safely, email, raw, purpose)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/magic-link/request", status_code=status.HTTP_204_NO_CONTENT)
def request_magic_link(
    payload: MagicLinkRequest,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    email = _normalize_email(payload.email)
    user = db.query(User).filter(User.email == email).one_or_none()
    # Always 204 to avoid leaking whether the account exists.
    if user is not None:
        purpose = "login" if user.email_verified_at else "signup"
        raw = _issue_magic_link(db, user, purpose)
        background.add_task(_send_link_safely, email, raw, purpose)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/magic-link/consume", response_model=TokenResponse)
def consume_magic_link(payload: MagicLinkConsume, db: Session = Depends(get_db)):
    token_hash = hash_token(payload.token)
    record = (
        db.query(MagicLinkToken)
        .filter(MagicLinkToken.token_hash == token_hash)
        .one_or_none()
    )
    if record is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid link")
    if record.consumed_at is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This link has already been used")

    expires_at = record.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This link has expired")

    user = db.query(User).filter(User.id == record.user_id).one()
    record.consumed_at = datetime.now(timezone.utc)
    if user.email_verified_at is None:
        user.email_verified_at = datetime.now(timezone.utc)
    if _is_admin_email(user.email) and not user.is_admin:
        user.is_admin = True
    # Ensure a profile row exists (empty) so /profiles/me always returns one.
    if user.profile is None:
        db.add(Profile(user_id=user.id))
    db.commit()
    db.refresh(user)

    token = create_jwt(user_id=user.id, email=user.email, is_admin=user.is_admin)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login_with_password(payload: LoginRequest, db: Session = Depends(get_db)):
    email = _normalize_email(payload.email)
    user = db.query(User).filter(User.email == email).one_or_none()
    if user is None or not verify_password(payload.password, user.password_hash or ""):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if user.email_verified_at is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not yet verified — sign in with a magic link first",
        )
    token = create_jwt(user_id=user.id, email=user.email, is_admin=user.is_admin)
    return TokenResponse(access_token=token)


@router.post("/password", status_code=status.HTTP_204_NO_CONTENT)
def set_password(
    payload: SetPasswordRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user.password_hash = hash_password(payload.password)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=MeResponse)
def me(user: User = Depends(get_current_user)):
    profile = user.profile
    complete = bool(
        profile
        and profile.startup_name
        and profile.founder_name
        and profile.country
        and profile.cohort_year
        and profile.industry
    )
    return MeResponse(
        id=user.id,
        email=user.email,
        is_admin=user.is_admin,
        has_password=bool(user.password_hash),
        email_verified=user.email_verified_at is not None,
        profile_complete=complete,
    )
