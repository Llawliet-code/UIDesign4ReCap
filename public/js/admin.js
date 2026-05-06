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
      year: parseInt(document.getElementById('project-year').value.trim()) || new Date().getFullYear(),
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
        this.showNotification('Project updated successfully!', 'success');
      } else {
        // Add new project — Database.addProject returns the ID string directly
        const newId = await Database.addProject(formData);
        if (!newId) throw new Error('Failed to get project ID after adding');
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
      
      // Load pending submissions
      await this.loadPendingSubmissions();
      
    } catch (error) {
      console.error('Error loading projects:', error);
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-red p-5">
            <div class="mb-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="opacity:0.6"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
            <div>Error loading projects. Please try again.</div>
          </td>
        </tr>
      `;
    } finally {
      if (loadingEl) loadingEl.classList.add('hidden');
    }
  },

  /**
   * Toggle pending submissions section
   */
  togglePendingSubmissions() {
    const content = document.getElementById('admin-pending-submissions-content');
    const toggle = document.getElementById('pending-submissions-toggle');
    
    if (!content || !toggle) return;
    
    const isCollapsed = content.style.maxHeight === '0px';
    
    if (isCollapsed) {
      // Expand
      content.style.maxHeight = '2000px';
      toggle.classList.remove('collapsed');
    } else {
      // Collapse
      content.style.maxHeight = '0px';
      toggle.classList.add('collapsed');
    }
  },

  /**
   * Load pending submissions
   */
  async loadPendingSubmissions() {
    const container = document.getElementById('admin-pending-submissions');
    const countBadge = document.getElementById('pending-count');
    
    if (!container) return;
    
    try {
      // Show loading
      container.innerHTML = `
        <div class="text-center text-secondary py-4">
          <div class="spinner" style="margin: 0 auto;"></div>
        </div>
      `;
      
      // Fetch pending submissions
      const submissions = await Database.fetchPendingSubmissions();
      
      // Update count badge
      if (countBadge) {
        countBadge.textContent = `${submissions.length} Pending`;
      }
      
      if (submissions.length === 0) {
        container.innerHTML = `
          <div class="text-center text-secondary py-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px; opacity: 0.3;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <div class="text-md">No pending submissions</div>
          </div>
        `;
        return;
      }
      
      // Display submissions
      container.innerHTML = submissions.map(submission => this.renderPendingSubmission(submission)).join('');
      
    } catch (error) {
      console.error('Error loading pending submissions:', error);
      container.innerHTML = `
        <div class="text-center text-error py-4">
          <div class="text-md">Failed to load submissions</div>
        </div>
      `;
    }
  },

  /**
   * Render a pending submission card
   */
  renderPendingSubmission(submission) {
    const submittedDate = submission.submittedAt ? 
      new Date(submission.submittedAt.toDate()).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'N/A';
    
    return `
      <div class="bg-surface-2 rounded-lg border p-4 mb-3">
        <div class="flex justify-between items-start mb-3">
          <div class="flex-1">
            <div class="text-base font-medium text-primary mb-1">${this.escapeHtml(submission.title)}</div>
            <div class="text-sm text-secondary">
              <strong>Authors:</strong> ${Array.isArray(submission.authors) ? submission.authors.join(', ') : submission.authors}
            </div>
            <div class="text-sm text-secondary">
              <strong>Submitted by:</strong> ${this.escapeHtml(submission.submittedByName)} • ${submittedDate}
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-3 mb-3 text-sm">
          <div>
            <span class="text-secondary">Adviser:</span> ${this.escapeHtml(submission.adviser)}
          </div>
          <div>
            <span class="text-secondary">Year:</span> ${submission.year}
          </div>
          <div>
            <span class="text-secondary">Program:</span> ${submission.program}
          </div>
          <div>
            <span class="text-secondary">Topics:</span> ${Array.isArray(submission.topics) ? submission.topics.slice(0, 2).join(', ') : 'None'}
          </div>
        </div>
        
        <div class="text-sm text-secondary mb-3">
          <strong>Abstract:</strong> ${this.escapeHtml(submission.abstract).substring(0, 150)}${submission.abstract.length > 150 ? '...' : ''}
        </div>
        
        <div class="flex gap-2">
          <button 
            class="btn btn-sm btn-success" 
            onclick="Admin.approveSubmission('${submission.id}')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><polyline points="20 6 9 17 4 12"/></svg>
            Approve & Publish
          </button>
          <button 
            class="btn btn-sm btn-error" 
            onclick="Admin.rejectSubmission('${submission.id}')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Reject
          </button>
          <button 
            class="btn btn-sm btn-secondary" 
            onclick="Admin.viewSubmissionDetails('${submission.id}')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            View Details
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Approve submission
   */
  async approveSubmission(submissionId) {
    const notes = prompt('Add approval notes (optional):');
    
    if (notes === null) return; // User cancelled
    
    if (!Auth.currentUser) {
      alert('You must be logged in to approve submissions');
      return;
    }
    
    try {
      await Database.approveSubmission(
        submissionId,
        Auth.currentUser.id,
        Auth.currentUser.name,
        notes
      );
      
      this.showNotification('Submission approved and published to RECAPS!', 'success');
      
      // Reload both submissions and projects
      await this.loadPendingSubmissions();
      await this.loadProjects();
      
    } catch (error) {
      console.error('Error approving submission:', error);
      this.showNotification('Failed to approve submission. Please try again.', 'error');
    }
  },

  /**
   * Reject submission
   */
  async rejectSubmission(submissionId) {
    const reason = prompt('Enter rejection reason (required):');
    
    if (!reason || reason.trim() === '') {
      alert('Rejection reason is required');
      return;
    }
    
    if (!Auth.currentUser) {
      alert('You must be logged in to reject submissions');
      return;
    }
    
    const confirmed = confirm('Are you sure you want to reject this submission?');
    if (!confirmed) return;
    
    try {
      await Database.rejectSubmission(
        submissionId,
        Auth.currentUser.id,
        Auth.currentUser.name,
        reason
      );
      
      this.showNotification('Submission rejected', 'success');
      
      // Reload submissions
      await this.loadPendingSubmissions();
      
    } catch (error) {
      console.error('Error rejecting submission:', error);
      this.showNotification('Failed to reject submission. Please try again.', 'error');
    }
  },

  /**
   * View submission details
   */
  async viewSubmissionDetails(submissionId) {
    try {
      const submission = await db.collection('submissions').doc(submissionId).get();
      
      if (!submission.exists) {
        alert('Submission not found');
        return;
      }
      
      const data = submission.data();
      
      // Create modal content
      const modalContent = `
        <div class="modal-overlay" id="submission-detail-modal" style="display: flex;">
          <div class="modal-container" style="max-width: 800px;">
            <div class="modal-header">
              <h2 class="modal-title">Submission Details</h2>
              <button class="modal-close" onclick="Admin.closeSubmissionDetailModal()" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
              <div class="mb-4">
                <div class="text-sm text-secondary mb-1">Title</div>
                <div class="text-base font-medium">${this.escapeHtml(data.title)}</div>
              </div>

              <div class="mb-4">
                <div class="text-sm text-secondary mb-1">Authors</div>
                <div class="text-base">${Array.isArray(data.authors) ? data.authors.join(', ') : data.authors}</div>
              </div>

              <div class="mb-4">
                <div class="text-sm text-secondary mb-1">Adviser</div>
                <div class="text-base">${this.escapeHtml(data.adviser)}</div>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div class="text-sm text-secondary mb-1">Year</div>
                  <div class="text-base">${data.year}</div>
                </div>
                <div>
                  <div class="text-sm text-secondary mb-1">Program</div>
                  <div class="text-base">${data.program}</div>
                </div>
              </div>

              <div class="mb-4">
                <div class="text-sm text-secondary mb-1">Abstract</div>
                <div class="text-base">${this.escapeHtml(data.abstract)}</div>
              </div>

              ${data.topics && data.topics.length > 0 ? `
                <div class="mb-4">
                  <div class="text-sm text-secondary mb-1">Topics</div>
                  <div class="text-base">${data.topics.join(', ')}</div>
                </div>
              ` : ''}

              ${data.keywords && data.keywords.length > 0 ? `
                <div class="mb-4">
                  <div class="text-sm text-secondary mb-1">Keywords</div>
                  <div class="text-base">${data.keywords.join(', ')}</div>
                </div>
              ` : ''}

              ${data.findings ? `
                <div class="mb-4">
                  <div class="text-sm text-secondary mb-1">Key Findings</div>
                  <div class="text-base">${this.escapeHtml(data.findings)}</div>
                </div>
              ` : ''}

              <div class="mb-4">
                <div class="text-sm text-secondary mb-1">Submitted By</div>
                <div class="text-base">${this.escapeHtml(data.submittedByName)} (${this.escapeHtml(data.submittedByEmail || 'No email')})</div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-success" onclick="Admin.approveSubmission('${submissionId}'); Admin.closeSubmissionDetailModal();">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><polyline points="20 6 9 17 4 12"/></svg>
                Approve & Publish
              </button>
              <button class="btn btn-error" onclick="Admin.rejectSubmission('${submissionId}'); Admin.closeSubmissionDetailModal();">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Reject
              </button>
              <button class="btn btn-secondary" onclick="Admin.closeSubmissionDetailModal()">
                Close
              </button>
            </div>
          </div>
        </div>
      `;

      // Add to body
      document.body.insertAdjacentHTML('beforeend', modalContent);

    } catch (error) {
      console.error('Error viewing submission:', error);
      alert('Failed to load submission details');
    }
  },

  /**
   * Close submission detail modal
   */
  closeSubmissionDetailModal() {
    const modal = document.getElementById('submission-detail-modal');
    if (modal) {
      modal.remove();
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
            <div class="mb-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="opacity:0.4"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </button>
            <button class="admin-btn admin-btn-delete ripple" data-action="delete-project" data-project-id="${project.id}" data-project-title="${this.escapeHtml(project.title)}">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              Delete
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
