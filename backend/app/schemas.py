from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, HttpUrl, field_validator

from app.constants import INDUSTRIES, COUNTRIES, cohort_year_range


# ---------- Auth ----------

class SignupRequest(BaseModel):
    email: EmailStr


class MagicLinkRequest(BaseModel):
    email: EmailStr


class MagicLinkConsume(BaseModel):
    token: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SetPasswordRequest(BaseModel):
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MeResponse(BaseModel):
    id: int
    email: EmailStr
    is_admin: bool
    has_password: bool
    email_verified: bool
    profile_complete: bool


# ---------- Profile ----------

class ProfileUpdate(BaseModel):
    founder_name: Optional[str] = Field(default=None, max_length=120)
    startup_name: Optional[str] = Field(default=None, max_length=160)
    tagline: Optional[str] = Field(default=None, max_length=280)
    website: Optional[str] = Field(default=None, max_length=255)
    country: Optional[str] = Field(default=None, min_length=2, max_length=2)
    cohort_year: Optional[int] = Field(default=None, ge=2000, le=2100)
    industry: Optional[str] = Field(default=None, max_length=64)
    linkedin_url: Optional[str] = Field(default=None, max_length=255)
    twitter_url: Optional[str] = Field(default=None, max_length=255)
    contact_email: Optional[str] = Field(default=None, max_length=255)
    contact_phone: Optional[str] = Field(default=None, max_length=40)
    logo_path: Optional[str] = Field(default=None, max_length=255)

    @field_validator("country")
    @classmethod
    def validate_country(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return v
        v = v.upper()
        if v not in COUNTRIES:
            raise ValueError(f"Unknown country code: {v}")
        return v

    @field_validator("cohort_year")
    @classmethod
    def validate_year(cls, v: Optional[int]) -> Optional[int]:
        if v is None or v == 0:
            return v
        years = cohort_year_range()
        if v not in years:
            raise ValueError(f"Cohort year must be between {years[0]} and {years[-1]}")
        return v

    @field_validator("industry")
    @classmethod
    def validate_industry(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return v
        if v not in INDUSTRIES:
            raise ValueError(f"Unknown industry: {v}")
        return v


class ProfilePublic(BaseModel):
    """Card/detail shape returned to anonymous callers (no contact fields)."""

    id: int
    user_id: int
    founder_name: str
    startup_name: str
    tagline: Optional[str] = None
    website: Optional[str] = None
    country: str
    country_name: str
    cohort_year: int
    industry: str
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    logo_path: Optional[str] = None


class ProfileAuthed(ProfilePublic):
    """Same plus contact fields. Returned to signed-in callers."""

    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class ProfileOwnerView(ProfileAuthed):
    """Owner-only view (includes hidden flag for admin & self)."""

    is_hidden: bool = False
    updated_at: datetime
    created_at: datetime


class ProfileListResponse(BaseModel):
    items: list[ProfileAuthed]
    total: int
    page: int
    page_size: int


# ---------- Stats ----------

class StatsResponse(BaseModel):
    total_alumni: int
    countries: int
    cohort_years: int
    industries: int


# ---------- Reference data ----------

class ReferenceResponse(BaseModel):
    industries: list[str]
    cohort_years: list[int]
    countries: list[dict]


# ---------- Upload ----------

class UploadResponse(BaseModel):
    path: str
