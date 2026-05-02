/**
 * API Keys Checker
 * Validates that API keys are configured
 */

const APIKeysChecker = {
  /**
   * Check if API keys are configured
   */
  checkKeys() {
    const missingKeys = [];
    
    if (!API_KEYS.mistral || API_KEYS.mistral === '') {
      missingKeys.push('Mistral AI');
    }
    
    if (!API_KEYS.gemini || API_KEYS.gemini === '') {
      missingKeys.push('Google Gemini');
    }
    
    if (!API_KEYS.groq || API_KEYS.groq === '') {
      missingKeys.push('Groq AI');
    }
    
    if (missingKeys.length > 0) {
      this.showWarning(missingKeys);
    } else {
      console.log('✅ All API keys configured!');
    }
  },
  
  /**
   * Show warning banner for missing keys
   */
  showWarning(missingKeys) {
    const banner = document.createElement('div');
    banner.id = 'api-keys-warning';
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 20px;
      text-align: center;
      z-index: 10000;
      font-family: 'Inter', sans-serif;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    banner.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 15px; flex-wrap: wrap;">
        <span style="font-size: 20px;">🔑</span>
        <span style="font-weight: 500;">
          Missing API Keys: <strong>${missingKeys.join(', ')}</strong>
        </span>
        <a href="API_KEYS_SETUP.md" target="_blank" 
           style="background: white; color: #667eea; padding: 6px 16px; border-radius: 6px; 
                  text-decoration: none; font-weight: 600; font-size: 14px;">
          📖 Setup Guide
        </a>
        <button onclick="document.getElementById('api-keys-warning').remove()" 
                style="background: rgba(255,255,255,0.2); border: 1px solid white; color: white; 
                       padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 14px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:4px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Dismiss
        </button>
      </div>
    `;
    
    document.body.insertBefore(banner, document.body.firstChild);
    
    console.warn('⚠️ Missing API keys:', missingKeys);
    console.log('📖 See API_KEYS_SETUP.md for instructions');
  },
  
  /**
   * Initialize checker
   */
  init() {
    // Check keys when page loads
    this.checkKeys();
  }
};

// Auto-run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => APIKeysChecker.init());
} else {
  APIKeysChecker.init();
}
