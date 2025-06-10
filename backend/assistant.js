import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const assistantId = process.env.ASSISTANT_ID;

if (!openai.apiKey || !assistantId) {
  throw new Error("Missing OPENAI_API_KEY or ASSISTANT_ID in environment variables.");
}

export async function createThreadAndSendMessage({ message, thread_id, language, gender }) {
  try {
    let thread;

    if (thread_id) {
      thread = await openai.beta.threads.retrieve(thread_id);
      console.log('📎 Retrieved existing thread:', thread_id);
    } else {
      thread = await openai.beta.threads.create();
      console.log('🧵 Created new thread:', thread.id);
    }

    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: message,
    });
    console.log('📨 Message sent to thread:', message);

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });
    console.log('▶️ Run started:', run.id);

    let runStatus;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      await new Promise((r) => setTimeout(r, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      console.log(`⏳ Run status: ${runStatus.status}`);
      attempts++;
      if (attempts >= maxAttempts) throw new Error('Run timeout: did not complete in time.');
    } while (runStatus.status !== 'completed');

    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data.find((msg) => msg.role === 'assistant');

    const reply = lastMessage?.content?.[0]?.text?.value || '';
    console.log('✅ Assistant reply:', reply);

    return {
      reply,
      newThreadId: thread_id ? null : thread.id,
    };

  } catch (err) {
    console.error('❌ Error in createThreadAndSendMessage:', err);
    throw err;
  }
}
