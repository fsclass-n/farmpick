import re

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..mock_data import TEST_ACCOUNTS
from ..security import create_access_token, get_current_user, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])

PASSWORD_RE = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$")


class LoginRequest(BaseModel):
    email: str
    password: str


def _public_user(u: dict) -> dict:
    return {"email": u["email"], "name": u["name"], "role": u["role"], "role_label": u["role_label"]}


@router.get("/test-accounts")
def test_accounts():
    return [
        {"email": u["email"], "password": u["password"], "role": u["role"], "role_label": u["role_label"], "name": u["name"]}
        for u in TEST_ACCOUNTS
    ]


@router.post("/login")
def login(body: LoginRequest):
    user = next((u for u in TEST_ACCOUNTS if u["email"] == body.email), None)
    if user is None:
        raise HTTPException(401, "이메일 또는 비밀번호가 올바르지 않습니다.")
    ok = body.password == user["password"] if user["password_hash"] == "demo" else verify_password(body.password, user["password_hash"])
    if not ok:
        raise HTTPException(401, "이메일 또는 비밀번호가 올바르지 않습니다.")
    return {"access_token": create_access_token(user), "user": _public_user(user)}


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str


@router.post("/register")
def register(body: RegisterRequest):
    if not PASSWORD_RE.match(body.password):
        raise HTTPException(400, "비밀번호는 영문 대소문자·숫자·특수문자 조합 8자리 이상이어야 합니다.")
    if any(u["email"] == body.email for u in TEST_ACCOUNTS):
        raise HTTPException(409, "이미 가입된 이메일입니다.")
    user = {
        "email": body.email, "password_hash": "demo", "password": body.password,
        "name": body.name, "role": "farmer", "role_label": "농가(재배자)",
    }
    TEST_ACCOUNTS.append(user)
    return {"access_token": create_access_token(user), "user": _public_user(user)}


@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    return _public_user(user)
