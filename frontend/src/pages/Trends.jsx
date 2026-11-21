import { useEffect, useMemo, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ErrorState } from '../components/Skeleton';

const COLORS = ['#3f6f58', '#5b8ea3', '#b98a4e', '#8b7aa8', '#b0604f'];

export default function Trends() {
  const { user } = useAuth();
  const [monthly, setMonthly] = useState(null);
  const [regions, setRegions] = useState(null);
  const [weather, setWeather] = useState(null);
  const [demands, setDemands] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    Promise.all([
      api('/api/trends/monthly').then(setMonthly),
      api('/api/trends/regions').then(setRegions),
      api('/api/trends/weather-correlation').then(setWeather),
    ]).catch((e) => setError(e.message));
    if (user) api('/api/trends/company-demands').then(setDemands).catch(() => {});
  };
  useEffect(load, [user]);

  const monthlyData = useMemo(() => {
    if (!monthly) return [];
    return monthly.labels.map((label, i) => {
      const row = { name: label };
      monthly.series.forEach((s) => { row[s.name] = s.data[i]; });
      return row;
    });
  }, [monthly]);

  const weatherData = useMemo(() => {
    if (!weather) return [];
    return weather.labels.map((label, i) => ({
      name: label, 습도: weather.humidity[i], 발생건수: weather.occurrence[i],
    }));
  }, [weather]);

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Trends</p>
        <h1 className="page-title">병해충 발생 동향</h1>
        <p className="page-desc">지역·작물·시기별 발생 통계와 기상 연관 분석을 제공합니다.</p>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      <section className="hairline bg-white p-6">
        <h2 className="mb-4 font-heading font-semibold text-ink-950">월별 주요 병해충 발생 추이</h2>
        {monthly ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ececea" />
              <XAxis dataKey="name" fontSize={12} stroke="#8f8f8a" />
              <YAxis fontSize={12} stroke="#8f8f8a" />
              <Tooltip />
              <Legend />
              {monthly.series.map((s, i) => (
                <Line key={s.name} type="monotone" dataKey={s.name} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : <div className="skeleton h-[300px] w-full" />}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="hairline bg-white p-6">
          <h2 className="mb-4 font-heading font-semibold text-ink-950">지역별 발생 건수</h2>
          {regions ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={regions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ececea" />
                <XAxis dataKey="region" fontSize={12} stroke="#8f8f8a" />
                <YAxis fontSize={12} stroke="#8f8f8a" />
                <Tooltip />
                <Bar dataKey="count" name="발생 건수" fill="#3f6f58" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="skeleton h-[280px] w-full" />}
          {regions && (
            <ul className="mt-4 grid grid-cols-2 gap-2 text-xs text-ink-500">
              {regions.map((r) => (
                <li key={r.region}><span className="font-medium text-ink-800">{r.region}</span> 다빈도: {r.top}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="hairline bg-white p-6">
          <h2 className="mb-4 font-heading font-semibold text-ink-950">습도와 병해충 발생의 상관관계</h2>
          {weather ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={weatherData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ececea" />
                <XAxis dataKey="name" fontSize={12} stroke="#8f8f8a" />
                <YAxis yAxisId="l" fontSize={12} stroke="#8f8f8a" />
                <YAxis yAxisId="r" orientation="right" fontSize={12} stroke="#8f8f8a" />
                <Tooltip />
                <Legend />
                <Line yAxisId="l" type="monotone" dataKey="습도" stroke="#5b8ea3" strokeWidth={2} dot={false} unit="%" />
                <Line yAxisId="r" type="monotone" dataKey="발생건수" stroke="#3f6f58" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="skeleton h-[280px] w-full" />}
          <p className="mt-3 text-xs text-ink-400">장마철(6~8월) 습도 상승 구간에서 발생 건수가 동반 증가하는 경향</p>
        </section>
      </div>

      {user && (
        <section className="hairline bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading font-semibold text-ink-950">기업 수요 등록 현황</h2>
            <span className="text-xs text-ink-400">관심 작물·지역 등록 → AI 구조화 → 맞춤 리포트·알림 반영</span>
          </div>
          {demands.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-200 text-left text-[11px] uppercase tracking-wider text-ink-400">
                    <th className="pb-3">기업</th><th className="pb-3">관심 작물</th>
                    <th className="pb-3">지역</th><th className="pb-3">요청 내용</th><th className="pb-3">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {demands.map((d) => (
                    <tr key={d.id} className="border-b border-ink-100 last:border-0">
                      <td className="py-3 font-medium text-ink-900">{d.company}</td>
                      <td className="py-3 text-ink-600">{d.crops.join(', ')}</td>
                      <td className="py-3 text-ink-600">{d.regions.join(', ')}</td>
                      <td className="py-3 text-ink-600">{d.interest}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 text-[11px] tracking-wide ${
                          d.status === '구조화 완료' ? 'bg-forest-100 text-forest-700' : 'bg-ink-100 text-ink-500'
                        }`}>{d.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="skeleton h-24 w-full" />}
        </section>
      )}
    </div>
  );
}
