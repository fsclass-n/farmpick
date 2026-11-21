import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { api } from '../lib/api';

const SUGGESTIONS = ['흰가루병 방제 방법 알려줘', '총채벌레 증상이 뭐야?', '진딧물 천적 방제는?'];

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: '안녕하세요! farmpick AI 상담사입니다. 병해충 이름이나 증상을 질문해 주세요.', sources: [] },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const data = await api('/api/chat/', { method: 'POST', body: { message: msg } });
      setMessages((m) => [...m, { role: 'ai', text: data.reply, sources: data.sources }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'ai', text: `오류: ${err.message} (로그인이 필요할 수 있습니다)`, sources: [] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-14rem)] max-w-3xl flex-col">
      <div className="mb-4">
        <p className="eyebrow">AI Assistant</p>
        <h1 className="page-title">AI 상담</h1>
        <p className="page-desc">병해충 DB와 진단 이력을 근거로 답변합니다.</p>
      </div>

      <div className="hairline flex-1 space-y-4 overflow-y-auto bg-white p-5">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user' ? 'bg-ink-900 text-white' : 'border border-ink-200 bg-ink-50 text-ink-800'
            }`}>
              <div className="whitespace-pre-wrap">
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
              {m.sources?.length > 0 && (
                <p className={`mt-2 border-t pt-2 text-xs ${m.role === 'user' ? 'border-white/20 text-white/60' : 'border-ink-200 text-ink-400'}`}>
                  <i className="fa-solid fa-book mr-1" />참고: {m.sources.join(', ')}
                </p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-500">
              <i className="fa-solid fa-ellipsis fa-beat-fade" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => send(s)}
            className="border border-ink-200 bg-white px-3 py-1.5 text-xs text-ink-600 hover:border-forest-500 hover:text-forest-700">
            {s}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="병해충에 대해 질문하세요…"
          className="input !py-3"
        />
        <button onClick={() => send()} disabled={loading} className="btn-primary rounded-md px-5" aria-label="전송">
          <i className="fa-solid fa-paper-plane text-sm" />
        </button>
      </div>
    </div>
  );
}
