/**
 * Authentication Module
 * Handles login, logout, and user authentication
 */

const Auth = {
  // Demo users for testing
  demoUsers: {
    'student@ctu.edu.ph': {
      password: 'student123',
      role: 'student',
      name: 'Juan dela Cruz',
      id: '2021-12345',
      program: 'BSIT 3A'
    },
    '2021-12345': {
      password: 'student123',
      role: 'student',
      name: 'Juan dela Cruz',
      id: '2021-12345',
      program: 'BSIT 3A'
    },
    'adviser@ctu.edu.ph': {
      password: 'adviser123',
      role: 'adviser',
      name: 'Prof. Elena Villanueva',
      id: 'ADV-001',
      department: 'Computer Science'
    },
    'librarian@ctu.edu.ph': {
      password: 'librarian123',
      role: 'librarian',
      name: 'Ms. Maria Santos',
      id: 'LIB-001',
      department: 'Library Services'
    },
    'admin@ctu.edu.ph': {
      password: 'admin123',
      role: 'admin',
      name: 'Admin User',
      id: 'ADM-001',
      department: 'System Administration'
    }
  },

  currentUser: null,

  /**
   * Show login modal
   */
  showLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      
      // Focus on email input
      setTimeout(() => {
        const emailInput = document.getElementById('login-email');
        if (emailInput) emailInput.focus();
      }, 100);
    }
  },

  /**
   * Close login modal
   */
  closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
      
      // Reset form
      this.resetForm();
    }
  },

  /**
   * Show signup modal
   */
  showSignupModal() {
    // Close login modal if open
    const loginModal = document.getElementById('login-modal');
    if (loginModal) loginModal.classList.add('hidden');

    const modal = document.getElementById('signup-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        const firstInput = document.getElementById('signup-firstname');
        if (firstInput) firstInput.focus();
      }, 100);
    }
  },

  /**
   * Close signup modal
   */
  closeSignupModal() {
    const modal = document.getElementById('signup-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
      this.resetSignupForm();
    }
  },

  /**
   * Reset signup form
   */
  resetSignupForm() {
    const form = document.getElementById('signup-form');
    if (form) {
      form.reset();
      document.querySelectorAll('#signup-modal .form-error').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('#signup-modal .form-input').forEach(el => el.classList.remove('error'));
      const btn = document.getElementById('signup-submit');
      if (btn) {
        btn.disabled = false;
        btn.querySelector('.btn-text').classList.remove('hidden');
        btn.querySelector('.btn-spinner').classList.add('hidden');
      }
      const successDiv = document.getElementById('signup-success');
      if (successDiv) successDiv.classList.add('hidden');
      if (form) form.classList.remove('hidden');
    }
  },

  /**
   * Toggle signup password visibility
   */
  toggleSignupPassword(fieldId) {
    const input = document.getElementById(fieldId);
    const btn = input ? input.closest('.password-input-wrapper').querySelector('.password-icon') : null;
    if (input && btn) {
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
      } else {
        input.type = 'password';
        btn.textContent = '👁️';
      }
    }
  },

  /**
   * Validate signup form
   */
  validateSignupForm(data) {
    let isValid = true;

    const setError = (id, msg) => {
      const input = document.getElementById(id);
      const error = document.getElementById(id + '-error');
      if (input) input.classList.add('error');
      if (error) { error.textContent = msg; error.classList.remove('hidden'); }
      isValid = false;
    };
    const clearError = (id) => {
      const input = document.getElementById(id);
      const error = document.getElementById(id + '-error');
      if (input) input.classList.remove('error');
      if (error) error.classList.add('hidden');
    };

    if (!data.firstName.trim()) {
      setError('signup-firstname', 'First name is required');
    } else { clearError('signup-firstname'); }

    if (!data.lastName.trim()) {
      setError('signup-lastname', 'Last name is required');
    } else { clearError('signup-lastname'); }

    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setError('signup-email', 'Please enter a valid email address');
    } else { clearError('signup-email'); }

    if (!data.password || data.password.length < 6) {
      setError('signup-password', 'Password must be at least 6 characters');
    } else { clearError('signup-password'); }

    if (data.password !== data.confirmPassword) {
      setError('signup-confirm-password', 'Passwords do not match');
    } else {
      const input = document.getElementById('signup-confirm-password');
      const error = document.getElementById('signup-confirm-error');
      if (input) input.classList.remove('error');
      if (error) error.classList.add('hidden');
    }

    return isValid;
  },

  /**
   * Handle signup form submission
   */
  async handleSignup(e) {
    e.preventDefault();

    const data = {
      firstName: document.getElementById('signup-firstname').value,
      lastName: document.getElementById('signup-lastname').value,
      email: document.getElementById('signup-email').value,
      studentId: document.getElementById('signup-student-id').value,
      program: document.getElementById('signup-program').value,
      password: document.getElementById('signup-password').value,
      confirmPassword: document.getElementById('signup-confirm-password').value,
    };

    if (!this.validateSignupForm(data)) return;

    // Set loading state
    const btn = document.getElementById('signup-submit');
    btn.disabled = true;
    btn.querySelector('.btn-text').classList.add('hidden');
    btn.querySelector('.btn-spinner').classList.remove('hidden');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create new user object
    const newUser = {
      role: 'student',
      name: `${data.firstName} ${data.lastName}`,
      id: data.studentId || `STU-${Date.now()}`,
      program: data.program || 'N/A',
      email: data.email,
    };

    // Register in demoUsers so they can log in immediately
    this.demoUsers[data.email.toLowerCase()] = {
      ...newUser,
      password: data.password,
    };

    // Auto-login the new user
    this.currentUser = newUser;
    sessionStorage.setItem('ctureap_user', JSON.stringify(newUser));

    // Show success
    const form = document.getElementById('signup-form');
    const successDiv = document.getElementById('signup-success');
    if (form) form.classList.add('hidden');
    if (successDiv) successDiv.classList.remove('hidden');

    // Redirect to dashboard
    setTimeout(() => {
      this.closeSignupModal();
      this.updateUIForLoggedInUser();
      if (typeof Navigation !== 'undefined') {
        Navigation.switchView('dashboard');
      }
    }, 1500);
  },

  /**
   * Reset login form
   */
  resetForm() {
    const form = document.getElementById('login-form');
    if (form) {
      form.reset();
      
      // Hide all errors
      document.querySelectorAll('.form-error').forEach(error => {
        error.classList.add('hidden');
      });
      
      // Remove error states
      document.querySelectorAll('.form-input').forEach(input => {
        input.classList.remove('error');
      });
      
      // Reset button state
      this.setButtonState(false);
      
      // Hide success message
      const successDiv = document.getElementById('login-success');
      if (successDiv) successDiv.classList.add('hidden');
      
      // Show form
      if (form) form.classList.remove('hidden');
    }
  },

  /**
   * Toggle password visibility
   */
  togglePassword() {
    const passwordInput = document.getElementById('login-password');
    const icon = document.querySelector('.password-icon');
    
    if (passwordInput && icon) {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.textContent = '🙈';
      } else {
        passwordInput.type = 'password';
        icon.textContent = '👁️';
      }
    }
  },

  /**
   * Validate form inputs
   */
  validateForm(email, password) {
    let isValid = true;
    
    // Validate email/student ID
    const emailInput = document.getElementById('login-email');
    const emailError = document.getElementById('email-error');
    
    if (!email || email.trim() === '') {
      emailInput.classList.add('error');
      emailError.textContent = 'Email or Student ID is required';
      emailError.classList.remove('hidden');
      isValid = false;
    } else {
      emailInput.classList.remove('error');
      emailError.classList.add('hidden');
    }
    
    // Validate password
    const passwordInput = document.getElementById('login-password');
    const passwordError = document.getElementById('password-error');
    
    if (!password || password.trim() === '') {
      passwordInput.classList.add('error');
      passwordError.textContent = 'Password is required';
      passwordError.classList.remove('hidden');
      isValid = false;
    } else if (password.length < 6) {
      passwordInput.classList.add('error');
      passwordError.textContent = 'Password must be at least 6 characters';
      passwordError.classList.remove('hidden');
      isValid = false;
    } else {
      passwordInput.classList.remove('error');
      passwordError.classList.add('hidden');
    }
    
    return isValid;
  },

  /**
   * Set button loading state
   */
  setButtonState(loading) {
    const button = document.getElementById('login-submit');
    const btnText = button.querySelector('.btn-text');
    const btnSpinner = button.querySelector('.btn-spinner');
    
    if (loading) {
      button.disabled = true;
      btnText.classList.add('hidden');
      btnSpinner.classList.remove('hidden');
    } else {
      button.disabled = false;
      btnText.classList.remove('hidden');
      btnSpinner.classList.add('hidden');
    }
  },

  /**
   * Authenticate user
   */
  authenticate(email, password) {
    // Check if user exists
    const user = this.demoUsers[email.toLowerCase()];
    
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or student ID'
      };
    }
    
    // Check password
    if (user.password !== password) {
      return {
        success: false,
        message: 'Incorrect password'
      };
    }
    
    // Success
    return {
      success: true,
      user: user
    };
  },

  /**
   * Handle login form submission
   */
  async handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    // Validate form
    if (!this.validateForm(email, password)) {
      return;
    }
    
    // Set loading state
    this.setButtonState(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Authenticate
    const result = this.authenticate(email, password);
    
    if (result.success) {
      // Store user data
      this.currentUser = result.user;
      
      // Save to localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem('ctureap_user', JSON.stringify(result.user));
      } else {
        sessionStorage.setItem('ctureap_user', JSON.stringify(result.user));
      }
      
      // Show success message
      this.showSuccess();
      
      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        this.closeLoginModal();
        this.updateUIForLoggedInUser();
        
        if (typeof Navigation !== 'undefined') {
          Navigation.switchView('dashboard');
          
          // Auto-select the correct role tab based on user role
          setTimeout(() => {
            const roleTabs = document.querySelectorAll('.role-tab');
            let targetTab = null;
            
            // Find the appropriate tab for the user's role
            roleTabs.forEach(tab => {
              const tabRole = tab.dataset.role;
              if (tabRole === this.currentUser.role && tab.style.display !== 'none') {
                targetTab = tab;
              }
            });
            
            // If user's role tab is not found or hidden, use first visible tab
            if (!targetTab) {
              targetTab = document.querySelector('.role-tab:not([style*="display: none"])');
            }
            
            if (targetTab) {
              Navigation.switchRole(targetTab, targetTab.dataset.role);
            }
          }, 100);
        }
      }, 1500);
      
    } else {
      // Show error
      this.setButtonState(false);
      const emailError = document.getElementById('email-error');
      emailError.textContent = result.message;
      emailError.classList.remove('hidden');
      document.getElementById('login-email').classList.add('error');
    }
  },

  /**
   * Show success message
   */
  showSuccess() {
    const form = document.getElementById('login-form');
    const successDiv = document.getElementById('login-success');
    
    if (form && successDiv) {
      form.classList.add('hidden');
      successDiv.classList.remove('hidden');
    }
  },

  /**
   * Demo login (quick login for testing)
   */
  async demoLogin() {
    // Auto-fill form
    document.getElementById('login-email').value = 'student@ctu.edu.ph';
    document.getElementById('login-password').value = 'student123';
    
    // Submit form
    const form = document.getElementById('login-form');
    if (form) {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  },

  /**
   * Update UI for logged in user
   */
  updateUIForLoggedInUser() {
    if (!this.currentUser) return;
    
    // Update welcome message
    const welcomeSpan = document.querySelector('.dash-welcome span');
    if (welcomeSpan) {
      welcomeSpan.textContent = this.currentUser.name;
    }
    
    // Update role badge
    const roleBadge = document.querySelector('.role-badge');
    if (roleBadge) {
      if (this.currentUser.role === 'student') {
        roleBadge.textContent = `Student — ${this.currentUser.program}`;
      } else if (this.currentUser.role === 'adviser') {
        roleBadge.textContent = `Adviser — ${this.currentUser.department}`;
      } else if (this.currentUser.role === 'librarian') {
        roleBadge.textContent = `Librarian — ${this.currentUser.department}`;
      } else if (this.currentUser.role === 'admin') {
        roleBadge.textContent = `Admin — ${this.currentUser.department}`;
      }
    }

    // Switch nav: hide auth buttons, show user menu
    const authButtons = document.getElementById('nav-auth-buttons');
    const userMenu = document.getElementById('nav-user-menu');
    const userAvatar = document.getElementById('nav-user-avatar');
    const userName = document.getElementById('nav-user-name');

    if (authButtons) {
      authButtons.classList.add('hidden');
      authButtons.style.display = 'none';
    }
    if (userMenu) {
      userMenu.classList.remove('hidden');
      userMenu.style.display = '';
    }
    if (userAvatar) userAvatar.textContent = this.currentUser.name.charAt(0).toUpperCase();
    if (userName) userName.textContent = this.currentUser.name.split(' ')[0];
    
    // Apply role-based access control
    this.applyRoleBasedAccess();
  },

  /**
   * Apply role-based access control to dashboard tabs
   */
  applyRoleBasedAccess() {
    if (!this.currentUser) return;
    
    const userRole = this.currentUser.role;
    const roleTabs = document.querySelectorAll('.role-tab');
    
    roleTabs.forEach(tab => {
      const allowedRoles = tab.dataset.allowedRoles?.split(',') || [];
      
      if (allowedRoles.includes(userRole)) {
        // User has access - show tab
        tab.style.display = '';
        tab.style.pointerEvents = '';
        tab.style.opacity = '';
      } else {
        // User doesn't have access - hide tab
        tab.style.display = 'none';
      }
    });
    
    // Ensure the active tab is one the user has access to
    const activeTab = document.querySelector('.role-tab.active');
    if (activeTab && activeTab.style.display === 'none') {
      // Find first accessible tab and activate it
      const firstAccessibleTab = document.querySelector('.role-tab[style=""], .role-tab:not([style])');
      if (firstAccessibleTab) {
        activeTab.classList.remove('active');
        firstAccessibleTab.classList.add('active');
        
        // Switch to that panel
        const role = firstAccessibleTab.dataset.role;
        if (typeof Navigation !== 'undefined') {
          Navigation.switchRole(firstAccessibleTab, role);
        }
      }
    }
  },

  /**
   * Show logout confirmation modal
   */
  showLogoutModal() {
    document.getElementById('logout-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  /**
   * Close logout modal
   */
  closeLogoutModal() {
    document.getElementById('logout-modal').classList.add('hidden');
    document.body.style.overflow = '';
  },

  /**
   * Confirm logout
   */
  confirmLogout() {
    this.closeLogoutModal();
    this.logout();
  },

  /**
   * Logout user
   */
  logout() {
    this.currentUser = null;
    localStorage.removeItem('ctureap_user');
    sessionStorage.removeItem('ctureap_user');
    
    // Restore nav: show auth buttons, hide user menu
    const authButtons = document.getElementById('nav-auth-buttons');
    const userMenu = document.getElementById('nav-user-menu');
    const userAvatar = document.getElementById('nav-user-avatar');
    const userName = document.getElementById('nav-user-name');

    if (authButtons) {
      authButtons.classList.remove('hidden');
      authButtons.style.display = '';
    }
    if (userMenu) {
      userMenu.classList.add('hidden');
      userMenu.style.display = 'none';
    }
    // Clear user info
    if (userAvatar) userAvatar.textContent = '';
    if (userName) userName.textContent = '';
    
    // Go to landing page
    if (typeof Navigation !== 'undefined') {
      Navigation.switchView('landing');
    }
  },

  /**
   * Check if user is already logged in
   */
  checkExistingSession() {
    // Clear any stale sessions on page load
    localStorage.removeItem('ctureap_user');
    sessionStorage.removeItem('ctureap_user');
    this.currentUser = null;
  },

  /**
   * Handle forgot password
   */
  forgotPassword() {
    alert('Demo credentials:\n\nStudent:\nemail: student@ctu.edu.ph\npassword: student123\n\nAdviser:\nemail: adviser@ctu.edu.ph\npassword: adviser123\n\nLibrarian:\nemail: librarian@ctu.edu.ph\npassword: librarian123');
  },

  /**
   * Initialize authentication module
   */
  init() {
    // Check for existing session
    this.checkExistingSession();
    
    // Setup login form submission
    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Setup signup form submission
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => this.handleSignup(e));
    }
    
    // Close login modal on overlay click
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
      loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
          this.closeLoginModal();
        }
      });
    }

    // Close signup modal on overlay click
    const signupModal = document.getElementById('signup-modal');
    if (signupModal) {
      signupModal.addEventListener('click', (e) => {
        if (e.target === signupModal) {
          this.closeSignupModal();
        }
      });
    }
    
    // Close logout modal on overlay click
    const logoutModal = document.getElementById('logout-modal');
    if (logoutModal) {
      logoutModal.addEventListener('click', (e) => {
        if (e.target === logoutModal) {
          this.closeLogoutModal();
        }
      });
    }
    
    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (loginModal && !loginModal.classList.contains('hidden')) {
          this.closeLoginModal();
        }
        if (signupModal && !signupModal.classList.contains('hidden')) {
          this.closeSignupModal();
        }
        if (logoutModal && !logoutModal.classList.contains('hidden')) {
          this.closeLogoutModal();
        }
      }
    });
    
    console.log('✓ Auth initialized');
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Auth;
}
