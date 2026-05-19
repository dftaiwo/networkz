from fastapi import APIRouter

from app.constants import COUNTRIES, INDUSTRIES, cohort_year_range
from app.schemas import ReferenceResponse

router = APIRouter(prefix="/reference", tags=["reference"])


@router.get("", response_model=ReferenceResponse)
def reference_data() -> ReferenceResponse:
    countries = [{"code": code, "name": name} for code, name in COUNTRIES.items()]
    countries.sort(key=lambda c: c["name"])
    return ReferenceResponse(
        industries=INDUSTRIES,
        cohort_years=cohort_year_range(),
        countries=countries,
    )
