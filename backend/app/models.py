"""SQLAlchemy 모델 — TiDB/MySQL 연동 시 사용."""

from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(30), default="farmer")  # farmer/company/admin/admin_readonly
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Pest(Base):
    __tablename__ = "pests"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), index=True)
    type: Mapped[str] = mapped_column(String(10))  # 병/충/정상
    crops: Mapped[list] = mapped_column(JSON)
    symptoms: Mapped[str] = mapped_column(Text)
    cause: Mapped[str] = mapped_column(Text)
    control: Mapped[str] = mapped_column(Text)
    severity: Mapped[str] = mapped_column(String(10))
    season: Mapped[str] = mapped_column(String(50))


class Farm(Base):
    __tablename__ = "farms"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(100))
    crop: Mapped[str] = mapped_column(String(50))
    area: Mapped[str] = mapped_column(String(50), default="")
    location: Mapped[str] = mapped_column(String(100), default="")


class DiagnosisRecord(Base):
    __tablename__ = "diagnosis_records"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    farm_id: Mapped[int] = mapped_column(ForeignKey("farms.id"))
    image_path: Mapped[str] = mapped_column(String(500), default="")
    pest_name: Mapped[str] = mapped_column(String(100))
    confidence: Mapped[float] = mapped_column(Float)
    result: Mapped[dict] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String(30), default="진단 완료")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class OccurrenceStat(Base):
    __tablename__ = "occurrence_stats"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    region: Mapped[str] = mapped_column(String(50))
    crop: Mapped[str] = mapped_column(String(50))
    pest_name: Mapped[str] = mapped_column(String(100))
    month: Mapped[int] = mapped_column(Integer)
    count: Mapped[int] = mapped_column(Integer, default=0)


class CompanyDemand(Base):
    __tablename__ = "company_demands"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    company: Mapped[str] = mapped_column(String(100))
    crops: Mapped[list] = mapped_column(JSON)
    regions: Mapped[list] = mapped_column(JSON)
    interest: Mapped[str] = mapped_column(Text)
    structured: Mapped[dict] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String(30), default="분석 대기")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
