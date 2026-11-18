import { useEffect, useMemo, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ErrorState, SkeletonCard } from '../components/Skeleton';

const COLORS = ['#16a34a', '#0ea5e9', '#f59e0b', '#a855f7', '#ef4444'];

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
        <h1 className="font-heading text-2xl font-bold text-gray-900">병해충 발생 동향</h1>
        <p className="mt-1 text-sm text-gray-500">지역·작물·시기별 발생 통계와 기상 연관 분석을 제공합니다.</p>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {/* 월별 발생 추이 */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-heading font-semibold text-gray-900">월별 주요 병해충 발생 추이</h2>
        {monthly ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
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
        {/* 지역별 발생 */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-heading font-semibold text-gray-900">지역별 발생 건수</h2>
          {regions ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={regions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" name="발생 건수" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="skeleton h-[280px] w-full" />}
          {regions && (
            <ul className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
              {regions.map((r) => (
                <li key={r.region}><span className="font-medium text-gray-700">{r.region}</span> 다빈도: {r.top}</li>
              ))}
            </ul>
          )}
        </section>

        {/* 기상 연관 */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-heading font-semibold text-gray-900">습도와 병해충 발생의 상관관계</h2>
          {weather ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={weatherData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis yAxisId="l" fontSize={12} />
                <YAxis yAxisId="r" orientation="right" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line yAxisId="l" type="monotone" dataKey="습도" stroke="#0ea5e9" strokeWidth={2} dot={false} unit="%" />
                <Line yAxisId="r" type="monotone" dataKey="발생건수" stroke="#16a34a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="skeleton h-[280px] w-full" />}
          <p className="mt-3 text-xs text-gray-400">장마철(6~8월) 습도 상승 구간에서 발생 건수가 동반 증가하는 경향</p>
        </section>
      </div>

      {/* 기업 수요 */}
      {user && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading font-semibold text-gray-900">기업 수요 등록 현황</h2>
            <span className="text-xs text-gray-400">관심 작물·지역 등록 → AI 구조화 → 맞춤 리포트·알림 반영</span>
          </div>
          {demands.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-400">
                    <th className="pb-2">기업</th><th className="pb-2">관심 작물</th>
                    <th className="pb-2">지역</th><th className="pb-2">요청 내용</th><th className="pb-2">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {demands.map((d) => (
                    <tr key={d.id} className="border-b last:border-0">
                      <td className="py-2.5 font-medium">{d.company}</td>
                      <td className="py-2.5">{d.crops.join(', ')}</td>
                      <td className="py-2.5">{d.regions.join(', ')}</td>
                      <td className="py-2.5">{d.interest}</td>
                      <td className="py-2.5">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${
                          d.status === '구조화 완료' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
                        }`}>{d.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <SkeletonCard />}
        </section>
      )}
    </div>
  );
}
