import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const assistantId = process.env.ASSISTANT_ID;
const threadIdMap = new Map();

if (!openai.apiKey || !assistantId) {
  throw new Error("Missing OPENAI_API_KEY or ASSISTANT_ID in environment variables.");
}

export async function createThreadAndSendMessage({ message, thread_id, language, gender, request_summary = false }) {
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

    if (request_summary) {
      instructions += " The user has reached the 6th interaction. Your response must be structured in three parts: a compliment on their last message, a brief summary of the discussion, and then ask if they want to move to the next scenario.";
    }

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
      additional_instructions: instructions,
    });

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
