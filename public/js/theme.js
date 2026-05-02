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
      themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
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
      const icon = theme === 'dark' ? '🌙' : '☀️';
      const text = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
      indicator.textContent = `${icon} ${text} Activated`;
      indicator.classList.add('show');
      
      setTimeout(() => {
        indicator.classList.remove('show');
      }, 2000);
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
