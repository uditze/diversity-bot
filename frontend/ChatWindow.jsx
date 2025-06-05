import React, { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem('session_id') || crypto.randomUUID();
  });
  const [lang, setLang] = useState('he');
  const bottomRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('session_id', sessionId);
    fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ init: true, session_id: sessionId })
    })
      .then(res => {
        if (!res.ok) throw new Error('Server returned error ' + res.status);
        return res.json();
      })
      .then(data => {
        setMessages([{ sender: 'bot', text: data.response }]);
        setLang(detectLanguage(data.response));
      })
      .catch(err => {
        console.error(err);
        setMessages([{ sender: 'bot', text: 'Sorry, something went wrong.' }]);
      });
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.height = 'auto';
      textRef.current.style.height = textRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const detectLanguage = (text) => {
    if (/[\u0600-\u06FF]/.test(text)) return 'ar';
    if (/[A-Za-z]/.test(text)) return 'en';
    return 'he';
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, session_id: sessionId })
      });
      if (!res.ok) throw new Error('Server returned error ' + res.status);
      let data;
      try {
        data = await res.json();
      } catch (e) {
        console.error('JSON parse error:', e);
        setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, something went wrong.' }]);
        return;
      }
      setMessages((prev) => [...prev, { sender: 'bot', text: data.response }]);
      setLang(detectLanguage(data.response));
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, something went wrong.' }]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-full w-full" dir={lang === 'en' ? 'ltr' : 'rtl'}>
      <div className="w-full flex-1 overflow-y-auto flex flex-col space-y-4 p-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} sender={msg.sender} text={msg.text} lang={lang} />
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="w-full p-4 border-t border-gray-300 flex flex-col gap-2">
        <textarea
          ref={textRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          className={`w-full resize-none rounded-lg border p-3 focus:outline-none ${lang === 'en' ? 'text-left' : 'text-right'}`}
          placeholder="כתוב כאן..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg self-end">
          שלח
        </button>
      </div>
    </div>
  );
}
