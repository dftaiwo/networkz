"""Idempotent seed: promote admin emails. Industries are a constant in code."""
import logging

from app.config import get_settings
from app.db import SessionLocal
from app.models import User

logger = logging.getLogger("networkz.seed")
logging.basicConfig(level=logging.INFO)


def main() -> None:
    settings = get_settings()
    if not settings.admin_emails_list:
        logger.info("No ADMIN_EMAILS set; skipping admin seed.")
        return
    db = SessionLocal()
    try:
        for email in settings.admin_emails_list:
            user = db.query(User).filter(User.email == email).one_or_none()
            if user is None:
                logger.info("Admin email %s not registered yet — will be promoted on first signup.", email)
                continue
            if not user.is_admin:
                user.is_admin = True
                logger.info("Promoted %s to admin.", email)
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    main()
