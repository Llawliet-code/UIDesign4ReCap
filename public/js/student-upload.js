/**
 * Student Upload Module
 * Handles student capstone metadata submission for adviser validation
 */

const StudentUpload = {
  autoSaveKey: 'recap_upload_draft',
  autoSaveInterval: null,

  /**
   * Initialize the student upload module
   */
  init() {
    // Setup form submission handler
    const form = document.getElementById('upload-metadata-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Setup auto-save on input change
    this.setupAutoSave();

    // Close modal on overlay click
    const modal = document.getElementById('upload-metadata-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('upload-metadata-modal');
        if (modal && !modal.classList.contains('hidden')) {
          this.closeModal();
        }
      }
    });

    console.log('✓ Student Upload initialized');
  },

  /**
   * Show upload modal
   */
  showModal() {
    // Check if user is logged in
    if (!Auth.currentUser) {
      // Show login modal instead
      if (typeof Notifications !== 'undefined') {
        Notifications.addNotification({
          title: 'Login Required',
          message: 'Please login to submit capstone metadata',
          type: 'warning'
        });
      }
      if (typeof Auth !== 'undefined') {
        Auth.showLoginModal();
      }
      return;
    }

    const modal = document.getElementById('upload-metadata-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      
      // Load saved draft if exists
      this.loadDraft();
      
      // Focus on first input
      setTimeout(() => {
        const firstInput = document.getElementById('upload-title');
        if (firstInput) firstInput.focus();
      }, 100);
    }
  },

  /**
   * Setup auto-save functionality
   */
  setupAutoSave() {
    const formFields = [
      'upload-title',
      'upload-authors',
      'upload-adviser',
      'upload-year',
      'upload-program',
      'upload-abstract',
      'upload-topics',
      'upload-keywords',
      'upload-findings'
    ];

    // Add input listeners to all fields
    formFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        // Save on input (debounced)
        field.addEventListener('input', () => {
          clearTimeout(this.autoSaveInterval);
          this.autoSaveInterval = setTimeout(() => {
            this.saveDraft();
          }, 1000); // Save 1 second after user stops typing
        });

        // Save on blur (when user leaves field)
        field.addEventListener('blur', () => {
          this.saveDraft();
        });
      }
    });

    console.log('✓ Auto-save enabled');
  },

  /**
   * Save form data to localStorage
   */
  saveDraft() {
    try {
      const formData = {
        title: document.getElementById('upload-title')?.value || '',
        authors: document.getElementById('upload-authors')?.value || '',
        adviser: document.getElementById('upload-adviser')?.value || '',
        year: document.getElementById('upload-year')?.value || '',
        program: document.getElementById('upload-program')?.value || '',
        abstract: document.getElementById('upload-abstract')?.value || '',
        topics: document.getElementById('upload-topics')?.value || '',
        keywords: document.getElementById('upload-keywords')?.value || '',
        findings: document.getElementById('upload-findings')?.value || '',
        savedAt: new Date().toISOString()
      };

      // Only save if at least one field has data
      const hasData = Object.values(formData).some(value => 
        value && value !== '' && value !== formData.savedAt
      );

      if (hasData) {
        localStorage.setItem(this.autoSaveKey, JSON.stringify(formData));
        
        // Show auto-save indicator
        this.showAutoSaveIndicator();
        
        console.log('💾 Draft auto-saved');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  },

  /**
   * Show auto-save indicator
   */
  showAutoSaveIndicator() {
    const indicator = document.getElementById('auto-save-indicator');
    const text = document.getElementById('auto-save-text');
    
    if (!indicator) return;

    // Update text
    if (text) text.textContent = 'Draft saved';

    // Show indicator
    indicator.classList.remove('hidden');
    setTimeout(() => {
      indicator.classList.add('show');
    }, 10);

    // Hide after 2 seconds
    setTimeout(() => {
      indicator.classList.remove('show');
      setTimeout(() => {
        indicator.classList.add('hidden');
      }, 300);
    }, 2000);
  },

  /**
   * Load draft from localStorage
   */
  loadDraft() {
    try {
      const savedDraft = localStorage.getItem(this.autoSaveKey);
      
      if (!savedDraft) {
        return;
      }

      const formData = JSON.parse(savedDraft);
      
      // Check if draft is recent (within 7 days)
      const savedDate = new Date(formData.savedAt);
      const daysSince = (Date.now() - savedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSince > 7) {
        // Draft is too old, clear it
        this.clearDraft();
        return;
      }

      // Ask user if they want to restore
      const restore = confirm(
        `Found a saved draft from ${this.formatDate(savedDate)}.\n\n` +
        `Do you want to restore it?`
      );

      if (restore) {
        // Restore form data
        if (formData.title) document.getElementById('upload-title').value = formData.title;
        if (formData.authors) document.getElementById('upload-authors').value = formData.authors;
        if (formData.adviser) document.getElementById('upload-adviser').value = formData.adviser;
        if (formData.year) document.getElementById('upload-year').value = formData.year;
        if (formData.program) document.getElementById('upload-program').value = formData.program;
        if (formData.abstract) document.getElementById('upload-abstract').value = formData.abstract;
        if (formData.topics) document.getElementById('upload-topics').value = formData.topics;
        if (formData.keywords) document.getElementById('upload-keywords').value = formData.keywords;
        if (formData.findings) document.getElementById('upload-findings').value = formData.findings;

        // Show notification
        if (typeof Notifications !== 'undefined') {
          Notifications.addNotification({
            title: 'Draft Restored',
            message: 'Your previous work has been restored',
            type: 'success'
          });
        }

        console.log('✓ Draft restored');
      } else {
        // User declined, clear the draft
        this.clearDraft();
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      this.clearDraft();
    }
  },

  /**
   * Clear saved draft
   */
  clearDraft() {
    try {
      localStorage.removeItem(this.autoSaveKey);
      console.log('✓ Draft cleared');
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  },

  /**
   * Format date for display
   */
  formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  },

  /**
   * Show upload modal
   */
  showModal() {
    // Check if user is logged in
    if (!Auth.currentUser) {
      // Show login modal instead
      if (typeof Notifications !== 'undefined') {
        Notifications.addNotification({
          title: 'Login Required',
          message: 'Please login to submit capstone metadata',
          type: 'warning'
        });
      }
      if (typeof Auth !== 'undefined') {
        Auth.showLoginModal();
      }
      return;
    }

    const modal = document.getElementById('upload-metadata-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      
      // Load saved draft if exists
      this.loadDraft();
      
      // Focus on first input
      setTimeout(() => {
        const firstInput = document.getElementById('upload-title');
        if (firstInput) firstInput.focus();
      }, 100);
    }
  },

  /**
   * Close upload modal
   */
  closeModal() {
    const modal = document.getElementById('upload-metadata-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
      this.resetForm();
    }
  },

  /**
   * Reset form
   */
  resetForm() {
    const form = document.getElementById('upload-metadata-form');
    if (!form) return;

    form.reset();
    form.classList.remove('hidden');

    // Clear all error messages
    document.querySelectorAll('#upload-metadata-modal .form-error').forEach(el => {
      el.classList.add('hidden');
    });

    // Remove error styling from inputs
    document.querySelectorAll('#upload-metadata-modal .form-input, #upload-metadata-modal .form-textarea').forEach(el => {
      el.classList.remove('error');
    });

    // Hide success message
    const success = document.getElementById('upload-metadata-success');
    if (success) success.classList.add('hidden');

    // Reset button state
    this.setButtonState(false);
  },

  /**
   * Set button loading state
   */
  setButtonState(loading) {
    const btn = document.getElementById('upload-metadata-submit');
    if (!btn) return;

    btn.disabled = loading;
    const btnText = btn.querySelector('.btn-text');
    const btnSpinner = btn.querySelector('.btn-spinner');

    if (btnText) btnText.classList.toggle('hidden', loading);
    if (btnSpinner) btnSpinner.classList.toggle('hidden', !loading);
  },

  /**
   * Validate form data
   */
  validateForm(data) {
    let isValid = true;

    const setError = (fieldId, message) => {
      const input = document.getElementById(fieldId);
      const error = document.getElementById(fieldId + '-error');
      if (input) input.classList.add('error');
      if (error) {
        error.textContent = message;
        error.classList.remove('hidden');
      }
      isValid = false;
    };

    const clearError = (fieldId) => {
      const input = document.getElementById(fieldId);
      const error = document.getElementById(fieldId + '-error');
      if (input) input.classList.remove('error');
      if (error) error.classList.add('hidden');
    };

    // Validate required fields
    if (!data.title || data.title.trim() === '') {
      setError('upload-title', 'Project title is required');
    } else {
      clearError('upload-title');
    }

    if (!data.authors || data.authors.trim() === '') {
      setError('upload-authors', 'Authors are required');
    } else {
      clearError('upload-authors');
    }

    if (!data.adviser || data.adviser.trim() === '') {
      setError('upload-adviser', 'Adviser is required');
    } else {
      clearError('upload-adviser');
    }

    if (!data.year || data.year.trim() === '') {
      setError('upload-year', 'Year is required');
    } else if (!/^\d{4}$/.test(data.year)) {
      setError('upload-year', 'Please enter a valid 4-digit year');
    } else {
      const yearNum = parseInt(data.year);
      const currentYear = new Date().getFullYear();
      if (yearNum < 2000 || yearNum > currentYear + 1) {
        setError('upload-year', `Year must be between 2000 and ${currentYear + 1}`);
      } else {
        clearError('upload-year');
      }
    }

    if (!data.program || data.program === '') {
      setError('upload-program', 'Program is required');
    } else {
      clearError('upload-program');
    }

    if (!data.abstract || data.abstract.trim() === '') {
      setError('upload-abstract', 'Abstract is required');
    } else if (data.abstract.trim().length < 50) {
      setError('upload-abstract', 'Abstract must be at least 50 characters');
    } else {
      clearError('upload-abstract');
    }

    return isValid;
  },

  /**
   * Handle form submission
   */
  async handleSubmit(e) {
    e.preventDefault();

    // Check if user is logged in
    if (!Auth.currentUser) {
      if (typeof Notifications !== 'undefined') {
        Notifications.addNotification({
          title: 'Login Required',
          message: 'Please login to submit capstone metadata',
          type: 'error'
        });
      }
      this.closeModal();
      if (typeof Auth !== 'undefined') {
        Auth.showLoginModal();
      }
      return;
    }

    // Collect form data
    const formData = {
      title: document.getElementById('upload-title').value.trim(),
      authors: document.getElementById('upload-authors').value.trim(),
      adviser: document.getElementById('upload-adviser').value.trim(),
      year: document.getElementById('upload-year').value.trim(),
      program: document.getElementById('upload-program').value,
      abstract: document.getElementById('upload-abstract').value.trim(),
      topics: document.getElementById('upload-topics').value.trim(),
      keywords: document.getElementById('upload-keywords').value.trim(),
      findings: document.getElementById('upload-findings').value.trim()
    };

    // Validate form
    if (!this.validateForm(formData)) {
      return;
    }

    // Set loading state
    this.setButtonState(true);

    try {
      // Submit to Firebase
      await this.submitToFirebase(formData);

      // Show success message
      const form = document.getElementById('upload-metadata-form');
      const success = document.getElementById('upload-metadata-success');
      if (form) form.classList.add('hidden');
      if (success) success.classList.remove('hidden');

      // Clear the saved draft since submission was successful
      this.clearDraft();

      // Show notification
      if (typeof Notifications !== 'undefined') {
        Notifications.addNotification({
          title: 'Submission Successful',
          message: 'Your capstone metadata has been submitted for librarian validation',
          type: 'success'
        });
      }

      // Reload submissions list if on student dashboard
      if (typeof StudentSubmissions !== 'undefined') {
        StudentSubmissions.loadSubmissions();
      }

      // DO NOT close modal automatically - let user close it manually

    } catch (error) {
      console.error('Error submitting metadata:', error);

      // Reset button state
      this.setButtonState(false);

      // Show error notification
      if (typeof Notifications !== 'undefined') {
        Notifications.addNotification({
          title: 'Submission Failed',
          message: error.message || 'Failed to submit metadata. Please try again.',
          type: 'error'
        });
      }

      // Show error in form
      const titleError = document.getElementById('upload-title-error');
      if (titleError) {
        titleError.textContent = 'Submission failed. Please try again.';
        titleError.classList.remove('hidden');
      }
    }
  },

  /**
   * Submit metadata to Firebase
   */
  async submitToFirebase(formData) {
    try {
      console.log('📤 Starting Firebase submission...');
      console.log('Form data:', formData);

      // Check if Firebase is initialized
      if (typeof firebase === 'undefined') {
        throw new Error('Firebase is not loaded. Please refresh the page.');
      }

      if (typeof db === 'undefined') {
        throw new Error('Firestore database is not initialized. Please refresh the page.');
      }

      // Parse comma-separated fields into arrays
      const authorsArray = formData.authors
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const topicsArray = formData.topics
        ? formData.topics.split(',').map(t => t.trim()).filter(t => t.length > 0)
        : [];

      const keywordsArray = formData.keywords
        ? formData.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
        : [];

      // Prepare submission data
      const submissionData = {
        title: formData.title,
        authors: authorsArray,
        adviser: formData.adviser,
        year: parseInt(formData.year),
        program: formData.program,
        abstract: formData.abstract,
        topics: topicsArray,
        keywords: keywordsArray,
        findings: formData.findings || '',
        
        // Submission metadata
        status: 'pending',
        submittedBy: Auth.currentUser.id,
        submittedByName: Auth.currentUser.name,
        submittedByEmail: Auth.currentUser.email || '',
        submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
        
        // Validation metadata (to be filled by adviser)
        validatedBy: null,
        validatedAt: null,
        validationNotes: ''
      };

      console.log('📊 Submission data prepared:', submissionData);

      // Submit to Firestore 'submissions' collection
      console.log('💾 Saving to Firestore...');
      const docRef = await db.collection('submissions').add(submissionData);

      console.log('✅ Metadata submitted with ID:', docRef.id);
      return docRef.id;

    } catch (error) {
      console.error('❌ Firebase submission error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please make sure you are logged in.');
      } else if (error.code === 'unavailable') {
        throw new Error('Firebase is currently unavailable. Please check your internet connection.');
      } else if (error.message.includes('Firebase')) {
        throw new Error('Firebase connection error. Please refresh the page and try again.');
      }
      
      throw new Error(error.message || 'Failed to submit metadata to database');
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StudentUpload;
}
