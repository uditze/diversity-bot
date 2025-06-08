import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { OpenAI } from 'openai';
import fs from 'fs';

config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY environment variable is missing');
}
if (!OPENAI_ASSISTANT_ID) {
  console.error('OPENAI_ASSISTANT_ID environment variable is missing');
}

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

// load scenarios from local txt file
const scenariosFile = new URL('./scenarios/albert_scenarios_multilingual.txt', import.meta.url);
const scenarios = {};
let currentLang = 'en';
for (const line of fs.readFileSync(scenariosFile, 'utf8').split(/\r?\n/)) {
  if (line.startsWith('[') && line.endsWith(']')) {
    currentLang = line.slice(1, -1);
    scenarios[currentLang] = [];
  } else if (line.trim()) {
    if (!scenarios[currentLang]) scenarios[currentLang] = [];
    scenarios[currentLang].push(line.trim());
  }
}

const sessions = {};

function detectLang(text) {
  if (/[\u0590-\u05FF]/.test(text)) return 'he';
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  return 'en';
}

function nextSessionId() {
  return Math.random().toString(36).slice(2);
}

const assistantId = OPENAI_ASSISTANT_ID;

app.post('/chat', async (req, res) => {
  let { message, session_id } = req.body;
  if (!message) {
    return res.status(400).json({ response: 'Missing message', session_id });
  }

  if (!openai || !assistantId) {
    console.error('Required OpenAI configuration is missing');
    return res.status(500).json({ response: 'Server misconfiguration', session_id });
  }

  // create new session if needed
  if (!session_id || !sessions[session_id]) {
    session_id = session_id || nextSessionId();
    const lang = detectLang(message);
    const thread = await openai.beta.threads.create();
    sessions[session_id] = {
      threadId: thread.id,
      lang,
      scenarioIndex: 0,
      interactions: 0
    };
  }

  const session = sessions[session_id];
  try {
    await openai.beta.threads.messages.create(session.threadId, {
      role: 'user',
      content: message
    });

    const scenarioList = scenarios[session.lang] || scenarios['en'] || [];
    const scenarioText = scenarioList[session.scenarioIndex] || '';

    const run = await openai.beta.threads.runs.create(session.threadId, {
      assistant_id: assistantId,
      instructions: scenarioText,
      model: 'gpt-4o'
    });

    let status = run.status;
    while (status === 'queued' || status === 'in_progress') {
      await new Promise((r) => setTimeout(r, 1000));
      const rStatus = await openai.beta.threads.runs.retrieve(session.threadId, run.id);
      status = rStatus.status;
    }

    if (status !== 'completed') {
      throw new Error('Run failed');
    }

    const list = await openai.beta.threads.messages.list(session.threadId, { limit: 1 });
    const assistantMsg = list.data[0]?.content?.[0]?.text?.value || 'Sorry, I had trouble responding.';

    session.interactions += 1;
    if (session.interactions >= 3) {
      session.interactions = 0;
      session.scenarioIndex = (session.scenarioIndex + 1) % scenarioList.length;
    }

    return res.json({ response: assistantMsg.trim(), session_id });
  } catch (err) {
    console.error("❌ Chat error:", err);
    return res.status(500).json({
      response: "Internal error: " + err.message,
      session_id,
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
