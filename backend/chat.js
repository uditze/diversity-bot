import { config } from 'dotenv';
import { OpenAI } from 'openai';
config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const scenarios = [
  {
    id: 1,
    text: `תרחיש 1 – חוק המואזין:\nבבוקר השיעור אישרה הכנסת את חוק המואזין. התקיים דיון, וחלק מהסטודנטים הביעו תמיכה. הסטודנטים המוסלמים נפגעו.\n\nכיצד לדעתך המרצה צריך לנהוג בשיעורים הבאים?\nהאם עליו לוותר על העיסוק בסוגיה בשל המתיחות? במידה ולא, כיצד היית נוהג.ת?`
  },
  {
    id: 2,
    text: `תרחיש 2 – סטריאוטיפ המוחלש:\nמקרה בוחן הציג מטופל אתיופי עם איידס. סטודנטים אתיופים מחו. המרצה האשימה אותם בחוסר מוטיבציה.\n\nמה לדעתך אפשר לעשות כדי להימנע ממקרים כאלה בעתיד?`
  },
  {
    id: 3,
    text: `תרחיש 3 – יחסי צוות עכורים במעבדה:\nבמעבדה יש מתיחות בין סטודנטים יהודים וערבים שהחלה לאחר אירועים ביטחוניים. שיתוף הפעולה נפגע.\n\nכיצד לדעתך ד"ר לוי צריכה לנהוג?`
  },
  {
    id: 4,
    text: `תרחיש 4 – הערות פוגעניות כלפי להט"בים:\nסטודנט העיר שזו "סטייה וזה אסור בדת", המרצה שתקה. סטודנטית אחרת נפגעה ופנתה לראש החוג.\n\nאיך לדעתך המרצה צריך לנהוג?`
  }
];

const sessions = {};

export async function handleChat(sessionId, message) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      step: 'intro',
      language: 'he',
      gender: 'neutral',
      scenarioIndex: 0,
      turns: 0
    };
    return `היי, אני אלברט (:\n\nאני בוט שמסייע למרצות ולמרצים לפתח את הכשירות התרבותית שלהם בהוראה באקדמיה. אני אציג בפניך מספר תרחישים מהכיתה. עליך לחשוב כיצד תתמודד עם כל תרחיש. המטרה של השיח על התרחישים היא לא לתת "תשובות נכונות", אלא לקדם את המודעות להיבטים של מגוון בהוראה, לחשוב על דרכי פעולה אפשריות ועל הערכים שמקודמים או נפגעים בבחירות שלנו.\n\nבאיזו שפה תרצה שנדבר? האם תרצה שאפנה אליך בלשון זכר או נקבה?`;
  }

  const session = sessions[sessionId];

  if (session.step === 'intro') {
    session.language = message.includes('ערבית') ? 'ar' : 'he';
    session.gender = message.includes('נקבה') ? 'female' : 'male';
    session.step = 'scenario';
    return `תודה! נתחיל עם התרחיש הראשון.\n\n${scenarios[0].text}`;
  }

  if (session.step === 'scenario') {
    session.turns += 1;
    if (message.trim() === 'עבור לתרחיש הבא') {
      session.scenarioIndex += 1;
      session.turns = 0;
      if (session.scenarioIndex < scenarios.length) {
        return scenarios[session.scenarioIndex].text;
      } else {
        session.step = 'done';
        return 'סיימנו את כל התרחישים. תודה על השיתוף!';
      }
    }

    if (session.turns >= 3) {
      return `רוצה לעבור לתרחיש הבא? כתוב/כתבי: "עבור לתרחיש הבא"`;
    }

    const gptResponse = await askGPT(message);
    return gptResponse;
  }

  return 'התרחישים הסתיימו. תודה!';
}

async function askGPT(userInput) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'אתה בוט שמעודד חשיבה ביקורתית על תרחישים רגישים בכיתה. השב תמיד בשני משפטים לכל היותר, תוך שאילת שאלה להעמקה.' },
        { role: 'user', content: userInput }
      ],
      temperature: 0.7,
      max_tokens: 100
    });
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('GPT Error:', error);
    return 'אירעה שגיאה בעת יצירת תגובה מהמודל.';
  }
}
