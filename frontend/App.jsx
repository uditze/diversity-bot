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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col font-sans">
      <header className="text-center text-xl sm:text-2xl font-semibold py-4 border-b border-gray-300 bg-white sticky top-0 z-10 shadow-sm dark:bg-gray-800">
        אלברט – בוט לקידום כשירות תרבותית בהוראה
      </header>

      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-2xl p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={\`max-w-prose px-4 py-3 rounded-xl shadow-sm whitespace-pre-line leading-relaxed \${msg.sender === 'user'
                ? 'bg-blue-100 self-end font-sans text-gray-900'
                : 'bg-gray-200 self-start font-serif text-gray-800 mt-6'}\`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </main>

      <footer className="p-4 bg-white dark:bg-gray-800 border-t border-gray-300">
        <div className="max-w-2xl mx-auto flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-400 p-3 text-base focus:outline-none focus:ring focus:ring-blue-300"
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
            className="bg-blue-500 text-white px-5 py-3 rounded-xl hover:bg-blue-600"
          >
            שלח
          </button>
        </div>
      </footer>
    </div>
  );
}
