import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const assistantId = process.env.ASSISTANT_ID;

// אובייקט שישמש כמילון למיפוי בין המזהה שלנו למזהה של OpenAI
const threadIdMap = new Map();

if (!openai.apiKey || !assistantId) {
  throw new Error("Missing OPENAI_API_KEY or ASSISTANT_ID in environment variables.");
}

// הפונקציה מקבלת כעת את ה-thread_id שלנו (שקראנו לו sessionId בפרונטאנד)
export async function createThreadAndSendMessage({ message, thread_id, language, gender }) {
  try {
    let thread;
    const sessionId = thread_id; // שינוי שם פנימי להבהרה

    // בדיקה אם כבר יש לנו מזהה של OpenAI עבור השיחה הזו
    const existingThreadId = threadIdMap.get(sessionId);

    if (existingThreadId) {
      // אם כן, נשתמש בו כדי להמשיך את השיחה הקיימת
      thread = await openai.beta.threads.retrieve(existingThreadId);
      console.log('📎 Retrieved existing OpenAI thread:', thread.id);
    } else {
      // אם לא, ניצור שיחה חדשה ב-OpenAI
      thread = await openai.beta.threads.create();
      // ונשמור את ההתאמה בין המזהה שלנו למזהה החדש של OpenAI
      threadIdMap.set(sessionId, thread.id);
      console.log(`🧵 Created new OpenAI thread: ${thread.id} for session: ${sessionId}`);
    }

    // הוספת הודעת המשתמש לשיחה
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: message,
    });
    console.log('📨 Message sent to thread:', message);

    // הרצת ה-Assistant על השיחה
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });
    console.log('▶️ Run started:', run.id);

    // המתנה לסיום הריצה
    let runStatus;
    const maxAttempts = 15;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      console.log(`⏳ Run status: ${runStatus.status}`);
      if (runStatus.status === 'completed') break;
    }

    if (runStatus.status !== 'completed') {
      throw new Error('Run did not complete in time.');
    }

    // קבלת תשובת ה-Assistant
    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data.find((msg) => msg.role === 'assistant');
    const reply = lastMessage?.content?.[0]?.text?.value || '';
    console.log('✅ Assistant reply:', reply);

    // אין צורך להחזיר את ה-threadId, הפרונטאנד כבר שומר את ה-sessionId
    return { reply, newThreadId: null };

  } catch (err) {
    console.error('❌ Error in createThreadAndSendMessage:', err);
    throw err;
  }
}
