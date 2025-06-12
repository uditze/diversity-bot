import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { createThreadAndSendMessage } from './assistant.js';
import { getNextScenario } from './scenarios.js';
import { supabase } from './supabaseClient.js'; // ייבוא הלקוח החדש של Supabase

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/start-session', (req, res) => {
  const sessionId = randomUUID();
  res.json({ sessionId: sessionId });
});

app.post('/chat', async (req, res) => {
  try {
    const { message, thread_id, language, gender } = req.body;

    // --- שמירת התגובה באמצעות Supabase ---
    const { error } = await supabase
      .from('responses') // שם הטבלה שיצרנו
      .insert([
        { session_id: thread_id, user_response: message, language: language }
      ]);

    if (error) {
      console.error('❌ Supabase insert error:', error.message);
      // ממשיכים גם אם יש שגיאה בשמירה
    } else {
      console.log('✅ User response saved to Supabase.');
    }
    // --- סוף קטע השמירה ---

    const { reply, newThreadId } = await createThreadAndSendMessage({
      message, thread_id, language, gender,
    });
    
    res.json({ reply, thread_id: newThreadId || thread_id });
  } catch (err) {
    console.error('Error handling /chat:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

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
  console.log(`✅ Server running on port ${PORT}`);
});