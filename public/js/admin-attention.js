/**
 * Admin Attention Modal
 * Shows a blocking modal when there are new pending submissions
 */

const AdminAttention = {
  seenSubmissionsKey: 'recap_admin_seen_submissions',

  /**
   * Initialize the attention system
   */
  init() {
    console.log('✓ Admin Attention initialized');
  },

  /**
   * Get list of seen submission IDs
   */
  getSeenSubmissions() {
    try {
      const seen = localStorage.getItem(this.seenSubmissionsKey);
      return seen ? JSON.parse(seen) : [];
    } catch (error) {
      console.error('Error reading seen submissions:', error);
      return [];
    }
  },

  /**
   * Mark submissions as seen
   */
  markAsSeen(submissionIds) {
    try {
      const seen = this.getSeenSubmissions();
      const updated = [...new Set([...seen, ...submissionIds])];
      localStorage.setItem(this.seenSubmissionsKey, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving seen submissions:', error);
    }
  },

  /**
   * Check for new pending submissions and show modal if needed
   */
  async checkForNewSubmissions() {
    // Only check if user is admin or librarian
    if (!Auth.currentUser || !['admin', 'librarian'].includes(Auth.currentUser.role)) {
      return;
    }

    try {
      // Fetch pending submissions
      const submissions = await Database.fetchPendingSubmissions();
      
      if (submissions.length === 0) {
        return; // No pending submissions
      }

      // Get seen submissions
      const seenIds = this.getSeenSubmissions();
      
      // Find new submissions (not seen yet)
      const newSubmissions = submissions.filter(sub => !seenIds.includes(sub.id));
      
      if (newSubmissions.length > 0) {
        // Show attention modal
        this.showAttentionModal(newSubmissions);
      }
    } catch (error) {
      console.error('Error checking for new submissions:', error);
    }
  },

  /**
   * Show attention modal with new submissions
   */
  showAttentionModal(submissions) {
    const count = submissions.length;
    const plural = count > 1 ? 's' : '';
    
    const modalHTML = `
      <div class="modal-overlay" id="admin-attention-modal" style="display: flex; z-index: 10000;">
        <div class="modal-container" style="max-width: 600px; animation: modalSlideIn 0.3s ease-out;">
          <div class="modal-header" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white;">
            <h2 class="modal-title" style="display: flex; align-items: center; color: white;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 12px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Attention Required!
            </h2>
          </div>
          <div class="modal-body" style="padding: 32px 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="width: 80px; height: 80px; margin: 0 auto 16px; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; animation: pulse 2s infinite;">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3 style="font-size: 24px; font-weight: 600; margin-bottom: 12px; color: var(--text-primary);">
                ${count} New Submission${plural} Pending
              </h3>
              <p style="font-size: 16px; color: var(--text-secondary); margin-bottom: 24px;">
                Student${plural} ${count > 1 ? 'have' : 'has'} submitted capstone metadata that require${count === 1 ? 's' : ''} your review and approval.
              </p>
            </div>

            <div style="background: var(--surface-2); border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <div style="font-size: 14px; font-weight: 500; color: var(--text-secondary); margin-bottom: 12px;">
                Recent Submissions:
              </div>
              ${submissions.slice(0, 3).map(sub => `
                <div style="padding: 8px 0; border-bottom: 1px solid var(--border);">
                  <div style="font-size: 14px; font-weight: 500; color: var(--text-primary);">
                    ${this.escapeHtml(sub.title)}
                  </div>
                  <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                    by ${this.escapeHtml(sub.submittedByName)}
                  </div>
                </div>
              `).join('')}
              ${count > 3 ? `
                <div style="padding: 8px 0; font-size: 13px; color: var(--text-secondary); text-align: center;">
                  + ${count - 3} more submission${count - 3 > 1 ? 's' : ''}
                </div>
              ` : ''}
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 12px; margin-bottom: 24px;">
              <div style="display: flex; align-items: start;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#856404" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; flex-shrink: 0; margin-top: 2px;">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <div style="font-size: 13px; color: #856404;">
                  <strong>Action Required:</strong> Please review and approve or reject these submissions to maintain workflow efficiency.
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer" style="justify-content: center;">
            <button class="btn btn-primary" onclick="AdminAttention.acknowledgeAndView()" style="padding: 12px 32px; font-size: 16px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Review Submissions Now
            </button>
          </div>
        </div>
      </div>

      <style>
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }

        #admin-attention-modal .modal-overlay {
          backdrop-filter: blur(4px);
          background: rgba(0, 0, 0, 0.7);
        }
      </style>
    `;

    // Add to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';

    // Store submission IDs to mark as seen when acknowledged
    this.currentNewSubmissions = submissions.map(s => s.id);
  },

  /**
   * Acknowledge modal and navigate to admin panel
   */
  acknowledgeAndView() {
    // Mark submissions as seen
    if (this.currentNewSubmissions) {
      this.markAsSeen(this.currentNewSubmissions);
      this.currentNewSubmissions = null;
    }

    // Close modal
    this.closeAttentionModal();

    // Navigate to admin dashboard
    if (typeof Navigation !== 'undefined') {
      Navigation.switchView('dashboard');
      
      // Switch to admin role tab
      setTimeout(() => {
        const adminTab = document.querySelector('.role-tab[data-role="admin"]');
        if (adminTab && typeof Navigation !== 'undefined') {
          Navigation.switchRole(adminTab, 'admin');
        }
      }, 100);
    }
  },

  /**
   * Close attention modal
   */
  closeAttentionModal() {
    const modal = document.getElementById('admin-attention-modal');
    if (modal) {
      modal.remove();
      document.body.style.overflow = '';
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
  module.exports = AdminAttention;
}
