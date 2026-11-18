import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const STEPS = ['이미지 업로드', 'AI 분석 중', '결과 생성'];

export default function Diagnosis() {
  const { user } = useAuth();
  const [crops, setCrops] = useState([]);
  const [crop, setCrop] = useState('토마토');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef();

  useEffect(() => {
    api('/api/pests/crops').then(setCrops).catch(() => {});
  }, []);

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError('');
  };

  const analyze = async () => {
    if (!user) {
      setError('로그인 후 이용 가능합니다.');
      return;
    }
    setStep(1);
    setError('');
    try {
      let data;
      if (file) {
        const fd = new FormData();
        fd.append('image', file);
        fd.append('crop', crop);
        data = await api('/api/diagnosis/analyze', { method: 'POST', formData: fd });
      } else {
        data = await api(`/api/diagnosis/mock-preview?crop=${encodeURIComponent(crop)}`, { method: 'POST' });
      }
      setStep(2);
      setResult(data.result || data);
    } catch (err) {
      setStep(0);
      setError(err.message);
    }
  };

  const reset = () => {
    setFile(null); setPreview(null); setResult(null); setStep(0); setError('');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-2xl font-bold text-gray-900">AI 병해충 진단</h1>
      <p className="mt-1 text-sm text-gray-500">생육 이미지를 업로드하면 AI가 병해충을 진단하고 방제 방법을 추천합니다.</p>

      {/* 진행 단계 */}
      <div className="mt-6 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              i <= step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>{i + 1}</span>
            <span className={`text-sm ${i <= step ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-8 bg-gray-300" />}
          </div>
        ))}
      </div>

      {!result && (
        <div className="organic-card mt-6 border border-forest-200 bg-white p-6">
          <label className="mb-1 block text-sm font-medium text-gray-700">작물 선택</label>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
          >
            {crops.map((c) => <option key={c}>{c}</option>)}
          </select>

          <div
            onClick={() => step !== 1 && inputRef.current?.click()}
            className={`mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 ${
              step === 1 ? 'scanner border-forest-400 bg-forest-50 cursor-wait'
              : 'cursor-pointer border-forest-200 bg-forest-50/50 hover:border-forest-400 hover:bg-forest-50'
            }`}
          >
            {preview ? (
              <div className={step === 1 ? 'scanner rounded-lg' : ''}>
                <img src={preview} alt="업로드 이미지" className="max-h-64 rounded-lg object-contain" />
                {step === 1 && (
                  <p className="mt-3 text-center text-xs font-medium text-forest-600">
                    <i className="fa-solid fa-satellite-dish mr-1" />AI가 이미지를 스캔하고 있습니다…
                  </p>
                )}
              </div>
            ) : (
              <>
                <i className="fa-solid fa-cloud-arrow-up text-4xl text-forest-500" />
                <p className="mt-3 text-sm font-medium text-forest-900">사진을 업로드하거나 촬영하세요</p>
                <p className="mt-1 text-xs text-gray-400">JPG/PNG, 최대 10MB</p>
              </>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={pick} className="hidden" />

          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div className="mt-5 flex gap-3">
            <button
              onClick={analyze}
              disabled={step === 1}
              className="flex-1 rounded-xl bg-forest-800 py-3 font-medium text-sprout-300 hover:bg-forest-700 disabled:opacity-50"
            >
              {step === 1 ? (
                <><i className="fa-solid fa-spinner fa-spin mr-2" />AI 분석 중…</>
              ) : (
                <><i className="fa-solid fa-microscope mr-2" />{file ? 'AI 진단 시작' : '데모 진단 체험'}</>
              )}
            </button>
            {preview && (
              <button onClick={reset} className="rounded-xl border border-gray-300 px-5 text-sm hover:bg-gray-100">
                초기화
              </button>
            )}
          </div>
          <p className="mt-3 text-xs text-gray-400">
            * 이미지 없이 실행하면 데모 데이터로 진단 결과 카드를 미리 볼 수 있습니다.
          </p>
        </div>
      )}

      {/* 결과 카드 */}
      {result && (
        <div className="fade-in mt-6 space-y-4">
          <div className="organic-card border border-forest-200 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-xl font-bold text-gray-900">{result.pest}</h2>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    result.type === '병' ? 'bg-purple-100 text-purple-700'
                    : result.type === '충' ? 'bg-orange-100 text-orange-700'
                    : 'bg-primary-100 text-primary-700'
                  }`}>{result.type}</span>
                  {result.mock && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">DEMO</span>}
                </div>
                <p className="mt-1 text-sm text-gray-500">작물: {crop} · 심각도: {result.severity}</p>
              </div>
              {/* 신뢰도 게이지 */}
              <div className="text-right">
                <p className="text-xs text-gray-400">AI 신뢰도</p>
                <p className="font-heading text-2xl font-bold text-forest-600">
                  {Math.round((result.confidence || 0) * 100)}%
                </p>
              </div>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-forest-100">
              <div className="h-full rounded-full bg-gradient-to-r from-forest-600 to-sprout-500" style={{ width: `${(result.confidence || 0) * 100}%` }} />
            </div>

            <dl className="mt-6 space-y-4">
              {[
                ['관찰 증상', result.symptoms, 'fa-eye'],
                ['발생 원인', result.cause, 'fa-circle-question'],
                ['방제 추천 (Pick)', result.control, 'fa-spray-can-sparkles'],
              ].map(([t, d, icon]) => (
                <div key={t} className="flex gap-3">
                  <i className={`fa-solid ${icon} mt-1 text-primary-600`} />
                  <div>
                    <dt className="text-sm font-semibold text-gray-800">{t}</dt>
                    <dd className="mt-0.5 text-sm text-gray-600">{d}</dd>
                  </div>
                </div>
              ))}
            </dl>

            {result.similar_cases?.length > 0 && (
              <p className="mt-4 text-xs text-gray-400">
                유사 사례: {result.similar_cases.join(' · ')}
              </p>
            )}
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <i className="fa-solid fa-triangle-exclamation mr-1" />{result.caution}
            </p>
          </div>
          <button onClick={reset} className="w-full rounded-xl border border-gray-300 bg-white py-3 text-sm font-medium hover:bg-gray-50">
            다른 사진으로 다시 진단하기
          </button>
        </div>
      )}
    </div>
  );
}
