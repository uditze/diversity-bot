import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createThreadAndSendMessage } from './assistant.js';
import { getNextScenario } from './scenarios.js'; // החזרנו את הייבוא הזה
import { supabase } from './supabaseClient.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// נתיב הצ'אט הראשי
app.post('/chat', async (req, res) => {
  try {
    const { message, thread_id, language, gender } = req.body;

    // שמירת הודעת המשתמש
    const { error: userError } = await supabase
      .from('responses')
      .insert([{ session_id: thread_id, role: 'user', content: message, language: language }]);
    if (userError) console.error('Supabase insert error (user):', userError.message);

    // קבלת תגובה מה-Assistant
    const { reply, newThreadId } = await createThreadAndSendMessage({
      message, thread_id, language, gender,
    });
    
    // שמירת תגובת הבוט
    if (reply) {
      const { error: botError } = await supabase
        .from('responses')
        .insert([{ session_id: thread_id, role: 'bot', content: reply, language: language }]);
      if (botError) console.error('Supabase insert error (bot):', botError.message);
    }
    
    res.json({ reply, thread_id: newThreadId || thread_id });
  } catch (err) {
    console.error('Error in /chat handler:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

// ✅ החזרנו את הנתיב החסר לשליפת תרחישים
app.post('/scenario', (req, res) => {
  try {
    const thread_id = req.body?.thread_id;
    const language = req.body?.language;
    const result = getNextScenario(thread_id, language);
    if (result && result.scenario) {
      res.json({ scenario: result.scenario });
    } else {
      res.status(404).json({ error: 'No scenario found.' });
    }
  } catch (err) {
    console.error('❌ Error in /scenario handler:', err);
    res.status(500).json({ error: 'Failed to retrieve scenario.' });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Original chatbot server running on port ${PORT}`);
});
