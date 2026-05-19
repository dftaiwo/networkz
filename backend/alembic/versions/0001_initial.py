"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-05-19

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=True),
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("email_verified_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "profiles",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("founder_name", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("startup_name", sa.String(length=160), nullable=False, server_default=""),
        sa.Column("tagline", sa.String(length=280), nullable=True),
        sa.Column("website", sa.String(length=255), nullable=True),
        sa.Column("country", sa.CHAR(length=2), nullable=False, server_default=""),
        sa.Column("cohort_year", sa.SmallInteger(), nullable=False, server_default="0"),
        sa.Column("industry", sa.String(length=64), nullable=False, server_default=""),
        sa.Column("linkedin_url", sa.String(length=255), nullable=True),
        sa.Column("twitter_url", sa.String(length=255), nullable=True),
        sa.Column("contact_email", sa.String(length=255), nullable=True),
        sa.Column("contact_phone", sa.String(length=40), nullable=True),
        sa.Column("logo_path", sa.String(length=255), nullable=True),
        sa.Column("is_hidden", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", name="uq_profiles_user"),
    )
    op.create_index("ix_profiles_country", "profiles", ["country"])
    op.create_index("ix_profiles_cohort_year", "profiles", ["cohort_year"])
    op.create_index("ix_profiles_industry", "profiles", ["industry"])

    op.create_table(
        "magic_link_tokens",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.CHAR(length=64), nullable=False),
        sa.Column(
            "purpose",
            sa.Enum("signup", "login", name="magic_link_purpose"),
            nullable=False,
        ),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("consumed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_magic_link_tokens_token_hash", "magic_link_tokens", ["token_hash"])
    op.create_index("ix_magic_link_tokens_expires_at", "magic_link_tokens", ["expires_at"])


def downgrade() -> None:
    op.drop_index("ix_magic_link_tokens_expires_at", table_name="magic_link_tokens")
    op.drop_index("ix_magic_link_tokens_token_hash", table_name="magic_link_tokens")
    op.drop_table("magic_link_tokens")

    op.drop_index("ix_profiles_industry", table_name="profiles")
    op.drop_index("ix_profiles_cohort_year", table_name="profiles")
    op.drop_index("ix_profiles_country", table_name="profiles")
    op.drop_table("profiles")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    sa.Enum(name="magic_link_purpose").drop(op.get_bind(), checkfirst=True)
