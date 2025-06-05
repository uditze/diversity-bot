import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { saveMessage } from './db.js';
import { handleChat } from './chat.js';
import { v4 as uuidv4 } from 'uuid';

config();
const app = express();
app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
  const { message = '', session_id, init } = req.body;
  const sessionId = session_id || uuidv4();

  try {
    if (message.trim()) {
      await saveMessage(sessionId, message, 'user');
    }

    const response = await handleChat(sessionId, message, { init });
    await saveMessage(sessionId, response, 'bot');
    res.json({ response, session_id: sessionId });
  } catch (err) {
    console.error(err);
    res.json({ response: 'Sorry, something went wrong.', session_id: sessionId });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
