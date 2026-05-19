from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import require_admin
from app.models import Profile, User
from app.schemas import ProfileOwnerView
from app.routers.profiles import _shape_owner

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/profiles", response_model=list[ProfileOwnerView])
def list_all_profiles(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    rows = db.query(Profile).order_by(Profile.created_at.desc()).all()
    return [_shape_owner(p) for p in rows]


@router.post("/profiles/{profile_id}/hide", status_code=status.HTTP_204_NO_CONTENT)
def hide_profile(profile_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    profile = db.query(Profile).filter(Profile.id == profile_id).one_or_none()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    profile.is_hidden = True
    db.commit()


@router.post("/profiles/{profile_id}/unhide", status_code=status.HTTP_204_NO_CONTENT)
def unhide_profile(profile_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    profile = db.query(Profile).filter(Profile.id == profile_id).one_or_none()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    profile.is_hidden = False
    db.commit()


@router.delete("/profiles/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_profile(profile_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    profile = db.query(Profile).filter(Profile.id == profile_id).one_or_none()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    db.delete(profile)
    db.commit()
