"""AI 진단 파이프라인 (담당: 홍기흥)"""

from pipeline.ai.prompts import DIAGNOSIS_PROMPT


def build_gemini_client(api_key: str, model_name: str = "gemini-2.0-flash"):
    import google.generativeai as genai

    genai.configure(api_key=api_key)
    return genai.GenerativeModel(model_name)


def diagnose(model, image_bytes: bytes, crop: str) -> str:
    resp = model.generate_content(
        [DIAGNOSIS_PROMPT.format(crop=crop), {"mime_type": "image/jpeg", "data": image_bytes}]
    )
    return resp.text
