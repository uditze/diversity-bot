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

// מסלול הצ'אט
app.post('/chat', async (req, res) => {
  try {
    const { message, thread_id, language, gender } = req.body;
    const { reply, newThreadId } = await createThreadAndSendMessage({
      message, thread_id, language, gender,
    });
    res.json({ reply, thread_id: newThreadId || thread_id });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

// מסלול תרחישים - גרסה סופית
app.post('/scenario', (req, res) => {
  console.log('[Handler] נכנס ללוגיקה של /scenario.');
  try {
    const thread_id = req.body?.thread_id;
    const language = req.body?.language;
    console.log(`[Handler] קורא ל-getNextScenario עם language: ${language}`);
    
    const result = getNextScenario(thread_id, language);

    console.log('[Handler] תוצאה מ-getNextScenario:', result);
    if (result && result.scenario) {
      res.json({ scenario: result.scenario });
    } else {
      console.error('[Handler] getNextScenario החזיר תוצאה ריקה.');
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
