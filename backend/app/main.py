from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import admin, auth, chat, diagnosis, farms, pests, trends

app = FastAPI(title="farmpick API", version="0.1.0")

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
