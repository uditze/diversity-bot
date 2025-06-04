import React from 'react';
import { useState, useEffect, useRef } from 'react';

export default function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem('session_id') || crypto.randomUUID();
  });
  const bottomRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('session_id', sessionId);
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');

    const res = await fetch('https://diversity-bot-jy5a.onrender.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, session_id: sessionId }),
    });

    const data = await res.json();
    setMessages(prev => [...prev, { sender: 'bot', text: data.response }]);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center font-sans text-xl leading-relaxed">
      <header className="w-full text-center text-3xl font-bold py-6 border-b border-gray-300 bg-blue-50 shadow sticky top-0 z-10">
        אלברט – בוט לקידום כשירות תרבותית בהוראה
      </header>

      <main className="flex-1 w-full flex justify-center items-start px-4 pt-12">
        <div className="w-full max-w-3xl flex flex-col space-y-10">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={
                'px-5 py-4 rounded-xl whitespace-pre-line break-words shadow-sm text-right ' +
                (msg.sender === 'user'
                  ? 'bg-blue-100 self-end font-sans text-gray-900'
                  : 'bg-gray-200 self-start font-serif text-gray-800')
              }
            >
              {msg.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </main>

      <footer className="w-full py-10 bg-blue-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto w-full flex flex-col items-center gap-4 px-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            className="w-full min-h-[60px] max-h-[300px] resize-y rounded-xl border border-gray-400 p-4 text-xl focus:outline-none focus:ring focus:ring-blue-300 text-right"
            placeholder="כתוב כאן..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 text-xl"
          >
            שלח
          </button>
        </div>
      </footer>
    
