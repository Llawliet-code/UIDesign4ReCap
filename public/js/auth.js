/**
 * Authentication Module
 * Uses Firebase Authentication + Firestore for persistent user accounts.
 * Falls back to hardcoded accounts for admin/demo use.
 */

const Auth = {
  currentUser: null,
  isCreatingAccount: false, // Flag to prevent onAuthStateChanged interference during signup

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
        const sessionData = JSON.parse(savedSession);
        
        // ⚠️ CRITICAL: Check if Firebase user is authenticated and verified
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          // Firebase user exists - verification will be checked in onAuthStateChanged
          this.currentUser = sessionData;
          console.log('✓ Session restored (verification will be checked)');
          return true;
        } else {
          // No Firebase user - clear the localStorage session
          console.warn('⚠️ Session found in localStorage but no Firebase user. Clearing...');
          this.clearSession();
          return false;
        }
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
      // Try to login with the email provided (could be Gmail or CTU email)
      let credential;
      let loginEmail = emailVal;
      
      // If user enters CTU email, we need to find their linked Gmail
      if (emailVal.toLowerCase().endsWith('@ctu.edu.ph')) {
        try {
          // Query Firestore to find the Gmail linked to this CTU email
          const snapshot = await db.collection('users')
            .where('email', '==', emailVal.toLowerCase())
            .limit(1)
            .get();
          
          if (!snapshot.empty) {
            const userData = snapshot.docs[0].data();
            if (userData.authEmail) {
              loginEmail = userData.authEmail; // Use Gmail for authentication
              console.log(`🔄 CTU email detected. Using linked Gmail for authentication: ${loginEmail}`);
            }
          }
        } catch (lookupError) {
          console.warn('Could not lookup Gmail, trying with provided email:', lookupError);
        }
      }
      
      // Authenticate with Firebase
      credential = await auth.signInWithEmailAndPassword(loginEmail, passwordVal);
      const uid = credential.user.uid;
      const firebaseUser = credential.user;

      // ⚠️ CHECK EMAIL VERIFICATION FIRST - BEFORE LOADING PROFILE
      if (!firebaseUser.emailVerified) {
        // Email not verified - close login modal and show verification modal
        this.setLoginButtonState(false);
        
        // Close login modal first
        this.closeLoginModal();
        
        // Small delay to ensure modal closes smoothly
        setTimeout(() => {
          this.showUnverifiedModal(firebaseUser.email);
        }, 300);
        
        // Sign out immediately - don't let them stay logged in
        await auth.signOut();
        return; // Stop execution here
      }

      // ✅ Email is verified - continue with profile loading
      const profileDoc = await db.collection('users').doc(uid).get();
      if (!profileDoc.exists) {
        // User authenticated but no profile found
        await auth.signOut();
        throw new Error('PROFILE_NOT_FOUND');
      }

      const profile = profileDoc.data();
      this.currentUser = { id: uid, ...profile };

      // Now call success (which will initialize everything)
      this._onLoginSuccess();

    } catch (error) {
      console.error('Login error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
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
      const passwordError = document.getElementById('password-error');
      
      // Determine which error to show
      let errorMsg = '';
      let showOnEmail = true;
      
      if (error.message === 'PROFILE_NOT_FOUND') {
        errorMsg = 'Account data not found. Please contact support or create a new account.';
      } else if (error.code === 'auth/wrong-password') {
        errorMsg = 'Incorrect password';
        showOnEmail = false; // Show on password field
      } else if (error.code === 'auth/user-not-found') {
        errorMsg = 'No account found with this email. Try using your Gmail address.';
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials') {
        errorMsg = 'Invalid email or password. Remember to login with your Gmail address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address format';
      } else if (error.code === 'auth/too-many-requests') {
        errorMsg = 'Too many failed attempts. Please try again later or reset your password.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMsg = 'Network error. Check your internet connection.';
      } else {
        // Generic error with more details
        errorMsg = error.message || 'Login failed. Please check your credentials and try again.';
      }
      
      // Display error on appropriate field
      if (showOnEmail) {
        emailError.textContent = errorMsg;
        emailError.classList.remove('hidden');
        document.getElementById('login-email').classList.add('error');
        passwordError.classList.add('hidden');
        document.getElementById('login-password').classList.remove('error');
      } else {
        passwordError.textContent = errorMsg;
        passwordError.classList.remove('hidden');
        document.getElementById('login-password').classList.add('error');
        emailError.classList.add('hidden');
        document.getElementById('login-email').classList.remove('error');
      }
    }
  },

  _onLoginSuccess() {
    // Email is already verified at this point (checked in handleLogin)
    // Just continue with login process
    this.continueLogin();
  },

  /**
   * Show unverified email modal
   * @param {string} gmailAddress - The Gmail address that needs verification
   */
  showUnverifiedModal(gmailAddress) {
    if (window.NotificationModal) {
      NotificationModal.show({
        type: 'warning',
        message: '⚠️ Email Verification Required',
        description: `
          <div style="text-align: left; margin-top: 12px;">
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin-bottom: 16px; border-radius: 4px;">
              <p style="margin: 0; font-weight: 600; color: #856404;">🔒 Account Not Verified</p>
              <p style="margin: 8px 0 0 0; color: #856404; font-size: 13px;">
                You cannot access the dashboard until your Gmail is verified.
              </p>
            </div>
            
            <p style="margin-bottom: 12px;"><strong>📧 Verification Email Sent To:</strong></p>
            <p style="background: var(--surface-2); padding: 12px; border-radius: 8px; font-weight: 600; color: var(--ctu-blue); margin-bottom: 16px; word-break: break-all;">
              ${gmailAddress}
            </p>
            
            <p style="margin-bottom: 8px;"><strong>Next Steps:</strong></p>
            <ol style="margin-left: 20px; margin-bottom: 12px; line-height: 1.8;">
              <li>Open your <strong>Gmail inbox</strong> (${gmailAddress})</li>
              <li>Find the verification email from Firebase</li>
              <li>Click the verification link in the email</li>
              <li>Come back and login again</li>
            </ol>
            
            <div style="background: #e7f3ff; border-left: 4px solid #2196F3; padding: 12px; margin-top: 16px; border-radius: 4px;">
              <p style="margin: 0; font-size: 13px; color: #0d47a1;">
                💡 <strong>Tip:</strong> Check your spam/junk folder if you don't see the email in your inbox.
              </p>
            </div>
            
            <p style="font-size: 12px; color: var(--text-secondary); margin-top: 12px; font-style: italic;">
              The verification email was sent when you created your account. If you can't find it, click "Resend Verification" below.
            </p>
          </div>
        `,
        actions: [
          {
            label: 'Open Gmail',
            variant: 'primary',
            action: () => {
              window.open('https://mail.google.com', '_blank');
              NotificationModal.close();
            }
          },
          {
            label: 'Resend Verification',
            variant: 'secondary',
            action: async () => {
              try {
                // Re-authenticate to get the user object
                const emailVal = document.getElementById('login-email').value.trim();
                const passwordVal = document.getElementById('login-password').value;
                
                let loginEmail = emailVal;
                
                // If CTU email, find Gmail
                if (emailVal.toLowerCase().endsWith('@ctu.edu.ph')) {
                  try {
                    const snapshot = await db.collection('users')
                      .where('email', '==', emailVal.toLowerCase())
                      .limit(1)
                      .get();
                    
                    if (!snapshot.empty) {
                      const userData = snapshot.docs[0].data();
                      if (userData.authEmail) {
                        loginEmail = userData.authEmail;
                      }
                    }
                  } catch (lookupError) {
                    console.warn('Could not lookup Gmail:', lookupError);
                  }
                }
                
                const credential = await auth.signInWithEmailAndPassword(loginEmail, passwordVal);
                const user = credential.user;
                
                await user.sendEmailVerification({
                  url: window.location.origin + '/index.html?verified=true',
                  handleCodeInApp: false
                });
                
                // Sign out after sending
                await auth.signOut();
                
                NotificationModal.show({
                  type: 'success',
                  message: '✅ Verification Email Sent!',
                  description: `
                    <div style="text-align: left; margin-top: 12px;">
                      <p style="margin-bottom: 12px;">A new verification email has been sent to:</p>
                      <p style="background: var(--surface-2); padding: 12px; border-radius: 8px; font-weight: 600; color: var(--ctu-blue); margin-bottom: 12px; word-break: break-all;">
                        📧 ${gmailAddress}
                      </p>
                      <p style="font-size: 13px; color: var(--text-secondary);">
                        Please check your Gmail inbox and spam folder.
                      </p>
                    </div>
                  `,
                  actions: [
                    {
                      label: 'Open Gmail',
                      variant: 'primary',
                      action: () => {
                        window.open('https://mail.google.com', '_blank');
                        NotificationModal.close();
                      }
                    },
                    {
                      label: 'OK',
                      variant: 'secondary',
                      action: () => NotificationModal.close()
                    }
                  ]
                });
              } catch (error) {
                console.error('Error resending verification:', error);
                
                let errorMsg = 'Failed to resend verification email. Please try again later.';
                if (error.code === 'auth/too-many-requests') {
                  errorMsg = 'Too many requests. Please wait a few minutes before trying again.';
                }
                
                NotificationModal.show({
                  type: 'error',
                  message: '❌ Error Sending Email',
                  description: errorMsg,
                  actions: [{ label: 'OK', variant: 'primary', action: () => NotificationModal.close() }]
                });
              }
            }
          },
          {
            label: 'Cancel',
            variant: 'secondary',
            action: () => {
              NotificationModal.close();
            }
          }
        ]
      });
    }
  },

  continueLogin() {
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
          // ADMIN AUTO-REDIRECT: If user is admin, go directly to Admin Panel
          if (this.currentUser.role === 'admin') {
            const adminTab = document.querySelector('.role-tab[data-role="admin"]');
            if (adminTab && typeof Navigation !== 'undefined') {
              Navigation.switchRole(adminTab, 'admin');
              console.log('✓ Admin user redirected to Admin Panel');
            }
          } else {
            // For non-admin users, use default role tab logic
            const roleTabs = document.querySelectorAll('.role-tab');
            let target = null;
            roleTabs.forEach(tab => {
              if (tab.dataset.role === this.currentUser.role && tab.style.display !== 'none') {
                target = tab;
              }
            });
            if (!target) target = document.querySelector('.role-tab:not([style*="display: none"])');
            if (target && typeof Navigation !== 'undefined') Navigation.switchRole(target, target.dataset.role);
          }
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

    // Instead of creating account directly, open Gmail linking modal
    if (typeof GmailLink !== 'undefined') {
      GmailLink.openModal(data);
    } else {
      console.error('GmailLink module not found');
      alert('Gmail linking system not available. Please refresh the page.');
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
    if (!this.currentUser) return;
    
    // Update dashboard welcome name
    const welcomeSpan = document.getElementById('dash-user-name');
    if (welcomeSpan) welcomeSpan.textContent = this.currentUser.name;

    // Update dashboard emails display
    const ctuEmailSpan = document.getElementById('dash-ctu-email');
    const gmailSpan = document.getElementById('dash-gmail');
    if (ctuEmailSpan && this.currentUser.email) {
      ctuEmailSpan.textContent = this.currentUser.email;
    }
    if (gmailSpan && this.currentUser.linkedGmail) {
      gmailSpan.textContent = this.currentUser.linkedGmail;
    }

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

    // Email validation: Must be @ctu.edu.ph
    if (!data.email) {
      setError('signup-email', 'Email is required');
    } else if (!/^[^\s@]+@ctu\.edu\.ph$/i.test(data.email)) {
      setError('signup-email', 'Only @ctu.edu.ph email addresses are allowed');
    } else {
      clearError('signup-email');
    }

    // Password validation: Minimum 8 characters
    if (!data.password) {
      setError('signup-password', 'Password is required');
    } else if (data.password.length < 8) {
      setError('signup-password', 'Password must be at least 8 characters');
    } else {
      clearError('signup-password');
    }

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

  // ─── LIVE VALIDATION ──────────────────────────────────────────────────────

  setupLiveValidation() {
    // Email validation on blur
    const emailInput = document.getElementById('signup-email');
    if (emailInput) {
      emailInput.addEventListener('blur', () => {
        const email = emailInput.value.trim();
        const error = document.getElementById('signup-email-error');
        
        if (email && !/^[^\s@]+@ctu\.edu\.ph$/i.test(email)) {
          emailInput.classList.add('error');
          if (error) {
            error.textContent = 'Only @ctu.edu.ph email addresses are allowed';
            error.classList.remove('hidden');
          }
        } else if (email) {
          emailInput.classList.remove('error');
          if (error) error.classList.add('hidden');
        }
      });

      // Clear error on focus
      emailInput.addEventListener('focus', () => {
        emailInput.classList.remove('error');
        const error = document.getElementById('signup-email-error');
        if (error) error.classList.add('hidden');
      });
    }

    // Password validation on input
    const passwordInput = document.getElementById('signup-password');
    if (passwordInput) {
      passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const error = document.getElementById('signup-password-error');
        
        if (password.length > 0 && password.length < 8) {
          passwordInput.classList.add('error');
          if (error) {
            error.textContent = `Password must be at least 8 characters (${password.length}/8)`;
            error.classList.remove('hidden');
          }
        } else {
          passwordInput.classList.remove('error');
          if (error) error.classList.add('hidden');
        }
      });
    }

    // Confirm password validation on input
    const confirmInput = document.getElementById('signup-confirm-password');
    if (confirmInput && passwordInput) {
      confirmInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const confirm = confirmInput.value;
        const error = document.getElementById('signup-confirm-error');
        
        if (confirm.length > 0 && password !== confirm) {
          confirmInput.classList.add('error');
          if (error) {
            error.textContent = 'Passwords do not match';
            error.classList.remove('hidden');
          }
        } else {
          confirmInput.classList.remove('error');
          if (error) error.classList.add('hidden');
        }
      });
    }
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
      'auth/invalid-login-credentials': 'Invalid email or password',
    };
    return map[code] || 'Something went wrong. Please try again.';
  },

  /**
   * Check if user just verified their email and handle redirect
   */
  checkVerificationRedirect() {
    // Check URL parameters for verification success
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get('verified');
    
    if (verified === 'true') {
      console.log('✅ User returned from email verification');
      
      // Check if there's a Firebase user
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        // Reload user to get updated emailVerified status
        firebaseUser.reload().then(() => {
          if (firebaseUser.emailVerified) {
            console.log('✅ Email verified! Auto-logging in...');
            
            // Show success message
            if (window.NotificationModal) {
              NotificationModal.show({
                type: 'success',
                message: '✅ Email Verified Successfully!',
                description: `
                  <div style="text-align: left; margin-top: 12px;">
                    <p style="margin-bottom: 12px;">Your Gmail has been verified!</p>
                    <p style="margin-bottom: 12px;">You are now being logged in...</p>
                  </div>
                `,
                actions: [
                  {
                    label: 'Continue',
                    variant: 'primary',
                    action: () => {
                      NotificationModal.close();
                      // Trigger onAuthStateChanged to load profile
                      window.location.href = window.location.origin + '/index.html';
                    }
                  }
                ]
              });
            } else {
              // No modal available, just reload
              window.location.href = window.location.origin + '/index.html';
            }
          } else {
            console.warn('⚠️ Email not yet verified');
          }
        });
      } else {
        // No Firebase user - show login prompt
        console.log('ℹ️ No active session. Please login.');
        
        if (window.NotificationModal) {
          NotificationModal.show({
            type: 'success',
            message: '✅ Email Verified!',
            description: `
              <div style="text-align: left; margin-top: 12px;">
                <p style="margin-bottom: 12px;">Your Gmail has been verified successfully!</p>
                <p style="margin-bottom: 12px;">Please login with your Gmail address to access your account.</p>
              </div>
            `,
            actions: [
              {
                label: 'Login Now',
                variant: 'primary',
                action: () => {
                  NotificationModal.close();
                  this.showLoginModal();
                }
              }
            ]
          });
        } else {
          // No modal, just show login
          this.showLoginModal();
        }
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  },

  // ─── INIT ─────────────────────────────────────────────────────────────────

  init() {
    // Try to restore session from localStorage first
    const sessionRestored = this.loadSession();
    if (sessionRestored) {
      // Don't initialize UI yet - wait for onAuthStateChanged to verify email
      console.log('✓ Session found, waiting for Firebase auth state verification...');
      
      // Note: UI will be updated in onAuthStateChanged after verification check
    }

    // Listen to Firebase Auth state — fires on every page load if user is signed in
    auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Skip verification check if we're in the middle of creating an account
        if (this.isCreatingAccount) {
          console.log('⏳ Account creation in progress, skipping verification check...');
          return;
        }
        
        try {
          // ⚠️ CRITICAL: Check email verification FIRST
          if (!firebaseUser.emailVerified) {
            console.warn('⚠️ Unverified user detected on page load. Logging out...');
            
            // Clear any stored session
            this.clearSession();
            this.currentUser = null;
            
            // Sign out from Firebase
            await auth.signOut();
            
            // Show verification modal
            this.showUnverifiedModal(firebaseUser.email);
            
            return; // Stop here - don't load profile or initialize anything
          }
          
          // ✅ Email is verified - continue loading profile
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

    // Check if user just verified their email (coming back from verification link)
    this.checkVerificationRedirect();

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', (e) => this.handleLogin(e));

    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) signupForm.addEventListener('submit', (e) => this.handleSignup(e));

    // Setup live validation for signup form
    this.setupLiveValidation();

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
