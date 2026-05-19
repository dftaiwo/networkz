from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.constants import country_name
from app.db import get_db
from app.deps import get_current_user, get_optional_user
from app.models import Profile, User
from app.schemas import (
    ProfileAuthed,
    ProfileListResponse,
    ProfileOwnerView,
    ProfilePublic,
    ProfileUpdate,
)


router = APIRouter(prefix="/profiles", tags=["profiles"])


def _shape(profile: Profile, *, authed: bool):
    base = {
        "id": profile.id,
        "user_id": profile.user_id,
        "founder_name": profile.founder_name or "",
        "startup_name": profile.startup_name or "",
        "tagline": profile.tagline,
        "website": profile.website,
        "country": profile.country or "",
        "country_name": country_name(profile.country or ""),
        "cohort_year": profile.cohort_year or 0,
        "industry": profile.industry or "",
        "linkedin_url": profile.linkedin_url,
        "twitter_url": profile.twitter_url,
        "logo_path": profile.logo_path,
    }
    if authed:
        base["contact_email"] = profile.contact_email
        base["contact_phone"] = profile.contact_phone
        return ProfileAuthed(**base)
    return ProfilePublic(**base)


def _shape_owner(profile: Profile) -> ProfileOwnerView:
    return ProfileOwnerView(
        id=profile.id,
        user_id=profile.user_id,
        founder_name=profile.founder_name or "",
        startup_name=profile.startup_name or "",
        tagline=profile.tagline,
        website=profile.website,
        country=profile.country or "",
        country_name=country_name(profile.country or ""),
        cohort_year=profile.cohort_year or 0,
        industry=profile.industry or "",
        linkedin_url=profile.linkedin_url,
        twitter_url=profile.twitter_url,
        logo_path=profile.logo_path,
        contact_email=profile.contact_email,
        contact_phone=profile.contact_phone,
        is_hidden=bool(profile.is_hidden),
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )


@router.get("", response_model=ProfileListResponse)
def list_profiles(
    q: Optional[str] = Query(default=None, max_length=120),
    country: Optional[str] = Query(default=None, min_length=2, max_length=2),
    year: Optional[int] = Query(default=None, ge=2000, le=2100),
    industry: Optional[str] = Query(default=None, max_length=64),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=24, ge=1, le=100),
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    query = db.query(Profile).filter(Profile.is_hidden == False)  # noqa: E712
    # Only show profiles that have at least a startup name (skip empty placeholders).
    query = query.filter(Profile.startup_name != "")

    if country:
        query = query.filter(Profile.country == country.upper())
    if year:
        query = query.filter(Profile.cohort_year == year)
    if industry:
        query = query.filter(Profile.industry == industry)
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                Profile.startup_name.ilike(like),
                Profile.founder_name.ilike(like),
                Profile.tagline.ilike(like),
            )
        )

    total = query.count()
    rows = (
        query.order_by(Profile.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    items = [_shape(p, authed=bool(user)) for p in rows]
    # Coerce to ProfileAuthed shape so the response_model serializes uniformly.
    payload_items = []
    for p in items:
        if isinstance(p, ProfileAuthed):
            payload_items.append(p)
        else:
            payload_items.append(ProfileAuthed(**p.model_dump()))
    return ProfileListResponse(items=payload_items, total=total, page=page, page_size=page_size)


@router.get("/me", response_model=ProfileOwnerView)
def get_my_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = user.profile
    if profile is None:
        profile = Profile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return _shape_owner(profile)


@router.patch("/me", response_model=ProfileOwnerView)
def update_my_profile(
    payload: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = user.profile
    if profile is None:
        profile = Profile(user_id=user.id)
        db.add(profile)
        db.flush()

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return _shape_owner(profile)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.profile:
        db.delete(user.profile)
        db.commit()
    return None


@router.get("/{profile_id}", response_model=ProfileAuthed)
def get_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    profile = db.query(Profile).filter(Profile.id == profile_id).one_or_none()
    if profile is None or (profile.is_hidden and not (user and user.is_admin)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    shaped = _shape(profile, authed=bool(user))
    if isinstance(shaped, ProfileAuthed):
        return shaped
    return ProfileAuthed(**shaped.model_dump())
