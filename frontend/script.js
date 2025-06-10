form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;

  // ✅ בדיקה אם המשתמש ביקש לעבור לתרחיש הבא
  const nextTriggers = ['כן', 'יאללה', 'next', 'التالي'];
  if (nextTriggers.includes(userMessage.toLowerCase())) {
    addMessage(userMessage, 'user');
    input.value = '';
    autoResize();
    await showNextScenario();
    return;
  }

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
