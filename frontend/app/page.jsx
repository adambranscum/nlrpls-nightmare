'use client';

import { useState, useRef, useEffect } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey, I'm nightmare — ask me anything about our IT setup.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: question }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }

      const data = await res.json();

      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: data.answer || data.error || 'No answer came back.',
          sources: data.sources,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: "Couldn't reach the backend. Is it running?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen">
      <div className="topbar">
        <h1>nightmare</h1>
        <span className="badge">NLRPLS IT Reference</span>
      </div>

      <div className="chat-area">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.content}
            {m.sources?.length > 0 && (
              <div className="sources">
                {m.sources.map((s, j) => (
                  <span key={j} className="source-chip">
                    {s.file} #{s.chunk}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <div className="msg assistant">Thinking…</div>}
        <div ref={bottomRef} />
      </div>

      <div className="input-bar">
        <form onSubmit={handleSubmit}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask an IT question…"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
