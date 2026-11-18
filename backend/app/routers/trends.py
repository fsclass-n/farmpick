from fastapi import APIRouter, Depends

from ..mock_data import COMPANY_DEMANDS, PEST_ALERTS, REGION_OCCURRENCE, TREND_MONTHLY, WEATHER_CORRELATION
from ..security import get_current_user, require_roles

router = APIRouter(prefix="/api/trends", tags=["trends"])


@router.get("/monthly")
def monthly():
    return TREND_MONTHLY


@router.get("/regions")
def regions():
    return REGION_OCCURRENCE


@router.get("/weather-correlation")
def weather():
    return WEATHER_CORRELATION


@router.get("/alerts")
def alerts():
    return PEST_ALERTS


@router.get("/company-demands")
def company_demands(user: dict = Depends(get_current_user)):
    return COMPANY_DEMANDS
