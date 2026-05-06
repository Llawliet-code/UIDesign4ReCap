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
   * Create provider badge for AI responses
   */
  createProviderBadge(provider) {
    const badge = document.createElement('span');
    badge.className = 'ai-provider-badge';
    
    if (provider === 'knowledge-base') {
      badge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:2px"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>KB';
    } else if (provider === 'data-analysis') {
      badge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:2px"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>Data';
    } else if (provider === 'system') {
      badge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:2px"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>System';
    } else if (provider === 'hybrid-mistral') {
      badge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:2px"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>Hybrid (Mistral+DB)';
      badge.style.cssText = 'font-size: 10px; opacity: 0.7; margin-left: 8px; color: #10b981;';
      return badge;
    } else if (provider === 'hybrid-gemini') {
      badge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:2px"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>Hybrid (Gemini+DB)';
      badge.style.cssText = 'font-size: 10px; opacity: 0.7; margin-left: 8px; color: #10b981;';
      return badge;
    } else if (provider === 'mistral') {
      badge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:2px"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15"/><line x1="16" y1="15" x2="16" y2="15"/></svg>Mistral';
    } else {
      badge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:2px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Gemini';
    }
    
    badge.style.cssText = 'font-size: 10px; opacity: 0.6; margin-left: 8px;';
    return badge;
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
    
    // Update ARIA attributes — blur first so focus isn't trapped inside aria-hidden
    const isOpen = panel.classList.contains('open');
    if (!isOpen && document.activeElement && panel.contains(document.activeElement)) {
      document.activeElement.blur();
    }
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

    // Add to conversation history
    if (typeof ConversationManager !== 'undefined') {
      ConversationManager.addMessage('user', userMessage);
    }

    input.value = '';
    messages.scrollTop = messages.scrollHeight;
    
    // Show login reminder for non-logged-in users (after first message)
    this.showLoginReminderIfNeeded(messages);
    
    // Show typing indicator
    this.showTyping(messages);
    
    try {
      // Get AI response
      const response = await AIService.sendMessage(userMessage);
      
      this.hideTyping(messages);
      
      const botMsg = document.createElement('div');
      botMsg.className = 'msg msg-bot';
      botMsg.innerHTML = MarkdownParser.parse(response.message);
      botMsg.setAttribute('role', 'log');
      
      // Add provider badge
      botMsg.appendChild(this.createProviderBadge(response.provider));
      
      messages.appendChild(botMsg);
      messages.scrollTop = messages.scrollHeight;

      // Add to conversation history
      if (typeof ConversationManager !== 'undefined') {
        ConversationManager.addMessage('assistant', response.message, response.provider);
      }
      
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

    // Add to conversation history
    if (typeof ConversationManager !== 'undefined') {
      ConversationManager.addMessage('user', userMessage);
    }

    input.value = '';
    
    // Show login reminder for non-logged-in users (after first message)
    this.showLoginReminderIfNeeded(messages);
    
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
      botMsg.innerHTML = MarkdownParser.parse(response.message);
      
      // Add provider badge
      botMsg.appendChild(this.createProviderBadge(response.provider));
      
      messages.appendChild(botMsg);
      messages.scrollTop = messages.scrollHeight;

      // Add to conversation history
      if (typeof ConversationManager !== 'undefined') {
        ConversationManager.addMessage('assistant', response.message, response.provider);
      }
      
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
      botMsg.innerHTML = MarkdownParser.parse(response.message);
      
      // Add provider badge
      botMsg.appendChild(this.createProviderBadge(response.provider));
      
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
   * Show login reminder for non-logged-in users
   */
  showLoginReminderIfNeeded(container) {
    // Check if user is logged in
    const isLoggedIn = typeof Auth !== 'undefined' && Auth.currentUser !== null;
    
    // Check if reminder already shown
    const reminderExists = container.querySelector('.chat-login-reminder');
    
    // Only show once per session for non-logged-in users
    if (!isLoggedIn && !reminderExists) {
      const reminder = document.createElement('div');
      reminder.className = 'chat-login-reminder';
      reminder.innerHTML = `
        <div class="chat-login-reminder-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="chat-login-reminder-content">
          <strong>Save your conversation!</strong>
          <p>Log in to save your chat history. Your conversations will be lost if you refresh or leave this page.</p>
          <button class="chat-login-btn" data-action="show-login">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            Log In Now
          </button>
        </div>
      `;
      
      // Insert after the first user message
      const firstUserMsg = container.querySelector('.msg-user');
      if (firstUserMsg && firstUserMsg.nextSibling) {
        container.insertBefore(reminder, firstUserMsg.nextSibling);
      } else {
        container.appendChild(reminder);
      }
      
      container.scrollTop = container.scrollHeight;
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

    // Setup guest start chat button
    const guestStartBtn = document.getElementById('guest-start-chat-btn');
    if (guestStartBtn) {
      guestStartBtn.addEventListener('click', () => {
        this.startGuestChat();
      });
    }

    // Initialize chatbot view state based on login status
    this.initChatbotViewState();
    
    // Initialize chat FAB visibility based on login status
    this.initChatFABVisibility();

    console.log('✓ Chat initialized');
  },

  /**
   * Initialize chatbot view state (show guest empty state or chatbot interface)
   * Logged-in users automatically see the chatbot interface
   * Guest users see the empty state with "Start Chat" button
   */
  initChatbotViewState() {
    const isLoggedIn = typeof Auth !== 'undefined' && Auth.currentUser !== null;
    const guestEmpty = document.getElementById('guest-chatbot-empty');
    const chatbotInterface = document.getElementById('chatbot-interface');
    
    if (isLoggedIn) {
      // User is logged in - automatically show chatbot interface
      if (guestEmpty) {
        guestEmpty.style.display = 'none';
      }
      if (chatbotInterface) {
        chatbotInterface.classList.add('active');
      }
      console.log('✓ Chatbot interface activated for logged-in user');
    } else {
      // User is not logged in - show guest empty state
      if (guestEmpty) {
        guestEmpty.style.display = 'flex';
      }
      if (chatbotInterface) {
        chatbotInterface.classList.remove('active');
      }
      console.log('✓ Guest empty state displayed');
    }
  },

  /**
   * Initialize chat FAB visibility based on login status and current view
   * For guest users, hide the FAB until they click "Start Chat"
   * ALWAYS hide the FAB when on the AI Chatbot tab
   */
  initChatFABVisibility() {
    const isLoggedIn = typeof Auth !== 'undefined' && Auth.currentUser !== null;
    const chatFAB = document.getElementById('chat-fab');
    const chatbotView = document.getElementById('view-chatbot');
    
    if (!chatFAB) return;
    
    // Check if currently on the chatbot view
    const isOnChatbotView = chatbotView && chatbotView.classList.contains('active');
    
    // ALWAYS hide FAB on chatbot view
    if (isOnChatbotView) {
      chatFAB.style.display = 'none';
      chatFAB.classList.add('hidden');
      return;
    }
    
    if (isLoggedIn) {
      // User is logged in - show chat FAB (unless on chatbot view)
      chatFAB.style.display = '';
      chatFAB.classList.remove('hidden');
    } else {
      // User is guest - hide chat FAB (will be shown when they click "Start Chat")
      chatFAB.style.display = 'none';
      chatFAB.classList.add('hidden');
    }
  },

  /**
   * Start guest chat session
   */
  startGuestChat() {
    const guestEmpty = document.getElementById('guest-chatbot-empty');
    const chatbotInterface = document.getElementById('chatbot-interface');
    const chatFAB = document.getElementById('chat-fab');
    const chatbotView = document.getElementById('view-chatbot');
    
    // Hide guest empty state
    if (guestEmpty) {
      guestEmpty.style.display = 'none';
    }
    
    // Show chatbot interface
    if (chatbotInterface) {
      chatbotInterface.classList.add('active');
    }
    
    // Show chat FAB for guest users ONLY if not on chatbot view
    const isOnChatbotView = chatbotView && chatbotView.classList.contains('active');
    if (chatFAB && !isOnChatbotView) {
      chatFAB.style.display = '';
      chatFAB.classList.remove('hidden');
    }
    
    // Setup unsaved warning for guest users
    if (typeof ConversationManager !== 'undefined') {
      ConversationManager.setupUnsavedWarning();
      console.log('✓ Unsaved warning initialized for guest user');
    }
    
    // Focus on input
    const inlineInput = document.getElementById('inline-chat-input');
    if (inlineInput) {
      setTimeout(() => inlineInput.focus(), 100);
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Chat;
}
