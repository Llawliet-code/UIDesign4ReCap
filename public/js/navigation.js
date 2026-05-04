  /**
 * Navigation Module
 * Handles view switching and tab navigation
 */

const Navigation = {
  /**
   * Switch between different views
   */
  switchView(viewName) {
    // Guard dashboard — must be logged in
    if (viewName === 'dashboard' && (typeof Auth === 'undefined' || !Auth.currentUser)) {
      if (typeof Auth !== 'undefined') Auth.showLoginModal();
      return;
    }

    // Update views
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
      view.setAttribute('aria-hidden', 'true');
    });
    
    // Update tabs - remove active from all
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
      tab.setAttribute('tabindex', '-1');
    });

    // Activate selected view
    const activeView = document.getElementById(`view-${viewName}`);
    if (activeView) {
      activeView.classList.add('active');
      activeView.setAttribute('aria-hidden', 'false');
    }

    // Hide/show floating chat button based on view with smooth transition
    const chatFab = document.getElementById('chat-fab');
    if (chatFab) {
      if (viewName === 'chatbot') {
        chatFab.classList.add('hidden');
      } else {
        chatFab.classList.remove('hidden');
      }
    }

    // Close conversation sidebar when navigating away from AI Chatbot
    if (viewName !== 'chatbot' && typeof ConversationManager !== 'undefined') {
      const sidebar = document.getElementById('conversation-sidebar');
      if (sidebar && sidebar.classList.contains('open')) {
        ConversationManager.closeSidebar();
      }
    }

    // Find the correct tab by data-view attribute instead of index
    // This is more reliable when tabs can be hidden/shown dynamically
    const tabs = document.querySelectorAll('.tab');
    let tabToActivate = null;
    
    tabs.forEach(tab => {
      if (tab.dataset.view === viewName) {
        tabToActivate = tab;
      }
    });
    
    // Activate the correct tab
    if (tabToActivate) {
      tabToActivate.classList.add('active');
      tabToActivate.setAttribute('aria-selected', 'true');
      tabToActivate.setAttribute('tabindex', '0');
    }

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Focus management for accessibility
    if (activeView) {
      const firstFocusable = activeView.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) {
        setTimeout(() => firstFocusable.focus(), 100);
      }
    }
  },

  /**
   * Switch dashboard role tabs
   */
  switchRole(element, role) {
    // Check if user has permission to access this role
    if (typeof Auth !== 'undefined' && Auth.currentUser) {
      const allowedRoles = element.dataset.allowedRoles?.split(',') || [];
      const userRole = Auth.currentUser.role;
      
      if (!allowedRoles.includes(userRole)) {
        console.warn(`Access denied: User role '${userRole}' cannot access '${role}' panel`);
        return;
      }
    }
    
    document.querySelectorAll('.role-tab').forEach(tab => tab.classList.remove('active'));
    element.classList.add('active');

    ['student', 'adviser', 'librarian', 'admin'].forEach(r => {
      const panel = document.getElementById(`dash-${r}`);
      if (panel) {
        panel.classList.toggle('hidden', r !== role);
      }
    });
    
    // Load data based on role
    if (role === 'admin' && typeof Admin !== 'undefined') {
      Admin.loadProjects();
    } else if (role === 'librarian' && typeof Librarian !== 'undefined') {
      Librarian.loadRecentUploads();
    }
  },

  /**
   * Setup keyboard navigation for tabs
   */
  setupKeyboardNavigation() {
    const allTabs = document.querySelectorAll('.tab');
    
    allTabs.forEach((tab) => {
      tab.addEventListener('keydown', (e) => {
        // Get only visible tabs for navigation
        const visibleTabs = Array.from(document.querySelectorAll('.tab')).filter(t => {
          return t.style.display !== 'none' && window.getComputedStyle(t).display !== 'none';
        });
        
        const currentIndex = visibleTabs.indexOf(tab);
        if (currentIndex === -1) return;
        
        let newIndex = currentIndex;
        
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          newIndex = (currentIndex + 1) % visibleTabs.length;
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          newIndex = (currentIndex - 1 + visibleTabs.length) % visibleTabs.length;
        } else if (e.key === 'Home') {
          e.preventDefault();
          newIndex = 0;
        } else if (e.key === 'End') {
          e.preventDefault();
          newIndex = visibleTabs.length - 1;
        } else {
          return;
        }
        
        const targetTab = visibleTabs[newIndex];
        if (targetTab && targetTab.dataset.view) {
          this.switchView(targetTab.dataset.view);
          
          // Focus the new tab after a short delay
          setTimeout(() => {
            targetTab.focus();
          }, 50);
        }
      });
    });
  },

  /**
   * Initialize navigation
   */
  init() {
    this.setupKeyboardNavigation();
    
    // Setup tab click handlers using data-view attribute
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach((tab) => {
      // Remove any existing click handlers
      const newTab = tab.cloneNode(true);
      tab.parentNode.replaceChild(newTab, tab);
      
      // Add new click handler
      newTab.addEventListener('click', (e) => {
        e.preventDefault();
        const viewName = newTab.dataset.view;
        if (viewName) {
          console.log('Tab clicked:', viewName);
          this.switchView(viewName);
        }
      });
    });

    // Setup role tab handlers
    document.querySelectorAll('.role-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        const text = this.textContent.toLowerCase();
        let role = 'student';
        
        if (text.includes('adviser')) role = 'adviser';
        else if (text.includes('librarian')) role = 'librarian';
        else if (text.includes('admin')) role = 'admin';
        
        Navigation.switchRole(this, role);
      });
    });
    
    console.log('✓ Navigation initialized');
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Navigation;
}
