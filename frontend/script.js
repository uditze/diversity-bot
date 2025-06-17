const chatBox = document.getElementById('chat');
const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');

let sessionId = null;
let scenarioShown = false;
let userGender = null;
let currentScenarioId = null; // ✅ משתנה חדש לשמירת מספר התרחיש

window.addEventListener('load', async () => {
  try {
    const response = await fetch('https://diversity-bot-1.onrender.com/start-session');
    const data = await response.json();
    sessionId = data.sessionId;
    showOpeningMessage();
  } catch (err) {
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
  const detectedGender = detectGender(userMessage);
  if (detectedGender) userGender = detectedGender;

  if (!scenarioShown) {
    await showNextScenario(lang);
    return;
  }

  try {
    const response = await fetch('https://diversity-bot-1.onrender.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        thread_id: sessionId,
        language: lang,
        gender: userGender,
        scenario_id: currentScenarioId // ✅ שליחת מספר התרחיש עם כל הודעה
      }),
    });

    const data = await response.json();
    
    if (data.reply && data.reply.includes('[NEXT_SCENARIO]')) {
      await showNextScenario(lang);
      return; 
    } else if (data.reply) {
      addMessage(data.reply, 'bot');
    }
  } catch (err) {
    addMessage('אירעה תקלה בשליחת ההודעה.', 'bot');
  }
});

async function showNextScenario(language = 'he') {
  try {
    const response = await fetch('https://diversity-bot-1.onrender.com/scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thread_id: sessionId, language: language }),
    });

    const data = await response.json();
    if (data.scenario) {
      addMessage(data.scenario, 'bot');
      scenarioShown = true;
      currentScenarioId = data.scenarioId; // ✅ שמירת מספר התרחיש הנוכחי
    } else {
      addMessage('לא הצלחתי לטעון את התרחיש הבא.', 'bot');
    }
  } catch (err) {
    addMessage('שגיאה בטעינת תרחיש.', 'bot');
  }
}

// שאר פונקציות העזר נשארות ללא שינוי
function addMessage(text, role) { /*...*/ }
function autoResize() { /*...*/ }
function detectLanguage(text) { /*...*/ }
function detectGender(text) { /*...*/ }
function showOpeningMessage() { /*...*/ }
