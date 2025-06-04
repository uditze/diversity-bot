import { config } from 'dotenv';
import { OpenAI } from 'openai';
config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function askGPT(userMessage, history) {
  const messages = history.map(line => {
    const [role, content] = line.split(/: (.+)/);
    return { role: role.toLowerCase(), content };
  });

  messages.push({ role: 'user', content: userMessage });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 150,
    });
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('GPT Error:', error);
    return 'אירעה שגיאה בעת יצירת תגובה מהמודל.';
  }
}
