const chatBox = document.getElementById('chat');
const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');

let sessionId = null;
let interactionCount = 0;
let scenarioShown = false;
let userGender = null; // ✅ משתנה חדש לשמירת המגדר

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

  // ✅ שמירת המגדר אם זוהה
  const detectedGender = detectGender(userMessage);
  if (detectedGender) {
    userGender = detectedGender;
  }

  if (!scenarioShown) {
    await showNextScenario(lang);
    return;
  }

  try {
    const shouldRequestSummary = (interactionCount === 5);
    const shouldAddCompliment = (interactionCount % 2 !== 0);

    const response = await fetch('https://diversity-bot-1.onrender.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        thread_id: sessionId,
        language: lang,
        gender: userGender, // ✅ שליחת המגדר השמור
        request_summary: shouldRequestSummary,
        add_compliment: shouldAddCompliment,
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

// פונקציות העזר...

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
  const lowerCaseText = text.toLowerCase();
  if (['נקבה', 'אישה', 'בת', 'מרצה', 'מורה', 'female', 'woman'].some(w => lowerCaseText.includes(w))) {
    // Basic check to avoid matching 'male' if 'female' is present
    if (['זכר', 'גבר', 'male', 'man'].some(w => lowerCaseText.includes(w))) return null;
    return 'female';
  }
  if (['זכר', 'גבר', 'בן', 'מרצה', 'מורה', 'male', 'man'].some(w => lowerCaseText.includes(w))) return 'male';
  return null;
}

function showOpeningMessage() {
  const message = `אני בוט שמסייע למרצות ולמרצים לפתח את הכשירות התרבותית שלהם בהוראה באקדמיה. אני אציג בפניך מספר תרחישים מהכיתה, ועליך לחשוב כיצד תתמודד. המטרה של השיח על התרחישים היא לא לתת "תשובות נכונות" אלא לקדם את המודעות להיבטים של מגוון בהוראה.\n\nהאם תרצה שאפנה אליך בלשון זכר או נקבה?\nWant to chat in English? Just type a word.\nبدك نحكي بالعربية؟ بس اكتب كلمة.`;
  addMessage(message, 'bot');
}
