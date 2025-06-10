const chatBox = document.getElementById('chat');
const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');

let threadId = null;
let interactionCount = 0;
let scenarioShown = false;
let hasSelectedLanguage = false; // דגל לניהול ההודעה הראשונה

// הצגת הודעת פתיחה בלבד כשנכנסים לעמוד
window.addEventListener('load', () => {
  showOpeningMessage();
});

// שליחה אוטומטית כשמשתמש לוחץ Enter (בלי Shift)
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    form.dispatchEvent(new Event('submit'));
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;

  addMessage(userMessage, 'user');
  input.value = '';
  autoResize();

  const lang = detectLanguage(userMessage);

  // שלב 1: טיפול בהודעה הראשונה (בחירת שפה/מגדר)
  if (!hasSelectedLanguage) {
    hasSelectedLanguage = true;
    await showNextScenario(lang);
    return; // עצור כאן כדי לא לשלוח את הודעת ההגדרה ל-Assistant
  }

  // שלב 2: טיפול בבקשה לעבור לתרחיש הבא
  const nextTriggers = ['כן', 'יאללה', 'next', 'التالي'];
  if (nextTriggers.includes(userMessage.toLowerCase())) {
    scenarioShown = false;
    await showNextScenario(lang);
    interactionCount = 0;
    return;
  }

  // שלב 3: שליחת הודעה רגילה ל-Assistant (רק אם הוצג תרחיש)
  if (!scenarioShown) {
    return;
  }

  try {
    const response = await fetch('https://diversity-bot-1.onrender.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        thread_id: threadId,
        language: lang,
        gender: detectGender(userMessage),
      }),
    });

    const data = await response.json();
    if (data.thread_id) {
      threadId = data.thread_id;
    }
    if (data.reply) {
      addMessage(data.reply, 'bot');
      interactionCount++;
      if (interactionCount >= 6) {
        addMessage('האם ברצונך לעבור לתרחיש הבא?', 'bot');
        interactionCount = 0;
      }
    }
  } catch (err) {
    addMessage('אירעה תקלה בשליחת ההודעה.', 'bot');
    console.error(err);
  }
});

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

async function showNextScenario(language = 'he') {
  try {
    const response = await fetch('https://diversity-bot-1.onrender.com/scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        thread_id: threadId,
        language: language,
      }),
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }

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
