/**
 * Student Submissions Module
 * Displays student's submission history and status
 */

const StudentSubmissions = {
  /**
   * Initialize the module
   */
  init() {
    console.log('✓ Student Submissions initialized');
  },

  /**
   * Load and display student's submissions
   */
  async loadSubmissions() {
    // Check if user is logged in
    if (!Auth.currentUser) {
      return;
    }

    const container = document.getElementById('student-submissions-list');
    if (!container) return;

    try {
      // Show loading state
      container.innerHTML = `
        <div class="text-center text-secondary py-8">
          <div class="spinner" style="margin: 0 auto 16px;"></div>
          <div class="text-md">Loading your submissions...</div>
        </div>
      `;

      // Fetch user's submissions
      const submissions = await Database.fetchUserSubmissions(Auth.currentUser.id);

      if (submissions.length === 0) {
        // No submissions
        container.innerHTML = `
          <div class="text-center text-secondary py-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px; opacity: 0.3;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <div class="text-md">No submissions yet</div>
            <div class="text-sm mt-1">Click "Upload Metadata" to submit your first capstone project</div>
          </div>
        `;
        return;
      }

      // Display submissions
      container.innerHTML = submissions.map(submission => this.renderSubmissionCard(submission)).join('');

    } catch (error) {
      console.error('Error loading submissions:', error);
      container.innerHTML = `
        <div class="text-center text-secondary py-8">
          <div class="text-md text-error">Failed to load submissions</div>
          <div class="text-sm mt-1">Please try refreshing the page</div>
        </div>
      `;
    }
  },

  /**
   * Render a single submission card
   */
  renderSubmissionCard(submission) {
    const statusConfig = this.getStatusConfig(submission.status);
    const submittedDate = submission.submittedAt ? 
      new Date(submission.submittedAt.toDate()).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }) : 'N/A';

    const validatedDate = submission.validatedAt ? 
      new Date(submission.validatedAt.toDate()).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }) : null;

    return `
      <div class="bg-surface-2 rounded-lg border p-4 mb-3">
        <div class="flex justify-between items-start mb-2">
          <div class="flex-1">
            <div class="text-base font-medium text-primary mb-1">${this.escapeHtml(submission.title)}</div>
            <div class="text-sm text-secondary">
              ${Array.isArray(submission.authors) ? submission.authors.join(', ') : submission.authors}
            </div>
          </div>
          <span class="status-badge status-${submission.status}" style="margin-left: 12px;">
            ${statusConfig.icon} ${statusConfig.label}
          </span>
        </div>
        
        <div class="text-sm text-secondary mb-2">
          <strong>Submitted:</strong> ${submittedDate}
        </div>

        ${submission.status === 'approved' ? `
          <div class="text-sm text-success mb-2">
            <strong>✅ Approved:</strong> ${validatedDate}
            ${submission.validatedByName ? `by ${this.escapeHtml(submission.validatedByName)}` : ''}
          </div>
          ${submission.validationNotes ? `
            <div class="text-sm text-secondary mb-2">
              <strong>Note:</strong> ${this.escapeHtml(submission.validationNotes)}
            </div>
          ` : ''}
          <div class="text-sm text-success">
            <strong>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; vertical-align: middle; margin-right: 4px;"><polyline points="20 6 9 17 4 12"/></svg>
              Your capstone is now live on <a href="https://re-caps.web.app/" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">RECAPS</a>!
            </strong>
          </div>
        ` : ''}

        ${submission.status === 'rejected' ? `
          <div class="text-sm text-error mb-2">
            <strong>❌ Rejected:</strong> ${validatedDate}
            ${submission.validatedByName ? `by ${this.escapeHtml(submission.validatedByName)}` : ''}
          </div>
          ${submission.validationNotes ? `
            <div class="text-sm text-secondary mb-2">
              <strong>Reason:</strong> ${this.escapeHtml(submission.validationNotes)}
            </div>
          ` : ''}
          <div class="text-sm text-secondary">
            You can submit a revised version by clicking "Upload Metadata" above.
          </div>
        ` : ''}

        ${submission.status === 'pending' ? `
          <div class="text-sm text-secondary">
            <strong>⏳ Status:</strong> Waiting for librarian review
          </div>
        ` : ''}

        <button 
          class="btn btn-sm btn-secondary mt-3" 
          onclick="StudentSubmissions.viewSubmissionDetails('${submission.id}')"
        >
          View Details
        </button>
      </div>
    `;
  },

  /**
   * Get status configuration
   */
  getStatusConfig(status) {
    const configs = {
      pending: {
        label: 'Pending Review',
        icon: '⏳',
        color: 'orange'
      },
      approved: {
        label: 'Approved',
        icon: '✅',
        color: 'green'
      },
      rejected: {
        label: 'Rejected',
        icon: '❌',
        color: 'red'
      }
    };

    return configs[status] || configs.pending;
  },

  /**
   * View submission details in modal
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
          <div class="modal-container" style="max-width: 700px;">
            <div class="modal-header">
              <h2 class="modal-title">Submission Details</h2>
              <button class="modal-close" onclick="StudentSubmissions.closeDetailModal()" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
              <div class="mb-4">
                <div class="text-sm text-secondary mb-1">Status</div>
                <span class="status-badge status-${data.status}">
                  ${this.getStatusConfig(data.status).icon} ${this.getStatusConfig(data.status).label}
                </span>
              </div>

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

              <div class="mb-4">
                <div class="text-sm text-secondary mb-1">Year</div>
                <div class="text-base">${data.year}</div>
              </div>

              <div class="mb-4">
                <div class="text-sm text-secondary mb-1">Program</div>
                <div class="text-base">${data.program}</div>
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

              ${data.validationNotes ? `
                <div class="mb-4">
                  <div class="text-sm text-secondary mb-1">Librarian Notes</div>
                  <div class="text-base">${this.escapeHtml(data.validationNotes)}</div>
                </div>
              ` : ''}
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" onclick="StudentSubmissions.closeDetailModal()">
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
   * Close detail modal
   */
  closeDetailModal() {
    const modal = document.getElementById('submission-detail-modal');
    if (modal) {
      modal.remove();
    }
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StudentSubmissions;
}
