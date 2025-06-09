const chatBox = document.getElementById('chat');
const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');

let threadId = null;

// שליחת הודעת פתיחה ברגע שהדף נטען
window.addEventListener('load', () => {
  sendInitialMessage();
});

async function sendInitialMessage() {
  try {
    const response = await fetch('https://diversity-bot-1.onrender.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `אני בוט שמסייע למרצות ולמרצים לפתח את הכשירות התרבותית שלהם בהוראה באקדמיה אני אציג בפניך מספר תרחישים מהכיתה עליך לחשוב כיצד תתמודד עם התרחיש המטרה של השיח על התרחישים היא לא לתת "תשובות נכונות" אלא לקדם את המודעות להיבטים של מגוון בהוראה  
האם תרצה שאפנה אליך בלשון זכר או נקבה  
Want to chat in English Just type a word  
بدك نحكي بالعربية؟ بس اكتب كلمة`,
        thread_id: null,
        language: 'he',
        gender: null
      }),
    });

    const data = await response.json();
    if (data.reply) addMessage(data.reply, 'bot');
    if (data.thread_id) threadId = data.thread_id;
  } catch (err) {
    console.error('Error loading initial message:', err);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;

  // הצגת הודעת המשתמש
  addMessage(userMessage, 'user');
  input.value = '';
  autoResize();

  try {
    const response = await fetch('https://diversity-bot-1.onrender.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        thread_id: threadId,
        language: detectLanguage(userMessage),
        gender: detectGender(userMessage),
      }),
    });

    const data = await response.json();
    if (data.reply) addMessage(data.reply, 'bot');
    if (data.thread_id) threadId = data.thread_id;
  } catch (err) {
    addMessage('אירעה תקלה בשליחת ההודעה.', 'bot');
    console.error(err);
  }
});

// הצגת הודעה בבועה
function addMessage(text, role) {
  const msg = document.createElement('div');
  msg.className = `message ${role}`;
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

// זיהוי מגדר (פשוט מאוד – לפי מילות מפתח)
function detectGender(text) {
  const femaleWords = ['אני מרצה', 'אני מורה', 'אני חוקרת'];
  const maleWords = ['אני מרצה גבר', 'אני מורה גבר', 'אני חוקר'];
  if (femaleWords.some(w => text.includes(w))) return 'female';
  if (maleWords.some(w => text.includes(w))) return 'male';
  return null;
}
