/* =====================
   VIEW NAVIGATION
   ===================== */

/**
 * Switches the active view/tab in the app.
 * @param {string} v - View name: 'landing' | 'dashboard' | 'detail' | 'chatbot'
 */
function switchView(v) {
  document.querySelectorAll('.view').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));

  document.getElementById('view-' + v).classList.add('active');

  const idx = { landing: 0, dashboard: 1, detail: 2, chatbot: 3 }[v];
  document.querySelectorAll('.tab')[idx].classList.add('active');

  window.scrollTo(0, 0);
}

/* =====================
   DASHBOARD ROLE TABS
   ===================== */

/**
 * Switches the active role panel in the dashboard.
 * @param {HTMLElement} el - The clicked role tab element
 * @param {string} role - Role name: 'student' | 'adviser' | 'librarian'
 */
function switchRole(el, role) {
  document.querySelectorAll('.role-tab').forEach(x => x.classList.remove('active'));
  el.classList.add('active');

  ['student', 'adviser', 'librarian'].forEach(r => {
    const panel = document.getElementById('dash-' + r);
    if (panel) panel.style.display = (r === role) ? 'block' : 'none';
  });
}

/* =====================
   FLOATING CHATBOT (FAB)
   ===================== */

/**
 * Toggles the floating chat panel open/closed.
 */
function toggleChat() {
  const panel = document.getElementById('chat-panel');
  panel.classList.toggle('open');
}

/**
 * Sends a message in the floating chat panel.
 */
function sendChat() {
  const input = document.getElementById('chat-input');
  const messages = document.getElementById('chat-messages');

  if (!input.value.trim()) return;

  // Append user message
  const userMsg = document.createElement('div');
  userMsg.className = 'msg msg-user';
  userMsg.textContent = input.value;
  messages.appendChild(userMsg);

  // Append bot response
  const botMsg = document.createElement('div');
  botMsg.className = 'msg msg-bot';
  botMsg.textContent = "Let me search the repository for you... I'll find the most relevant capstone projects matching your query.";
  messages.appendChild(botMsg);

  input.value = '';
  messages.scrollTop = messages.scrollHeight;
}

/* =====================
   INLINE CHATBOT (CHATBOT VIEW)
   ===================== */

/** Predefined responses for suggestion chips */
const suggestionResponses = {
  'How do I upload my abstract?':
    'To upload your abstract, log in with your student account, go to Dashboard, and click "Submit Capstone Metadata". Fill in the required fields and your adviser will receive a validation request automatically.',
  'Show me IoT projects from 2024 using Arduino':
    'I found 6 IoT projects from 2024 using Arduino! The top result is "IoT-Based Soil Moisture Detection" by Fernandez & Bautista. Click to view all 6 results in the search page.',
  'Summarize research trends in 2025':
    'In 2025, the top research trends from CTU capstone projects include: Machine Learning & AI (34%), IoT & Hardware Systems (28%), Web & Mobile Applications (22%), and Data Analytics (16%). ML adoption grew 40% compared to 2024.'
};

/**
 * Handles clicking a suggestion chip in the inline chatbot.
 * @param {HTMLElement} btn - The clicked suggestion button
 * @param {string} text - The suggestion text
 */
function sendSuggestion(btn, text) {
  document.getElementById('inline-suggestions').style.display = 'none';

  const messages = document.getElementById('inline-chat-messages');

  const userMsg = document.createElement('div');
  userMsg.className = 'msg msg-user';
  userMsg.textContent = text;
  messages.appendChild(userMsg);

  setTimeout(() => {
    const botMsg = document.createElement('div');
    botMsg.className = 'msg msg-bot';
    botMsg.textContent = suggestionResponses[text] || 'Great question! Let me look that up in the repository for you.';
    messages.appendChild(botMsg);
    messages.scrollTop = messages.scrollHeight;
  }, 600);
}

/**
 * Sends a typed message in the inline chatbot view.
 */
function sendInlineMessage() {
  const input = document.getElementById('inline-chat-input');
  if (!input.value.trim()) return;

  const messages = document.getElementById('inline-chat-messages');
  document.getElementById('inline-suggestions').style.display = 'none';

  const userMsg = document.createElement('div');
  userMsg.className = 'msg msg-user';
  userMsg.textContent = input.value;
  messages.appendChild(userMsg);

  input.value = '';

  setTimeout(() => {
    const botMsg = document.createElement('div');
    botMsg.className = 'msg msg-bot';
    botMsg.textContent = "I'm searching the repository for that. I'll surface the most relevant capstone studies for you right away!";
    messages.appendChild(botMsg);
    messages.scrollTop = messages.scrollHeight;
  }, 500);
}

/* =====================
   ADVISER VALIDATION
   ===================== */

/**
 * Placeholder for the title originality validation logic.
 * Will be connected to the AI backend in production.
 */
function runValidation() {
  return true;
}

/* =====================
   EVENT LISTENERS
   ===================== */
document.addEventListener('DOMContentLoaded', () => {
  const inlineInput = document.getElementById('inline-chat-input');
  if (inlineInput) {
    inlineInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') sendInlineMessage();
    });
  }
});

/* =====================
   MODAL OVERLAY CLICK
   ===================== */

/**
 * Closes the auth modal when clicking the dark backdrop.
 * @param {MouseEvent} e
 */
function handleOverlayClick(e) {
  if (e.target === document.getElementById('auth-modal')) closeAuthModal();
}
