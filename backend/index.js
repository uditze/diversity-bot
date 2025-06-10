import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createThreadAndSendMessage } from './assistant.js';
import { getNextScenario } from './scenarios.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// רשם בקשות
app.use((req, res, next) => {
  console.log(`[Request Logger] התקבלה בקשה: ${req.method} ${req.path}`);
  next();
});

// מסלול הצ'אט הקיים
app.post('/chat', async (req, res) => {
  const { message, thread_id, language, gender } = req.body;
  try {
    const { reply, newThreadId } = await createThreadAndSendMessage({
      message, thread_id, language, gender,
    });
    res.json({ reply, thread_id: newThreadId || thread_id });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

// --- מסלול תרחישים עם קוד בדיקה קשיח ---
app.post('/scenario', (req, res) => {
  console.log('[TEST] נכנסתי בהצלחה לתוך הלוגיקה של /scenario.');
  const testScenario = {
    scenario: 'זהו תרחיש בדיקה. אם אתה רואה את ההודעה הזו, הניתוב עובד והתקלה כמעט פתורה!'
  };
  res.json(testScenario);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
