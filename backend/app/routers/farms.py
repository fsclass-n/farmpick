from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..mock_data import FARMS
from ..security import get_current_user

router = APIRouter(prefix="/api/farms", tags=["farms"])


@router.get("/")
def list_farms(user: dict = Depends(get_current_user)):
    return FARMS


class FarmCreate(BaseModel):
    name: str
    crop: str
    area: str = ""
    location: str = ""


@router.post("/")
def create_farm(body: FarmCreate, user: dict = Depends(get_current_user)):
    farm = {
        "id": max([f["id"] for f in FARMS], default=0) + 1,
        "name": body.name, "crop": body.crop,
        "area": body.area, "location": body.location, "records": [],
    }
    FARMS.append(farm)
    return farm


@router.delete("/{farm_id}")
def delete_farm(farm_id: int, user: dict = Depends(get_current_user)):
    idx = next((i for i, f in enumerate(FARMS) if f["id"] == farm_id), None)
    if idx is None:
        raise HTTPException(404, "농장을 찾을 수 없습니다.")
    return FARMS.pop(idx)
