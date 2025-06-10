const chatBox = document.getElementById('chat');
const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');

let threadId = null;
let genderSelected = false;
let interactionCount = 0;

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

  // בחירת מגדר לאחר פתיחה (רק לעברית וערבית)
  if (!genderSelected && (lang === 'he' || lang === 'ar')) {
    genderSelected = true;
    await showNextScenario();
    return;
  }

  // מעבר תרחיש לפי מילת טריגר
  const nextTriggers = ['כן', 'יאללה', 'next', 'التالي'];
  if (nextTriggers.includes(userMessage.toLowerCase())) {
    await showNextScenario();
    interactionCount = 0;
    return;
  }

  // שליחה לשרת
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
    if (data.reply) {
      addMessage(data.reply, 'bot');
      interactionCount++;
      if (interactionCount >= 6) {
        addMessage('רוצה לעבור לתרחיש הבא? כתוב/כתבי כן או יאללה.', 'bot');
        interactionCount = 0;
      }
    }
    if (data.thread_id) threadId = data.thread_id;
  } catch (err) {
    addMessage('אירעה תקלה בשליחת ההודעה.', 'bot');
    console.error(err);
  }
});

// הצגת הודעה בבועה
function addMessage(text, role) {
  const msg = document.createElement('div');
  msg.className = `message ${role}`; // תיקון התחביר כאן
  msg.innerText = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// שינוי גובה אוטומטי לתיבת הטקסט
input.addEventListener('input', autoResize);
function autoResize() {
  input.style.height = 'auto';
  input.style.height = input.scrollHeight + 'px';
}

// זיהוי שפה בסיסי
function detectLanguage(text) {
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  if (/^[a-zA-Z0-9\s.,?!'":;()]+$/.test(text)) return 'en';
  return 'he';
}

// זיהוי מגדר
function detectGender(text) {
  const femaleWords = ['אני מרצה', 'אני מורה', 'אני חוקרת'];
  const maleWords = ['אני מרצה גבר', 'אני מורה גבר', 'אני חוקר'];
  if (femaleWords.some(w => text.includes(w))) return 'female';
  if (maleWords.some(w => text.includes(w))) return 'male';
  return null;
}

// הודעת פתיחה
function showOpeningMessage() {
  const message = `אני בוט שמסייע למרצות ולמרצים לפתח את הכשירות התרבותית שלהם בהוראה באקדמיה אני אציג בפניך מספר תרחישים מהכיתה עליך לחשוב כיצד תתמודד עם התרחיש המטרה של השיח על התרחישים היא לא לתת "תשובות נכונות" אלא לקדם את המודעות להיבטים של מגוון בהוראה  
האם תרצה שאפנה אליך בלשון זכר או נקבה?  
Want to chat in English Just type a word  
بدك نحكي بالعربية؟ بس اكتب كلمة`;
  addMessage(message, 'bot');
}

// שליפת תרחיש מהשרת
async function showNextScenario() {
  try {
    const response = await fetch('https://diversity-bot-1.onrender.com/scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        thread_id: threadId,
        language: 'he',
      }),
    });

    const data = await response.json();
    if (data.scenario) {
      addMessage(data.scenario, 'bot');
    } else {
      addMessage('לא נותרו תרחישים זמינים כרגע.', 'bot');
    }
  } catch (err) {
    console.error('❌ שגיאה בשליפת תרחיש:', err);
    addMessage('שגיאה בטעינת תרחיש.', 'bot');
  }
}
