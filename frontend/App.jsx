import React from 'react';
import ChatWindow from './ChatWindow';

export default function App() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-white text-gray-900">
      <div className="w-full max-w-3xl h-full flex flex-col border border-gray-300 shadow-lg rounded-lg overflow-hidden">
        <header className="text-center text-2xl font-bold py-4 bg-blue-50 border-b border-gray-300">
          אלברט - בוט לקידום הכשירות התרבותית של סגל הוראה
        </header>
        <ChatWindow />
      </div>
    </div>
  );
}
