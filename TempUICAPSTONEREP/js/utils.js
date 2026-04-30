/**
 * Utilities Module
 * Helper functions and utilities
 */

const Utils = {
  /**
   * Toggle save button state
   */
  toggleSave(button) {
    const isSaved = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', !isSaved);
    
    const icon = button.querySelector('span[aria-hidden]');
    if (icon) {
      icon.textContent = isSaved ? '☆' : '★';
    }
    
    const text = button.childNodes[button.childNodes.length - 1];
    if (text && text.nodeType === Node.TEXT_NODE) {
      text.textContent = isSaved ? ' Save' : ' Saved';
    }
    
    button.style.color = isSaved ? '' : 'var(--ctu-orange)';
    button.style.borderColor = isSaved ? '' : 'var(--ctu-orange)';
  },

  /**
   * Run validation (placeholder)
   */
  runValidation() {
    console.log('Running validation...');
    return true;
  },

  /**
   * Initialize utilities
   */
  init() {
    // Setup save buttons
    document.querySelectorAll('.save-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleSave(btn);
      });
    });

    // Setup back buttons
    document.querySelectorAll('[data-action="back"]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof Navigation !== 'undefined') {
          Navigation.switchView('landing');
        }
      });
    });
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}
