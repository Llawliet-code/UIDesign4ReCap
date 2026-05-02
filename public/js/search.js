/**
 * Search Module
 * Handles search functionality with Groq AI semantic search
 */

const Search = {
  searchTimeout: null,
  useNaturalLanguage: true,

  /**
   * Handle search with debouncing
   */
  handleSearch(query) {
    clearTimeout(this.searchTimeout);
    
    this.searchTimeout = setTimeout(async () => {
      console.log('🔍 Search triggered for:', query);

      // Always go through Filters so active sidebar filters are respected
      if (typeof Filters !== 'undefined') {
        await Filters.runSearch();
        return;
      }

      // Fallback if Filters not loaded
      if (!query.trim()) {
        if (typeof Projects !== 'undefined') {
          await Projects.loadProjects();
        }
        return;
      }

      if (typeof Projects !== 'undefined') {
        await Projects.searchProjects(query);
      }
    }, 400);
  },

  /**
   * Search using Groq AI
   */
  async searchWithGroq(query) {
    const container = document.getElementById('results-container');
    const loadingSkeleton = document.getElementById('loading-skeleton');
    
    if (!container) return;
    
    // Show loading
    if (loadingSkeleton) loadingSkeleton.classList.remove('hidden');
    
    try {
      // Get all projects for semantic search
      const allProjects = await Database.fetchProjects({});
      
      // Update Groq cache
      if (typeof GroqService !== 'undefined') {
        GroqService.updateProjectsCache(allProjects);
      }
      
      // Perform semantic search
      const results = await GroqService.semanticSearch(query, allProjects);
      
      // Hide loading
      if (loadingSkeleton) loadingSkeleton.classList.add('hidden');
      
      // Display results
      if (results.length === 0) {
        this.showNoResults(container, query);
      } else {
        if (typeof Projects !== 'undefined') {
          Projects.displayProjects(results, container);
          Projects.updateResultsCount(results.length);
        }
      }
      
    } catch (error) {
      console.error('Search error:', error);
      if (loadingSkeleton) loadingSkeleton.classList.add('hidden');
      
      // Fallback to Firebase search
      if (typeof Projects !== 'undefined') {
        await Projects.searchProjects(query);
      }
    }
  },

  /**
   * Show no results message
   */
  showNoResults(container, query) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3 class="empty-title">No Results Found</h3>
        <p class="empty-text">No projects match your search for "${this.escapeHtml(query)}"</p>
        <p class="empty-hint">Try different keywords or use natural language like "projects about AI in agriculture"</p>
      </div>
    `;
  },

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Show loading skeleton
   */
  showLoading() {
    const skeleton = document.getElementById('loading-skeleton');
    if (skeleton) {
      skeleton.classList.remove('hidden');
      skeleton.setAttribute('aria-busy', 'true');
    }
  },

  /**
   * Hide loading skeleton
   */
  hideLoading() {
    const skeleton = document.getElementById('loading-skeleton');
    if (skeleton) {
      skeleton.classList.add('hidden');
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
    if (typeof Projects === 'undefined' || !Projects.currentProjects || !Projects.currentProjects.length) return;
    const container = document.getElementById('results-container');
    if (!container) return;

    let sorted = [...Projects.currentProjects];

    if (sortType.includes('Newest')) {
      sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (sortType.includes('Oldest')) {
      sorted.sort((a, b) => (a.year || 0) - (b.year || 0));
    }

    Projects.displayProjects(sorted, container);
  },

  /**
   * Toggle natural language search
   */
  toggleNLSearch() {
    const toggle = document.querySelector('.search-toggle');
    if (!toggle) return;
    
    const isChecked = toggle.getAttribute('aria-checked') === 'true';
    this.useNaturalLanguage = !isChecked;
    toggle.setAttribute('aria-checked', this.useNaturalLanguage);
    
    // Visual feedback
    const pill = toggle.querySelector('.toggle-pill');
    if (pill) {
      pill.style.background = this.useNaturalLanguage ? 'var(--ctu-orange)' : 'var(--text-hint)';
    }
    
    const label = toggle.querySelector('.toggle-label');
    if (label) {
      label.textContent = this.useNaturalLanguage ? 'AI Semantic Search' : 'Keyword Search';
    }
    
    console.log('Search Mode:', this.useNaturalLanguage ? 'AI Semantic' : 'Keyword');
  },

  /**
   * Initialize search
   */
  init() {
    // Setup search input
    const searchBar = document.getElementById('main-search');
    if (searchBar) {
      searchBar.addEventListener('input', (e) => this.handleSearch(e.target.value));
      
      // Update placeholder for AI search
      searchBar.placeholder = 'Try: "projects about machine learning in agriculture" or "IoT systems for monitoring"';
    }

    // Setup sort select
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => this.sortResults(e.target.value));
    }

    // Setup NL search toggle
    const nlToggle = document.querySelector('.search-toggle');
    if (nlToggle) {
      // Set initial state
      const label = nlToggle.querySelector('.toggle-label');
      if (label) {
        label.textContent = 'AI Semantic Search';
      }
      
      nlToggle.addEventListener('click', () => this.toggleNLSearch());
      nlToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleNLSearch();
        }
      });
    }
    
    console.log('✓ Search initialized with Groq AI semantic search');
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Search;
}
