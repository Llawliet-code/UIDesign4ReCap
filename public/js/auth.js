/**
 * Authentication Module
 * Uses Firebase Authentication + Firestore for persistent user accounts.
 * Falls back to hardcoded accounts for admin/demo use.
 */

const Auth = {
  currentUser: null,

  // ─── HARDCODED FALLBACK ACCOUNTS ──────────────────────────────────────────
  // Temporary — replace with real Firebase accounts when ready.
  _fallbackUsers: {
    'admin@ctu.edu.ph': {
      password: 'CTU@dmin2024!',
      profile: { name: 'Admin User', role: 'admin', department: 'System Administration', program: 'N/A', studentId: 'ADM-001' }
    },
    'librarian@ctu.edu.ph': {
      password: 'CTU@Lib2024!',
      profile: { name: 'Ms. Maria Santos', role: 'librarian', department: 'Library Services', program: 'N/A', studentId: 'LIB-001' }
    },
    'adviser@ctu.edu.ph': {
      password: 'CTU@Adv2024!',
      profile: { name: 'Prof. Elena Villanueva', role: 'adviser', department: 'Computer Science', program: 'N/A', studentId: 'ADV-001' }
    },
    'student@ctu.edu.ph': {
      password: 'CTU@Stud2024!',
      profile: { name: 'Juan dela Cruz', role: 'student', program: 'BSIT 3A', studentId: '2021-12345', department: '' }
    },
  },

  // ─── SESSION PERSISTENCE ──────────────────────────────────────────────────

  saveSession() {
    if (this.currentUser) {
      try {
        localStorage.setItem('recap_user_session', JSON.stringify(this.currentUser));
        console.log('✓ Session saved');
      } catch (e) {
        console.error('Failed to save session:', e);
      }
    }
  },

  loadSession() {
    try {
      const savedSession = localStorage.getItem('recap_user_session');
      if (savedSession) {
        this.currentUser = JSON.parse(savedSession);
        console.log('✓ Session restored');
        return true;
      }
    } catch (e) {
      console.error('Failed to load session:', e);
      localStorage.removeItem('recap_user_session');
    }
    return false;
  },

  clearSession() {
    try {
      localStorage.removeItem('recap_user_session');
      console.log('✓ Session cleared');
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
  },

  // ─── MODAL HELPERS ────────────────────────────────────────────────────────

  showLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        const el = document.getElementById('login-email');
        if (el) el.focus();
      }, 100);
    }
  },

  closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
      this.resetLoginForm();
    }
  },

  showSignupModal() {
    const loginModal = document.getElementById('login-modal');
    if (loginModal) loginModal.classList.add('hidden');
    const modal = document.getElementById('signup-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        const el = document.getElementById('signup-firstname');
        if (el) el.focus();
      }, 100);
    }
  },

  closeSignupModal() {
    const modal = document.getElementById('signup-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
      this.resetSignupForm();
    }
  },

  showLogoutModal() {
    const modal = document.getElementById('logout-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  },

  closeLogoutModal() {
    const modal = document.getElementById('logout-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  },

  confirmLogout() {
    this.closeLogoutModal();
    this.logout();
  },

  // ─── FORM RESETS ──────────────────────────────────────────────────────────

  resetLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;
    form.reset();
    form.classList.remove('hidden');
    document.querySelectorAll('#login-modal .form-error').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('#login-modal .form-input').forEach(el => el.classList.remove('error'));
    const success = document.getElementById('login-success');
    if (success) success.classList.add('hidden');
    this.setLoginButtonState(false);
  },

  resetSignupForm() {
    const form = document.getElementById('signup-form');
    if (!form) return;
    form.reset();
    form.classList.remove('hidden');
    document.querySelectorAll('#signup-modal .form-error').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('#signup-modal .form-input').forEach(el => el.classList.remove('error'));
    const success = document.getElementById('signup-success');
    if (success) success.classList.add('hidden');
    const btn = document.getElementById('signup-submit');
    if (btn) {
      btn.disabled = false;
      btn.querySelector('.btn-text')?.classList.remove('hidden');
      btn.querySelector('.btn-spinner')?.classList.add('hidden');
    }
  },

  // ─── PASSWORD TOGGLES ─────────────────────────────────────────────────────

  togglePassword() {
    this._togglePasswordField('login-password', '#login-modal .password-icon');
  },

  toggleSignupPassword(fieldId) {
    const input = document.getElementById(fieldId);
    const icon = input?.closest('.password-input-wrapper')?.querySelector('.password-icon');
    if (!input || !icon) return;
    this._togglePasswordField(fieldId, null, input, icon);
  },

  _togglePasswordField(fieldId, iconSelector, inputEl, iconEl) {
    const input = inputEl || document.getElementById(fieldId);
    const icon = iconEl || document.querySelector(iconSelector);
    const eyeSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    const eyeOffSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
    if (input && icon) {
      if (input.type === 'password') {
        input.type = 'text';
        icon.innerHTML = eyeOffSVG;
      } else {
        input.type = 'password';
        icon.innerHTML = eyeSVG;
      }
    }
  },

  // ─── LOGIN BUTTON STATE ───────────────────────────────────────────────────

  setLoginButtonState(loading) {
    const btn = document.getElementById('login-submit');
    if (!btn) return;
    btn.disabled = loading;
    btn.querySelector('.btn-text')?.classList.toggle('hidden', loading);
    btn.querySelector('.btn-spinner')?.classList.toggle('hidden', !loading);
  },

  // ─── FIREBASE LOGIN ───────────────────────────────────────────────────────

  async handleLogin(e) {
    e.preventDefault();

    const emailVal = document.getElementById('login-email').value.trim();
    const passwordVal = document.getElementById('login-password').value;

    // Basic validation
    let valid = true;
    const emailInput = document.getElementById('login-email');
    const emailError = document.getElementById('email-error');
    const passwordInput = document.getElementById('login-password');
    const passwordError = document.getElementById('password-error');

    if (!emailVal) {
      emailInput.classList.add('error');
      emailError.textContent = 'Email is required';
      emailError.classList.remove('hidden');
      valid = false;
    } else {
      emailInput.classList.remove('error');
      emailError.classList.add('hidden');
    }

    if (!passwordVal) {
      passwordInput.classList.add('error');
      passwordError.textContent = 'Password is required';
      passwordError.classList.remove('hidden');
      valid = false;
    } else {
      passwordInput.classList.remove('error');
      passwordError.classList.add('hidden');
    }

    if (!valid) return;

    this.setLoginButtonState(true);

    try {
      const credential = await auth.signInWithEmailAndPassword(emailVal, passwordVal);
      const uid = credential.user.uid;

      // Fetch profile from Firestore
      const profileDoc = await db.collection('users').doc(uid).get();
      if (!profileDoc.exists) throw new Error('User profile not found');

      const profile = profileDoc.data();
      this.currentUser = { id: uid, ...profile };

      this._onLoginSuccess();

    } catch (error) {
      // ── Fallback: check hardcoded accounts ──────────────────────────────
      const fallback = this._fallbackUsers[emailVal.toLowerCase()];
      if (fallback && fallback.password === passwordVal) {
        this.currentUser = { id: emailVal, email: emailVal, ...fallback.profile };
        this._onLoginSuccess();
        return;
      }
      // ────────────────────────────────────────────────────────────────────

      this.setLoginButtonState(false);
      const emailError = document.getElementById('email-error');
      emailError.textContent = this._friendlyError(error.code);
      emailError.classList.remove('hidden');
      document.getElementById('login-email').classList.add('error');
    }
  },

  _onLoginSuccess() {
    // Save session to localStorage
    this.saveSession();

    const form = document.getElementById('login-form');
    const success = document.getElementById('login-success');
    if (form) form.classList.add('hidden');
    if (success) success.classList.remove('hidden');

    setTimeout(() => {
      this.closeLoginModal();
      this.updateUIForLoggedInUser();
      
      // Reinitialize conversation manager for logged-in user
      if (typeof ConversationManager !== 'undefined') {
        ConversationManager.init();
      }
      
      // Reinitialize chatbot view state
      if (typeof Chat !== 'undefined') {
        Chat.initChatbotViewState();
        // Show chat FAB for logged-in users
        Chat.initChatFABVisibility();
      }
      
      if (typeof Navigation !== 'undefined') {
        Navigation.switchView('dashboard');
        setTimeout(() => {
          const roleTabs = document.querySelectorAll('.role-tab');
          let target = null;
          roleTabs.forEach(tab => {
            if (tab.dataset.role === this.currentUser.role && tab.style.display !== 'none') {
              target = tab;
            }
          });
          if (!target) target = document.querySelector('.role-tab:not([style*="display: none"])');
          if (target && typeof Navigation !== 'undefined') Navigation.switchRole(target, target.dataset.role);
        }, 100);
      }
    }, 1500);
  },

  // ─── FIREBASE SIGNUP ──────────────────────────────────────────────────────

  async handleSignup(e) {
    e.preventDefault();

    const data = {
      firstName: document.getElementById('signup-firstname').value.trim(),
      lastName: document.getElementById('signup-lastname').value.trim(),
      email: document.getElementById('signup-email').value.trim(),
      studentId: document.getElementById('signup-student-id').value.trim(),
      program: document.getElementById('signup-program').value,
      password: document.getElementById('signup-password').value,
      confirmPassword: document.getElementById('signup-confirm-password').value,
    };

    if (!this.validateSignupForm(data)) return;

    const btn = document.getElementById('signup-submit');
    btn.disabled = true;
    btn.querySelector('.btn-text')?.classList.add('hidden');
    btn.querySelector('.btn-spinner')?.classList.remove('hidden');

    try {
      // Create Firebase Auth account
      const credential = await auth.createUserWithEmailAndPassword(data.email, data.password);
      const uid = credential.user.uid;

      // Save profile to Firestore
      const profile = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        studentId: data.studentId || '',
        program: data.program || 'N/A',
        role: 'student',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection('users').doc(uid).set(profile);

      this.currentUser = { id: uid, ...profile };

      // Save session to localStorage
      this.saveSession();

      // Reinitialize conversation manager for logged-in user
      if (typeof ConversationManager !== 'undefined') {
        ConversationManager.init();
      }

      // Show success
      const form = document.getElementById('signup-form');
      const success = document.getElementById('signup-success');
      if (form) form.classList.add('hidden');
      if (success) success.classList.remove('hidden');

      setTimeout(() => {
        this.closeSignupModal();
        this.updateUIForLoggedInUser();
        
        // Reinitialize chatbot view state
        if (typeof Chat !== 'undefined') {
          Chat.initChatbotViewState();
          // Show chat FAB for logged-in users
          Chat.initChatFABVisibility();
        }
        
        if (typeof Navigation !== 'undefined') Navigation.switchView('dashboard');
      }, 1500);

    } catch (error) {
      btn.disabled = false;
      btn.querySelector('.btn-text')?.classList.remove('hidden');
      btn.querySelector('.btn-spinner')?.classList.add('hidden');

      const emailError = document.getElementById('signup-email-error');
      if (emailError) {
        emailError.textContent = this._friendlyError(error.code);
        emailError.classList.remove('hidden');
        document.getElementById('signup-email').classList.add('error');
      }
    }
  },

  // ─── FIREBASE LOGOUT ──────────────────────────────────────────────────────

  async logout() {
    try {
      // Only sign out of Firebase if it was a real Firebase session
      const firebaseUser = auth.currentUser;
      if (firebaseUser) await auth.signOut();
    } catch (e) {
      console.error('Sign out error:', e);
    }

    this.currentUser = null;
    
    // Clear session from localStorage
    this.clearSession();

    // Clear conversation history
    if (typeof ConversationManager !== 'undefined') {
      ConversationManager.clearConversations();
    }

    // Clear saved project cache so next user starts fresh
    if (typeof Projects !== 'undefined') {
      Projects.savedProjectIds = new Set();
      Projects._patchSaveButtons(); // reset all visible save buttons to default state
    }

    // Reinitialize chatbot view state to show guest empty state
    if (typeof Chat !== 'undefined') {
      Chat.initChatbotViewState();
      // Hide chat FAB for guest users
      Chat.initChatFABVisibility();
    }

    const authButtons = document.getElementById('nav-auth-buttons');
    const userMenu = document.getElementById('nav-user-menu');
    const userAvatar = document.getElementById('nav-user-avatar');
    const userName = document.getElementById('nav-user-name');

    if (authButtons) { authButtons.classList.remove('hidden'); authButtons.style.display = ''; }
    if (userMenu) { userMenu.classList.add('hidden'); userMenu.style.display = 'none'; }
    if (userAvatar) userAvatar.textContent = '';
    if (userName) userName.textContent = '';

    // Update mobile menu
    if (typeof MobileMenu !== 'undefined') {
      MobileMenu.updateMenuItems();
    }

    // Hide the dashboard tab when logged out
    const dashTab = document.getElementById('tab-dashboard');
    if (dashTab) dashTab.style.display = 'none';

    if (typeof Navigation !== 'undefined') Navigation.switchView('landing');
  },

  // ─── UI UPDATE ────────────────────────────────────────────────────────────

  updateUIForLoggedInUser() {
    if (!this.currentUser) return;    const welcomeSpan = document.querySelector('.dash-welcome span');
    if (welcomeSpan) welcomeSpan.textContent = this.currentUser.name;

    const roleBadge = document.querySelector('.role-badge');
    if (roleBadge) {
      const role = this.currentUser.role;
      if (role === 'student') roleBadge.textContent = `Student — ${this.currentUser.program}`;
      else if (role === 'adviser') roleBadge.textContent = `Adviser — ${this.currentUser.department || ''}`;
      else if (role === 'librarian') roleBadge.textContent = `Librarian — ${this.currentUser.department || ''}`;
      else if (role === 'admin') roleBadge.textContent = `Admin — ${this.currentUser.department || ''}`;
    }

    const authButtons = document.getElementById('nav-auth-buttons');
    const userMenu = document.getElementById('nav-user-menu');
    const userAvatar = document.getElementById('nav-user-avatar');
    const userName = document.getElementById('nav-user-name');

    if (authButtons) { authButtons.classList.add('hidden'); authButtons.style.display = 'none'; }
    if (userMenu) { userMenu.classList.remove('hidden'); userMenu.style.display = ''; }
    if (userAvatar) userAvatar.textContent = this.currentUser.name.charAt(0).toUpperCase();
    if (userName) userName.textContent = this.currentUser.name.split(' ')[0];

    // Show the dashboard tab now that user is logged in
    const dashTab = document.getElementById('tab-dashboard');
    if (dashTab) dashTab.style.display = '';

    this.applyRoleBasedAccess();

    // Update mobile menu
    if (typeof MobileMenu !== 'undefined') {
      MobileMenu.updateMenuItems();
    }

    // Load saved projects so dashboard is populated on every page load
    if (typeof Projects !== 'undefined') {
      Projects.loadSavedIds();      // fetches IDs + patches all visible save buttons
      Projects.loadSavedProjects(); // populates dashboard grid
    }
  },

  applyRoleBasedAccess() {
    if (!this.currentUser) return;
    const userRole = this.currentUser.role;
    document.querySelectorAll('.role-tab').forEach(tab => {
      const allowed = tab.dataset.allowedRoles?.split(',') || [];
      tab.style.display = allowed.includes(userRole) ? '' : 'none';
    });

    const activeTab = document.querySelector('.role-tab.active');
    if (activeTab && activeTab.style.display === 'none') {
      const first = document.querySelector('.role-tab:not([style*="display: none"])');
      if (first) {
        activeTab.classList.remove('active');
        first.classList.add('active');
        if (typeof Navigation !== 'undefined') Navigation.switchRole(first, first.dataset.role);
      }
    }
  },

  // ─── SIGNUP VALIDATION ────────────────────────────────────────────────────

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

    if (!data.firstName) setError('signup-firstname', 'First name is required');
    else clearError('signup-firstname');

    if (!data.lastName) setError('signup-lastname', 'Last name is required');
    else clearError('signup-lastname');

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      setError('signup-email', 'Please enter a valid email address');
    else clearError('signup-email');

    if (!data.password || data.password.length < 6)
      setError('signup-password', 'Password must be at least 6 characters');
    else clearError('signup-password');

    if (data.password !== data.confirmPassword) {
      const input = document.getElementById('signup-confirm-password');
      const error = document.getElementById('signup-confirm-error');
      if (input) input.classList.add('error');
      if (error) { error.textContent = 'Passwords do not match'; error.classList.remove('hidden'); }
      isValid = false;
    } else {
      const input = document.getElementById('signup-confirm-password');
      const error = document.getElementById('signup-confirm-error');
      if (input) input.classList.remove('error');
      if (error) error.classList.add('hidden');
    }

    return isValid;
  },

  // ─── MISC ─────────────────────────────────────────────────────────────────

  forgotPassword() {
    const email = document.getElementById('login-email')?.value?.trim();
    if (!email) {
      alert('Enter your email address first, then click Forgot Password.');
      return;
    }
    auth.sendPasswordResetEmail(email)
      .then(() => alert(`Password reset email sent to ${email}. Check your inbox.`))
      .catch(err => alert(this._friendlyError(err.code)));
  },

  async demoLogin() {
    document.getElementById('login-email').value = 'student@ctu.edu.ph';
    document.getElementById('login-password').value = 'student123';
    const form = document.getElementById('login-form');
    if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  },

  _friendlyError(code) {
    const map = {
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/invalid-email': 'Invalid email address',
      'auth/email-already-in-use': 'An account with this email already exists',
      'auth/weak-password': 'Password must be at least 6 characters',
      'auth/too-many-requests': 'Too many attempts. Please try again later',
      'auth/network-request-failed': 'Network error. Check your connection',
      'auth/invalid-credential': 'Invalid email or password',
    };
    return map[code] || 'Something went wrong. Please try again.';
  },

  // ─── INIT ─────────────────────────────────────────────────────────────────

  init() {
    // Try to restore session from localStorage first
    const sessionRestored = this.loadSession();
    if (sessionRestored) {
      this.updateUIForLoggedInUser();
      
      // Reinitialize conversation manager for restored session
      if (typeof ConversationManager !== 'undefined') {
        ConversationManager.init();
      }
      
      // Reinitialize chatbot view state for restored session
      if (typeof Chat !== 'undefined') {
        Chat.initChatbotViewState();
        Chat.initChatFABVisibility();
      }
      
      console.log('✓ User session restored from localStorage');
    }

    // Listen to Firebase Auth state — fires on every page load if user is signed in
    auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profileDoc = await db.collection('users').doc(firebaseUser.uid).get();
          if (profileDoc.exists) {
            this.currentUser = { id: firebaseUser.uid, ...profileDoc.data() };
            this.saveSession(); // Save Firebase session to localStorage
            this.updateUIForLoggedInUser();
            
            // Reinitialize conversation manager
            if (typeof ConversationManager !== 'undefined') {
              ConversationManager.init();
            }
            
            // Reinitialize chatbot view state
            if (typeof Chat !== 'undefined') {
              Chat.initChatbotViewState();
              // Show chat FAB for logged-in users
              Chat.initChatFABVisibility();
            }
          }
        } catch (e) {
          console.error('Error loading user profile:', e);
        }
      } else {
        // Only clear UI if no localStorage session exists
        if (!sessionRestored) {
          this.currentUser = null;
        }
      }
    });

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', (e) => this.handleLogin(e));

    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) signupForm.addEventListener('submit', (e) => this.handleSignup(e));

    // Close on overlay click
    ['login-modal', 'signup-modal', 'logout-modal'].forEach(id => {
      const modal = document.getElementById(id);
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            if (id === 'login-modal') this.closeLoginModal();
            else if (id === 'signup-modal') this.closeSignupModal();
            else if (id === 'logout-modal') this.closeLogoutModal();
          }
        });
      }
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const loginModal = document.getElementById('login-modal');
      const signupModal = document.getElementById('signup-modal');
      const logoutModal = document.getElementById('logout-modal');
      if (loginModal && !loginModal.classList.contains('hidden')) this.closeLoginModal();
      if (signupModal && !signupModal.classList.contains('hidden')) this.closeSignupModal();
      if (logoutModal && !logoutModal.classList.contains('hidden')) this.closeLogoutModal();
    });

    console.log('✓ Auth initialized');
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Auth;
}
