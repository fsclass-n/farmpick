import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const STEPS = ['이미지 업로드', 'AI 분석 중', '결과 생성'];

export default function Diagnosis() {
  const { user } = useAuth();
  const [crops, setCrops] = useState([]);
  const [allPests, setAllPests] = useState([]);
  const [crop, setCrop] = useState('토마토');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef();

  useEffect(() => {
    api('/api/pests/crops').then(setCrops).catch(() => {});
    api('/api/pests/').then(setAllPests).catch(() => {});
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
    if (!user) { setError('로그인 후 이용 가능합니다.'); return; }
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

  const reset = () => { setFile(null); setPreview(null); setResult(null); setStep(0); setError(''); };

  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow">Diagnosis</p>
      <h1 className="page-title">AI 병해충 진단</h1>
      <p className="page-desc">생육 이미지를 업로드하면 AI가 병해충을 진단하고 방제 방법을 추천합니다.</p>

      {/* 진행 단계 */}
      <div className="mt-8 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className={`flex h-6 w-6 items-center justify-center text-[11px] font-bold ${
              i <= step ? 'bg-ink-900 text-white' : 'border border-ink-300 text-ink-400'
            }`}>{i + 1}</span>
            <span className={`text-[13px] ${i <= step ? 'text-ink-900' : 'text-ink-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-8 bg-ink-200" />}
          </div>
        ))}
      </div>

      {!result && (
        <div className="hairline mt-6 bg-white p-6 md:p-8">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-500">작물 선택</label>
          <select value={crop} onChange={(e) => setCrop(e.target.value)} className="input">
            {crops.map((c) => <option key={c}>{c}</option>)}
          </select>

          <div
            onClick={() => step !== 1 && inputRef.current?.click()}
            className={`mt-5 flex flex-col items-center justify-center border-2 border-dashed py-14 ${
              step === 1
                ? 'scanner cursor-wait border-forest-400 bg-forest-50'
                : 'cursor-pointer border-ink-300 bg-ink-50 hover:border-forest-500 hover:bg-forest-50'
            }`}
          >
            {preview ? (
              <div className={step === 1 ? 'scanner' : ''}>
                <img src={preview} alt="업로드 이미지" className="max-h-64 object-contain" />
                {step === 1 && (
                  <p className="mt-4 text-center text-xs font-medium tracking-wide text-forest-600">
                    <i className="fa-solid fa-satellite-dish mr-1" />AI가 이미지를 스캔하고 있습니다…
                  </p>
                )}
              </div>
            ) : (
              <>
                <i className="fa-solid fa-cloud-arrow-up text-3xl text-forest-500" />
                <p className="mt-4 text-sm font-medium text-ink-800">사진을 업로드하거나 촬영하세요</p>
                <p className="mt-1 text-xs text-ink-400">JPG/PNG, 최대 10MB</p>
              </>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={pick} className="hidden" />

          {error && <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">{error}</p>}

          <div className="mt-6 flex gap-3">
            <button onClick={analyze} disabled={step === 1} className="btn-primary flex-1 rounded-md py-3 text-sm">
              {step === 1 ? (
                <><i className="fa-solid fa-spinner fa-spin mr-2" />AI 분석 중…</>
              ) : (
                <><i className="fa-solid fa-microscope mr-2" />{file ? 'AI 진단 시작' : '데모 진단 체험'}</>
              )}
            </button>
            {preview && (
              <button onClick={reset} className="btn-ghost rounded-md px-5 text-sm">초기화</button>
            )}
          </div>
          <p className="mt-3 text-xs text-ink-400">
            * 이미지 없이 실행하면 데모 데이터로 진단 결과 카드를 미리 볼 수 있습니다.
          </p>
        </div>
      )}

      {/* 결과 카드 */}
      {result && (
        <div className="fade-in mt-6 space-y-4">
          <div className="hairline bg-white p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-xl font-bold text-ink-950">{result.pest}</h2>
                  <span className={`px-2 py-0.5 text-[11px] tracking-wide ${
                    result.type === '병' ? 'bg-purple-50 text-purple-700'
                    : result.type === '충' ? 'bg-orange-50 text-orange-700'
                    : 'bg-forest-100 text-forest-700'
                  }`}>{result.type}</span>
                  {result.mock && <span className="bg-ink-100 px-2 py-0.5 text-[10px] tracking-wider text-ink-500">DEMO</span>}
                </div>
                <p className="mt-1 text-sm text-ink-500">작물: {crop} · 심각도: {result.severity}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-[0.15em] text-ink-400">AI 신뢰도</p>
                <p className="font-heading text-3xl font-bold tracking-tight text-forest-600">
                  {Math.round((result.confidence || 0) * 100)}%
                </p>
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden bg-ink-100">
              <div className="h-full bg-forest-500" style={{ width: `${(result.confidence || 0) * 100}%` }} />
            </div>

            <dl className="mt-7 divide-y divide-ink-100 border-t border-ink-200">
              {[
                ['관찰 증상', result.symptoms, 'fa-eye'],
                ['발생 원인', result.cause, 'fa-circle-question'],
                ['방제 추천 (Pick)', result.control, 'fa-spray-can-sparkles'],
              ].map(([t, d, icon]) => (
                <div key={t} className="flex gap-4 py-4">
                  <i className={`fa-solid ${icon} mt-1 w-4 text-forest-600`} />
                  <div>
                    <dt className="text-[13px] font-semibold text-ink-900">{t}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-ink-600">{d}</dd>
                  </div>
                </div>
              ))}
            </dl>

            {/* 혼동 주의 — 유사 병해충 증상 비교 */}
            {result.similar_cases?.length > 0 && (
              <div className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-400">
                  혼동 주의 — 유사 병해충 증상 비교
                </p>
                <div className="mt-2 divide-y divide-ink-100 border border-ink-200">
                  <div className="flex gap-3 bg-forest-50 px-4 py-3">
                    <span className="mt-0.5 shrink-0 bg-forest-100 px-2 py-0.5 text-[10px] tracking-wide text-forest-700">진단</span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-ink-900">{result.pest}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-500">{result.symptoms}</p>
                    </div>
                  </div>
                  {result.similar_cases.map((name) => {
                    const sp = allPests.find((p) => p.name === name);
                    return (
                      <div key={name} className="flex gap-3 px-4 py-3">
                        <span className="mt-0.5 shrink-0 bg-ink-100 px-2 py-0.5 text-[10px] tracking-wide text-ink-500">유사</span>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-ink-900">{name}</p>
                          {sp && <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-500">{sp.symptoms}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <p className="mt-4 border border-harvest/30 bg-harvest/5 px-3 py-2.5 text-xs text-harvest">
              <i className="fa-solid fa-triangle-exclamation mr-1" />{result.caution}
            </p>
          </div>
          <button onClick={reset} className="btn-ghost w-full rounded-md bg-white py-3 text-sm">
            다른 사진으로 다시 진단하기
          </button>
        </div>
      )}
    </div>
  );
}
