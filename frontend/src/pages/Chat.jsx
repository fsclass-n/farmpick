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
    <div className="mx-auto flex h-[calc(100vh-13rem)] max-w-3xl flex-col">
      <div className="mb-4">
        <h1 className="font-heading text-2xl font-bold text-gray-900">AI 상담</h1>
        <p className="text-sm text-gray-500">병해충 DB와 진단 이력을 근거로 답변합니다.</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}>
              <div className="whitespace-pre-wrap">
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
              {m.sources?.length > 0 && (
                <p className={`mt-2 border-t pt-2 text-xs ${m.role === 'user' ? 'border-white/30 text-primary-100' : 'border-gray-200 text-gray-400'}`}>
                  <i className="fa-solid fa-book mr-1" />참고: {m.sources.join(', ')}
                </p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-500">
              <i className="fa-solid fa-ellipsis fa-beat-fade" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => send(s)}
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:border-primary-400 hover:text-primary-700">
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
          className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
        <button
          onClick={() => send()}
          disabled={loading}
          className="rounded-xl bg-primary-600 px-5 text-white hover:bg-primary-700 disabled:opacity-50"
          aria-label="전송"
        >
          <i className="fa-solid fa-paper-plane" />
        </button>
      </div>
    </div>
  );
}
