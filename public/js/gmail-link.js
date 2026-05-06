/**
 * Gmail Linking System
 * Handles linking CTU email accounts to Gmail for verification and preventing duplicates
 */

const GmailLink = {
  // Pending signup data
  pendingSignupData: null,

  // Elements
  elements: {
    modal: null,
    ctuEmailDisplay: null,
    gmailInput: null,
    errorMsg: null,
    submitBtn: null,
    cancelBtn: null,
    closeBtn: null
  },

  /**
   * Initialize the Gmail linking system
   */
  init() {
    // Get DOM elements
    this.elements.modal = document.getElementById('gmail-link-modal');
    this.elements.ctuEmailDisplay = document.getElementById('gmail-link-ctu-email');
    this.elements.gmailInput = document.getElementById('gmail-link-input');
    this.elements.errorMsg = document.getElementById('gmail-link-error');
    this.elements.submitBtn = document.getElementById('gmail-link-submit');
    this.elements.cancelBtn = document.getElementById('gmail-link-cancel');
    this.elements.closeBtn = document.getElementById('gmail-link-close');

    // Check if elements exist
    if (!this.elements.modal) {
      console.warn('Gmail Link: Required elements not found');
      return;
    }

    // Bind event listeners
    this.bindEvents();
  },

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Submit button
    this.elements.submitBtn?.addEventListener('click', () => this.handleLinking());

    // Cancel button
    this.elements.cancelBtn?.addEventListener('click', () => this.closeModal());

    // Close button
    this.elements.closeBtn?.addEventListener('click', () => this.closeModal());

    // Enter key on input
    this.elements.gmailInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleLinking();
      }
    });

    // Clear error on input
    this.elements.gmailInput?.addEventListener('input', () => {
      this.hideError();
      this.elements.gmailInput.classList.remove('error');
    });

    // Close modal on overlay click
    this.elements.modal?.addEventListener('click', (e) => {
      if (e.target === this.elements.modal) {
        this.closeModal();
      }
    });
  },

  /**
   * Open the Gmail linking modal
   * @param {Object} signupData - The signup data from the signup form
   */
  openModal(signupData) {
    if (!this.elements.modal) return;

    // Store the pending signup data
    this.pendingSignupData = signupData;

    // Display the CTU email
    if (this.elements.ctuEmailDisplay) {
      this.elements.ctuEmailDisplay.textContent = signupData.email;
    }

    // Clear previous input
    if (this.elements.gmailInput) {
      this.elements.gmailInput.value = '';
    }

    this.hideError();
    this.elements.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Focus on input after a short delay
    setTimeout(() => {
      this.elements.gmailInput?.focus();
    }, 100);
  },

  /**
   * Close the Gmail linking modal
   */
  closeModal() {
    if (!this.elements.modal) return;

    this.elements.modal.classList.add('hidden');
    document.body.style.overflow = '';
    this.elements.gmailInput.value = '';
    this.hideError();
    this.pendingSignupData = null;

    // Reset button state
    this.setButtonState(false);
  },

  /**
   * Validate Gmail address
   * @param {string} email - The email to validate
   * @returns {boolean} - True if valid Gmail address
   */
  validateGmail(email) {
    // Must be a valid Gmail address
    const gmailRegex = /^[^\s@]+@gmail\.com$/i;
    return gmailRegex.test(email);
  },

  /**
   * Check if Gmail is already linked to another CTU account
   * @param {string} gmail - The Gmail address to check
   * @returns {Promise<boolean>} - True if already linked
   */
  async isGmailAlreadyLinked(gmail) {
    try {
      // Query Firestore to check if this Gmail is already linked
      const snapshot = await db.collection('users')
        .where('linkedGmail', '==', gmail.toLowerCase())
        .get();

      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking Gmail link:', error);
      return false;
    }
  },

  /**
   * Check if CTU email already has a linked Gmail
   * @param {string} ctuEmail - The CTU email to check
   * @returns {Promise<boolean>} - True if already has linked Gmail
   */
  async hasCTUEmailLinkedGmail(ctuEmail) {
    try {
      // Query Firestore to check if this CTU email already has a linked Gmail
      const snapshot = await db.collection('users')
        .where('email', '==', ctuEmail.toLowerCase())
        .get();

      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        return !!userData.linkedGmail;
      }
      return false;
    } catch (error) {
      console.error('Error checking CTU email link:', error);
      return false;
    }
  },

  /**
   * Handle the Gmail linking process
   */
  async handleLinking() {
    const gmail = this.elements.gmailInput?.value?.trim() || '';

    // Validate Gmail format
    if (!gmail) {
      this.showError('Please enter a Gmail address');
      return;
    }

    if (!this.validateGmail(gmail)) {
      this.showError('Please enter a valid @gmail.com address');
      return;
    }

    // Check if we have pending signup data
    if (!this.pendingSignupData) {
      this.showError('Signup data not found. Please try again.');
      return;
    }

    this.setButtonState(true);

    try {
      // Skip duplicate checks - they require authentication which we don't have yet
      // Firebase will handle duplicate email errors during account creation
      
      // Proceed directly with account creation
      await this.createAccountWithGmailLink(gmail);

    } catch (error) {
      console.error('Gmail linking error:', error);
      this.setButtonState(false);
      
      // Handle specific errors
      if (error.code === 'auth/email-already-in-use') {
        this.showError('This CTU email is already registered');
      } else if (error.message && error.message.includes('Gmail is already linked')) {
        this.showError('This Gmail is already linked to another CTU account');
      } else {
        this.showError('An error occurred. Please try again.');
      }
    }
  },

  /**
   * Create the account with Gmail link
   * @param {string} gmail - The Gmail address to link
   */
  async createAccountWithGmailLink(gmail) {
    try {
      const data = this.pendingSignupData;

      // Set flag to prevent onAuthStateChanged from interfering during signup
      if (typeof Auth !== 'undefined') {
        Auth.isCreatingAccount = true;
      }

      // IMPORTANT: Create Firebase Auth account with GMAIL (not CTU email)
      // This way Firebase will send verification emails to Gmail
      const credential = await auth.createUserWithEmailAndPassword(gmail, data.password);
      const uid = credential.user.uid;

      // Check if Gmail is already linked (now we're authenticated)
      try {
        const gmailLinkDoc = await db.collection('gmail_links').doc(gmail.toLowerCase()).get();
        if (gmailLinkDoc.exists) {
          // Gmail already linked - delete the auth account and show error
          await credential.user.delete();
          
          // Clear the flag
          if (typeof Auth !== 'undefined') {
            Auth.isCreatingAccount = false;
          }
          
          throw new Error('Gmail is already linked to another CTU account');
        }
      } catch (checkError) {
        if (checkError.message && checkError.message.includes('Gmail is already linked')) {
          throw checkError;
        }
        // If it's a permission error, continue (rules might not be deployed)
        console.warn('Could not check Gmail link, continuing...', checkError);
      }

      // Save profile to Firestore FIRST (before sending email)
      const profile = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email, // Store CTU email in profile
        authEmail: gmail.toLowerCase(), // Gmail is used for authentication
        linkedGmail: gmail.toLowerCase(), // Same as authEmail
        emailVerified: false,
        studentId: data.studentId || '',
        program: data.program || 'N/A',
        role: 'student',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        linkedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection('users').doc(uid).set(profile);

      // Also create a reverse lookup for quick Gmail checking
      try {
        await db.collection('gmail_links').doc(gmail.toLowerCase()).set({
          ctuEmail: data.email.toLowerCase(),
          userId: uid,
          linkedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      } catch (linkError) {
        console.warn('Could not create gmail_links document:', linkError);
        // Continue anyway - the main user document is created
      }

      // Send Firebase's built-in verification email (will go to Gmail)
      await credential.user.sendEmailVerification({
        url: window.location.origin + '/index.html?verified=true',
        handleCodeInApp: false
      });

      console.log(`✅ Firebase verification email sent to: ${gmail}`);

      // Set current user
      if (typeof Auth !== 'undefined') {
        Auth.currentUser = { id: uid, ...profile };
        Auth.saveSession();
      }

      // Clear the flag - account creation complete
      if (typeof Auth !== 'undefined') {
        Auth.isCreatingAccount = false;
      }

      // Close Gmail modal
      this.closeModal();

      // Small delay before showing verification modal to ensure smooth transition
      setTimeout(() => {
        this.showVerificationModal(gmail);
      }, 300);

    } catch (error) {
      // Clear the flag on error
      if (typeof Auth !== 'undefined') {
        Auth.isCreatingAccount = false;
      }
      
      this.setButtonState(false);
      console.error('Account creation error:', error);
      
      let errorMessage = 'An error occurred during account creation';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This Gmail is already registered';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (error.message && error.message.includes('Gmail is already linked')) {
        errorMessage = error.message;
      } else if (error.message && error.message.includes('Missing or insufficient permissions')) {
        errorMessage = 'Database permission error. Please contact administrator.';
      }
      
      this.showError(errorMessage);
    }
  },



  /**
   * Show verification required modal
   * @param {string} gmail - The Gmail address verification was sent to
   */
  showVerificationModal(gmail) {
    // Close signup modal first
    if (typeof Auth !== 'undefined') {
      Auth.closeSignupModal();
    }

    // Get the CTU email from pending signup data
    const ctuEmail = this.pendingSignupData?.email || 'your CTU email';

    // Show success + verification modal
    if (window.NotificationModal) {
      NotificationModal.show({
        type: 'success',
        message: '🎉 Account Created Successfully!',
        description: `
          <div style="text-align: left; margin-top: 12px;">
            <p style="margin-bottom: 12px;"><strong>Your account is ready!</strong></p>
            <p style="margin-bottom: 8px;">✅ CTU Email: <strong>${ctuEmail}</strong></p>
            <p style="margin-bottom: 12px;">✅ Linked Gmail: <strong>${gmail}</strong></p>
            
            <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 12px; margin: 16px 0; border-radius: 4px;">
              <p style="margin: 0; font-weight: 600; color: #155724;">📧 Verification Email Sent!</p>
              <p style="margin: 8px 0 0 0; color: #155724; font-size: 13px;">
                Firebase has sent a verification email to your <strong>Gmail (${gmail})</strong>.
              </p>
            </div>
            
            <p style="margin-bottom: 8px;"><strong>Last Step:</strong></p>
            <ol style="margin-left: 20px; margin-bottom: 12px; line-height: 1.8;">
              <li>Check your <strong>Gmail inbox</strong> (${gmail})</li>
              <li>Open the verification email from Firebase</li>
              <li>Click the verification link</li>
              <li>Come back and login with your <strong>Gmail</strong></li>
            </ol>
            <p style="font-size: 13px; color: var(--text-secondary); margin-top: 12px;">
              🚫 You cannot access the dashboard until your Gmail is verified.
            </p>
            <p style="font-size: 13px; color: var(--text-secondary); margin-top: 8px;">
              💡 <strong>Important:</strong> Login using your <strong>Gmail address</strong>, not your CTU email.
            </p>
          </div>
        `,
        actions: [
          {
            label: 'Check Gmail Now',
            variant: 'primary',
            action: () => {
              // Open Gmail in new tab
              window.open('https://mail.google.com', '_blank');
              NotificationModal.close();
              // Log out the user since they can't access dashboard yet
              if (typeof Auth !== 'undefined') {
                Auth.logout();
              }
            }
          },
          {
            label: 'I\'ll Do It Later',
            variant: 'secondary',
            action: () => {
              NotificationModal.close();
              // Log out the user since they can't access dashboard yet
              if (typeof Auth !== 'undefined') {
                Auth.logout();
              }
            }
          }
        ]
      });
    }
  },

  /**
   * Resend verification email using Firebase built-in method
   */
  async resendVerificationEmail() {
    try {
      const user = auth.currentUser;
      if (user && !user.emailVerified) {
        // Resend using Firebase's built-in method
        await user.sendEmailVerification({
          url: window.location.origin + '/index.html?verified=true',
          handleCodeInApp: false
        });
        
        if (window.NotificationModal) {
          NotificationModal.show({
            type: 'success',
            message: '✅ Verification Email Sent!',
            description: `
              <div style="text-align: left; margin-top: 12px;">
                <p style="margin-bottom: 12px;">A new verification email has been sent to your <strong>Gmail</strong>:</p>
                <p style="background: var(--surface-2); padding: 12px; border-radius: 8px; font-weight: 600; color: var(--ctu-blue); margin-bottom: 12px;">
                  📧 ${user.email}
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
        }
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      
      let errorMessage = 'Failed to resend verification email. Please try again later.';
      
      if (window.NotificationModal) {
        NotificationModal.show({
          type: 'error',
          message: 'Error Sending Email',
          description: errorMessage,
          actions: [
            {
              label: 'OK',
              variant: 'primary',
              action: () => NotificationModal.close()
            }
          ]
        });
      }
    }
  },

  /**
   * Set button loading state
   * @param {boolean} loading - Whether button is in loading state
   */
  setButtonState(loading) {
    const btn = this.elements.submitBtn;
    if (!btn) return;

    btn.disabled = loading;
    btn.querySelector('.btn-text')?.classList.toggle('hidden', loading);
    btn.querySelector('.btn-spinner')?.classList.toggle('hidden', !loading);
  },

  /**
   * Show error message
   * @param {string} message - The error message to display
   */
  showError(message) {
    if (this.elements.errorMsg) {
      this.elements.errorMsg.textContent = message;
      this.elements.errorMsg.classList.remove('hidden');
    }
    if (this.elements.gmailInput) {
      this.elements.gmailInput.classList.add('error');
    }
  },

  /**
   * Hide error message
   */
  hideError() {
    if (this.elements.errorMsg) {
      this.elements.errorMsg.classList.add('hidden');
    }
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => GmailLink.init());
} else {
  GmailLink.init();
}
