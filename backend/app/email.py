import logging
import re
from pathlib import Path

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

from app.config import get_settings

settings = get_settings()
logger = logging.getLogger("networkz.email")

TEMPLATES_DIR = Path(__file__).parent / "email_templates"


def _parse_from(value: str) -> tuple[str, str]:
    # Accepts "Display Name <user@host>" or "user@host"
    m = re.match(r"^\s*(?P<name>.*?)\s*<(?P<addr>[^>]+)>\s*$", value)
    if m:
        return m.group("name") or "NetworkZ", m.group("addr")
    return "NetworkZ", value.strip()


_from_name, _from_addr = _parse_from(settings.smtp_from)

_conf = ConnectionConfig(
    MAIL_USERNAME=settings.smtp_user or "noreply",
    MAIL_PASSWORD=settings.smtp_password or "",
    MAIL_FROM=_from_addr,
    MAIL_FROM_NAME=_from_name,
    MAIL_PORT=settings.smtp_port,
    MAIL_SERVER=settings.smtp_host,
    MAIL_STARTTLS=settings.smtp_tls,
    MAIL_SSL_TLS=settings.smtp_ssl,
    USE_CREDENTIALS=bool(settings.smtp_user),
    VALIDATE_CERTS=False,
    TEMPLATE_FOLDER=str(TEMPLATES_DIR),
)

_mailer = FastMail(_conf)


def _build_link(token: str) -> str:
    base = settings.frontend_url.rstrip("/")
    return f"{base}/auth/callback?token={token}"


async def send_magic_link(*, email: str, raw_token: str, purpose: str) -> None:
    link = _build_link(raw_token)
    is_signup = purpose == "signup"
    subject = "Welcome to NetworkZ — finish signing up" if is_signup else "Your NetworkZ sign-in link"
    template = "welcome.html" if is_signup else "signin.html"

    body_ctx = {
        "link": link,
        "minutes": settings.magic_link_ttl_minutes,
    }
    message = MessageSchema(
        subject=subject,
        recipients=[email],
        template_body=body_ctx,
        subtype=MessageType.html,
    )
    try:
        await _mailer.send_message(message, template_name=template)
        logger.info("Sent %s magic link to %s", purpose, email)
    except Exception:
        logger.exception("Failed sending magic link to %s; link=%s", email, link)
        raise
