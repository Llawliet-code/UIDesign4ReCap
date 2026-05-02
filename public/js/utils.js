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
      icon.innerHTML = isSaved
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
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
