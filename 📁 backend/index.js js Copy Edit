import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createThreadAndSendMessage } from './assistant.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
    console.error('Error handling /chat:', err.message);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
