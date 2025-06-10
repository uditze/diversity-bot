import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createThreadAndSendMessage } from './assistant.js';
import { getNextScenario } from './scenarios.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- רשם בקשות חדש ---
// ידפיס כל בקשה שמגיעה לשרת
app.use((req, res, next) => {
  console.log(`[Request Logger] התקבלה בקשה: ${req.method} ${req.path}`);
  next(); // המשך לבקשה הבאה
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
    console.error('❌ Error handling /chat:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

// מסלול לשליפת תרחישים
app.post('/scenario', (req, res) => {
  const { thread_id, language } = req.body;
  try {
    const result = getNextScenario(thread_id, language);
    if (result.scenario) {
      res.json({ scenario: result.scenario });
    } else {
      res.status(404).json({ error: 'No scenario found or available.' });
    }
  } catch (err) {
    console.error('❌ Error handling /scenario:', err);
    res.status(500).json({ error: 'Failed to retrieve scenario.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
