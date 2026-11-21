from fastapi import APIRouter

from ..database import get_session
from ..mock_data import CROPS, PESTS

router = APIRouter(prefix="/api/pests", tags=["pests"])


def _load_pests() -> list[dict]:
    """DB 사용 가능 시 pests 테이블에서, 아니면 mock 데이터에서 조회"""
    with get_session() as session:
        if session is None:
            return PESTS
        from ..models import Pest

        return [
            {"id": p.id, "name": p.name, "type": p.type, "crops": p.crops,
             "symptoms": p.symptoms, "cause": p.cause, "control": p.control,
             "severity": p.severity, "season": p.season}
            for p in session.query(Pest).all()
        ]


@router.get("/")
def list_pests(type: str | None = None, crop: str | None = None, q: str | None = None):
    items = _load_pests()
    if type:
        items = [p for p in items if p["type"] == type]
    if crop:
        items = [p for p in items if crop in p["crops"]]
    if q:
        items = [p for p in items if q in p["name"] or q in p["symptoms"]]
    return items


@router.get("/crops")
def crops():
    return CROPS


@router.get("/{pest_id}")
def pest_detail(pest_id: int):
    pest = next((p for p in _load_pests() if p["id"] == pest_id), None)
    return pest or {"error": "not found"}
