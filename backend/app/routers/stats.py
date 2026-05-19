import time
from threading import Lock

from fastapi import APIRouter, Depends
from sqlalchemy import distinct, func
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Profile
from app.schemas import StatsResponse

router = APIRouter(prefix="/stats", tags=["stats"])

_CACHE: dict = {"ts": 0.0, "value": None}
_LOCK = Lock()
_TTL = 60.0


@router.get("", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)) -> StatsResponse:
    with _LOCK:
        now = time.time()
        if _CACHE["value"] is not None and now - _CACHE["ts"] < _TTL:
            return _CACHE["value"]

    q = db.query(Profile).filter(Profile.is_hidden == False, Profile.startup_name != "")  # noqa: E712
    total_alumni = q.count()
    countries = (
        db.query(func.count(distinct(Profile.country)))
        .filter(Profile.is_hidden == False, Profile.country != "")  # noqa: E712
        .scalar()
        or 0
    )
    years = (
        db.query(func.count(distinct(Profile.cohort_year)))
        .filter(Profile.is_hidden == False, Profile.cohort_year > 0)  # noqa: E712
        .scalar()
        or 0
    )
    industries = (
        db.query(func.count(distinct(Profile.industry)))
        .filter(Profile.is_hidden == False, Profile.industry != "")  # noqa: E712
        .scalar()
        or 0
    )

    value = StatsResponse(
        total_alumni=total_alumni,
        countries=countries,
        cohort_years=years,
        industries=industries,
    )
    with _LOCK:
        _CACHE["ts"] = time.time()
        _CACHE["value"] = value
    return value


def invalidate_stats_cache() -> None:
    with _LOCK:
        _CACHE["ts"] = 0.0
        _CACHE["value"] = None
