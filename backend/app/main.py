from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .security import READONLY_ALLOWED, WRITE_METHODS, token_role
from .routers import admin, auth, chat, diagnosis, farms, pests, trends

app = FastAPI(title="farmpick API", version="0.1.0")


@app.middleware("http")
async def readonly_guard(request: Request, call_next):
    """테스트 관리자(admin_readonly)의 모든 데이터 변경 요청을 플랫폼 전역에서 차단"""
    if (
        request.method in WRITE_METHODS
        and not request.url.path.startswith(READONLY_ALLOWED)
        and token_role(request.headers.get("authorization")) == "admin_readonly"
    ):
        return JSONResponse(
            {"detail": "테스트 관리자는 읽기 전용입니다. 데이터 변경 권한이 없습니다.", "readonly": True},
            status_code=403,
        )
    return await call_next(request)


# CORS 는 마지막에 추가해 가장 바깥에서 동작 (403 응답에도 CORS 헤더 부여)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(diagnosis.router)
app.include_router(trends.router)
app.include_router(pests.router)
app.include_router(farms.router)
app.include_router(chat.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {"service": "farmpick API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok", "mock_ai": settings.use_mock_ai, "mock_db": settings.use_mock_db}
