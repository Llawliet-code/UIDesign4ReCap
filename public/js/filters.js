/**
 * Filters Module
 * Handles search filters and filter chips
 */

const Filters = {
  /**
   * Update filters and show active filter chips
   */
  async update() {
    const activeFilters = [];
    const filters = {};
    
    // Collect all checked filters
    document.querySelectorAll('.filter-content input[type="checkbox"]:checked').forEach(checkbox => {
      const label = document.querySelector(`label[for="${checkbox.id}"]`);
      if (label) {
        const filterText = label.textContent.trim();
        activeFilters.push({
          id: checkbox.id,
          text: filterText
        });
        
        // Determine filter type and add to filters object
        if (checkbox.id.startsWith('y')) {
          filters.year = parseInt(filterText);
        } else if (checkbox.id.startsWith('p')) {
          filters.program = filterText;
        } else if (checkbox.id.startsWith('t')) {
          filters.topic = filterText;
        }
      }
    });
    
    // Update filter chips display
    this.updateChips(activeFilters);
    
    // Apply filters to projects
    if (typeof Projects !== 'undefined') {
      await Projects.loadProjects(filters);
    }
  },

  /**
   * Update active filter chips
   */
  updateChips(filters) {
    const container = document.getElementById('active-filters');
    if (!container) return;
    
    container.innerHTML = '';
    
    filters.forEach(filter => {
      const chip = document.createElement('div');
      chip.className = 'filter-chip';
      chip.innerHTML = `
        ${filter.text}
        <span class="filter-chip-remove" data-filter-id="${filter.id}" aria-label="Remove ${filter.text} filter" role="button" tabindex="0">×</span>
      `;
      container.appendChild(chip);
    });

    // Add event listeners to remove buttons
    container.querySelectorAll('.filter-chip-remove').forEach(btn => {
      btn.addEventListener('click', () => this.remove(btn.dataset.filterId));
    });
  },

  /**
   * Remove a specific filter
   */
  remove(filterId) {
    const checkbox = document.getElementById(filterId);
    if (checkbox) {
      checkbox.checked = false;
      this.update();
    }
  },

  /**
   * Clear all filters
   */
  clearAll() {
    // Uncheck all checkboxes
    document.querySelectorAll('.filter-content input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // Clear keyword input
    const keywordInput = document.getElementById('keyword-input');
    if (keywordInput) {
      keywordInput.value = '';
    }
    
    // Update display
    this.update();
  },

  /**
   * Update results count display
   */
  updateResultsCount(filterCount) {
    const totalElement = document.getElementById('results-total');
    if (totalElement) {
      // Simulate different result counts based on filters
      const baseCounts = [42, 38, 35, 31, 28, 24, 20];
      const count = baseCounts[Math.min(filterCount, baseCounts.length - 1)];
      totalElement.textContent = count;
    }
  },

  /**
   * Toggle filter section open/closed
   */
  toggleSection(button) {
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', !isExpanded);
    
    const content = button.nextElementSibling;
    if (content) {
      content.style.display = isExpanded ? 'none' : 'flex';
    }
  },

  /**
   * Initialize filters
   */
  init() {
    // Setup filter checkboxes
    document.querySelectorAll('.filter-content input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => this.update());
    });

    // Setup filter section toggles
    document.querySelectorAll('.filter-title').forEach(title => {
      title.addEventListener('click', () => this.toggleSection(title));
    });

    // Setup clear all button
    const clearBtn = document.querySelector('.btn-clear-filters');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearAll());
    }

    // Initialize filter chips
    this.update();
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Filters;
}
