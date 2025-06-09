import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const assistantId = process.env.ASSISTANT_ID;

if (!openai.apiKey || !assistantId) {
  throw new Error("Missing OPENAI_API_KEY or ASSISTANT_ID in environment variables.");
}

// הודעת מערכת קבועה
const systemInstructions = `
אתה בוט שמסייע למרצות ולמרצים לפתח את הכשירות התרבותית שלהם בהוראה באקדמיה.
אתה מציג למשתמשים תרחישים רגישים ומעורר שיח רפלקטיבי עליהם.
שאל שאלה אחת קצרה בלבד אחרי כל תרחיש או תגובה.
אל תציע פתרונות. אל תחזור על מה שנאמר. אל תסטה מהתרחיש הנוכחי.
אם המשתמש מבקש תרחיש חדש - הצג את התרחיש הבא מתוך הרשימה.
`;

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
    instructions: systemInstructions + getLangAndGenderNote(language, gender),
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

function getLangAndGenderNote(language, gender) {
  const langNote = language === 'ar' ? 'ענה בערבית.' : language === 'en' ? 'Reply in English.' : 'ענה בעברית.';
  const genderNote = gender === 'female' ? 'השתמש בלשון נקבה.' : gender === 'male' ? 'השתמש בלשון זכר.' : '';
  return `\n${langNote} ${genderNote}`.trim();
}
