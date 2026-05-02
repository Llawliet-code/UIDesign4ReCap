/**
 * Admin Module
 * Handles admin panel CRUD operations
 */

const Admin = {
  currentProjects: [],
  editingProjectId: null,

  /**
   * Show add project modal
   */
  showAddProjectModal() {
    this.editingProjectId = null;
    document.getElementById('project-modal-title').textContent = 'Add New Project';
    document.getElementById('project-form').reset();
    document.getElementById('project-id').value = '';
    document.getElementById('project-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  /**
   * Show edit project modal
   */
  showEditProjectModal(project) {
    this.editingProjectId = project.id;
    document.getElementById('project-modal-title').textContent = 'Edit Project';
    
    // Fill form with project data
    document.getElementById('project-id').value = project.id;
    document.getElementById('project-title').value = project.title || '';
    document.getElementById('project-authors').value = Array.isArray(project.authors) ? project.authors.join(', ') : '';
    document.getElementById('project-adviser').value = project.adviser || '';
    document.getElementById('project-year').value = project.year || '';
    document.getElementById('project-program').value = project.program || '';
    document.getElementById('project-abstract').value = project.abstract || '';
    document.getElementById('project-topics').value = Array.isArray(project.topics) ? project.topics.join(', ') : '';
    document.getElementById('project-keywords').value = Array.isArray(project.keywords) ? project.keywords.join(', ') : '';
    document.getElementById('project-findings').value = project.findings || '';
    
    document.getElementById('project-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  /**
   * Close project modal
   */
  closeProjectModal() {
    document.getElementById('project-modal').classList.add('hidden');
    document.body.style.overflow = '';
    this.editingProjectId = null;
  },

  /**
   * Handle project form submission
   */
  async handleProjectSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
      title: document.getElementById('project-title').value.trim(),
      authors: document.getElementById('project-authors').value.split(',').map(a => a.trim()).filter(a => a),
      adviser: document.getElementById('project-adviser').value.trim(),
      year: document.getElementById('project-year').value.trim(), // Keep as string
      program: document.getElementById('project-program').value,
      abstract: document.getElementById('project-abstract').value.trim(),
      topics: document.getElementById('project-topics').value.split(',').map(t => t.trim()).filter(t => t),
      keywords: document.getElementById('project-keywords').value.split(',').map(k => k.trim()).filter(k => k),
      findings: document.getElementById('project-findings').value.trim()
    };
    
    // Set button loading state
    this.setButtonLoading(true);
    
    try {
      let projectId;
      
      if (this.editingProjectId) {
        // Update existing project
        await Database.updateProject(this.editingProjectId, formData);
        projectId = this.editingProjectId;
        this.showNotification('Project updated successfully!', 'success');
      } else {
        // Add new project
        const result = await Database.addProject(formData);
        projectId = result.id;
        this.showNotification('Project added successfully!', 'success');
      }
      
      // Close modal and refresh
      this.closeProjectModal();
      await this.loadProjects();
      
    } catch (error) {
      console.error('Error saving project:', error);
      this.showNotification('Error saving project. Please try again.', 'error');
    } finally {
      this.setButtonLoading(false);
    }
  },

  /**
   * Delete project
   */
  async deleteProject(projectId, projectTitle) {
    const confirmed = confirm(`Are you sure you want to delete "${projectTitle}"?\n\nThis action cannot be undone.`);
    
    if (!confirmed) return;
    
    try {
      await Database.deleteProject(projectId);
      this.showNotification('Project deleted successfully!', 'success');
      
      await this.loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      this.showNotification('Error deleting project. Please try again.', 'error');
    }
  },

  /**
   * Load all projects
   */
  async loadProjects(filters = {}) {
    const loadingEl = document.getElementById('admin-loading');
    const tableBody = document.getElementById('admin-projects-table');
    
    // Show loading
    if (loadingEl) loadingEl.classList.remove('hidden');
    
    try {
      // Fetch projects from database
      const projects = await Database.fetchProjects(filters);
      this.currentProjects = projects;
      
      // Update statistics
      this.updateStatistics(projects);
      
      // Display projects in table
      this.displayProjects(projects);
      
    } catch (error) {
      console.error('Error loading projects:', error);
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-red p-5">
            <div class="mb-2">⚠️</div>
            <div>Error loading projects. Please try again.</div>
          </td>
        </tr>
      `;
    } finally {
      if (loadingEl) loadingEl.classList.add('hidden');
    }
  },

  /**
   * Display projects in table
   */
  displayProjects(projects) {
    const tableBody = document.getElementById('admin-projects-table');
    
    if (!projects || projects.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-secondary p-5">
            <div class="mb-2">📚</div>
            <div>No projects found. Click "Add New Project" to get started.</div>
          </td>
        </tr>
      `;
      return;
    }
    
    tableBody.innerHTML = projects.map(project => `
      <tr>
        <td>
          <div class="admin-table-title" title="${this.escapeHtml(project.title)}">
            ${this.escapeHtml(project.title)}
          </div>
        </td>
        <td>
          <div class="admin-table-authors" title="${this.escapeHtml(Array.isArray(project.authors) ? project.authors.join(', ') : '')}">
            ${this.escapeHtml(Array.isArray(project.authors) ? project.authors.join(', ') : '')}
          </div>
        </td>
        <td>${project.year || 'N/A'}</td>
        <td>${project.program || 'N/A'}</td>
        <td>
          <div class="admin-table-topics">
            ${Array.isArray(project.topics) ? project.topics.slice(0, 2).map(topic => 
              `<span class="admin-topic-tag">${this.escapeHtml(topic)}</span>`
            ).join('') : ''}
            ${Array.isArray(project.topics) && project.topics.length > 2 ? 
              `<span class="admin-topic-tag">+${project.topics.length - 2}</span>` : ''}
          </div>
        </td>
        <td>
          <div class="admin-actions">
            <button class="admin-btn admin-btn-edit ripple" data-action="edit-project" data-project-id="${project.id}">
              ✏️ Edit
            </button>
            <button class="admin-btn admin-btn-delete ripple" data-action="delete-project" data-project-id="${project.id}" data-project-title="${this.escapeHtml(project.title)}">
              🗑️ Delete
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  /**
   * Update statistics
   */
  updateStatistics(projects) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    const totalProjects = projects.length;
    const thisYearProjects = projects.filter(p => p.year === currentYear).length;
    const thisMonthProjects = projects.filter(p => {
      if (!p.createdAt) return false;
      const createdDate = p.createdAt.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
      return createdDate.getFullYear() === currentYear && createdDate.getMonth() === currentMonth;
    }).length;
    
    document.getElementById('admin-total-projects').textContent = totalProjects;
    document.getElementById('admin-this-year').textContent = thisYearProjects;
    document.getElementById('admin-this-month').textContent = thisMonthProjects;
  },

  /**
   * Handle search
   */
  async handleSearch() {
    const keyword = document.getElementById('admin-search').value.trim();
    
    if (!keyword) {
      this.displayProjects(this.currentProjects);
      return;
    }
    
    const filtered = this.currentProjects.filter(project => {
      const searchText = `${project.title} ${project.authors?.join(' ')} ${project.keywords?.join(' ')}`.toLowerCase();
      return searchText.includes(keyword.toLowerCase());
    });
    
    this.displayProjects(filtered);
  },

  /**
   * Handle filter change
   */
  async handleFilterChange() {
    const year = document.getElementById('admin-filter-year').value;
    const program = document.getElementById('admin-filter-program').value;
    
    const filters = {};
    if (year) filters.year = parseInt(year);
    if (program) filters.program = program;
    
    await this.loadProjects(filters);
  },

  /**
   * Set button loading state
   */
  setButtonLoading(loading) {
    const button = document.getElementById('project-submit');
    const btnText = button.querySelector('.btn-text');
    const btnSpinner = button.querySelector('.btn-spinner');
    
    if (loading) {
      button.disabled = true;
      btnText.classList.add('hidden');
      btnSpinner.classList.remove('hidden');
    } else {
      button.disabled = false;
      btnText.classList.remove('hidden');
      btnSpinner.classList.add('hidden');
    }
  },

  /**
   * Show notification
   */
  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 24px;
      background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Initialize admin panel
   */
  init() {
    // Setup form submission
    const form = document.getElementById('project-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleProjectSubmit(e));
    }
    
    // Setup search
    const searchInput = document.getElementById('admin-search');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => this.handleSearch(), 300);
      });
    }
    
    // Setup filters
    const yearFilter = document.getElementById('admin-filter-year');
    const programFilter = document.getElementById('admin-filter-program');
    
    if (yearFilter) {
      yearFilter.addEventListener('change', () => this.handleFilterChange());
    }
    if (programFilter) {
      programFilter.addEventListener('change', () => this.handleFilterChange());
    }
    
    // Setup event delegation for edit/delete buttons
    document.addEventListener('click', (e) => {
      const editBtn = e.target.closest('[data-action="edit-project"]');
      const deleteBtn = e.target.closest('[data-action="delete-project"]');
      
      if (editBtn) {
        const projectId = editBtn.dataset.projectId;
        const project = this.currentProjects.find(p => p.id === projectId);
        if (project) this.showEditProjectModal(project);
      }
      
      if (deleteBtn) {
        const projectId = deleteBtn.dataset.projectId;
        const projectTitle = deleteBtn.dataset.projectTitle;
        this.deleteProject(projectId, projectTitle);
      }
    });
    
    console.log('✓ Admin initialized');
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Admin;
}
