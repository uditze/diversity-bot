import { config } from 'dotenv';
import OpenAI from 'openai';
import { scenarios } from './scenarios.js';

config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_INTERACTIONS_PER_SCENARIO = 3;
const sessions = {};

export async function handleChat(sessionId, message) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      scenarioIndex: 0,
      interactions: 0,
      language: null,
      gender: null,
      initialized: false
    };

    return `אני בוט שמסייע למרצות ולמרצים לפתח את הכשירות התרבותית שלהם בהוראה באקדמיה. אני אציג בפניך מספר תרחישים מהכיתה. עליך לחשוב כיצד תתמודד עם התרחיש. המטרה של השיח על התרחישים היא לא לתת "תשובות נכונות", אלא לקדם את המודעות להיבטים של מגוון בהוראה.

האם תרצה שאפנה אליך בלשון זכר או נקבה?
Want to chat in English? Just type a word!
بدك نحكي بالعربية؟ بس اكتب كلمة!`;
  }

  const session = sessions[sessionId];

  if (!session.language) {
    if (/[؀-ۿ]/.test(message)) session.language = 'ar';
    else if (/[a-zA-Z]/.test(message)) session.language = 'en';
    else session.language = 'he';
  }

  if (!session.gender) {
    if (message.includes('זכר')) session.gender = 'male';
    else if (message.includes('נקבה')) session.gender = 'female';
    else session.gender = 'neutral';
    return scenarios[0].text;
  }

  if (message.trim().includes('עבור לתרחיש הבא') || message.trim().toLowerCase().includes('next')) {
    if (session.scenarioIndex < scenarios.length - 1) {
      session.scenarioIndex++;
      session.interactions = 0;
      return scenarios[session.scenarioIndex].text;
    } else {
      return session.language === 'ar' ? 'لقد أنهيت جميع السيناريوهات. شكراً لمشاركتك!' :
             session.language === 'en' ? 'You have completed all scenarios. Thank you for participating!' :
             'סיימנו את כל התרחישים. תודה שהשתתפת!';
    }
  }

  if (/^(כן|yes|sure|ok|okay|نعم|أجل|ايوا)/i.test(message.trim())) {
    if (session.scenarioIndex < scenarios.length - 1) {
      session.scenarioIndex++;
      session.interactions = 0;
      return scenarios[session.scenarioIndex].text;
    } else {
      return session.language === 'ar' ? 'لقد أنهيت جميع السيناريوهات. شكراً لمشاركتك!' :
             session.language === 'en' ? 'You have completed all scenarios. Thank you for participating!' :
             'סיימנו את כל התרחישים. תודה שהשתתפת!';
    }
  }

  if (message.trim().toLowerCase() === 'לא' || message.trim().toLowerCase() === 'no') {
    return session.language === 'ar' ? 'يسعدني الاستمرار بالنقاش. ما رأيك؟' :
           session.language === 'en' ? 'Let’s keep discussing. What do you think?' :
           'נשמח להעמיק עוד. מה לדעתך חשוב שהמרצה יעשה במצב כזה?';
  }

  session.interactions++;

  if (session.interactions >= MAX_INTERACTIONS_PER_SCENARIO) {
    return session.language === 'ar' ? 'هل ترغب بالانتقال إلى السيناريو التالي؟ اكتب: "التالي"' :
           session.language === 'en' ? 'Would you like to continue to the next scenario? Type: "next"' :
           'רוצה לעבור לתרחיש הבא? כתוב/כתבי: "עבור לתרחיש הבא".';
  }

  const langPrompt = session.language === 'ar' ?
    'أجب بالعربية. اسأل سؤالاً يعمّق التفكير ولا تقترح حلاً. لا تتعدى الجملتين.' :
    session.language === 'en' ?
    'Reply in English. Ask a question that encourages reflection. Do not suggest solutions. No more than two sentences.' :
    'ענה בעברית. שאל שאלה שמעודדת רפלקציה ומעמיקה את החשיבה. אל תציע פתרונות. עד שני משפטים.';

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: langPrompt },
      { role: 'user', content: message }
    ],
    temperature: 0.7,
    max_tokens: 150
  });

  return response.choices[0].message.content.trim();
}
