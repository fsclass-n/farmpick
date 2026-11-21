"""데이터 수집기 베이스 클래스 (담당: 이오리)"""

from abc import ABC, abstractmethod
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[2] / "data"


class BaseCollector(ABC):
    name: str = "base"

    @abstractmethod
    def collect(self) -> list[dict]:
        """원천 데이터 수집 후 dict 리스트로 반환"""

    def save(self, rows: list[dict], filename: str) -> Path:
        import json

        out = DATA_DIR / "raw" / filename
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
        return out
