import random
import time

from fastapi import APIRouter, Depends, File, Form, UploadFile

from ..mock_data import FARMS, PESTS
from ..security import get_current_user
from ..services import gemini_service

router = APIRouter(prefix="/api/diagnosis", tags=["diagnosis"])


@router.post("/analyze")
async def analyze(
    image: UploadFile = File(...),
    crop: str = Form("토마토"),
    user: dict = Depends(get_current_user),
):
    data = await image.read()
    if len(data) > 10 * 1024 * 1024:
        return {"error": "이미지는 10MB 이하만 가능합니다."}
    result = await gemini_service.diagnose_image(data, crop, image.filename or "")
    return {"filename": image.filename, "crop": crop, "result": result, "engine": "mock" if result.get("mock") else "gemini"}


@router.get("/history")
def history(user: dict = Depends(get_current_user)):
    records = []
    for farm in FARMS:
        for r in farm["records"]:
            records.append({**r, "farm": farm["name"], "crop": farm["crop"]})
    return sorted(records, key=lambda x: x["date"], reverse=True)


@router.post("/mock-preview")
def mock_preview(crop: str = "토마토"):
    """이미지 없이 진단 결과 카드 UI를 미리 확인하는 데모용"""
    time.sleep(0.6)
    pest = random.choice([p for p in PESTS if p["type"] != "정상"])
    similar = random.sample([p["name"] for p in PESTS if p["name"] != pest["name"] and p["type"] != "정상"], k=2)
    return {
        "mock": True, "pest": pest["name"], "type": pest["type"],
        "confidence": round(random.uniform(0.72, 0.97), 2),
        "symptoms": pest["symptoms"], "cause": pest["cause"], "control": pest["control"],
        "severity": pest["severity"], "similar_cases": similar,
        "caution": "본 진단 결과는 AI 추정치이며, 정확한 진단은 농업기술센터 전문가 상담을 권장합니다.",
    }
