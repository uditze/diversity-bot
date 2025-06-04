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

    const res = await fetch('http://localhost:3001/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, session_id: sessionId }),
    });

    const data = await res.json();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }, { sender: 'bot', text: data.response }]);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={`max-w-xl px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-200 self-end' : 'bg-gray-300 self-start'}`}>
            {msg.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="mt-4 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 rounded-l-2xl border border-gray-400 dark:border-gray-600"
          placeholder="כתוב כאן..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 rounded-r-2xl hover:bg-blue-600"
        >
          שלח
        </button>
      </div>
    </div>
  );
}