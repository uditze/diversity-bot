import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { randomUUID } from 'crypto'; // הוספנו מחדש
import { createThreadAndSendMessage } from './assistant.js';
import { supabase } from './supabaseClient.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ החזרנו את הנתיב החסר ליצירת סשן
app.get('/start-session', (req, res) => {
  const sessionId = randomUUID();
  res.json({ sessionId: sessionId });
});

// הנתיב הראשי של הצ'אטבוט
app.post('/chat', async (req, res) => {
  try {
    const { message, thread_id, language, gender } = req.body;

    // שמירת הודעת המשתמש
    await supabase
      .from('responses')
      .insert([{ session_id: thread_id, role: 'user', content: message, language: language }]);
    console.log('✅ Chatbot: User response saved.');

    // קבלת תגובה מה-Assistant
    const { reply, newThreadId } = await createThreadAndSendMessage({
      message, thread_id, language, gender,
    });
    
    // שמירת תגובת הבוט
    if (reply) {
      await supabase
        .from('responses')
        .insert([{ session_id: thread_id, role: 'bot', content: reply, language: language }]);
      console.log('✅ Chatbot: Bot response saved.');
    }
    
    res.json({ reply, thread_id: newThreadId || thread_id });
    
  } catch (err) {
    console.error('Error in /chat handler:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Original chatbot server running on port ${PORT}`);
});
