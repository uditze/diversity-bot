import OpenAI from 'openai';
import { config } from 'dotenv';
import { saveMessage } from './db.js';

config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const scenarios = [
  {
    id: 1,
    text: `*תרחיש 1*
חוק המואזין
בבוקר השיעור אישרה הכנסת, בקריאה ראשונה, הצעת החוק הקוראת על איסור השמעת מואזין (מבוסס על הצעת חוק אמיתית). בפתח השיעור, התקיים דיון בנושא, כאשר חלק מהסטודנטים הביעו עמדות נחרצות בעד הצעד, מה שעורר תחושות תסכול אצל הסטודנטים המוסלמים. אלה אף נפגעו מעצם קיום הדיון בכיתה.
כיצד לדעתך המרצה צריך לנהוג בשיעורים הבאים?
האם עליו לוותר על העיסוק בסוגיה בשל המתיחות? במידה ולא, כיצד היית נוהג.ת?`
  },
  {
    id: 2,
    text: `*תרחיש 2*
סטריאוטיפ המוחלש
בפקולטה ברפואה, הסטודנטים נדרשים לאבחן ולהציע טיפול למטופלים. אחת המתרגלות כתבה משימה ובה מקרה בוחן לניתוח עבור הסטודנטים. המקרה מתאר מטופל אתיופי שסובל מאיידס.
סטודנטים אתיופים שקראו את הדוגמה לא הגישו את המשימה, ונקטו בשביתה איטלקית בקורס ועברו אותו בקושי. מנגד, המרצה שלא שמה לב לדוגמה ולתסכול של הסטודנטים, האשימה שהם חסרי מוטיבציה בקורס.
מה לדעתך אפשר לעשות כדי להימנע ממקרים כאלה בעתיד?`
  },
  {
    id: 3,
    text: `*תרחיש 3*
יחסי צוות עכורים במעבדה
ד"ר לוי מנהלת מעבדת מחקר בכימיה הכוללת שמונה סטודנטים לתואר שני, חצי יהודים וחצי ערבים. בעקבות המתיחות הביטחונית, היחסים בין הקבוצות הדרדרו. סטודנטים שהיו עד לא מכבר ביחסים טובים, הפסיקו לברך זה את זה לשלום והיחסים הצטמצמו להיבטים קורקטיים של העבודה בלבד. ד"ר לוי מרגישה שהיחסים העכורים גם משליכים לרעה על העבודה, משום שבישיבות הצוות הסטודנטים הפסיקו לשתף לעומק, לבקר רעיונות ולהציע רעיונות חדשים.
כיצד לדעתך ד"ר לוי צריכה לנהוג?`
  },
  {
    id: 4,
    text: `*תרחיש 4*
הערות פוגעניות כלפי להט"בים
בשיעור על פילוסופיה קלאסית במדעי המדינה, הסטודנטים נחשפים לטקסט של אפלטון. אחד הסטודנטים מעיר שסוקרטס תיאר את אפלטון כמי שנמשך לנערים. בתגובה אחד הסטודנטים מעיר "זו סטייה וזה אסור בדת". המרצה לא יודע מה לעשות והוא ממשיך בשיעור מבלי להתייחס לתגובה של הסטודנט. לאחר השיעור, סטודנטית אחרת, שנפגעה מההערה של הסטודנט, כותבת אימייל לראש החוג, בו היא מאשימה את המרצה בחוסר תגובה לגזענות בשיעור ואומרת שהיא לא רוצה להשתתף יותר בשיעור.
איך לדעתך המרצה צריך לנהוג?`
  }
];

const sessions = {};
const translationCache = { ar: {}, en: {} };
const MAX_INTERACTIONS = 3;

function detectLanguage(text = '') {
  if (/[؀-ۿ]/.test(text)) return 'ar';
  if (/[A-Za-z]/.test(text)) return 'en';
  return 'he';
}

function systemPrompt(lang) {
  if (lang === 'ar') {
    return 'أنت مساعد تفكير لأساتذة الجامعات. في كل خطوة، يتم عرض سيناريو من الصف. يجب أن تطرح سؤالًا واحدًا فقط، قصيرًا، يعمق تفكير الأستاذ في التفاعل الصفي. لا تقترح حلولاً. لا تتحدث بشكل فلسفي أو عام. اربط السؤال دائمًا بالسيناريو المطروح.';
  }
  if (lang === 'en') {
    return 'You are a thinking assistant for university lecturers. At each step, a classroom scenario is presented. You must ask one short question that deepens the lecturer\'s reflection on classroom interaction. Do not offer solutions. Do not speak in abstract terms. Stay grounded in the specific scenario.';
  }
  return 'אתה עוזר חשיבה למרצות ולמרצים באקדמיה. בכל שלב מוצג תרחיש מהכיתה. עליך לשאול שאלה אחת בלבד, קצרה, שמעמיקה את הרפלקציה של המרצה בנוגע לאינטראקציה בכיתה. אל תציע פתרונות. אל תדבר על ערכים באופן כללי. השאלה שלך צריכה להתייחס ישירות לתרחיש שנדון.';
}

async function translate(text, lang) {
  if (lang === 'he') return text;
  if (translationCache[lang][text]) return translationCache[lang][text];
  const prompt = lang === 'en' ? 'Translate the following text from Hebrew to English' : 'Translate the following text from Hebrew to Arabic';
  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: text }
    ],
    temperature: 0.3,
    max_tokens: 800
  });
  const translated = res.choices[0].message.content.trim();
  translationCache[lang][text] = translated;
  return translated;
}

async function getScenario(index, lang) {
  const heb = scenarios[index].text;
  return translate(heb, lang);
}

async function greeting(lang) {
  const heb = 'ברוכים הבאים! אני אלברט, בוט המסייע בפיתוח כשירות תרבותית בהוראה באמצעות דיון בתרחישים מהכיתה.';
  return translate(heb, lang);
}

export async function handleChat(sessionId, message, { init = false } = {}) {
  const msgLang = detectLanguage(message);
  if (!sessions[sessionId]) {
    sessions[sessionId] = { index: 0, interactions: 0, language: msgLang, started: false };
  }
  const session = sessions[sessionId];
  if (init) {
    const greet = await greeting(session.language);
    session.started = false;
    session.interactions = 0;
    return greet;
  }

  session.language = msgLang || session.language;

  if (!session.started) {
    session.started = true;
    session.interactions = 0;
    return await getScenario(session.index, session.language);
  }

  const nextRegex = /^(next|כן|יאללה|עבור לתרחיש הבא|التالي)/i;
  const noRegex = /^(no|לא|لا)/i;

  if (nextRegex.test(message.trim())) {
    if (session.index < scenarios.length - 1) {
      session.index++;
      session.interactions = 0;
      return await getScenario(session.index, session.language);
    }
    const doneHe = 'סיימנו את כל התרחישים. תודה שהשתתפת!';
    return await translate(doneHe, session.language);
  }

  if (noRegex.test(message.trim())) {
    const contHe = 'נשמח להעמיק עוד בתרחיש הנוכחי. מה דעתך?';
    return await translate(contHe, session.language);
  }

  session.interactions++;
  if (session.interactions >= MAX_INTERACTIONS) {
    const askNextHe = 'רוצה לעבור לתרחיש הבא? כתוב/כתבי: "עבור לתרחיש הבא"';
    return await translate(askNextHe, session.language);
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt(session.language) },
      { role: 'user', content: message }
    ],
    temperature: 0.7,
    max_tokens: 150
  });

  return response.choices[0].message.content.trim();
}
