/**
 * Search Module
 * Handles search functionality with debouncing
 */

const Search = {
  searchTimeout: null,

  /**
   * Handle search with debouncing
   */
  handleSearch(query) {
    clearTimeout(this.searchTimeout);
    
    this.searchTimeout = setTimeout(() => {
      console.log('Searching for:', query);
      this.showLoading();
      
      // Simulate API call
      setTimeout(() => {
        this.hideLoading();
        this.updateResults(query);
      }, 800);
    }, 300);
  },

  /**
   * Show loading skeleton
   */
  showLoading() {
    const skeleton = document.getElementById('loading-skeleton');
    if (skeleton) {
      skeleton.style.display = 'block';
      skeleton.setAttribute('aria-busy', 'true');
    }
  },

  /**
   * Hide loading skeleton
   */
  hideLoading() {
    const skeleton = document.getElementById('loading-skeleton');
    if (skeleton) {
      skeleton.style.display = 'none';
      skeleton.setAttribute('aria-busy', 'false');
    }
  },

  /**
   * Update search results display
   */
  updateResults(query) {
    const resultsQuery = document.getElementById('results-query');
    if (resultsQuery) {
      resultsQuery.textContent = query || 'all projects';
    }
  },

  /**
   * Sort search results
   */
  sortResults(sortType) {
    console.log('Sorting by:', sortType);
    
    this.showLoading();
    
    // Simulate sorting delay
    setTimeout(() => {
      this.hideLoading();
      console.log('Results sorted by:', sortType);
    }, 500);
  },

  /**
   * Toggle natural language search
   */
  toggleNLSearch() {
    const toggle = document.querySelector('.search-toggle');
    if (!toggle) return;
    
    const isChecked = toggle.getAttribute('aria-checked') === 'true';
    toggle.setAttribute('aria-checked', !isChecked);
    
    // Visual feedback
    const pill = toggle.querySelector('.toggle-pill');
    if (pill) {
      pill.style.background = isChecked ? 'var(--text-hint)' : 'var(--ctu-orange)';
    }
    
    console.log('Natural Language Search:', !isChecked ? 'ON' : 'OFF');
  },

  /**
   * Initialize search
   */
  init() {
    // Setup search input
    const searchBar = document.getElementById('main-search');
    if (searchBar) {
      searchBar.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    // Setup sort select
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => this.sortResults(e.target.value));
    }

    // Setup NL search toggle
    const nlToggle = document.querySelector('.search-toggle');
    if (nlToggle) {
      nlToggle.addEventListener('click', () => this.toggleNLSearch());
      nlToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleNLSearch();
        }
      });
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Search;
}
