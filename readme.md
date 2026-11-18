# farmpick

AI 모델 및 K-AI 데이터 분석을 통한 기업 수요 반영 비즈니스 플랫폼 구축
농작물 생육 이미지 데이터를 통한 병해충 진단 관리 시스템

생육 이미지를 AI(Gemini Vision)로 진단해 병해충·방제법을 추천(Pick)하고,
지역·작물별 발생 동향과 기업 수요를 분석하는 B2B/B2C 스마트팜 플랫폼입니다.

## 배포
| 구분 | URL |
|---|---|
| Frontend Demo | https://farmpick.netlify.app |
| Frontend | https://farmpick.onrender.com |
| Backend API | https://farmpick-api.onrender.com |

## 기술 스택
React(Vite) + Tailwind CSS v4 / FastAPI(Python 3.11) / TiDB / Google Gemini API

## 디렉터리
```
backend/    FastAPI 백엔드            (담당: 김모란)
frontend/   React + Tailwind 프런트   (담당: 박미금)
pipeline/   데이터 수집·분석(이오리) / AI 모델(홍기흥)
docs/       산출물·진행일지·발표자료   (총괄: 이오리(조장))
```

## 로컬 실행
```bash
# 백엔드
python -m venv .venv && .venv/Scripts/pip install -r requirements.txt
cd backend && ../.venv/Scripts/uvicorn app.main:app --reload   # http://localhost:8000/docs

# 프런트엔드
cd frontend && npm install && npm run dev                      # http://localhost:5173
```

`GEMINI_API_KEY`, `DATABASE_URL` 미설정 시 Mock 데이터로 동작합니다.

### 테스트 계정
| 역할 | 이메일 | 비밀번호 |
|---|---|---|
| 농가 | farmer@farmpick.kr | Farm1234! |
| 기업 담당자 | company@farmpick.kr | Corp1234! |
| 관리자 | admin@farmpick.kr | Admin1234! |
| 테스트 관리자(읽기 전용) | viewer@farmpick.kr | View1234! |
