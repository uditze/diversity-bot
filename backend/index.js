import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { createThreadAndSendMessage } from './assistant.js';
import { getNextScenario } from './scenarios.js';
import pool, { initializeDatabase } from './db.js'; // ייבוא החיבור למסד הנתונים

dotenv.config();

// הפעלת הפונקציה שמוודאת שהטבלה קיימת
initializeDatabase();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[Request Logger] התקבלה בקשה: ${req.method} ${req.path}`);
  next();
});

app.get('/start-session', (req, res) => {
  const sessionId = randomUUID();
  console.log(`[Session] New session started with ID: ${sessionId}`);
  res.json({ sessionId: sessionId });
});

app.post('/chat', async (req, res) => {
  try {
    const { message, thread_id, language, gender } = req.body;

    // --- קטע קוד חדש: שמירת תגובת המשתמש במסד הנתונים ---
    try {
      const insertQuery = `
        INSERT INTO responses (session_id, user_response, language)
        VALUES ($1, $2, $3)
      `;
      const values = [thread_id, message, language];
      await pool.query(insertQuery, values);
      console.log('✅ User response saved to database.');
    } catch (dbError) {
      console.error('❌ Error saving response to database:', dbError);
      // אנחנו לא עוצרים את ריצת האפליקציה אם יש בעיה בשמירה, רק רושמים שגיאה
    }
    // --- סוף הקטע החדש ---

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