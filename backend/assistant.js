import OpenAI from 'openai';
import fetch from 'node-fetch'; // ודא שזה מותקן ב־package.json

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const assistantId = process.env.ASSISTANT_ID;
const BACKEND_URL = process.env.BACKEND_URL || 'https://diversity-bot-1.onrender.com'; // כתובת השרת שלך

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

    let run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });
    console.log('▶️ Run started:', run.id);

    let runStatus;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      console.log(`⏳ Run status: ${runStatus.status}`);

      if (runStatus.status === 'completed') break;

      // ✅ טיפול בקריאה לפונקציה
      if (runStatus.status === 'requires_action' && runStatus.required_action?.submit_tool_outputs) {
        const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
        const toolResponses = [];

        for (const toolCall of toolCalls) {
          const { name, arguments: argsJson } = toolCall.function;
          const args = JSON.parse(argsJson);

          if (name === 'get_next_scenario') {
            console.log('🔧 Calling tool: get_next_scenario', args);

            const response = await fetch(`${BACKEND_URL}/scenario`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                thread_id: args.thread_id,
                language: args.language,
              }),
            });

            const data = await response.json();

            toolResponses.push({
              tool_call_id: toolCall.id,
              output: data.scenario || 'No scenario available.',
            });
          }
        }

        // שליחת הפלטים חזרה ל־OpenAI
        await openai.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
          tool_outputs: toolResponses,
        });
        console.log('✅ Tool outputs submitted');
      }

      attempts++;
    }

    if (runStatus.status !== 'completed') {
      throw new Error('Run timeout: did not complete in time.');
    }

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
