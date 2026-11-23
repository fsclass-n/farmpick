import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import settings
from .mock_data import TEST_ACCOUNTS

bearer = HTTPBearer(auto_error=False)


def hash_password(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(8)
    digest = hashlib.sha256(f"{salt}{password}".encode()).hexdigest()
    return f"{salt}${digest}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt, digest = stored.split("$", 1)
    except ValueError:
        return False
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest() == digest


def create_access_token(user: dict) -> str:
    payload = {
        "sub": user["email"],
        "name": user["name"],
        "role": user["role"],
        "exp": datetime.now(timezone.utc)
        + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> dict:
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "인증이 필요합니다.")
    try:
        payload = jwt.decode(
            creds.credentials, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "유효하지 않은 토큰입니다.")
    user = next((u for u in TEST_ACCOUNTS if u["email"] == payload["sub"]), None)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "사용자를 찾을 수 없습니다.")
    return user


def require_roles(*roles: str):
    def dep(user: dict = Depends(get_current_user)) -> dict:
        if user["role"] not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "권한이 없습니다.")
        return user

    return dep


def verify_admin_secret(key: str) -> bool:
    """.env 의 ADMIN_SECRET_KEY 와 상수 시간 비교"""
    return bool(key) and hmac.compare_digest(key.encode(), settings.ADMIN_SECRET_KEY.encode())


WRITE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
# 읽기 전용 사용자도 호출 가능한 POST 경로 (인증·AI 분석처럼 데이터를 변경하지 않는 요청)
READONLY_ALLOWED = ("/api/auth/", "/api/diagnosis/analyze", "/api/diagnosis/mock-preview", "/api/chat")


def token_role(authorization: str | None) -> str | None:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    try:
        return jwt.decode(
            authorization[7:], settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM]
        ).get("role")
    except jwt.PyJWTError:
        return None


async def block_readonly_writes(
    request: Request, user: dict = Depends(get_current_user)
) -> dict:
    """admin_readonly 권한의 쓰기 요청을 백엔드에서 일괄 차단"""
    if user["role"] == "admin_readonly" and request.method in WRITE_METHODS:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "테스트 관리자는 읽기 전용입니다. (읽기 전용 모드)",
        )
    return user
