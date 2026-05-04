/**
 * Notification Modal Module
 * Displays modern modal notifications instead of alerts
 */

const NotificationModal = {
  /**
   * Show notification modal
   * @param {Object} options - Configuration options
   * @param {string} options.title - Modal title
   * @param {string} options.message - Main message
   * @param {string} options.description - Optional description
   * @param {string} options.icon - Icon type: 'info', 'warning', 'error', 'success', 'login'
   * @param {Array} options.buttons - Array of button objects {text, action, style}
   */
  show(options) {
    const modal = document.getElementById('notification-modal');
    const titleEl = document.getElementById('notification-title');
    const iconEl = document.getElementById('notification-icon');
    const messageEl = document.getElementById('notification-message');
    const descriptionEl = document.getElementById('notification-description');
    const actionsEl = document.getElementById('notification-actions');

    if (!modal) return;

    // Set title
    if (titleEl) titleEl.textContent = options.title || 'Notification';

    // Set icon
    if (iconEl) {
      iconEl.innerHTML = this.getIcon(options.icon || 'info');
    }

    // Set message
    if (messageEl) messageEl.textContent = options.message || '';

    // Set description
    if (descriptionEl) {
      if (options.description) {
        descriptionEl.textContent = options.description;
        descriptionEl.style.display = '';
      } else {
        descriptionEl.style.display = 'none';
      }
    }

    // Set buttons
    if (actionsEl) {
      actionsEl.innerHTML = '';
      const buttons = options.buttons || [{ text: 'OK', action: () => this.close(), style: 'btn-blue' }];
      
      buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = `btn ${btn.style || 'btn-blue'} w-full ripple`;
        button.textContent = btn.text;
        button.onclick = () => {
          if (btn.action) btn.action();
          this.close();
        };
        actionsEl.appendChild(button);
      });
    }

    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  /**
   * Close notification modal
   */
  close() {
    const modal = document.getElementById('notification-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  },

  /**
   * Get icon SVG based on type
   */
  getIcon(type) {
    const icons = {
      info: `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#1A4F8A">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      `,
      warning: `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#E87722">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      `,
      error: `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#c0392b">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      `,
      success: `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#27ae60">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      `,
      login: `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#1A4F8A">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
      `,
      delete: `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#E87722">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
      `,
      limit: `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#E87722">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
        </svg>
      `
    };

    return icons[type] || icons.info;
  },

  /**
   * Show login required notification
   */
  showLoginRequired() {
    this.show({
      title: 'Login Required',
      message: 'Please login to access conversation history',
      description: 'You need to be logged in to save and manage your chat conversations.',
      icon: 'login',
      buttons: [
        {
          text: 'Cancel',
          style: 'btn-outline',
          action: () => {}
        },
        {
          text: 'Login',
          style: 'btn-blue',
          action: () => {
            if (typeof Auth !== 'undefined') {
              Auth.showLoginModal();
            }
          }
        }
      ]
    });
  },

  /**
   * Show conversation limit reached notification
   */
  showConversationLimitReached() {
    this.show({
      title: 'Conversation Limit Reached',
      message: 'You have reached the maximum of 3 conversations',
      description: 'Please delete an existing conversation to create a new one.',
      icon: 'limit',
      buttons: [
        {
          text: 'OK',
          style: 'btn-blue',
          action: () => {}
        }
      ]
    });
  },

  /**
   * Show delete confirmation
   */
  showDeleteConfirmation(onConfirm) {
    this.show({
      title: 'Delete Conversation',
      message: 'Are you sure you want to delete this conversation?',
      description: 'This action cannot be undone. All messages will be permanently deleted.',
      icon: 'delete',
      buttons: [
        {
          text: 'Cancel',
          style: 'btn-outline',
          action: () => {}
        },
        {
          text: 'Delete',
          style: 'btn-orange',
          action: onConfirm
        }
      ]
    });
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationModal;
}
