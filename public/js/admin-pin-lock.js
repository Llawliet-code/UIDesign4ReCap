/**
 * Admin PIN Lock System
 * Handles the PIN modal and unlock functionality for the admin table
 */

const AdminPinLock = {
  // Configuration
  CORRECT_PIN: '1234', // Change this to your desired PIN
  INACTIVITY_TIMEOUT: 10000, // 10 seconds in milliseconds
  
  // State
  inactivityTimer: null,
  isUnlocked: false,
  
  // Elements
  elements: {
    container: null,
    lockIcon: null,
    modal: null,
    pinInput: null,
    errorMsg: null,
    submitBtn: null,
    cancelBtn: null,
    closeBtn: null
  },

  /**
   * Initialize the PIN lock system
   */
  init() {
    // Get DOM elements
    this.elements.container = document.getElementById('admin-table-container');
    this.elements.lockIcon = document.getElementById('admin-lock-icon');
    this.elements.modal = document.getElementById('admin-pin-modal');
    this.elements.pinInput = document.getElementById('admin-pin-input');
    this.elements.errorMsg = document.getElementById('admin-pin-error');
    this.elements.submitBtn = document.getElementById('admin-pin-submit');
    this.elements.cancelBtn = document.getElementById('admin-pin-cancel');
    this.elements.closeBtn = document.getElementById('admin-pin-close');

    // Check if elements exist
    if (!this.elements.container || !this.elements.lockIcon || !this.elements.modal) {
      console.warn('Admin PIN Lock: Required elements not found');
      return;
    }

    // Bind event listeners
    this.bindEvents();

    // Check if already unlocked in session (but don't auto-unlock, require PIN again)
    // This ensures fresh PIN entry on page load
    this.lock();
    
    // Setup page visibility and navigation listeners
    this.setupAutoLock();
  },

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Lock icon click - open modal
    this.elements.lockIcon?.addEventListener('click', () => this.openModal());

    // Submit button
    this.elements.submitBtn?.addEventListener('click', () => this.verifyPin());

    // Cancel button
    this.elements.cancelBtn?.addEventListener('click', () => this.closeModal());

    // Close button
    this.elements.closeBtn?.addEventListener('click', () => this.closeModal());

    // Enter key on input
    this.elements.pinInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.verifyPin();
      }
    });

    // Only allow numbers in PIN input
    this.elements.pinInput?.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    // Clear error on input
    this.elements.pinInput?.addEventListener('input', () => {
      this.hideError();
    });

    // Close modal on overlay click
    this.elements.modal?.addEventListener('click', (e) => {
      if (e.target === this.elements.modal) {
        this.closeModal();
      }
    });
  },

  /**
   * Setup auto-lock functionality
   */
  setupAutoLock() {
    // Lock when page visibility changes (switching tabs/windows)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.isUnlocked) {
        console.log('Page hidden - locking admin table');
        this.lock();
      }
    });

    // Lock when navigating away (beforeunload)
    window.addEventListener('beforeunload', () => {
      if (this.isUnlocked) {
        console.log('Page unloading - locking admin table');
        this.lock();
      }
    });

    // Lock when user navigates to different view/section
    // Listen for hash changes (if using hash-based routing)
    window.addEventListener('hashchange', () => {
      if (this.isUnlocked) {
        console.log('Navigation detected - locking admin table');
        this.lock();
      }
    });

    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', () => {
      if (this.isUnlocked) {
        console.log('Browser navigation - locking admin table');
        this.lock();
      }
    });

    // Setup inactivity detection
    this.setupInactivityDetection();
  },

  /**
   * Setup inactivity detection (10 seconds of no mouse movement)
   */
  setupInactivityDetection() {
    const resetTimer = () => {
      // Only track inactivity if unlocked
      if (!this.isUnlocked) return;

      // Clear existing timer
      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer);
      }

      // Set new timer
      this.inactivityTimer = setTimeout(() => {
        if (this.isUnlocked) {
          console.log('Inactivity detected - locking admin table');
          this.lock();
          
          // Show notification
          if (window.NotificationModal) {
            NotificationModal.show({
              type: 'warning',
              message: 'Auto-Locked',
              description: 'Admin table locked due to inactivity.',
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
      }, this.INACTIVITY_TIMEOUT);
    };

    // Track mouse movement
    document.addEventListener('mousemove', resetTimer);
    
    // Track mouse clicks
    document.addEventListener('mousedown', resetTimer);
    
    // Track keyboard activity
    document.addEventListener('keypress', resetTimer);
    
    // Track scroll
    document.addEventListener('scroll', resetTimer);
    
    // Track touch events (for mobile)
    document.addEventListener('touchstart', resetTimer);
  },

  /**
   * Open the PIN modal
   */
  openModal() {
    if (!this.elements.modal) return;
    
    this.elements.modal.classList.remove('hidden');
    this.elements.pinInput.value = '';
    this.hideError();
    
    // Focus on input after a short delay
    setTimeout(() => {
      this.elements.pinInput?.focus();
    }, 100);
  },

  /**
   * Close the PIN modal
   */
  closeModal() {
    if (!this.elements.modal) return;
    
    this.elements.modal.classList.add('hidden');
    this.elements.pinInput.value = '';
    this.hideError();
  },

  /**
   * Verify the entered PIN
   */
  verifyPin() {
    const enteredPin = this.elements.pinInput?.value || '';

    // Check if PIN is empty
    if (!enteredPin) {
      this.showError('Please enter a PIN');
      return;
    }

    // Check if PIN is correct
    if (enteredPin === this.CORRECT_PIN) {
      this.unlock();
    } else {
      this.showError('Incorrect PIN. Please try again.');
      this.elements.pinInput.value = '';
      this.elements.pinInput.focus();
      
      // Shake animation
      this.elements.modal.querySelector('.modal-container')?.classList.add('shake');
      setTimeout(() => {
        this.elements.modal.querySelector('.modal-container')?.classList.remove('shake');
      }, 500);
    }
  },

  /**
   * Unlock the admin table
   */
  unlock() {
    // Add unlocked class to remove blur and lock overlay
    this.elements.container?.classList.add('unlocked');
    
    // Update state
    this.isUnlocked = true;
    
    // Store unlock status in session
    sessionStorage.setItem('adminTableUnlocked', 'true');
    
    // Close modal
    this.closeModal();
    
    // Start inactivity timer
    this.setupInactivityDetection();
    
    // Show success notification (if notification system exists)
    if (window.NotificationModal) {
      NotificationModal.show({
        type: 'success',
        message: 'Admin Table Unlocked',
        description: 'You now have full access to the admin table.',
        actions: [
          {
            label: 'OK',
            variant: 'primary',
            action: () => NotificationModal.close()
          }
        ]
      });
    }
  },

  /**
   * Lock the admin table
   */
  lock() {
    // Remove unlocked class
    this.elements.container?.classList.remove('unlocked');
    
    // Update state
    this.isUnlocked = false;
    
    // Remove unlock status from session
    sessionStorage.removeItem('adminTableUnlocked');
    
    // Clear inactivity timer
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  },

  /**
   * Show error message
   */
  showError(message) {
    if (this.elements.errorMsg) {
      this.elements.errorMsg.textContent = message;
      this.elements.errorMsg.classList.remove('hidden');
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
  document.addEventListener('DOMContentLoaded', () => AdminPinLock.init());
} else {
  AdminPinLock.init();
}
