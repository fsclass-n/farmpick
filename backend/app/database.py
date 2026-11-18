"""TiDB/MySQL 연결 레이어.

DATABASE_URL(예: mysql+pymysql://user:pass@host:4000/farmpick?ssl_verify_cert=true)
설정 시 실제 DB 세션을 제공하고, 미설정 시 None을 반환해 라우터가
mock_data를 사용하도록 한다.
"""

from contextlib import contextmanager

from .config import settings

_engine = None
_SessionLocal = None

if settings.DATABASE_URL:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    _engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, pool_recycle=3600)
    _SessionLocal = sessionmaker(bind=_engine, autoflush=False, expire_on_commit=False)


def db_enabled() -> bool:
    return _SessionLocal is not None


@contextmanager
def get_session():
    """DB 미설정 시 None을 yield — 라우터에서 mock 폴백 처리."""
    if _SessionLocal is None:
        yield None
        return
    session = _SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def init_db():
    """테이블 생성 (최초 배포 시 1회 실행)"""
    if _engine is None:
        raise RuntimeError("DATABASE_URL이 설정되지 않았습니다.")
    from . import models

    models.Base.metadata.create_all(_engine)
