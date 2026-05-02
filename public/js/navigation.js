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

    // Activate selected tab based on view name
    const tabs = document.querySelectorAll('.tab');
    let tabIndex = -1;
    
    // Map view names to tab indices (matching HTML order)
    switch(viewName) {
      case 'landing':
        tabIndex = 0;
        break;
      case 'detail':
        tabIndex = 1;
        // Load project details when switching to detail view
        if (typeof Projects !== 'undefined') {
          Projects.loadDetailView();
        }
        break;
      case 'chatbot':
        tabIndex = 2;
        break;
      case 'dashboard':
        tabIndex = 3;
        break;
    }
    
    // Activate the correct tab
    if (tabIndex >= 0 && tabs[tabIndex]) {
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
    const tabs = document.querySelectorAll('.tab');
    const viewNames = ['landing', 'detail', 'chatbot', 'dashboard'];
    
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
        
        this.switchView(viewNames[newIndex]);
        
        // Focus the new tab after a short delay
        setTimeout(() => {
          const updatedTabs = document.querySelectorAll('.tab');
          if (updatedTabs[newIndex]) {
            updatedTabs[newIndex].focus();
          }
        }, 50);
      });
    });
  },

  /**
   * Initialize navigation
   */
  init() {
    this.setupKeyboardNavigation();
    
    // Setup tab click handlers with proper view mapping
    const tabs = document.querySelectorAll('.tab');
    const viewNames = ['landing', 'detail', 'chatbot', 'dashboard'];
    
    tabs.forEach((tab, index) => {
      // Remove any existing click handlers
      const newTab = tab.cloneNode(true);
      tab.parentNode.replaceChild(newTab, tab);
      
      // Add new click handler
      newTab.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Tab clicked:', viewNames[index]);
        this.switchView(viewNames[index]);
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
