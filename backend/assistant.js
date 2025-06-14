import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const assistantId = process.env.ASSISTANT_ID;
const threadIdMap = new Map();

if (!openai.apiKey || !assistantId) {
  throw new Error("Missing OPENAI_API_KEY or ASSISTANT_ID in environment variables.");
}

export async function createThreadAndSendMessage({ message, thread_id, language, gender, request_summary = false, add_compliment = false }) {
  try {
    let thread;
    const sessionId = thread_id;
    const existingThreadId = threadIdMap.get(sessionId);

    if (existingThreadId) {
      thread = await openai.beta.threads.retrieve(existingThreadId);
    } else {
      thread = await openai.beta.threads.create();
      threadIdMap.set(sessionId, thread.id);
    }

    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: message,
    });

    const languageInstructions = {
      en: `Please respond in English.`,
      ar: `الرجاء الرد باللغة العربية.`,
      he: `אנא הגב בעברית.`,
    };
    
    let instructions = languageInstructions[language] || languageInstructions['he'];

    if (gender === 'female') {
      instructions += ' You MUST address the user in the feminine form (פנייה בלשון נקבה).';
    } else if (gender === 'male') {
      instructions += ' You MUST address the user in the masculine form (פנייה בלשון זכר).';
    }

    if (request_summary) {
      instructions += " The user has reached the 6th interaction. Your response must be structured in three parts: an encouraging phrase, a brief summary, and then ask if they want to move on.";
    } else if (add_compliment) {
      // הנחיה חיובית לתת פידבק
      instructions += " Your response MUST begin with a varied, objective, and encouraging phrase about the user's idea (e.g., 'That's an interesting point'). After the phrase, ask your single reflective question.";
    } else {
      // ✅ הנחיה שלילית מפורשת - לא לתת פידבק
      instructions += " Do NOT use any compliment or affirming phrase. Respond only with the single reflective question.";
    }

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
      additional_instructions: instructions,
    });

    // ... (המשך הקוד נשאר ללא שינוי)
    let runStatus;
    const maxAttempts = 15;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      if (runStatus.status === 'completed') break;
    }

    if (runStatus.status !== 'completed') {
      throw new Error('Run did not complete in time.');
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data.find((msg) => msg.role === 'assistant');
    const reply = lastMessage?.content?.[0]?.text?.value || '';

    return { reply, newThreadId: null };

  } catch (err) {
    console.error('❌ Error in createThreadAndSendMessage:', err);
    throw err;
  }
}
