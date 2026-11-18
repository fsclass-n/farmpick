"""병해충 발생 트렌드 분석 (담당: 이오리)

수집 데이터 → 지역·작물·월별 발생 통계, 기상 연관 분석 →
backend/app/mock_data.py 형식의 시각화용 JSON으로 가공.
"""

import pandas as pd


def monthly_trend(df: pd.DataFrame, pest_col: str = "pest", month_col: str = "month") -> dict:
    """월별·병해충별 발생 건수 → 차트 시리즈 형태로 변환"""
    pivot = df.groupby([pest_col, month_col]).size().unstack(fill_value=0)
    labels = [f"{m}월" for m in pivot.columns]
    return {
        "labels": labels,
        "series": [{"name": idx, "data": row.tolist()} for idx, row in pivot.iterrows()],
    }


def region_summary(df: pd.DataFrame, region_col: str = "region", pest_col: str = "pest") -> list[dict]:
    """지역별 발생 건수 + 최다 발생 병해충"""
    summary = []
    for region, g in df.groupby(region_col):
        top = g[pest_col].value_counts().idxmax()
        summary.append({"region": region, "count": len(g), "top": top})
    return sorted(summary, key=lambda x: -x["count"])


def weather_correlation(occurrence: pd.Series, humidity: pd.Series) -> float:
    """발생 건수와 습도의 상관계수"""
    return float(occurrence.corr(humidity))
