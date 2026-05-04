/**
 * Projects Module
 * Handles dynamic project loading and display
 */

const Projects = {
  currentProjects: [],
  currentFilters: {},
  savedProjectIds: new Set(), // tracks which project IDs the current user has saved

  /**
   * Load and display projects
   */
  async loadProjects(filters = {}) {
    const container = document.getElementById('results-container');
    const loadingSkeleton = document.getElementById('loading-skeleton');
    const emptyState = document.getElementById('empty-state');
    
    if (!container) return;
    
    // Show loading
    if (loadingSkeleton) loadingSkeleton.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');
    
    try {
      // Fetch projects from database
      const projects = await Database.fetchProjects(filters);
      this.currentProjects = projects;
      this.currentFilters = filters;
      
      // Hide loading
      if (loadingSkeleton) loadingSkeleton.classList.add('hidden');
      
      // Display projects
      if (projects.length === 0) {
        this.showEmptyState(container);
      } else {
        await this.displayProjects(projects, container);
      }
      
      // Update results count
      this.updateResultsCount(projects.length);
      
    } catch (error) {
      console.error('Error loading projects:', error);
      if (loadingSkeleton) loadingSkeleton.classList.add('hidden');
      this.showErrorState(container);
    }
  },

  /**
   * Display projects in cards
   */
  async displayProjects(projects, container) {
    container.innerHTML = projects.map(project => this.createProjectCard(project)).join('');
    // Patch buttons after render — handles the case where savedProjectIds
    // loaded after cards were already drawn (e.g. on page refresh)
    if (Auth.currentUser) {
      if (this.savedProjectIds.size === 0) {
        await this.loadSavedIds(); // also calls _patchSaveButtons internally
      } else {
        this._patchSaveButtons();
      }
    }
  },

  /**
   * Create project card HTML
   */
  createProjectCard(project) {
    const authors = Array.isArray(project.authors) ? project.authors.join(' · ') : '';
    const topics = Array.isArray(project.topics) ? project.topics : [];
    const keywords = Array.isArray(project.keywords) ? project.keywords : [];
    const allTags = [...topics, ...keywords].slice(0, 4);
    
    return `
      <article class="result-card card-hover" data-project-id="${this.escapeHtml(String(project.id))}" role="article" tabindex="0">
        <div class="result-card-top">
          <h2 class="result-title">${this.escapeHtml(project.title)}</h2>
          <span class="result-year" aria-label="Published in ${project.year}">${project.year || 'N/A'}</span>
        </div>
        <div class="result-meta">
          <span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:3px"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>${this.escapeHtml(authors)}</span>
          <span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:3px"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>${this.escapeHtml(project.program || 'N/A')}</span>
        </div>
        <div class="result-abstract">${this.escapeHtml(this.truncate(project.abstract, 200))}</div>
        <div class="result-tags">
          ${allTags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
        </div>
        <div class="result-actions">
          <button class="save-btn ripple" data-action="save-project" data-project-id="${project.id}" aria-label="Save this project" aria-pressed="${this.savedProjectIds.has(project.id)}">
            ${this.savedProjectIds.has(project.id)
              ? `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:3px"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>Saved`
              : `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:3px"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>Save`
            }
          </button>
          <button class="view-btn ripple" data-action="view-project" data-project-id="${project.id}" aria-label="View project details">
            View Details →
          </button>
        </div>
      </article>
    `;
  },

  /**
   * Show empty state
   */
  showEmptyState(container) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <h3 class="empty-title">No Projects Found</h3>
        <p class="empty-text">No capstone projects match your search criteria.</p>
        <p class="empty-hint">Try adjusting your filters or search terms.</p>
      </div>
    `;
  },

  /**
   * Show error state
   */
  showErrorState(container) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <h3 class="empty-title">Error Loading Projects</h3>
        <p class="empty-text">There was a problem loading the projects.</p>
        <p class="empty-hint">Please refresh the page or try again later.</p>
      </div>
    `;
  },

  /**
   * Update results count
   */
  updateResultsCount(count) {
    const countElement = document.querySelector('.results-count strong');
    if (countElement) {
      countElement.textContent = count;
    }
    
    const resultsText = document.querySelector('.results-count');
    if (resultsText && count > 0) {
      const filterText = this.getFilterText();
      resultsText.innerHTML = `Showing <strong>${count}</strong> result${count !== 1 ? 's' : ''}${filterText}`;
    }
  },

  /**
   * Get filter text for display
   */
  getFilterText() {
    const filters = [];
    if (this.currentFilters.year) filters.push(`year ${this.currentFilters.year}`);
    if (this.currentFilters.program) filters.push(`program ${this.currentFilters.program}`);
    if (this.currentFilters.topic) filters.push(`topic "${this.currentFilters.topic}"`);
    
    return filters.length > 0 ? ` for ${filters.join(', ')}` : '';
  },

  /**
   * Search projects
   */
  async searchProjects(keyword) {
    const container = document.getElementById('results-container');
    const loadingSkeleton = document.getElementById('loading-skeleton');
    
    console.log('📚 Projects.searchProjects called with:', keyword);
    
    if (!keyword.trim()) {
      await this.loadProjects(this.currentFilters);
      return;
    }
    
    // Show loading
    if (loadingSkeleton) loadingSkeleton.classList.remove('hidden');
    
    try {
      let results;
      
      // Use Meilisearch if available, otherwise fallback to Firebase
      if (typeof MeilisearchService !== 'undefined' && !MeilisearchService.useFallback) {
        console.log('✓ Projects using Meilisearch for:', keyword);
        results = await MeilisearchService.search(keyword, {
          limit: 100,
          filters: this.currentFilters
        });
        console.log('✓ Meilisearch returned:', results.length, 'results');
      } else {
        console.log('⚠️ Projects using Firebase fallback for:', keyword);
        results = await Database.searchProjects(keyword);
        console.log('✓ Firebase returned:', results.length, 'results');
      }
      
      // Hide loading
      if (loadingSkeleton) loadingSkeleton.classList.add('hidden');
      
      // Display results
      if (results.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <h3 class="empty-title">No Results Found</h3>
            <p class="empty-text">No projects match your search for "${this.escapeHtml(keyword)}"</p>
            <p class="empty-hint">Try different keywords or check your spelling.</p>
          </div>
        `;
      } else {
        await this.displayProjects(results, container);
      }
      
      // Update count
      this.updateResultsCount(results.length);
      
    } catch (error) {
      console.error('❌ Error searching projects:', error);
      if (loadingSkeleton) loadingSkeleton.classList.add('hidden');
      this.showErrorState(container);
    }
  },

  /**
   * View project from saved research (fetches from DB since it may not be in currentProjects)
   */
  async viewSavedProject(projectId) {
    try {
      // Try currentProjects first (faster)
      let project = this.currentProjects.find(p => p.id === projectId);

      // Fall back to Firestore fetch
      if (!project) {
        project = await Database.fetchProjectById(projectId);
      }

      if (!project) return;

      sessionStorage.setItem('currentProject', JSON.stringify(project));
      this.populateDetailView(project);

      if (typeof Navigation !== 'undefined') {
        Navigation.switchView('detail');
      }
    } catch (error) {
      console.error('Error viewing saved project:', error);
    }
  },

  /**
   * View project details
   */
  viewProject(projectId) {
    const project = this.currentProjects.find(p => p.id === projectId);
    if (!project) return;
    
    // Store project for detail view
    sessionStorage.setItem('currentProject', JSON.stringify(project));
    
    // Populate detail view
    this.populateDetailView(project);
    
    // Switch to detail view
    if (typeof Navigation !== 'undefined') {
      Navigation.switchView('detail');
    }
  },

  /**
   * Populate detail view with project data
   */
  populateDetailView(project) {
    // Update badge
    const badge = document.querySelector('.detail-badge');
    if (badge) {
      const topics = Array.isArray(project.topics) ? project.topics[0] : 'Research';
      badge.textContent = `${project.program || 'N/A'} · ${project.year || 'N/A'} · ${topics}`;
    }
    
    // Update title
    const title = document.querySelector('.detail-title');
    if (title) {
      title.textContent = project.title || 'Untitled Project';
    }
    
    // Update authors
    const authors = document.querySelector('.detail-authors');
    if (authors) {
      const authorsList = Array.isArray(project.authors) ? project.authors.join(' · ') : 'Unknown';
      const adviserText = project.adviser ? ` — Adviser: ${project.adviser}` : '';
      authors.textContent = `${authorsList}${adviserText}`;
    }
    
    // Update abstract
    const abstractSection = document.querySelector('.detail-main .section-content');
    if (abstractSection) {
      abstractSection.textContent = project.abstract || 'No abstract available.';
    }
    
    // Update key findings (now the second section)
    const methodologySections = document.querySelectorAll('.detail-main .section-content');
    if (methodologySections[1]) {
      methodologySections[1].textContent = project.findings || 'No findings information available.';
    }
    
    // Update project info sidebar
    const projectInfoRows = document.querySelectorAll('.project-info-row');
    if (projectInfoRows[0]) {
      const yearValue = projectInfoRows[0].querySelector('.project-info-value');
      if (yearValue) yearValue.textContent = project.year || 'N/A';
    }
    if (projectInfoRows[1]) {
      const programValue = projectInfoRows[1].querySelector('.project-info-value');
      if (programValue) programValue.textContent = project.program || 'N/A';
    }
  },

  /**
   * Load detail view from sessionStorage
   */
  loadDetailView() {
    const projectData = sessionStorage.getItem('currentProject');
    if (projectData) {
      try {
        const project = JSON.parse(projectData);
        this.populateDetailView(project);
      } catch (error) {
        console.error('Error loading project from sessionStorage:', error);
      }
    }
  },

  /**
   * Save/unsave project
   */
  async toggleSaveProject(projectId, button) {
    if (!Auth.currentUser) {
      alert('Please login to save projects');
      Auth.showLoginModal();
      return;
    }
    
    const isSaved = button.getAttribute('aria-pressed') === 'true';
    const firebaseUser = auth.currentUser;
    
    try {
      if (isSaved) {
        // Unsave project
        if (firebaseUser) {
          // Real Firebase user - use Firestore
          await Database.unsaveProject(Auth.currentUser.id, projectId);
        }
        this.savedProjectIds.delete(projectId);
        // Always save to localStorage as backup
        this.saveSavedIdsToLocalStorage();
        
        button.setAttribute('aria-pressed', 'false');
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:3px"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>Save';
      } else {
        // Save project
        if (firebaseUser) {
          // Real Firebase user - use Firestore
          await Database.saveProject(Auth.currentUser.id, projectId);
        }
        this.savedProjectIds.add(projectId);
        // Always save to localStorage as backup
        this.saveSavedIdsToLocalStorage();
        
        button.setAttribute('aria-pressed', 'true');
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:3px"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>Saved';
      }
      // Refresh dashboard saved list
      this.loadSavedProjects();
    } catch (error) {
      console.error('Error toggling save:', error);
      alert('Error saving project. Please try again.');
    }
  },

  /**
   * Load saved project IDs into cache, then patch all visible save buttons
   */
  async loadSavedIds() {
    if (!Auth.currentUser) return;
    
    // Check if user is authenticated with Firebase
    const firebaseUser = auth.currentUser;
    
    if (firebaseUser) {
      // Real Firebase user - use Firestore
      try {
        const snapshot = await db.collection('savedProjects')
          .where('userId', '==', Auth.currentUser.id)
          .get();
        this.savedProjectIds = new Set();
        snapshot.forEach(doc => this.savedProjectIds.add(doc.data().projectId));
      } catch (e) {
        console.error('Error loading saved IDs from Firestore:', e);
        // Fallback to localStorage
        this.loadSavedIdsFromLocalStorage();
      }
    } else {
      // Fallback account - use localStorage
      this.loadSavedIdsFromLocalStorage();
    }
    
    // Patch any already-rendered buttons on the page
    this._patchSaveButtons();
  },

  /**
   * Load saved project IDs from localStorage (for fallback accounts)
   */
  loadSavedIdsFromLocalStorage() {
    try {
      const key = `recap_saved_projects_${Auth.currentUser.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        this.savedProjectIds = new Set(JSON.parse(saved));
      } else {
        this.savedProjectIds = new Set();
      }
    } catch (e) {
      console.error('Error loading saved IDs from localStorage:', e);
      this.savedProjectIds = new Set();
    }
  },

  /**
   * Save project IDs to localStorage (for fallback accounts)
   */
  saveSavedIdsToLocalStorage() {
    try {
      const key = `recap_saved_projects_${Auth.currentUser.id}`;
      localStorage.setItem(key, JSON.stringify([...this.savedProjectIds]));
    } catch (e) {
      console.error('Error saving IDs to localStorage:', e);
    }
  },

  /**
   * Walk all visible save buttons and set their state from savedProjectIds
   */
  _patchSaveButtons() {
    const savedIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:3px"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;
    const unsavedIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:3px"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;

    document.querySelectorAll('[data-action="save-project"]').forEach(btn => {
      const pid = btn.dataset.projectId;
      if (this.savedProjectIds.has(pid)) {
        btn.setAttribute('aria-pressed', 'true');
        btn.innerHTML = savedIcon + 'Saved';
      } else {
        btn.setAttribute('aria-pressed', 'false');
        btn.innerHTML = unsavedIcon + 'Save';
      }
    });
  },

  /**
   * Load saved projects and render them in the dashboard
   */
  async loadSavedProjects() {
    if (!Auth.currentUser) return;

    const grid = document.getElementById('saved-projects-grid');
    const statCount = document.getElementById('stat-saved-count');
    if (!grid) return;

    grid.innerHTML = '<p class="text-secondary text-md">Loading...</p>';

    try {
      const saved = await Database.fetchSavedProjects(Auth.currentUser.id);

      if (statCount) statCount.textContent = saved.length;

      if (saved.length === 0) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column:1/-1">
            <div class="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3 class="empty-title">No Saved Research Yet</h3>
            <p class="empty-text">Go to the Search page and click Save on any project.</p>
          </div>`;
        return;
      }

      grid.innerHTML = saved.map(project => {
        const authors = Array.isArray(project.authors) ? project.authors[0] + ' et al.' : 'Unknown';
        return `
          <div class="saved-card" data-project-id="${this.escapeHtml(String(project.id))}">
            <div class="saved-title">${this.escapeHtml(project.title)}</div>
            <div class="saved-meta">${this.escapeHtml(authors)} · ${this.escapeHtml(project.program || '')} · ${project.year || ''}</div>
            <div class="saved-actions" style="display:flex;gap:8px;margin-top:8px;align-items:center;">
              <button class="view-btn ripple" data-action="view-saved-project" data-project-id="${this.escapeHtml(String(project.id))}" aria-label="View project details">
                View Details →
              </button>
              <div class="saved-remove" data-action="remove-saved" data-project-id="${this.escapeHtml(String(project.id))}">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Remove
              </div>
            </div>
          </div>`;
      }).join('');

    } catch (error) {
      console.error('Error loading saved projects:', error);
      grid.innerHTML = '<p class="text-secondary text-md">Failed to load saved projects.</p>';
    }
  },

  /**
   * Remove a saved project from the dashboard
   */
  async removeSavedProject(projectId, element) {
    if (!Auth.currentUser) return;

    const card = element.closest('.saved-card');
    if (card) card.style.opacity = '0.4';

    try {
      await Database.unsaveProject(Auth.currentUser.id, projectId);
      this.savedProjectIds.delete(projectId);

      // Flip the Save button back on the search page if it's visible
      const saveBtn = document.querySelector(
        `[data-action="save-project"][data-project-id="${projectId}"]`
      );
      if (saveBtn) {
        saveBtn.setAttribute('aria-pressed', 'false');
        saveBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:3px"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>Save`;
      }

      // Refresh the dashboard grid
      await this.loadSavedProjects();

    } catch (error) {
      console.error('Error removing saved project:', error);
      if (card) card.style.opacity = '1';
      alert('Could not remove project. Please try again.');
    }
  },

  /**
   * Truncate text
   */
  truncate(text, length) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  },

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Initialize projects module
   */
  init() {
    // Projects are loaded by Filters.init() → Filters.apply()
    // so no separate loadProjects() call needed here
    
    // Setup event delegation for project actions
    document.addEventListener('click', (e) => {
      const viewBtn = e.target.closest('[data-action="view-project"]');
      const viewSavedBtn = e.target.closest('[data-action="view-saved-project"]');
      const saveBtn = e.target.closest('[data-action="save-project"]');
      const removeBtn = e.target.closest('[data-action="remove-saved"]');
      
      if (viewBtn) {
        const projectId = viewBtn.dataset.projectId;
        this.viewProject(projectId);
      }

      if (viewSavedBtn) {
        const projectId = viewSavedBtn.dataset.projectId;
        this.viewSavedProject(projectId);
      }
      
      if (saveBtn) {
        const projectId = saveBtn.dataset.projectId;
        this.toggleSaveProject(projectId, saveBtn);
      }

      if (removeBtn) {
        const projectId = removeBtn.dataset.projectId;
        this.removeSavedProject(projectId, removeBtn);
      }
    });
    
    console.log('✓ Projects initialized');
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Projects;
}
