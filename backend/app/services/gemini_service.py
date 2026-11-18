"""Gemini Vision 연동 서비스.

GEMINI_API_KEY 미설정 시 Mock 결과를 반환해 데모가 동작하도록 한다.
"""

import json
import random

from ..config import settings
from ..mock_data import PESTS

DIAGNOSIS_PROMPT = """당신은 농작물 병해충 진단 전문 AI입니다.
사용자가 업로드한 {crop} 생육 이미지를 분석해 아래 JSON 형식으로만 답하세요.
{{
  "pest": "병해충명 또는 '정상'",
  "type": "병|충|정상",
  "confidence": 0.0~1.0,
  "symptoms": "관찰되는 증상 설명",
  "cause": "발생 원인",
  "control": "방제 방법·추천 약제 계열",
  "severity": "상|중|경미|없음",
  "caution": "주의사항"
}}"""


async def diagnose_image(data: bytes, crop: str, filename: str) -> dict:
    if settings.use_mock_ai:
        return _mock_diagnosis(crop)
    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        resp = model.generate_content(
            [
                DIAGNOSIS_PROMPT.format(crop=crop),
                {"mime_type": "image/jpeg", "data": data},
            ]
        )
        text = resp.text.strip().removeprefix("```json").removesuffix("```").strip()
        return json.loads(text)
    except Exception:
        return _mock_diagnosis(crop)


def _mock_diagnosis(crop: str) -> dict:
    candidates = [p for p in PESTS if crop in p["crops"] and p["type"] != "정상"]
    pest = random.choice(candidates or [p for p in PESTS if p["type"] != "정상"])
    similar = random.sample(
        [p["name"] for p in PESTS if p["name"] != pest["name"] and p["type"] != "정상"], k=2
    )
    return {
        "mock": True,
        "pest": pest["name"],
        "type": pest["type"],
        "confidence": round(random.uniform(0.72, 0.97), 2),
        "symptoms": pest["symptoms"],
        "cause": pest["cause"],
        "control": pest["control"],
        "severity": pest["severity"],
        "similar_cases": similar,
        "caution": "본 결과는 Mock 데모 진단입니다. GEMINI_API_KEY 설정 시 실제 AI 진단으로 동작합니다.",
    }


async def chat(message: str, pests: list[dict]) -> tuple[str, list[str]]:
    """AI 상담. Gemini 사용 가능 시 실제 응답, 아니면 규칙 기반 Mock."""
    if not settings.use_mock_ai:
        try:
            import google.generativeai as genai

            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            context = "\n".join(
                f"- {p['name']}({p['type']}): {p['symptoms']} / 방제: {p['control']}"
                for p in pests
            )
            prompt = (
                "당신은 farmpick의 병해충 상담 AI입니다. 아래 병해충 DB를 근거로 답변하세요.\n"
                + context
                + f"\n\n질문: {message}"
            )
            resp = model.generate_content(prompt)
            return resp.text.strip(), _match_sources(message, pests)
        except Exception:
            pass

    matched = _match_sources(message, pests)
    if matched:
        pest = next(p for p in pests if p["name"] == matched[0])
        reply = (
            f"**{pest['name']}** ({pest['type']}, 심각도: {pest['severity']})\n\n"
            f"- 증상: {pest['symptoms']}\n"
            f"- 발생 원인: {pest['cause']}\n"
            f"- 방제 방법: {pest['control']}\n"
            f"- 주요 발생기: {pest['season']}\n\n"
            "※ 데모 응답입니다. 정확한 진단은 'AI 병해충 진단'에서 사진을 업로드해 주세요."
        )
    else:
        reply = (
            "질문 주셔서 감사합니다. 병해충 이름(예: 흰가루병, 총채벌레, 진딧물)을 포함해 "
            "질문해 주시면 증상·원인·방제 방법을 안내해 드립니다. "
            "사진 기반 진단은 'AI 병해충 진단' 메뉴를 이용해 주세요."
        )
    return reply, matched


def _match_sources(message: str, pests: list[dict]) -> list[str]:
    return [p["name"] for p in pests if p["name"] in message][:3]
