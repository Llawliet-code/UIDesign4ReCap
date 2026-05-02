/**
 * Librarian Module
 * Handles librarian panel operations and metadata uploads
 */

const Librarian = {
  currentProjects: [],

  /**
   * Show upload metadata modal (reuses admin project modal)
   */
  showUploadModal() {
    // Reuse the admin project modal
    document.getElementById('project-modal-title').textContent = 'Upload Project Metadata';
    document.getElementById('project-form').reset();
    document.getElementById('project-id').value = '';
    document.getElementById('project-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  /**
   * Load recent uploads
   */
  async loadRecentUploads() {
    try {
      // Fetch all projects, sorted by creation date
      const projects = await Database.fetchProjects({});
      
      // Sort by createdAt (most recent first)
      const sortedProjects = projects.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      // Take only the 10 most recent
      this.currentProjects = sortedProjects.slice(0, 10);
      
      // Update statistics
      this.updateStatistics(projects);
      
      // Display recent uploads
      this.displayRecentUploads(this.currentProjects);
      
    } catch (error) {
      console.error('Error loading recent uploads:', error);
    }
  },

  /**
   * Display recent uploads in table
   */
  displayRecentUploads(projects) {
    const container = document.querySelector('#dash-librarian .flex-col.gap-1');
    
    if (!container) return;
    
    if (projects.length === 0) {
      container.innerHTML = `
        <div class="text-center text-secondary p-5">
          <div class="mb-2">📚</div>
          <div>No projects uploaded yet.</div>
        </div>
      `;
      return;
    }
    
    container.innerHTML = projects.map(project => {
      const status = project.status || 'Published';
      const statusClass = status.toLowerCase() === 'pending' ? 'status-pending' : 'status-published';
      const rowClass = status.toLowerCase() === 'pending' ? 'librarian-table-row-pending' : '';
      
      return `
        <div class="librarian-table-row ${rowClass}">
          <span class="text-primary" title="${this.escapeHtml(project.title)}">
            ${this.escapeHtml(this.truncate(project.title, 50))}
          </span>
          <span class="text-secondary">${project.program || 'N/A'}</span>
          <span class="text-secondary">${project.year || 'N/A'}</span>
          <span class="${statusClass}">${status}</span>
        </div>
      `;
    }).join('');
  },

  /**
   * Update statistics
   */
  updateStatistics(projects) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    const totalProjects = projects.length;
    const pendingProjects = projects.filter(p => p.status === 'Pending').length;
    const thisMonthProjects = projects.filter(p => {
      if (!p.createdAt) return false;
      const createdDate = p.createdAt.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
      return createdDate.getFullYear() === currentYear && createdDate.getMonth() === currentMonth;
    }).length;
    
    // Update stat cards
    const statCards = document.querySelectorAll('#dash-librarian .stat-card .stat-num');
    if (statCards[0]) statCards[0].textContent = totalProjects;
    if (statCards[1]) statCards[1].textContent = pendingProjects;
    if (statCards[2]) statCards[2].textContent = thisMonthProjects;
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
   * Initialize librarian module
   */
  init() {
    console.log('✓ Librarian initialized');
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Librarian;
}
