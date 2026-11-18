from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..mock_data import ADMIN_STATS, PESTS, TEST_ACCOUNTS
from ..security import block_readonly_writes, require_roles

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(block_readonly_writes)],
)


def _admin_user(user: dict = Depends(require_roles("admin", "admin_readonly"))) -> dict:
    return user


@router.get("/stats")
def stats(user: dict = Depends(_admin_user)):
    return ADMIN_STATS


@router.get("/users")
def users(user: dict = Depends(_admin_user)):
    return [
        {"email": u["email"], "name": u["name"], "role": u["role"], "role_label": u["role_label"]}
        for u in TEST_ACCOUNTS
    ]


class RoleChange(BaseModel):
    role: str


@router.patch("/users/{email}/role")
def change_role(email: str, body: RoleChange, user: dict = Depends(_admin_user)):
    if body.role not in {"farmer", "company", "admin", "admin_readonly"}:
        raise HTTPException(400, "유효하지 않은 권한입니다.")
    target = next((u for u in TEST_ACCOUNTS if u["email"] == email), None)
    if target is None:
        raise HTTPException(404, "사용자를 찾을 수 없습니다.")
    target["role"] = body.role
    return {"email": email, "role": body.role}


# ---------- 병해충 콘텐츠 관리 ----------

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
def admin_pests(user: dict = Depends(_admin_user)):
    return PESTS


@router.post("/pests")
def create_pest(body: PestPayload, user: dict = Depends(_admin_user)):
    pest = {"id": max([p["id"] for p in PESTS], default=0) + 1, **body.model_dump()}
    PESTS.append(pest)
    return pest


@router.put("/pests/{pest_id}")
def update_pest(pest_id: int, body: PestPayload, user: dict = Depends(_admin_user)):
    pest = next((p for p in PESTS if p["id"] == pest_id), None)
    if pest is None:
        raise HTTPException(404, "병해충 정보를 찾을 수 없습니다.")
    pest.update(body.model_dump())
    return pest


@router.delete("/pests/{pest_id}")
def delete_pest(pest_id: int, user: dict = Depends(_admin_user)):
    idx = next((i for i, p in enumerate(PESTS) if p["id"] == pest_id), None)
    if idx is None:
        raise HTTPException(404, "병해충 정보를 찾을 수 없습니다.")
    return PESTS.pop(idx)
