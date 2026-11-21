"""병해충 발생 트렌드 분석 (담당: 이오리)"""

import pandas as pd


def monthly_trend(df: pd.DataFrame, pest_col: str = "pest", month_col: str = "month") -> dict:
    pivot = df.groupby([pest_col, month_col]).size().unstack(fill_value=0)
    return {
        "labels": [f"{m}월" for m in pivot.columns],
        "series": [{"name": idx, "data": row.tolist()} for idx, row in pivot.iterrows()],
    }


def region_summary(df: pd.DataFrame, region_col: str = "region", pest_col: str = "pest") -> list[dict]:
    summary = []
    for region, g in df.groupby(region_col):
        top = g[pest_col].value_counts().idxmax()
        summary.append({"region": region, "count": len(g), "top": top})
    return sorted(summary, key=lambda x: -x["count"])


def weather_correlation(occurrence: pd.Series, humidity: pd.Series) -> float:
    return float(occurrence.corr(humidity))
