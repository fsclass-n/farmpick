"""농촌진흥청 병해충 발생정보 수집기 (골격)

API 신청 후 service_key를 .env(RDA_API_KEY)에 등록해 사용.
"""

import os

import requests

from .base import BaseCollector


class RdaPestCollector(BaseCollector):
    name = "rda-pest"
    BASE_URL = "http://ncpms.rda.go.kr/npmsAPI/service"

    def __init__(self, service_key: str | None = None):
        self.service_key = service_key or os.getenv("RDA_API_KEY", "")

    def collect(self) -> list[dict]:
        if not self.service_key:
            raise RuntimeError("RDA_API_KEY가 설정되지 않았습니다.")
        params = {"apiKey": self.service_key, "serviceCode": "SVC01", "serviceType": "AA001"}
        resp = requests.get(self.BASE_URL, params=params, timeout=30)
        resp.raise_for_status()
        return resp.json().get("list", [])


if __name__ == "__main__":
    rows = RdaPestCollector().collect()
    print(f"수집 {len(rows)}건")
