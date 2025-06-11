const chatBox = document.getElementById('chat');
const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');

let sessionId = null;
let interactionCount = 0;
let scenarioShown = false;

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

  if (!scenarioShown) {
    await showNextScenario(lang);
    return;
  }

  try {
    const shouldRequestSummary = (interactionCount === 5);
    // ✅ לוגיקה חדשה: בקש מחמאה כל תגובה שנייה (זוגית)
    // interactionCount מתחיל ב-0, אז נבדוק אם הוא אי-זוגי לפני השליחה
    const shouldAddCompliment = (interactionCount % 2 !== 0);

    const response = await fetch('https://diversity-bot-1.onrender.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        thread_id: sessionId,
        language: lang,
        gender: detectGender(userMessage),
        request_summary: shouldRequestSummary,
        add_compliment: shouldAddCompliment, // שליחת הסימון החדש
      }),
    });

    const data = await response.json();
    
    if (data.reply && data.reply.includes('[NEXT_SCENARIO]')) {
      scenarioShown = false;
      interactionCount = 0;
      await showNextScenario(lang);
      return; 
    } else if (data.reply) {
      addMessage(data.reply, 'bot');
      
      if (shouldRequestSummary) {
        interactionCount = 0;
      } else {
        interactionCount++;
      }
    }
  } catch (err) {
    addMessage('אירעה תקלה בשליחת ההודעה.', 'bot');
    console.error(err);
  }
});

// פונקציות העזר נשארות ללא שינוי...
// (showNextScenario, addMessage, etc.)

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
