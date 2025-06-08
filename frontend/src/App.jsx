import React, { useEffect, useRef, useState } from 'react';
import './App.css';

function randomId() {
  return Math.random().toString(36).slice(2);
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dir, setDir] = useState('ltr');
  const textareaRef = useRef(null);

  const sessionIdRef = useRef(null);
  useEffect(() => {
    let sid = localStorage.getItem('session_id');
    if (!sid) {
      sid = randomId();
      localStorage.setItem('session_id', sid);
    }
    sessionIdRef.current = sid;
  }, []);

  const adjustHeight = (e) => {
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  const detectDir = (text) => {
    if (/[\u0590-\u05FF\u0600-\u06FF]/.test(text)) return 'rtl';
    return 'ltr';
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages((m) => [...m, { sender: 'user', text: userMsg }]);
    setDir(detectDir(userMsg));
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/chat';
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, session_id: sessionIdRef.current })
      });
      const data = await res.json();
      if (data.response) {
        setMessages((m) => [...m, { sender: 'bot', text: data.response }]);
        setDir(detectDir(data.response));
      }
    } catch {
      setMessages((m) => [...m, { sender: 'bot', text: 'Error processing request.' }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="chat-container" dir={dir}>
      <header className="header">
        אלברט - בוט לקידום הכשירות התרבותית בהוראה באקדמיה
      </header>
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.sender}`}>{m.text}</div>
        ))}
        {loading && <div className="message bot">...</div>}
      </div>
      <div className="input-area">
        <textarea
          ref={textareaRef}
          value={input}
          onInput={(e) => { adjustHeight(e); setInput(e.target.value); }}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Type your message..."
        />
        <button onClick={send} disabled={loading}>Send</button>
      </div>
    </div>
  );
}
