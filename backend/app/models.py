from datetime import datetime
from sqlalchemy import (
    BigInteger,
    Boolean,
    CHAR,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    SmallInteger,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from app.db import Base

# SQLite needs INTEGER for autoincrement primary keys; MySQL uses BIGINT.
PK = BigInteger().with_variant(Integer(), "sqlite")
FK = BigInteger().with_variant(Integer(), "sqlite")


class User(Base):
    __tablename__ = "users"

    id = Column(PK, primary_key=True, autoincrement=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=True)
    is_admin = Column(Boolean, nullable=False, default=False)
    email_verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    tokens = relationship("MagicLinkToken", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(PK, primary_key=True, autoincrement=True)
    user_id = Column(FK, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    founder_name = Column(String(120), nullable=False, default="")
    startup_name = Column(String(160), nullable=False, default="")
    tagline = Column(String(280), nullable=True)
    website = Column(String(255), nullable=True)
    country = Column(CHAR(2), nullable=False, default="")
    cohort_year = Column(SmallInteger, nullable=False, default=0)
    industry = Column(String(64), nullable=False, default="")
    linkedin_url = Column(String(255), nullable=True)
    twitter_url = Column(String(255), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(40), nullable=True)
    logo_path = Column(String(255), nullable=True)
    is_hidden = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="profile")

    __table_args__ = (
        Index("ix_profiles_country", "country"),
        Index("ix_profiles_cohort_year", "cohort_year"),
        Index("ix_profiles_industry", "industry"),
    )


class MagicLinkToken(Base):
    __tablename__ = "magic_link_tokens"

    id = Column(PK, primary_key=True, autoincrement=True)
    user_id = Column(FK, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(CHAR(64), nullable=False, index=True)
    purpose = Column(Enum("signup", "login", name="magic_link_purpose"), nullable=False)
    expires_at = Column(DateTime, nullable=False, index=True)
    consumed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="tokens")
