/**
 * Chat Module
 * Handles chatbot functionality
 */

const Chat = {
  suggestionResponses: {
    'How do I upload my abstract?':
      'To upload your abstract, log in with your student account, go to Dashboard, and click "Submit Capstone Metadata". Fill in the required fields and your adviser will receive a validation request automatically.',
    'Show me IoT projects from 2024 using Arduino':
      'I found 6 IoT projects from 2024 using Arduino! The top result is "IoT-Based Soil Moisture Detection" by Fernandez & Bautista. Click to view all 6 results in the search page.',
    'Summarize research trends in 2025':
      'In 2025, the top research trends from CTU capstone projects include: Machine Learning & AI (34%), IoT & Hardware Systems (28%), Web & Mobile Applications (22%), and Data Analytics (16%). ML adoption grew 40% compared to 2024.'
  },

  /**
   * Toggle floating chat panel
   */
  togglePanel() {
    console.log('Chat togglePanel called'); // Debug log
    const panel = document.getElementById('chat-panel');
    
    if (!panel) {
      console.error('Chat panel not found!');
      return;
    }
    
    console.log('Panel found, toggling...'); // Debug log
    panel.classList.toggle('open');
    
    // Update ARIA attributes
    const isOpen = panel.classList.contains('open');
    panel.setAttribute('aria-hidden', !isOpen);
    
    console.log('Panel is now:', isOpen ? 'open' : 'closed'); // Debug log
    
    // Focus management
    if (isOpen) {
      const chatInput = document.getElementById('chat-input');
      if (chatInput) {
        setTimeout(() => chatInput.focus(), 100);
      }
    }
  },

  /**
   * Send message in floating chat
   */
  sendMessage() {
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');

    if (!input || !messages || !input.value.trim()) return;

    // Append user message
    const userMsg = document.createElement('div');
    userMsg.className = 'msg msg-user';
    userMsg.textContent = input.value;
    userMsg.setAttribute('role', 'log');
    messages.appendChild(userMsg);

    input.value = '';
    messages.scrollTop = messages.scrollHeight;
    
    // Show typing indicator
    this.showTyping(messages);
    
    // Simulate bot response
    setTimeout(() => {
      this.hideTyping(messages);
      
      const botMsg = document.createElement('div');
      botMsg.className = 'msg msg-bot';
      botMsg.textContent = "Let me search the repository for you... I'll find the most relevant capstone projects matching your query.";
      botMsg.setAttribute('role', 'log');
      messages.appendChild(botMsg);
      
      messages.scrollTop = messages.scrollHeight;
    }, 1200);
  },

  /**
   * Send message in inline chat
   */
  sendInlineMessage() {
    const input = document.getElementById('inline-chat-input');
    const messages = document.getElementById('inline-chat-messages');

    if (!input || !messages || !input.value.trim()) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'msg msg-user';
    userMsg.textContent = input.value;
    messages.appendChild(userMsg);

    input.value = '';
    
    // Show typing indicator
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.style.display = 'flex';
    }

    setTimeout(() => {
      // Hide typing indicator
      if (typingIndicator) {
        typingIndicator.style.display = 'none';
      }
      
      const botMsg = document.createElement('div');
      botMsg.className = 'msg msg-bot';
      botMsg.textContent = "I'm searching the repository for that. I'll surface the most relevant capstone studies for you right away!";
      messages.appendChild(botMsg);
      messages.scrollTop = messages.scrollHeight;
    }, 1000);
  },

  /**
   * Handle suggestion chip click
   */
  sendSuggestion(button, text) {
    const suggestions = document.getElementById('inline-suggestions');
    const messages = document.getElementById('inline-chat-messages');

    if (suggestions) {
      suggestions.style.display = 'none';
    }

    if (!messages) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'msg msg-user';
    userMsg.textContent = text;
    messages.appendChild(userMsg);
    
    // Show typing indicator
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.style.display = 'flex';
    }

    setTimeout(() => {
      // Hide typing indicator
      if (typingIndicator) {
        typingIndicator.style.display = 'none';
      }
      
      const botMsg = document.createElement('div');
      botMsg.className = 'msg msg-bot';
      botMsg.textContent = this.suggestionResponses[text] || 'Great question! Let me look that up in the repository for you.';
      messages.appendChild(botMsg);
      messages.scrollTop = messages.scrollHeight;
    }, 1000);
  },

  /**
   * Show typing indicator
   */
  showTyping(container) {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing-indicator-temp';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    indicator.setAttribute('aria-label', 'Assistant is typing');
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
  },

  /**
   * Hide typing indicator
   */
  hideTyping(container) {
    const indicator = container.querySelector('#typing-indicator-temp');
    if (indicator) {
      indicator.remove();
    }
  },

  /**
   * Initialize chat
   */
  init() {
    // Note: Chat FAB and close button are now handled by data-attributes in app.js
    // No need to add duplicate event listeners here
    
    // Setup Enter key for floating chat input (not handled by data-enter-send)
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
      // Remove any existing listeners
      const newInput = chatInput.cloneNode(true);
      chatInput.parentNode.replaceChild(newInput, chatInput);
    }

    // Setup Enter key for inline chat input
    const inlineInput = document.getElementById('inline-chat-input');
    if (inlineInput) {
      inlineInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.sendInlineMessage();
        }
      });
    }

    console.log('✓ Chat initialized');
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Chat;
}
