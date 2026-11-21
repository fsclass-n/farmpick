import os
from pathlib import Path

from dotenv import load_dotenv

# 상위 디렉터리를 순회하며 .env를 찾는다 (로컬: 프로젝트 루트, Docker: /app 상위)
for _parent in Path(__file__).resolve().parents:
    _env = _parent / ".env"
    if _env.exists():
        load_dotenv(_env)


class Settings:
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev-secret-key")
    ADMIN_SECRET_KEY: str = os.getenv("ADMIN_SECRET_KEY", "dev-admin-key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

    CORS_ORIGINS: list[str] = [
        o.strip()
        for o in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,https://farmpick.netlify.app,https://farmpick.onrender.com",
        ).split(",")
        if o.strip()
    ]

    @property
    def use_mock_ai(self) -> bool:
        return not self.GEMINI_API_KEY

    @property
    def use_mock_db(self) -> bool:
        return not self.DATABASE_URL


settings = Settings()
