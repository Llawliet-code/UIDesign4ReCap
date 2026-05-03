/**
 * Filters Module
 * Handles search filters, filter chips, and combined filter+search
 */

const Filters = {
  // Current active filter state
  activeFilters: {
    years: [],
    programs: [],
    topics: [],
    keyword: ''
  },

  /**
   * Collect all checked filters from the sidebar
   */
  collectFilters() {
    const years = [];
    const programs = [];
    const topics = [];

    document.querySelectorAll('.filter-content input[type="checkbox"]:checked').forEach(checkbox => {
      const label = document.querySelector(`label[for="${checkbox.id}"]`);
      if (!label) return;
      const text = label.textContent.trim();

      if (checkbox.id.startsWith('y')) {
        years.push(parseInt(text));
      } else if (checkbox.id.startsWith('p')) {
        programs.push(text);
      } else if (checkbox.id.startsWith('t')) {
        topics.push(text);
      }
    });

    const keywordInput = document.querySelector('.filter-keyword-input');
    const keyword = keywordInput ? keywordInput.value.trim() : '';

    return { years, programs, topics, keyword };
  },

  /**
   * Apply filters — fetch from DB then filter client-side for multi-value support
   */
  async apply() {
    const filters = this.collectFilters();
    this.activeFilters = filters;

    // Build chip list
    const chips = [];
    filters.years.forEach(y => chips.push({ id: `y${y}`, text: String(y), type: 'year' }));
    filters.programs.forEach(p => {
      const id = [...document.querySelectorAll('.filter-content input[type="checkbox"]')]
        .find(cb => {
          const lbl = document.querySelector(`label[for="${cb.id}"]`);
          return lbl && lbl.textContent.trim() === p && cb.id.startsWith('p');
        })?.id || p;
      chips.push({ id, text: p, type: 'program' });
    });
    filters.topics.forEach(t => {
      const id = [...document.querySelectorAll('.filter-content input[type="checkbox"]')]
        .find(cb => {
          const lbl = document.querySelector(`label[for="${cb.id}"]`);
          return lbl && lbl.textContent.trim() === t && cb.id.startsWith('t');
        })?.id || t;
      chips.push({ id, text: t, type: 'topic' });
    });
    if (filters.keyword) {
      chips.push({ id: 'kw', text: `"${filters.keyword}"`, type: 'keyword' });
    }

    this.updateChips(chips);
    await this.runSearch();
  },

  /**
   * Run the actual search+filter against the database
   */
  async runSearch() {
    const container = document.getElementById('results-container');
    const loadingSkeleton = document.getElementById('loading-skeleton');
    if (!container) return;

    if (loadingSkeleton) loadingSkeleton.classList.remove('hidden');

    try {
      // Fetch all projects (Firestore doesn't support multi-value OR filters natively)
      let projects = await Database.fetchProjects({});

      // Client-side filtering for multi-value support
      projects = this.filterProjects(projects, this.activeFilters);

      // Also apply search bar query if present
      const searchQuery = document.getElementById('main-search')?.value.trim();
      if (searchQuery) {
        projects = this.keywordFilter(projects, searchQuery);
      }

      if (loadingSkeleton) loadingSkeleton.classList.add('hidden');

      if (projects.length === 0) {
        Projects.showEmptyState(container);
      } else {
        await Projects.displayProjects(projects, container);
      }

      Projects.updateResultsCount(projects.length);
      Projects.currentProjects = projects;

    } catch (err) {
      console.error('Filter error:', err);
      if (loadingSkeleton) loadingSkeleton.classList.add('hidden');
      Projects.showErrorState(container);
    }
  },

  /**
   * Filter projects array client-side
   */
  filterProjects(projects, filters) {
    return projects.filter(p => {
      // Year filter (OR logic — match any selected year)
      if (filters.years.length > 0) {
        const projectYear = typeof p.year === 'string' ? parseInt(p.year) : p.year;
        if (!filters.years.includes(projectYear)) return false;
      }

      // Program filter (OR logic)
      if (filters.programs.length > 0) {
        if (!filters.programs.includes(p.program)) return false;
      }

      // Topic filter (OR logic — project must have at least one matching topic)
      if (filters.topics.length > 0) {
        const projectTopics = Array.isArray(p.topics) ? p.topics : [];
        const hasMatch = filters.topics.some(t =>
          projectTopics.some(pt => pt.toLowerCase() === t.toLowerCase())
        );
        if (!hasMatch) return false;
      }

      // Keyword filter (sidebar keyword input)
      if (filters.keyword) {
        if (!this.matchesKeyword(p, filters.keyword)) return false;
      }

      return true;
    });
  },

  /**
   * Filter by search bar keyword
   */
  keywordFilter(projects, query) {
    const q = query.toLowerCase();
    return projects.filter(p => this.matchesKeyword(p, q));
  },

  /**
   * Check if a project matches a keyword
   */
  matchesKeyword(project, keyword) {
    const kw = keyword.toLowerCase();
    const searchable = [
      project.title,
      project.abstract,
      project.findings,
      Array.isArray(project.authors) ? project.authors.join(' ') : project.authors,
      Array.isArray(project.topics) ? project.topics.join(' ') : '',
      Array.isArray(project.keywords) ? project.keywords.join(' ') : '',
      project.program,
      String(project.year)
    ].filter(Boolean).join(' ').toLowerCase();

    return searchable.includes(kw);
  },

  /**
   * Update active filter chips display
   */
  updateChips(chips) {
    const container = document.getElementById('active-filters');
    if (!container) return;

    container.innerHTML = '';

    chips.forEach(filter => {
      const chip = document.createElement('div');
      chip.className = 'filter-chip';
      chip.innerHTML = `
        ${filter.text}
        <span class="filter-chip-remove" data-filter-id="${filter.id}" data-filter-type="${filter.type}" aria-label="Remove ${filter.text} filter" role="button" tabindex="0">×</span>
      `;
      container.appendChild(chip);
    });

    container.querySelectorAll('.filter-chip-remove').forEach(btn => {
      btn.addEventListener('click', () => this.removeChip(btn.dataset.filterId, btn.dataset.filterType));
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') this.removeChip(btn.dataset.filterId, btn.dataset.filterType);
      });
    });
  },

  /**
   * Remove a filter chip and uncheck its checkbox
   */
  removeChip(filterId, filterType) {
    if (filterType === 'keyword') {
      const keywordInput = document.querySelector('.filter-keyword-input');
      if (keywordInput) keywordInput.value = '';
    } else {
      const checkbox = document.getElementById(filterId);
      if (checkbox) checkbox.checked = false;
    }
    this.apply();
  },

  /**
   * Clear all filters
   */
  clearAll() {
    document.querySelectorAll('.filter-content input[type="checkbox"]').forEach(cb => {
      cb.checked = false;
    });

    const keywordInput = document.querySelector('.filter-keyword-input');
    if (keywordInput) keywordInput.value = '';

    const searchBar = document.getElementById('main-search');
    if (searchBar) searchBar.value = '';

    this.apply();
  },

  /**
   * Toggle filter section open/closed
   */
  toggleSection(button) {
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!isExpanded));

    const content = button.nextElementSibling;
    if (content) {
      content.style.display = isExpanded ? 'none' : 'flex';
    }
  },

  /**
   * Load real filter counts from the database and update the sidebar
   */
  async loadFilterCounts() {
    try {
      const stats = await Database.getFilterStats();

      // Update year counts
      document.querySelectorAll('[data-count-year]').forEach(span => {
        const year = parseInt(span.dataset.countYear);
        const count = stats.years[year] || 0;
        span.textContent = count;
        span.setAttribute('aria-label', `${count} projects`);
      });

      // Update program counts
      document.querySelectorAll('[data-count-program]').forEach(span => {
        const program = span.dataset.countProgram;
        const count = stats.programs[program] || 0;
        span.textContent = count;
        span.setAttribute('aria-label', `${count} projects`);
      });

      // Update topic counts
      document.querySelectorAll('[data-count-topic]').forEach(span => {
        const topic = span.dataset.countTopic;
        // Topics in DB may be stored differently, do case-insensitive match
        const count = Object.entries(stats.topics).reduce((sum, [key, val]) => {
          return key.toLowerCase() === topic.toLowerCase() ? sum + val : sum;
        }, 0);
        span.textContent = count;
        span.setAttribute('aria-label', `${count} projects`);
      });

    } catch (err) {
      console.error('Error loading filter counts:', err);
    }
  },

  /**
   * Initialize filters
   */
  init() {
    // Live filter on checkbox change
    document.querySelectorAll('.filter-content input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => this.apply());
    });

    // Live filter on keyword input (debounced)
    const keywordInput = document.querySelector('.filter-keyword-input');
    if (keywordInput) {
      let kwTimeout;
      keywordInput.addEventListener('input', () => {
        clearTimeout(kwTimeout);
        kwTimeout = setTimeout(() => this.apply(), 400);
      });
    }

    // Filter section toggles
    document.querySelectorAll('[data-filter-toggle]').forEach(title => {
      title.addEventListener('click', () => this.toggleSection(title));
    });

    // Initial load — no filters applied, and load real counts
    this.loadFilterCounts();
    this.apply();

    console.log('✓ Filters initialized');
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Filters;
}
