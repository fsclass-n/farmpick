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

### 관리자 권한 체계
| 구분 | 진입 방법 | 권한 |
|---|---|---|
| 관리자 | 로그인 › `관리자` 탭 › `.env` 의 `ADMIN_SECRET_KEY` 입력 (`POST /api/auth/admin-login`) | 병해충 DB · 방제 매뉴얼 · 진단 이력 · 농가/회원 전체 CRUD |
| 테스트 관리자 | 로그인 › `관리자` 탭 › **테스트 관리자 로그인** 버튼 (`POST /api/auth/test-admin-login`) | 관리 콘솔 전체 열람, 생성·수정·삭제 차단 (Read-Only) |

- 관리자 계정은 비밀번호 로그인이 불가하며 보안 키(상수 시간 비교)로만 인증됩니다.
- 읽기 전용 차단은 2중으로 적용됩니다: 프런트 `api()` 레이어(1차) + 백엔드 전역 미들웨어 `readonly_guard`(2차, 모든 POST/PUT/PATCH/DELETE).

## 이미지 출처
`frontend/public/images/*.webp` 는 [Unsplash License](https://unsplash.com/license)(상업적 이용 가능, 출처 표기 권장) 무료 이미지를 WebP로 최적화해 저장한 것입니다.
작가 정보는 `frontend/src/lib/photos.js` 에 정리되어 있으며 푸터의 *Photos from Unsplash* 에서 확인할 수 있습니다.
