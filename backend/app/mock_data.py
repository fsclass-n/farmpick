"""TiDB 미연결 시 사용하는 Mock 데이터 (데모/개발용)"""

TEST_ACCOUNTS = [
    {"email": "farmer@farmpick.kr", "password_hash": "demo", "password": "Farm1234!", "name": "김농부", "role": "farmer", "role_label": "농가(재배자)"},
    {"email": "company@farmpick.kr", "password_hash": "demo", "password": "Corp1234!", "name": "이기업", "role": "company", "role_label": "기업 담당자"},
    # 실제 관리자: 비밀번호 로그인 불가, .env 의 ADMIN_SECRET_KEY 로만 진입
    {"email": "admin@farmpick.kr", "password_hash": "key-only", "password": None, "name": "관리자", "role": "admin", "role_label": "관리자", "hidden": True},
    {"email": "viewer@farmpick.kr", "password_hash": "demo", "password": "View1234!", "name": "테스트 관리자", "role": "admin_readonly", "role_label": "테스트 관리자(읽기 전용)", "hidden": True},
]

CROPS = ["토마토", "딸기", "오이", "고추", "상추", "감자", "사과", "배"]

PESTS = [
    {"id": 1, "name": "흰가루병", "type": "병", "crops": ["오이", "딸기", "토마토"],
     "symptoms": "잎 표면에 흰색 가루 모양의 균사가 형성되고 점차 잎이 마름",
     "cause": "고온건조와 환기 부족, 질소 과다 시 비발",
     "control": "환기 개선, 석회유황합제·트리후미졸 계열 약제 살포", "severity": "중", "season": "봄~가을"},
    {"id": 2, "name": "잿빛곰팡이병(보트리티스)", "type": "병", "crops": ["딸기", "토마토", "상추"],
     "symptoms": "과실·잎에 회색 곰팡이층, 조직이 물러 썩음",
     "cause": "저온다습, 밀식 재배, 낙과·상처 부위 침입",
     "control": "습도 관리, 병든 조직 제거, 이프로디온·펜헥사미드 계열 살포", "severity": "상", "season": "겨울~봄"},
    {"id": 3, "name": "노균병", "type": "병", "crops": ["오이", "상추", "배추"],
     "symptoms": "잎 윗면에 황색 반점, 뒷면에 회백색 곰팡이",
     "cause": "저온다습·결로 조건에서 급속 확산",
     "control": "야간 보온·환기, 디메토모르프·만코zeb 계열 예방 살포", "severity": "상", "season": "봄·가을"},
    {"id": 4, "name": "역병", "type": "병", "crops": ["고추", "감자", "토마토"],
     "symptoms": "줄기·뿌리가 물러 썩고 급격히 시듦",
     "cause": "토양 전염, 장마철 고온다습",
     "control": "배수 개선, 메탈락실·포세틸 계열 관주", "severity": "상", "season": "여름(장마철)"},
    {"id": 5, "name": "탄저병", "type": "병", "crops": ["고추", "딸기", "사과"],
     "symptoms": "과실에 원형 움푹 패인 병반, 주황색 포자덩이",
     "cause": "고온다습, 빗물 튐으로 전염",
     "control": "우천 전후 예방 살포, 디페노코나졸·프로클로라즈 계열", "severity": "상", "season": "여름~가을"},
    {"id": 6, "name": "진딧물", "type": "충", "crops": ["고추", "오이", "상추", "사과"],
     "symptoms": "신초·잎 뒷면에 군집, 감로 분비로 그을음병 유발, 바이러스 매개",
     "cause": "기온 상승 시 급속 번식",
     "control": "천적(무당벌레) 방사, 아세타미프리드·플로니카미드 계열 살포", "severity": "중", "season": "봄~가을"},
    {"id": 7, "name": "총채벌레", "type": "충", "crops": ["고추", "딸기", "오이"],
     "symptoms": "잎·과실에 은색 흡즙 자국, 생장점 왜곡, TSWV 바이러스 매개",
     "cause": "고온건조, 하우스 내 상존",
     "control": "청색 끈끈이 트랩, 스피네토람·에마메틴벤조에이트 계열", "severity": "상", "season": "연중(시설)"},
    {"id": 8, "name": "응애(점박이응애)", "type": "충", "crops": ["오이", "딸기", "사과"],
     "symptoms": "잎 뒷면 흡즙으로 잎이 황화·건조, 잔사 형성",
     "cause": "고온건조 시 밀도 급증",
     "control": "칠레이리응애 등 천적 활용, 아바멕틴·에톡사졸 계열", "severity": "중", "season": "여름"},
    {"id": 9, "name": "온실가루이", "type": "충", "crops": ["토마토", "오이", "파프리카"],
     "symptoms": "잎 뒷면에서 흡즙, 감로·그을음, 황화",
     "cause": "시설 내 상시 발생, 약제 저항성",
     "control": "온실콜레마니 등 천적, 디노테퓨란 계열", "severity": "중", "season": "연중(시설)"},
    {"id": 10, "name": "정상", "type": "정상", "crops": CROPS,
     "symptoms": "특이 병징이 관찰되지 않음", "cause": "-",
     "control": "현재 수준의 관리 유지, 정기적 예찰 권장", "severity": "없음", "season": "-"},
]

