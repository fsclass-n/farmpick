"""데이터 수집기 베이스 클래스 (담당: 이오리)

수집 소스:
- AI Hub 농작물 병해충 이미지 데이터셋
- 공공데이터포털 / 농촌진흥청 병해충 발생정보 API
- 기상청 기상 데이터 API
"""

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
