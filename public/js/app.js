/**
 * Main Application Entry Point
 * Initializes all modules and sets up the application
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
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

  if (typeof MobileMenu !== 'undefined') {
    MobileMenu.init();
    console.log('✓ Mobile Menu initialized');
  }

  if (typeof Filters !== 'undefined') {
    Filters.init();
    console.log('✓ Filters initialized');
  }

  // Initialize Auth FIRST before Chat to ensure user session is loaded
  if (typeof Auth !== 'undefined') {
    Auth.init();
    console.log('✓ Auth initialized');
  }

  // Initialize Groq AI before Search
  if (typeof GroqService !== 'undefined') {
    await GroqService.init();
    console.log('✓ Groq AI Service initialized');
  }

  if (typeof Search !== 'undefined') {
    Search.init();
    console.log('✓ Search initialized');
  }

  // Initialize AI Chatbot
  if (typeof AIService !== 'undefined') {
    await AIService.init();
    console.log('✓ AI Chatbot initialized');
  }

  // Initialize AI Data Context (for live data analysis)
  if (typeof AIDataContext !== 'undefined') {
    await AIDataContext.initialize();
    console.log('✓ AI Data Context initialized');
  }

  if (typeof Chat !== 'undefined') {
    Chat.init();
    console.log('✓ Chat initialized');
  }

  // Initialize Notifications
  if (typeof Notifications !== 'undefined') {
    Notifications.init();
    console.log('✓ Notifications initialized');
  }

  // Initialize Conversation Manager
  if (typeof ConversationManager !== 'undefined') {
    ConversationManager.init();
    console.log('✓ Conversation Manager initialized');
  }

  if (typeof Utils !== 'undefined') {
    Utils.init();
    console.log('✓ Utils initialized');
  }

  if (typeof Admin !== 'undefined') {
    Admin.init();
    console.log('✓ Admin initialized');
  }

  if (typeof Librarian !== 'undefined') {
    Librarian.init();
    console.log('✓ Librarian initialized');
  }

  if (typeof Citation !== 'undefined') {
    Citation.init();
    console.log('✓ Citation initialized');
  }

  if (typeof StudentUpload !== 'undefined') {
    StudentUpload.init();
    console.log('✓ Student Upload initialized');
  }

  if (typeof StudentSubmissions !== 'undefined') {
    StudentSubmissions.init();
    console.log('✓ Student Submissions initialized');
  }

  if (typeof AdminAttention !== 'undefined') {
    AdminAttention.init();
    console.log('✓ Admin Attention initialized');
  }

  if (typeof Projects !== 'undefined') {
    Projects.init();
    console.log('✓ Projects initialized');
  }

  console.log('✨ CTU RECAP - All systems ready!');
  
  // Set up global event listeners for data-attribute based interactions
  setupGlobalListeners();
  
  // Auto-load data if user is logged in and on dashboard
  setTimeout(() => {
    if (Auth.currentUser) {
      const dashboardView = document.getElementById('view-dashboard');
      
      // ADMIN AUTO-REDIRECT: If admin user and not on dashboard, redirect to Admin Panel
      if (Auth.currentUser.role === 'admin') {
        if (!dashboardView || !dashboardView.classList.contains('active')) {
          // Admin is not on dashboard, redirect them
          if (typeof Navigation !== 'undefined') {
            console.log('✓ Redirecting admin to Admin Panel...');
            Navigation.switchView('dashboard');
            setTimeout(() => {
              const adminTab = document.querySelector('.role-tab[data-role="admin"]');
              if (adminTab && typeof Navigation !== 'undefined') {
                Navigation.switchRole(adminTab, 'admin');
              }
            }, 200);
          }
        } else {
          // Admin is already on dashboard, just switch to admin tab
          const adminTab = document.querySelector('.role-tab[data-role="admin"]');
          if (adminTab && typeof Navigation !== 'undefined') {
            Navigation.switchRole(adminTab, 'admin');
          }
        }
      } else if (dashboardView && dashboardView.classList.contains('active')) {
        // Non-admin users: load data for their current role
        // Only load if user is authenticated and verified
        if (typeof Auth !== 'undefined' && Auth.currentUser) {
          const activeRoleTab = document.querySelector('.role-tab.active');
          if (activeRoleTab) {
            const role = activeRoleTab.dataset.role;
            if (role === 'student' && typeof StudentSubmissions !== 'undefined') {
              console.log('Auto-loading student submissions...');
              StudentSubmissions.loadSubmissions();
            } else if (role === 'admin' && typeof Admin !== 'undefined') {
              console.log('Auto-loading admin data...');
              Admin.loadProjects();
            } else if (role === 'librarian' && typeof Librarian !== 'undefined') {
              console.log('Auto-loading librarian data...');
              Librarian.loadRecentUploads();
            }
          }
        } else {
          console.log('⚠️ User not authenticated, skipping data load');
        }
      }
      
      // Check for new pending submissions (admin/librarian only)
      if (typeof AdminAttention !== 'undefined') {
        AdminAttention.checkForNewSubmissions();
      }
    }
  }, 500); // Small delay to ensure Auth is fully loaded
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
    case 'apply-filters':
      if (typeof Filters !== 'undefined') Filters.apply();
      break;
    case 'clear-filters':
      if (typeof Filters !== 'undefined') Filters.clearAll();
      break;
    case 'toggle-mobile-filters': {
      const panel = document.getElementById('mobile-filter-panel');
      const btn = document.getElementById('mobile-filter-toggle');
      const sidebar = document.querySelector('.sidebar');
      if (panel && sidebar) {
        const isHidden = panel.classList.contains('hidden');
        if (isHidden) {
          // Clone sidebar content into mobile panel
          panel.innerHTML = sidebar.innerHTML;
          panel.classList.remove('hidden');
          if (btn) btn.setAttribute('aria-expanded', 'true');
          // Re-init checkboxes inside the cloned panel
          panel.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', () => {
              // Sync with original sidebar checkbox
              const original = document.getElementById(cb.id);
              if (original) original.checked = cb.checked;
              if (typeof Filters !== 'undefined') Filters.apply();
            });
          });
        } else {
          panel.classList.add('hidden');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        }
      }
      break;
    }
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
      if (typeof Auth !== 'undefined') Auth.showSignupModal();
      break;
    case 'show-signup':
      if (typeof Auth !== 'undefined') Auth.showSignupModal();
      break;
    case 'close-signup':
      if (typeof Auth !== 'undefined') Auth.closeSignupModal();
      break;
    case 'show-login-from-signup':
      if (typeof Auth !== 'undefined') {
        Auth.closeSignupModal();
        Auth.showLoginModal();
      }
      break;
    case 'toggle-signup-password':
      if (typeof Auth !== 'undefined') Auth.toggleSignupPassword('signup-password');
      break;
    case 'toggle-signup-confirm-password':
      if (typeof Auth !== 'undefined') Auth.toggleSignupPassword('signup-confirm-password');
      break;
    case 'show-user-menu':
      if (typeof Auth !== 'undefined') {
        Auth.showLogoutModal();
      }
      break;
    case 'close-logout':
      if (typeof Auth !== 'undefined') Auth.closeLogoutModal();
      break;
    case 'confirm-logout':
      if (typeof Auth !== 'undefined') Auth.confirmLogout();
      break;
    case 'show-upload-metadata':
      if (typeof StudentUpload !== 'undefined') StudentUpload.showModal();
      break;
    case 'close-upload-metadata':
      if (typeof StudentUpload !== 'undefined') StudentUpload.closeModal();
      break;
    case 'show-add-project':
      if (typeof Admin !== 'undefined') Admin.showAddProjectModal();
      break;
    case 'show-upload-metadata':
      if (typeof Librarian !== 'undefined') Librarian.showUploadModal();
      break;
    case 'close-project-modal':
      if (typeof Admin !== 'undefined') Admin.closeProjectModal();
      break;
    case 'admin-refresh':
      if (typeof Admin !== 'undefined') Admin.loadProjects();
      break;
    case 'show-citation':
      if (typeof Citation !== 'undefined') Citation.showCitationModal();
      break;
    case 'close-citation':
      if (typeof Citation !== 'undefined') Citation.closeCitationModal();
      break;
    case 'copy-citation':
      if (typeof Citation !== 'undefined') Citation.copyCitation();
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
