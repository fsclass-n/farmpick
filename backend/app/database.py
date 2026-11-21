"""TiDB/MySQL 연결 레이어. DATABASE_URL 미설정 시 mock 데이터 폴백."""

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
    if _engine is None:
        raise RuntimeError("DATABASE_URL이 설정되지 않았습니다.")
    from . import models

    models.Base.metadata.create_all(_engine)
