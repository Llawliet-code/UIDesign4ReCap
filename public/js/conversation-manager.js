/**
 * Conversation Manager Module
 * Manages chat conversation history with a limit of 3 conversations
 */

const ConversationManager = {
  maxConversations: 3,
  currentConversationId: null,
  conversations: [],
  _unsavedWarningInitialized: false,

  /**
   * Initialize conversation manager
   */
  async init() {
    // Check if user is logged in
    if (!this.isUserLoggedIn()) {
      console.log('✓ Conversation Manager: User not logged in, skipping initialization');
      // Note: setupUnsavedWarning() will be called when guest clicks "Start Chat"
      return;
    }

    await this.loadConversations();
    
    // If no conversations exist, create the first one
    if (this.conversations.length === 0) {
      await this.createNewConversation();
    } else {
      // Load the most recent conversation
      this.currentConversationId = this.conversations[0].id;
    }

    this.renderConversationList();
    this.loadCurrentConversation();
    this.initBackdropHandler();
    
    console.log('✓ Conversation Manager initialized');
  },

  /**
   * Check if user is logged in
   */
  isUserLoggedIn() {
    return typeof Auth !== 'undefined' && Auth.currentUser !== null;
  },

  /**
   * Get storage key for current user
   */
  getStorageKey() {
    if (!this.isUserLoggedIn()) {
      return null;
    }
    return `recap_conversations_${Auth.currentUser.id}`;
  },

  /**
   * Generate unique ID
   */
  generateId() {
    return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  /**
   * Create a new conversation
   */
  async createNewConversation() {
    // Check if user is logged in
    if (!this.isUserLoggedIn()) {
      if (typeof NotificationModal !== 'undefined') {
        NotificationModal.showLoginRequired();
      } else {
        alert('Please login to use conversation history');
        if (typeof Auth !== 'undefined') Auth.showLoginModal();
      }
      return;
    }

    // Check if we've reached the limit
    if (this.conversations.length >= this.maxConversations) {
      // Show notification that limit is reached
      if (typeof NotificationModal !== 'undefined') {
        NotificationModal.showConversationLimitReached();
      } else {
        alert('You have reached the maximum of 3 conversations. Please delete one to create a new conversation.');
      }
      return;
    }

    const newConversation = {
      id: this.generateId(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to the beginning of the array (most recent first)
    this.conversations.unshift(newConversation);
    this.currentConversationId = newConversation.id;

    await this.saveConversations();
    this.renderConversationList();
    this.clearChatUI();

    console.log(`✓ New conversation created: ${newConversation.id}`);
  },

  /**
   * Switch to a different conversation
   */
  switchConversation(conversationId) {
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      console.error('Conversation not found:', conversationId);
      return;
    }

    this.currentConversationId = conversationId;
    this.loadCurrentConversation();
    this.renderConversationList();

    console.log(`✓ Switched to conversation: ${conversationId}`);
  },

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId) {
    const index = this.conversations.findIndex(c => c.id === conversationId);
    if (index === -1) return;

    this.conversations.splice(index, 1);

    // If we deleted the current conversation, switch to another
    if (this.currentConversationId === conversationId) {
      if (this.conversations.length > 0) {
        this.currentConversationId = this.conversations[0].id;
        this.loadCurrentConversation();
      } else {
        // No conversations left, create a new one
        await this.createNewConversation();
        return;
      }
    }

    await this.saveConversations();
    this.renderConversationList();

    console.log(`✓ Conversation deleted: ${conversationId}`);
  },

  /**
   * Add a message to the current conversation
   */
  addMessage(role, content, provider = null) {
    const conversation = this.conversations.find(c => c.id === this.currentConversationId);
    if (!conversation) return;

    const message = {
      role, // 'user' or 'assistant'
      content,
      provider, // 'mistral' or 'gemini'
      timestamp: new Date().toISOString()
    };

    conversation.messages.push(message);
    conversation.updatedAt = new Date().toISOString();

    // Auto-generate title from first user message
    if (conversation.title === 'New Conversation' && role === 'user' && conversation.messages.length === 1) {
      conversation.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
    }

    this.saveConversations();
    this.renderConversationList();
  },

  /**
   * Get current conversation
   */
  getCurrentConversation() {
    return this.conversations.find(c => c.id === this.currentConversationId);
  },

  /**
   * Load current conversation into chat UI
   */
  loadCurrentConversation() {
    const conversation = this.getCurrentConversation();
    if (!conversation) return;

    // Clear both chat UIs
    this.clearChatUI();

    // Load messages into both floating and inline chat
    const floatingMessages = document.getElementById('chat-messages');
    const inlineMessages = document.getElementById('inline-chat-messages');

    conversation.messages.forEach(msg => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `msg msg-${msg.role === 'user' ? 'user' : 'bot'}`;
      
      // Use markdown parser for assistant messages, plain text for user messages
      if (msg.role === 'assistant' && typeof MarkdownParser !== 'undefined') {
        messageDiv.innerHTML = MarkdownParser.parse(msg.content);
      } else {
        messageDiv.textContent = msg.content;
      }

      // Add provider badge for assistant messages
      if (msg.role === 'assistant' && msg.provider) {
        const badge = document.createElement('span');
        badge.className = 'ai-provider-badge';
        badge.innerHTML = msg.provider === 'mistral' 
          ? '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:2px"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15"/><line x1="16" y1="15" x2="16" y2="15"/></svg>Mistral' 
          : '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:2px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Gemini';
        badge.style.cssText = 'font-size: 10px; opacity: 0.6; margin-left: 8px;';
        messageDiv.appendChild(badge);
      }

      if (floatingMessages) {
        floatingMessages.appendChild(messageDiv.cloneNode(true));
      }
      if (inlineMessages) {
        inlineMessages.appendChild(messageDiv.cloneNode(true));
      }
    });

    // Scroll to bottom
    if (floatingMessages) floatingMessages.scrollTop = floatingMessages.scrollHeight;
    if (inlineMessages) inlineMessages.scrollTop = inlineMessages.scrollHeight;
  },

  /**
   * Clear chat UI
   */
  clearChatUI() {
    const floatingMessages = document.getElementById('chat-messages');
    const inlineMessages = document.getElementById('inline-chat-messages');

    if (floatingMessages) {
      // Keep the initial bot greeting
      floatingMessages.innerHTML = '<div class="msg msg-bot">Hi! I\'m your Kapstone Assistant! I can help you find research, navigate the system, or summarize trends. What do you need?</div>';
    }

    if (inlineMessages) {
      // Keep the initial bot greeting
      inlineMessages.innerHTML = '<div class="msg msg-bot">Hi! I\'m your Kapstone Assistant! I can help you find research, navigate the system, or summarize trends. What do you need?</div>';
    }
  },

  /**
   * Render conversation list in sidebar
   */
  renderConversationList() {
    const container = document.getElementById('conversation-list');
    if (!container) return;

    container.innerHTML = '';

    this.conversations.forEach((conv, index) => {
      const item = document.createElement('div');
      item.className = 'conversation-item' + (conv.id === this.currentConversationId ? ' active' : '');
      
      const date = new Date(conv.updatedAt);
      const timeAgo = this.getTimeAgo(date);

      item.innerHTML = `
        <div class="conversation-item-content" data-conversation-id="${conv.id}">
          <div class="conversation-title">${conv.title}</div>
          <div class="conversation-meta">
            <span class="conversation-count">${conv.messages.length} messages</span>
            <span class="conversation-time">${timeAgo}</span>
          </div>
        </div>
        <button class="conversation-delete" data-conversation-id="${conv.id}" aria-label="Delete conversation">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;

      container.appendChild(item);
    });

    // Update conversation counter
    const counter = document.getElementById('conversation-counter');
    if (counter) {
      counter.textContent = `${this.conversations.length}/${this.maxConversations}`;
    }

    // Attach event listeners
    this.attachConversationListeners();
  },

  /**
   * Attach event listeners to conversation items
   */
  attachConversationListeners() {
    // Switch conversation
    document.querySelectorAll('.conversation-item-content').forEach(item => {
      item.addEventListener('click', (e) => {
        const conversationId = e.currentTarget.dataset.conversationId;
        this.switchConversation(conversationId);
      });
    });

    // Delete conversation
    document.querySelectorAll('.conversation-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const conversationId = e.currentTarget.dataset.conversationId;
        
        // Use notification modal for confirmation
        if (typeof NotificationModal !== 'undefined') {
          NotificationModal.showDeleteConfirmation(() => {
            this.deleteConversation(conversationId);
          });
        } else {
          // Fallback to confirm dialog
          if (confirm('Delete this conversation?')) {
            this.deleteConversation(conversationId);
          }
        }
      });
    });
  },

  /**
   * Get time ago string
   */
  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  },

  /**
   * Toggle conversation sidebar
   */
  toggleSidebar() {
    // Check if user is logged in
    if (!this.isUserLoggedIn()) {
      if (typeof NotificationModal !== 'undefined') {
        NotificationModal.showLoginRequired();
      } else {
        alert('Please login to access conversation history');
        if (typeof Auth !== 'undefined') Auth.showLoginModal();
      }
      return;
    }

    const sidebar = document.getElementById('conversation-sidebar');
    const backdrop = document.getElementById('conversation-backdrop');
    
    if (sidebar) {
      const isOpen = sidebar.classList.toggle('open');
      
      // Toggle backdrop on mobile
      if (backdrop) {
        if (isOpen) {
          backdrop.classList.add('active');
        } else {
          backdrop.classList.remove('active');
        }
      }

      // Prevent body scroll on mobile when sidebar is open
      if (window.innerWidth <= 768) {
        if (isOpen) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      }
    }
  },

  /**
   * Close sidebar (used by backdrop click)
   */
  closeSidebar() {
    const sidebar = document.getElementById('conversation-sidebar');
    const backdrop = document.getElementById('conversation-backdrop');
    
    if (sidebar) {
      sidebar.classList.remove('open');
    }
    
    if (backdrop) {
      backdrop.classList.remove('active');
    }

    // Restore body scroll
    if (window.innerWidth <= 768) {
      document.body.style.overflow = '';
    }
  },

  /**
   * Initialize backdrop click handler
   */
  initBackdropHandler() {
    const backdrop = document.getElementById('conversation-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        this.closeSidebar();
      });
    }

    // Close sidebar on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const sidebar = document.getElementById('conversation-sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
          this.closeSidebar();
        }
      }
    });
  },

  /**
   * Save conversations to Firestore (cloud sync) with localStorage backup
   */
  async saveConversations() {
    if (!this.isUserLoggedIn()) return;

    const userId = Auth.currentUser.id;
    const firebaseUser = auth.currentUser;

    // Always save to localStorage as backup
    try {
      const key = this.getStorageKey();
      if (key) {
        localStorage.setItem(key, JSON.stringify(this.conversations));
      }
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }

    // Save to Firestore if Firebase user
    if (firebaseUser) {
      try {
        await db.collection('conversations').doc(userId).set({
          conversations: this.conversations,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✓ Conversations synced to cloud');
      } catch (e) {
        console.error('Failed to save to Firestore:', e);
      }
    }
  },

  /**
   * Load conversations from Firestore (cloud) with localStorage fallback
   */
  async loadConversations() {
    if (!this.isUserLoggedIn()) {
      this.conversations = [];
      return;
    }

    const userId = Auth.currentUser.id;
    const firebaseUser = auth.currentUser;

    // Try Firestore first if Firebase user
    if (firebaseUser) {
      try {
        const doc = await db.collection('conversations').doc(userId).get();
        if (doc.exists) {
          const data = doc.data();
          this.conversations = data.conversations || [];
          console.log('✓ Conversations loaded from cloud');
          
          // Sync to localStorage
          const key = this.getStorageKey();
          if (key) {
            localStorage.setItem(key, JSON.stringify(this.conversations));
          }
          return;
        }
      } catch (e) {
        console.error('Failed to load from Firestore:', e);
      }
    }

    // Fallback to localStorage
    try {
      const key = this.getStorageKey();
      if (key) {
        const saved = localStorage.getItem(key);
        if (saved) {
          this.conversations = JSON.parse(saved);
          console.log('✓ Conversations loaded from localStorage');
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }

    this.conversations = [];
  },

  /**
   * Clear all conversations (called on logout)
   */
  clearConversations() {
    this.conversations = [];
    this.currentConversationId = null;
    this.renderConversationList();
    
    // Clear the chat UI (both floating and inline)
    this.clearChatUI();
    
    console.log('✓ Conversations cleared on logout');
  },

  /**
   * Setup warning for non-logged-in users with unsaved conversations
   */
  setupUnsavedWarning() {
    // Prevent duplicate event listeners
    if (this._unsavedWarningInitialized) {
      return;
    }
    
    this._unsavedWarningInitialized = true;
    
    window.addEventListener('beforeunload', (e) => {
      // Check if user is not logged in and has chat messages
      if (!this.isUserLoggedIn() && this.hasUnsavedMessages()) {
        const message = 'You have unsaved conversations. Please log in to save your chat history before leaving.';
        e.preventDefault();
        e.returnValue = message; // Standard for most browsers
        return message; // For some older browsers
      }
    });
    
    console.log('✓ Unsaved warning listener attached');
  },

  /**
   * Check if there are unsaved messages in the chat
   */
  hasUnsavedMessages() {
    const floatingMessages = document.getElementById('chat-messages');
    const inlineMessages = document.getElementById('inline-chat-messages');
    
    // Check if there are more than just the initial greeting message
    const floatingCount = floatingMessages ? floatingMessages.querySelectorAll('.msg').length : 0;
    const inlineCount = inlineMessages ? inlineMessages.querySelectorAll('.msg').length : 0;
    
    // More than 1 message means user has chatted (initial greeting is 1 message)
    return floatingCount > 1 || inlineCount > 1;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConversationManager;
}