TREND_MONTHLY = {
    "labels": ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
    "series": [
        {"name": "흰가루병", "data": [12, 18, 34, 52, 68, 74, 60, 55, 48, 30, 20, 14]},
        {"name": "잿빛곰팡이병", "data": [40, 45, 50, 38, 20, 15, 12, 14, 18, 26, 36, 42]},
        {"name": "총채벌레", "data": [20, 22, 30, 45, 60, 78, 85, 80, 62, 44, 30, 22]},
        {"name": "탄저병", "data": [2, 3, 6, 10, 22, 45, 70, 82, 64, 30, 12, 4]},
    ],
}

REGION_OCCURRENCE = [
    {"region": "경기", "count": 284, "top": "총채벌레"},
    {"region": "충북", "count": 198, "top": "탄저병"},
    {"region": "충남", "count": 246, "top": "노균병"},
    {"region": "전북", "count": 172, "top": "흰가루병"},
    {"region": "전남", "count": 310, "top": "역병"},
    {"region": "경북", "count": 265, "top": "탄저병"},
    {"region": "경남", "count": 221, "top": "잿빛곰팡이병"},
    {"region": "제주", "count": 96, "top": "응애"},
]

WEATHER_CORRELATION = {
    "labels": ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
    "humidity": [62, 60, 64, 66, 70, 78, 84, 82, 76, 70, 66, 63],
    "occurrence": [76, 88, 130, 185, 230, 290, 317, 313, 256, 176, 124, 88],
}

PEST_ALERTS = [
    {"pest": "총채벌레", "level": "경보", "region": "전남·경북", "note": "고온 지속 시 밀도 급증, 바이러스 매개 주의"},
    {"pest": "탄저병", "level": "주의", "region": "충북·경북", "note": "우천 전후 예방적 방제 필요"},
    {"pest": "잿빛곰팡이병", "level": "주의", "region": "시설재배 전역", "note": "야간 결로 관리 필수"},
]

FARMS = [
    {"id": 1, "name": "햇살농장 1동", "crop": "토마토", "area": "1,320㎡", "location": "충남 논산",
     "records": [
         {"id": 101, "date": "2026-11-10", "pest": "온실가루이", "severity": "중", "status": "방제 완료"},
         {"id": 102, "date": "2026-11-02", "pest": "흰가루병", "severity": "경미", "status": "경과 관찰"},
         {"id": 103, "date": "2026-10-21", "pest": "정상", "severity": "없음", "status": "정상"},
     ]},
    {"id": 2, "name": "햇살농장 딸기하우스", "crop": "딸기", "area": "990㎡", "location": "충남 논산",
     "records": [
         {"id": 104, "date": "2026-11-14", "pest": "잿빛곰팡이병", "severity": "주의", "status": "방제 진행"},
         {"id": 105, "date": "2026-11-05", "pest": "정상", "severity": "없음", "status": "정상"},
     ]},
]

ADMIN_STATS = {
    "collection": {"collected": 12840, "analyzed": 11920, "success_rate": 92.8},
    "diagnosis": {"total": 3562, "avg_confidence": 0.87, "rediagnosis_rate": 6.4},
    "users": {"active": 412, "farmers": 355, "companies": 41, "admins": 16},
    "ranking": [
        {"name": "총채벌레", "count": 742}, {"name": "흰가루병", "count": 685},
        {"name": "탄저병", "count": 590}, {"name": "잿빛곰팡이병", "count": 452},
        {"name": "노균병", "count": 388},
    ],
    "region_diagnosis": [
        {"region": "전남", "count": 812}, {"region": "경북", "count": 690},
        {"region": "충남", "count": 648}, {"region": "경기", "count": 520},
        {"region": "기타", "count": 892},
    ],
}

COMPANY_DEMANDS = [
    {"id": 1, "company": "(주)그린아그로", "crops": ["딸기", "토마토"], "regions": ["전남", "충남"], "interest": "병해충 발생 동향 리포트", "status": "구조화 완료"},
    {"id": 2, "company": "팜케어", "crops": ["고추"], "regions": ["경북"], "interest": "탄저병 조기 경보 알림", "status": "분석 대기"},
]

CONTROL_MANUALS = [
    {"id": 1, "title": "시설 딸기 잿빛곰팡이병 저온다습기 관리", "pest": "잿빛곰팡이병", "crop": "딸기", "stage": "예방",
     "steps": ["야간 최저 8℃ 이상 보온", "일출 직후 30분 환기로 결로 제거", "병든 과실·잎 즉시 제거 후 밀봉 폐기", "펜헥사미드 계열 7일 간격 2회 살포"]},
    {"id": 2, "title": "고추 탄저병 장마철 방제 체계", "pest": "탄저병", "crop": "고추", "stage": "치료",
     "steps": ["비가림 재배·멀칭으로 빗물 튐 차단", "강우 전 예방 살포", "발병과 즉시 제거", "디페노코나졸 계열 교호 살포(저항성 방지)"]},
    {"id": 3, "title": "오이 총채벌레 종합관리(IPM)", "pest": "총채벌레", "crop": "오이", "stage": "예찰",
     "steps": ["청색 끈끈이 트랩 10a당 20매 설치", "주 1회 트랩 밀도 기록", "미끌애꽃노린재 천적 방사", "밀도 초과 시 스피네토람 계열 살포"]},
]
