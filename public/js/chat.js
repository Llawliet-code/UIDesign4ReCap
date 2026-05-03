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
  async sendMessage() {
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');

    if (!input || !messages || !input.value.trim()) return;

    const userMessage = input.value.trim();

    // Append user message
    const userMsg = document.createElement('div');
    userMsg.className = 'msg msg-user';
    userMsg.textContent = userMessage;
    userMsg.setAttribute('role', 'log');
    messages.appendChild(userMsg);

    input.value = '';
    messages.scrollTop = messages.scrollHeight;
    
    // Show typing indicator
    this.showTyping(messages);
    
    try {
      // Get AI response
      const response = await AIService.sendMessage(userMessage);
      
      this.hideTyping(messages);
      
      const botMsg = document.createElement('div');
      botMsg.className = 'msg msg-bot';
      botMsg.textContent = response.message;
      botMsg.setAttribute('role', 'log');
      
      // Add provider badge
      const badge = document.createElement('span');
      badge.className = 'ai-provider-badge';
      badge.innerHTML = response.provider === 'mistral' ? '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:2px"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15"/><line x1="16" y1="15" x2="16" y2="15"/></svg>Mistral' : '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:2px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Gemini';
      badge.style.cssText = 'font-size: 10px; opacity: 0.6; margin-left: 8px;';
      botMsg.appendChild(badge);
      
      messages.appendChild(botMsg);
      messages.scrollTop = messages.scrollHeight;
      
    } catch (error) {
      this.hideTyping(messages);
      
      const errorMsg = document.createElement('div');
      errorMsg.className = 'msg msg-bot';
      errorMsg.textContent = 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.';
      errorMsg.setAttribute('role', 'log');
      messages.appendChild(errorMsg);
      
      messages.scrollTop = messages.scrollHeight;
      console.error('Chat error:', error);
    }
  },

  /**
   * Send message in inline chat
   */
  async sendInlineMessage() {
    const input = document.getElementById('inline-chat-input');
    const messages = document.getElementById('inline-chat-messages');

    if (!input || !messages || !input.value.trim()) return;

    const userMessage = input.value.trim();

    const userMsg = document.createElement('div');
    userMsg.className = 'msg msg-user';
    userMsg.textContent = userMessage;
    messages.appendChild(userMsg);

    input.value = '';
    
    // Show typing indicator
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.classList.remove('hidden');
    }

    try {
      // Get AI response
      const response = await AIService.sendMessage(userMessage);
      
      // Hide typing indicator
      if (typingIndicator) {
        typingIndicator.classList.add('hidden');
      }
      
      const botMsg = document.createElement('div');
      botMsg.className = 'msg msg-bot';
      botMsg.textContent = response.message;
      
      // Add provider badge
      const badge = document.createElement('span');
      badge.className = 'ai-provider-badge';
      badge.innerHTML = response.provider === 'mistral' ? '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:2px"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15"/><line x1="16" y1="15" x2="16" y2="15"/></svg>Mistral' : '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:2px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Gemini';
      badge.style.cssText = 'font-size: 10px; opacity: 0.6; margin-left: 8px;';
      botMsg.appendChild(badge);
      
      messages.appendChild(botMsg);
      messages.scrollTop = messages.scrollHeight;
      
    } catch (error) {
      // Hide typing indicator
      if (typingIndicator) {
        typingIndicator.classList.add('hidden');
      }
      
      const errorMsg = document.createElement('div');
      errorMsg.className = 'msg msg-bot';
      errorMsg.textContent = 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.';
      messages.appendChild(errorMsg);
      messages.scrollTop = messages.scrollHeight;
      
      console.error('Chat error:', error);
    }
  },

  /**
   * Handle suggestion chip click
   */
  async sendSuggestion(button, text) {
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
      typingIndicator.classList.remove('hidden');
    }

    try {
      // Get AI response
      const response = await AIService.sendMessage(text);
      
      // Hide typing indicator
      if (typingIndicator) {
        typingIndicator.classList.add('hidden');
      }
      
      const botMsg = document.createElement('div');
      botMsg.className = 'msg msg-bot';
      botMsg.textContent = response.message;
      
      // Add provider badge
      const badge = document.createElement('span');
      badge.className = 'ai-provider-badge';
      badge.innerHTML = response.provider === 'mistral' ? '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:2px"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15"/><line x1="16" y1="15" x2="16" y2="15"/></svg>Mistral' : '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:2px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Gemini';
      badge.style.cssText = 'font-size: 10px; opacity: 0.6; margin-left: 8px;';
      botMsg.appendChild(badge);
      
      messages.appendChild(botMsg);
      messages.scrollTop = messages.scrollHeight;
      
    } catch (error) {
      // Hide typing indicator
      if (typingIndicator) {
        typingIndicator.classList.add('hidden');
      }
      
      const errorMsg = document.createElement('div');
      errorMsg.className = 'msg msg-bot';
      errorMsg.textContent = 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.';
      messages.appendChild(errorMsg);
      messages.scrollTop = messages.scrollHeight;
      
      console.error('Chat error:', error);
    }
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
