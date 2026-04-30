/**
 * Main Application Entry Point
 * Initializes all modules and sets up the application
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing CTU RECAP...');

  // Initialize all modules
  if (typeof ThemeManager !== 'undefined') {
    ThemeManager.init();
    console.log('✓ Theme Manager initialized');
  }

  if (typeof Navigation !== 'undefined') {
    Navigation.init();
    console.log('✓ Navigation initialized');
  }

  if (typeof Filters !== 'undefined') {
    Filters.init();
    console.log('✓ Filters initialized');
  }

  if (typeof Search !== 'undefined') {
    Search.init();
    console.log('✓ Search initialized');
  }

  if (typeof Chat !== 'undefined') {
    Chat.init();
    console.log('✓ Chat initialized');
  }

  if (typeof Utils !== 'undefined') {
    Utils.init();
    console.log('✓ Utils initialized');
  }

  if (typeof Auth !== 'undefined') {
    Auth.init();
    console.log('✓ Auth initialized');
  }

  console.log('✨ CTU RECAP - All systems ready!');
  
  // Set up global event listeners for data-attribute based interactions
  setupGlobalListeners();
});

/**
 * Set up global event listeners for data-attribute based interactions
 */
function setupGlobalListeners() {
  // Single click handler for all data-attribute interactions
  document.addEventListener('click', (e) => {
    // Handle data-action (highest priority)
    const actionTarget = e.target.closest('[data-action]');
    if (actionTarget) {
      e.preventDefault();
      const action = actionTarget.dataset.action;
      handleAction(action, actionTarget);
      return;
    }
    
    // Handle data-view navigation
    const viewTarget = e.target.closest('[data-view]');
    if (viewTarget && typeof Navigation !== 'undefined') {
      e.preventDefault();
      const view = viewTarget.dataset.view;
      Navigation.switchView(view);
      return;
    }
    
    // Handle data-role tab clicks
    const roleTarget = e.target.closest('[data-role]');
    if (roleTarget && typeof Navigation !== 'undefined') {
      const role = roleTarget.dataset.role;
      Navigation.switchRole(roleTarget, role);
      return;
    }
    
    // Handle data-suggestion clicks
    const suggestionTarget = e.target.closest('[data-suggestion]');
    if (suggestionTarget && typeof Chat !== 'undefined') {
      const suggestion = suggestionTarget.dataset.suggestion;
      Chat.sendSuggestion(suggestionTarget, suggestion);
      return;
    }
    
    // Handle data-filter-toggle clicks
    const filterTarget = e.target.closest('[data-filter-toggle]');
    if (filterTarget && typeof Filters !== 'undefined') {
      Filters.toggleSection(filterTarget);
      return;
    }
  });
  
  // Handle Enter key on data-enter-send inputs
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.hasAttribute('data-enter-send')) {
      e.preventDefault();
      if (e.target.id === 'chat-input' && typeof Chat !== 'undefined') {
        Chat.sendMessage();
      }
    }
  });
}

/**
 * Handle various data-action events
 */
function handleAction(action, element) {
  console.log('Action triggered:', action); // Debug log
  
  switch (action) {
    case 'toggle-chat':
      console.log('Toggling chat...'); // Debug log
      if (typeof Chat !== 'undefined') {
        Chat.togglePanel();
      } else {
        console.error('Chat module not loaded');
      }
      break;
    case 'send-chat':
      if (typeof Chat !== 'undefined') Chat.sendMessage();
      break;
    case 'send-inline':
      if (typeof Chat !== 'undefined') Chat.sendInlineMessage();
      break;
    case 'validate':
      if (typeof Utils !== 'undefined') Utils.runValidation();
      break;
    case 'show-login':
      if (typeof Auth !== 'undefined') Auth.showLoginModal();
      break;
    case 'close-login':
      if (typeof Auth !== 'undefined') Auth.closeLoginModal();
      break;
    case 'toggle-password':
      if (typeof Auth !== 'undefined') Auth.togglePassword();
      break;
    case 'demo-login':
      if (typeof Auth !== 'undefined') Auth.demoLogin();
      break;
    case 'forgot-password':
      if (typeof Auth !== 'undefined') Auth.forgotPassword();
      break;
    case 'show-register':
      alert('Registration feature coming soon!');
      break;
    case 'show-user-menu':
      if (typeof Auth !== 'undefined') {
        const confirmLogout = confirm('Do you want to logout?');
        if (confirmLogout) Auth.logout();
      }
      break;
    default:
      console.warn(`Unknown action: ${action}`);
  }
}

// Make functions globally available for HTML event handlers (temporary)
// These will be removed once HTML is fully refactored
window.switchView = function(view) {
  if (typeof Navigation !== 'undefined') {
    Navigation.switchView(view);
  }
};

window.switchRole = function(element, role) {
  if (typeof Navigation !== 'undefined') {
    Navigation.switchRole(element, role);
  }
};

window.toggleChat = function() {
  if (typeof Chat !== 'undefined') {
    Chat.togglePanel();
  }
};

window.sendChat = function() {
  if (typeof Chat !== 'undefined') {
    Chat.sendMessage();
  }
};

window.sendInlineMessage = function() {
  if (typeof Chat !== 'undefined') {
    Chat.sendInlineMessage();
  }
};

window.sendSuggestion = function(button, text) {
  if (typeof Chat !== 'undefined') {
    Chat.sendSuggestion(button, text);
  }
};

window.runValidation = function() {
  if (typeof Utils !== 'undefined') {
    return Utils.runValidation();
  }
};
