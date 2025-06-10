const chatBox = document.getElementById('chat');
const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');

let sessionId = null;
let interactionCount = 0;
let scenarioShown = false;

// בעת טעינת העמוד: קבל מזהה שיחה ייחודי ואז הצג הודעת פתיחה
window.addEventListener('load', async () => {
  try {
    const response = await fetch('https://diversity-bot-1.onrender.com/start-session');
    const data = await response.json();
    sessionId = data.sessionId;
    showOpeningMessage();
  } catch (err) {
    console.error("Failed to start a session:", err);
    addMessage("אירעה שגיאה ביצירת שיחה חדשה. אנא רענן את הדף.", "bot");
  }
});

// שליחה אוטומטית כשמשתמש לוחץ Enter
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    form.dispatchEvent(new Event('submit'));
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage || !sessionId) return;

  addMessage(userMessage, 'user');
  input.value = '';
  autoResize();

  const lang = detectLanguage(userMessage);

  // אם עוד לא הוצג תרחיש (זו התגובה להודעת הפתיחה)
  if (!scenarioShown) {
    await showNextScenario(lang);
    return;
  }

  // שליחה רגילה ל-Assistant
  try {
    const response = await fetch('https://diversity-bot-1.onrender.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        thread_id: sessionId,
        language: lang,
        gender: detectGender(userMessage),
      }),
    });

    const data = await response.json();
    
    // בדיקת הפקודה המיוחדת מה-Assistant
    if (data.reply && data.reply.includes('[NEXT_SCENARIO]')) {
      // אם ה-Assistant אמר לעבור, הצג את התרחיש הבא
      scenarioShown = false;
      interactionCount = 0;
      await showNextScenario(lang);
      // ✅ תיקון קריטי: הוספת return כדי לעצור את ריצת הפונקציה כאן
      return; 
    } else if (data.reply) {
      // אחרת, הצג את תגובת ה-Assistant (שאלה רפלקטיבית)
      addMessage(data.reply, 'bot');
      interactionCount++;
      if (interactionCount >= 6) {
        const nextScenarioPrompts = {
          he: 'האם להמשיך לתרחיש הבא?',
          en: 'Shall we continue to the next scenario?',
          ar: 'هل ننتقل إلى السيناريو التالي؟'
        };
        addMessage(nextScenarioPrompts[lang] || nextScenarioPrompts['he'], 'bot');
        interactionCount = 0;
      }
    }
  } catch (err) {
    addMessage('אירעה תקלה בשליחת ההודעה.', 'bot');
    console.error(err);
  }
});

async function showNextScenario(language = 'he') {
  try {
    const response = await fetch('https://diversity-bot-1.onrender.com/scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        thread_id: sessionId,
        language: language,
      }),
    });

    const data = await response.json();
    if (data.scenario) {
      addMessage(data.scenario, 'bot');
      scenarioShown = true;
    } else {
      addMessage('לא הצלחתי לטעון את התרחיש הבא.', 'bot');
    }
  } catch (err) {
    console.error('❌ שגיאה בשליפת תרחיש:', err);
    addMessage('שגיאה בטעינת תרחיש.', 'bot');
  }
}

// --- פונקציות עזר (ללא שינוי) ---
function addMessage(text, role) {
  const msg = document.createElement('div');
  msg.className = `message ${role}`;
  msg.innerText = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function autoResize() {
  input.style.height = 'auto';
  input.style.height = `${input.scrollHeight}px`;
}

function detectLanguage(text) {
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  if (/^[a-zA-Z0-9\s.,?!'":;()]+$/.test(text)) return 'en';
  return 'he';
}

function detectGender(text) {
  if (['נקבה', 'אישה'].some(w => text.includes(w))) return 'female';
  if (['זכר', 'גבר'].some(w => text.includes(w))) return 'male';
  return null;
}

function showOpeningMessage() {
  const message = `אני בוט שמסייע למרצות ולמרצים לפתח את הכשירות התרבותית שלהם בהוראה באקדמיה. אני אציג בפניך מספר תרחישים מהכיתה, ועליך לחשוב כיצד תתמודד. המטרה של השיח על התרחישים היא לא לתת "תשובות נכונות" אלא לקדם את המודעות להיבטים של מגוון בהוראה.\n\nהאם תרצה שאפנה אליך בלשון זכר או נקבה?\nWant to chat in English? Just type a word.\nبدك نحكي بالعربية؟ بس اكتب كلمة.`;
  addMessage(message, 'bot');
}
