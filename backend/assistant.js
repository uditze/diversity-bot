import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const assistantId = process.env.ASSISTANT_ID;

if (!openai.apiKey || !assistantId) {
  throw new Error("Missing OPENAI_API_KEY or ASSISTANT_ID in environment variables.");
}

export async function createThreadAndSendMessage({ message, thread_id, language, gender }) {
  let thread;

  if (thread_id) {
    thread = await openai.beta.threads.retrieve(thread_id);
  } else {
    thread = await openai.beta.threads.create();
  }

  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: message,
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistantId,
  });

  let runStatus;
  do {
    runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    await new Promise((r) => setTimeout(r, 1000));
  } while (runStatus.status !== 'completed');

  const messages = await openai.beta.threads.messages.list(thread.id);
  const lastMessage = messages.data.find((msg) => msg.role === 'assistant');

  return {
    reply: lastMessage?.content?.[0]?.text?.value || '',
    newThreadId: thread_id ? null : thread.id,
  };
}
