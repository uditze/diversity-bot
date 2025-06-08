import React, { useState } from 'react';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages((m) => [...m, { sender: 'user', text: userMsg }]);
    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setMessages((m) => [...m, { sender: 'bot', text: data.response }]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>AI Chat</h1>
      <div>
        {messages.map((m, i) => (
          <div key={i}><strong>{m.sender}:</strong> {m.text}</div>
        ))}
      </div>
      <textarea
        rows="3"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: '100%', marginTop: '1rem' }}
      />
      <button onClick={send}>Send</button>
    </div>
  );
}
