/**
 * Theme Management Module
 * Handles dark mode toggle, persistence, and background switching
 */

const ThemeManager = {
  /**
   * Initialize theme from localStorage or system preference
   */
  init() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    this.setTheme(theme, false);
    this.setupListeners();
    this.preloadBackgrounds();
  },

  /**
   * Preload background images for smooth transitions
   */
  preloadBackgrounds() {
    const lightBg = new Image();
    const darkBg = new Image();
    lightBg.src = 'Light_mode_Theme.png';
    darkBg.src = 'Dark_mode_Theme.png';
  },

  /**
   * Set the theme and update UI with smooth transition
   */
  setTheme(theme, save = true) {
    // Add transition class for smooth background change
    document.body.classList.add('theme-transitioning');
    
    document.documentElement.setAttribute('data-theme', theme);
    
    const themeIcon = document.querySelector('.theme-icon');
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeIcon) {
      const moonSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
      const sunSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
      themeIcon.innerHTML = theme === 'dark' ? sunSVG : moonSVG;
    }
    
    // Update button title
    if (themeToggle) {
      themeToggle.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
    
    if (save) {
      localStorage.setItem('theme', theme);
      // Show theme indicator
      this.showThemeIndicator(theme);
    }
    
    // Remove transition class after animation completes
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 350);
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  },

  /**
   * Show theme switch indicator
   */
  showThemeIndicator(theme) {
    const indicator = document.getElementById('theme-indicator');
    if (indicator) {
      const text = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
      indicator.textContent = `${text} Activated`;
      indicator.classList.add('show');
      setTimeout(() => { indicator.classList.remove('show'); }, 2000);
    }
  },

  /**
   * Toggle between light and dark themes with animation
   */
  toggle() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Add visual feedback
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        themeToggle.style.transform = '';
      }, 350);
    }
    
    this.setTheme(newTheme);
  },

  /**
   * Setup event listeners
   */
  setupListeners() {
    // Theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggle());
      
      // Keyboard support
      themeToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.setTheme(e.matches ? 'dark' : 'light', false);
      }
    });
  },

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}
