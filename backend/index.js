import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createThreadAndSendMessage } from './assistant.js';
import { getNextScenario } from './scenarios.js'; // ✅ חדש

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// מסלול הצ'אט הקיים
app.post('/chat', async (req, res) => {
  const { message, thread_id, language, gender } = req.body;

  try {
    const { reply, newThreadId } = await createThreadAndSendMessage({
      message,
      thread_id,
      language,
      gender,
    });

    res.json({ reply, thread_id: newThreadId || thread_id });
  } catch (err) {
    console.error('❌ Error handling /chat:', err);
    res.status(500).json({ error: err.message || 'Something went wrong.' });
  }
});

// ✅ מסלול חדש לשליפת תרחישים
app.post('/scenario', (req, res) => {
  const { thread_id, language } = req.body;

  try {
    const result = getNextScenario(thread_id, language);
    if (result.scenario) {
      res.json({ scenario: result.scenario });
    } else {
      res.status(404).json({ error: 'No more scenarios available.' });
    }
  } catch (err) {
    console.error('❌ Error handling /scenario:', err);
    res.status(500).json({ error: err.message || 'Failed to retrieve scenario.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
