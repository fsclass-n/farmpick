from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..mock_data import ADMIN_STATS, CONTROL_MANUALS, FARMS, PESTS, TEST_ACCOUNTS
from ..security import block_readonly_writes, require_roles

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(require_roles("admin", "admin_readonly")), Depends(block_readonly_writes)],
)


def _next_id(items: list[dict]) -> int:
    return max([i["id"] for i in items], default=0) + 1


def _find(items: list[dict], item_id: int, label: str) -> dict:
    item = next((i for i in items if i["id"] == item_id), None)
    if item is None:
        raise HTTPException(404, f"{label} 정보를 찾을 수 없습니다.")
    return item


def _all_records() -> list[dict]:
    return sorted(
        ({**r, "farm_id": f["id"], "farm": f["name"], "crop": f["crop"]} for f in FARMS for r in f["records"]),
        key=lambda r: r["date"],
        reverse=True,
    )


@router.get("/stats")
def stats():
    return {
        **ADMIN_STATS,
        "counts": {
            "pests": len(PESTS), "manuals": len(CONTROL_MANUALS), "farms": len(FARMS),
            "records": sum(len(f["records"]) for f in FARMS), "users": len(TEST_ACCOUNTS),
        },
    }


# ---------- 사용자 ----------

@router.get("/users")
def users():
    return [
        {"email": u["email"], "name": u["name"], "role": u["role"], "role_label": u["role_label"]}
        for u in TEST_ACCOUNTS
    ]


class RoleChange(BaseModel):
    role: str


@router.patch("/users/{email}/role")
def change_role(email: str, body: RoleChange):
    if body.role not in {"farmer", "company", "admin", "admin_readonly"}:
        raise HTTPException(400, "유효하지 않은 권한입니다.")
    target = next((u for u in TEST_ACCOUNTS if u["email"] == email), None)
    if target is None:
        raise HTTPException(404, "사용자를 찾을 수 없습니다.")
    target["role"] = body.role
    return {"email": email, "role": body.role}


@router.delete("/users/{email}")
def delete_user(email: str):
    idx = next((i for i, u in enumerate(TEST_ACCOUNTS) if u["email"] == email), None)
    if idx is None:
        raise HTTPException(404, "사용자를 찾을 수 없습니다.")
    if TEST_ACCOUNTS[idx].get("hidden"):
        raise HTTPException(400, "시스템 관리자 계정은 삭제할 수 없습니다.")
    TEST_ACCOUNTS.pop(idx)
    return {"email": email}


# ---------- 병해충 DB ----------

class PestPayload(BaseModel):
    name: str
    type: str
    crops: list[str] = []
    symptoms: str = ""
    cause: str = ""
    control: str = ""
    severity: str = "중"
    season: str = ""


@router.get("/pests")
def admin_pests():
    return PESTS


@router.post("/pests")
def create_pest(body: PestPayload):
    pest = {"id": _next_id(PESTS), **body.model_dump()}
    PESTS.append(pest)
    return pest


@router.put("/pests/{pest_id}")
def update_pest(pest_id: int, body: PestPayload):
    pest = _find(PESTS, pest_id, "병해충")
    pest.update(body.model_dump())
    return pest


@router.delete("/pests/{pest_id}")
def delete_pest(pest_id: int):
    pest = _find(PESTS, pest_id, "병해충")
    PESTS.remove(pest)
    return pest


# ---------- 방제 매뉴얼 ----------

class ManualPayload(BaseModel):
    title: str
    pest: str
    crop: str
    stage: str = "예방"
    steps: list[str] = []


@router.get("/manuals")
def manuals():
    return CONTROL_MANUALS


@router.post("/manuals")
def create_manual(body: ManualPayload):
    manual = {"id": _next_id(CONTROL_MANUALS), **body.model_dump()}
    CONTROL_MANUALS.append(manual)
    return manual


@router.put("/manuals/{manual_id}")
def update_manual(manual_id: int, body: ManualPayload):
    manual = _find(CONTROL_MANUALS, manual_id, "방제 매뉴얼")
    manual.update(body.model_dump())
    return manual


@router.delete("/manuals/{manual_id}")
def delete_manual(manual_id: int):
    manual = _find(CONTROL_MANUALS, manual_id, "방제 매뉴얼")
    CONTROL_MANUALS.remove(manual)
    return manual


# ---------- 진단 이력 ----------

class RecordStatus(BaseModel):
    status: str


@router.get("/records")
def records():
    return _all_records()


@router.patch("/records/{record_id}")
def update_record(record_id: int, body: RecordStatus):
    for farm in FARMS:
        for r in farm["records"]:
            if r["id"] == record_id:
                r["status"] = body.status
                return r
    raise HTTPException(404, "진단 이력을 찾을 수 없습니다.")


@router.delete("/records/{record_id}")
def delete_record(record_id: int):
    for farm in FARMS:
        for r in farm["records"]:
            if r["id"] == record_id:
                farm["records"].remove(r)
                return r
    raise HTTPException(404, "진단 이력을 찾을 수 없습니다.")


# ---------- 농가 ----------

@router.get("/farms")
def farms():
    return [{**{k: v for k, v in f.items() if k != "records"}, "record_count": len(f["records"])} for f in FARMS]


@router.delete("/farms/{farm_id}")
def delete_farm(farm_id: int):
    farm = _find(FARMS, farm_id, "농장")
    FARMS.remove(farm)
    return {"id": farm_id}
