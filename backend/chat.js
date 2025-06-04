import { config } from 'dotenv';
import OpenAI from 'openai';
config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const scenarios = [
  {
    id: 1,
    text: 'תרחיש ראשון: במהלך שיעור, סטודנטית מהחברה הערבית משתפת פעולה עם בן כיתתה ומעירה לו בעברית, אך הוא עונה לה באנגלית. איך תתמודד/י עם הסיטואציה?'
  },
  {
    id: 2,
    text: 'תרחיש שני: סטודנט מעלה נקודת מבט פוליטית שגורמת לחלק מהסטודנטים להרגיש חוסר נוחות. איך תאזנ/י בין חופש הביטוי לבין תחושת הביטחון של כולם?'
  },
  {
    id: 3,
    text: 'תרחיש שלישי: מרצה מדגים דוגמה מהשטח אך היא מבוססת על סטריאוטיפ מגדרי. איך תתנהג/י כמשתתף/ת או כמרצה-שותף/ה?'
  },
  {
    id: 4,
    text: 'תרחיש רביעי: סטודנט חרדי מבקש לא להשתתף בדיון על זהויות להט"ב. כיצד תגיב/י לבקשה כזו?'
  }
];

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

  // זיהוי שפה לפי הודעה ראשונה
  if (!session.language) {
    if (/[؀-ۿ]/.test(message)) session.language = 'ar';
    else if (/[a-zA-Z]/.test(message)) session.language = 'en';
    else session.language = 'he';
  }

  // זיהוי מגדר
  if (!session.gender) {
    if (message.includes('זכר')) session.gender = 'male';
    else if (message.includes('נקבה')) session.gender = 'female';
    else session.gender = 'neutral';
    return scenarios[0].text;
  }

  // אם המשתמש כתב "עבור לתרחיש הבא"
  if (message.trim().includes('עבור לתרחיש הבא') || message.trim().toLowerCase().includes('next')) {
    if (session.scenarioIndex < scenarios.length - 1) {
      session.scenarioIndex++;
      session.interactions = 0;
      return scenarios[session.scenarioIndex].text;
    } else {
      return 'סיימנו את כל התרחישים. תודה שהשתתפת!';
    }
  }

  // אם המשתמש עונה "לא" על שאלה אם לעבור תרחיש
  if (message.trim().toLowerCase() === 'לא') {
    return 'נשמח להעמיק עוד. מה לדעתך חשוב שהמרצה יעשה במצב כזה?';
  }

  session.interactions++;

  if (session.interactions >= MAX_INTERACTIONS_PER_SCENARIO) {
    return 'רוצה לעבור לתרחיש הבא? כתוב/כתבי: "עבור לתרחיש הבא".';
  }

  // פנייה ל־GPT להעמקת השיח
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `ענה בשפה שבה המשתמש כותב. שאל שאלה שמעודדת רפלקציה ומעמיקה את החשיבה. אל תציע פתרונות. התגובה צריכה להיות עד שני משפטים בלבד.`
      },
      { role: 'user', content: message }
    ],
    temperature: 0.7,
    max_tokens: 150
  });

  return response.choices[0].message.content.trim();
}
