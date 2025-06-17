import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { createThreadAndSendMessage } from './assistant.js';
import { getNextScenario } from './scenarios.js';
import { supabase } from './supabaseClient.js';

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
    const { message, thread_id, language, gender, scenario_id } = req.body;

    await supabase
      .from('responses')
      .insert([{ session_id: thread_id, role: 'user', content: message, language: language, scenario_id: scenario_id }]);

    const { reply } = await createThreadAndSendMessage({ message, thread_id, language, gender });
    
    if (reply) {
      await supabase
        .from('responses')
        .insert([{ session_id: thread_id, role: 'bot', content: reply, language: language, scenario_id: scenario_id }]);
    }
    
    res.json({ reply, thread_id });
  } catch (err) {
    console.error('Error in /chat handler:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.post('/scenario', (req, res) => {
  try {
    const { thread_id, language } = req.body;
    const result = getNextScenario(thread_id, language);
    if (result && result.scenario) {
      res.json({ scenario: result.scenario, scenarioId: result.scenarioId });
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
