import React from 'react';

export default function MessageBubble({ sender, text, lang }) {
  const align = sender === 'user' ? 'self-end' : 'self-start';
  const bg = sender === 'user' ? 'bg-blue-100' : 'bg-gray-200';
  const font = sender === 'user' ? 'font-sans' : 'font-serif';
  return (
    <div className={`${align} ${bg} ${font} px-4 py-3 rounded-xl whitespace-pre-line break-words shadow`}
         dir={lang === 'en' ? 'ltr' : 'rtl'}>
      {text}
    </div>
  );
}
