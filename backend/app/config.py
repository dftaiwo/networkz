from functools import lru_cache
from typing import List
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

    app_env: str = "dev"
    database_url: str = "mysql+pymysql://networkz:networkz@mysql:3306/networkz"
    test_database_url: str = "sqlite:///./test.db"

    jwt_secret: str = "please-change-me"
    jwt_ttl_days: int = 7

    frontend_url: str = "http://localhost:5173"
    backend_cors_origins: str = "http://localhost:5173"

    smtp_host: str = "mailhog"
    smtp_port: int = 1025
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "NetworkZ <no-reply@networkz.dev>"
    smtp_tls: bool = False
    smtp_ssl: bool = False

    admin_emails: str = ""
    upload_dir: str = "/data/uploads"
    magic_link_ttl_minutes: int = 15

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.backend_cors_origins.split(",") if o.strip()]

    @property
    def admin_emails_list(self) -> List[str]:
        return [e.strip().lower() for e in self.admin_emails.split(",") if e.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
