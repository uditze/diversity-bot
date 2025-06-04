import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { saveMessage, getRecentMessages } from './db.js';
import { askGPT } from './chat.js';
import { v4 as uuidv4 } from 'uuid';

config();
const app = express();
app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
  const { message, session_id } = req.body;
  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Empty message' });
  }
  const sessionId = session_id || uuidv4();
  const history = await getRecentMessages(sessionId);
  const response = await askGPT(message, history);
  await saveMessage(sessionId, message, 'user');
  await saveMessage(sessionId, response, 'bot');
  res.json({ response, session_id: sessionId });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));