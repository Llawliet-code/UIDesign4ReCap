/**
 * Navigation Module
 * Handles view switching and tab navigation
 */

const Navigation = {
  /**
   * Switch between different views
   */
  switchView(viewName) {
    // Update views
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
      view.setAttribute('aria-hidden', 'true');
    });
    
    // Update tabs
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

    // Activate selected tab
    const tabIndex = { landing: 0, dashboard: 1, detail: 2, chatbot: 3 }[viewName];
    const tabs = document.querySelectorAll('.tab');
    if (tabs[tabIndex]) {
      tabs[tabIndex].classList.add('active');
      tabs[tabIndex].setAttribute('aria-selected', 'true');
      tabs[tabIndex].setAttribute('tabindex', '0');
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
    document.querySelectorAll('.role-tab').forEach(tab => tab.classList.remove('active'));
    element.classList.add('active');

    ['student', 'adviser', 'librarian'].forEach(r => {
      const panel = document.getElementById(`dash-${r}`);
      if (panel) {
        panel.style.display = (r === role) ? 'block' : 'none';
      }
    });
  },

  /**
   * Setup keyboard navigation for tabs
   */
  setupKeyboardNavigation() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach((tab, index) => {
      tab.addEventListener('keydown', (e) => {
        let newIndex = index;
        
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          newIndex = (index + 1) % tabs.length;
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          newIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (e.key === 'Home') {
          e.preventDefault();
          newIndex = 0;
        } else if (e.key === 'End') {
          e.preventDefault();
          newIndex = tabs.length - 1;
        } else {
          return;
        }
        
        tabs[newIndex].click();
        tabs[newIndex].focus();
      });
    });
  },

  /**
   * Initialize navigation
   */
  init() {
    this.setupKeyboardNavigation();
    
    // Setup tab click handlers
    document.querySelectorAll('.tab').forEach((tab, index) => {
      const views = ['landing', 'dashboard', 'detail', 'chatbot'];
      tab.addEventListener('click', () => this.switchView(views[index]));
    });

    // Setup role tab handlers
    document.querySelectorAll('.role-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        const role = this.textContent.toLowerCase().includes('student') ? 'student' :
                     this.textContent.toLowerCase().includes('adviser') ? 'adviser' : 'librarian';
        Navigation.switchRole(this, role);
      });
    });
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Navigation;
}
