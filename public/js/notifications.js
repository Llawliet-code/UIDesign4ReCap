/**
 * Notifications Module
 * Handles notification display and management
 */

const Notifications = {
  notifications: [],
  maxNotifications: 50,
  
  /**
   * Initialize notifications
   */
  init() {
    // Load notifications from localStorage
    this.loadNotifications();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Update badge
    this.updateBadge();
    
    console.log('✓ Notifications initialized');
  },
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Toggle notification panel
    const notificationBtn = document.getElementById('notification-btn');
    if (notificationBtn) {
      notificationBtn.addEventListener('click', () => {
        this.togglePanel();
      });
    }
    
    // Mark all as read
    const markAllReadBtn = document.getElementById('mark-all-read-btn');
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener('click', () => {
        this.markAllAsRead();
      });
    }
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('notification-panel');
      const btn = document.getElementById('notification-btn');
      const backdrop = document.getElementById('notification-backdrop');
      
      if (panel && !panel.contains(e.target) && !btn.contains(e.target)) {
        this.closePanel();
      }
      
      // Close when clicking backdrop
      if (backdrop && e.target === backdrop) {
        this.closePanel();
      }
    });
  },
  
  /**
   * Toggle notification panel
   */
  togglePanel() {
    const panel = document.getElementById('notification-panel');
    const backdrop = document.getElementById('notification-backdrop');
    
    if (panel) {
      const isHidden = panel.classList.contains('hidden');
      
      panel.classList.toggle('hidden');
      if (backdrop) {
        backdrop.classList.toggle('hidden');
      }
      
      if (isHidden) {
        // Opening panel
        this.renderNotifications();
      }
    }
  },
  
  /**
   * Close notification panel
   */
  closePanel() {
    const panel = document.getElementById('notification-panel');
    const backdrop = document.getElementById('notification-backdrop');
    
    if (panel) {
      panel.classList.add('hidden');
    }
    if (backdrop) {
      backdrop.classList.add('hidden');
    }
  },
  
  /**
   * Add a new notification
   */
  addNotification(notification) {
    const newNotification = {
      id: Date.now() + Math.random(),
      title: notification.title || 'Notification',
      message: notification.message || '',
      type: notification.type || 'info', // info, success, warning, error
      timestamp: Date.now(),
      read: false,
      action: notification.action || null
    };
    
    // Add to beginning of array
    this.notifications.unshift(newNotification);
    
    // Limit notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }
    
    // Save to localStorage
    this.saveNotifications();
    
    // Update UI
    this.updateBadge();
    this.renderNotifications();
    
    console.log('✓ Notification added:', newNotification.title);
    
    return newNotification.id;
  },
  
  /**
   * Mark notification as read
   */
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.updateBadge();
      this.renderNotifications();
    }
  },
  
  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.updateBadge();
    this.renderNotifications();
    console.log('✓ All notifications marked as read');
  },
  
  /**
   * Delete notification
   */
  deleteNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
    this.updateBadge();
    this.renderNotifications();
  },
  
  /**
   * Clear all notifications
   */
  clearAll() {
    this.notifications = [];
    this.saveNotifications();
    this.updateBadge();
    this.renderNotifications();
    console.log('✓ All notifications cleared');
  },
  
  /**
   * Get unread count
   */
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  },
  
  /**
   * Update notification badge
   */
  updateBadge() {
    const badge = document.getElementById('notification-badge');
    const unreadCount = this.getUnreadCount();
    
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  },
  
  /**
   * Render notifications in panel
   */
  renderNotifications() {
    const listContainer = document.getElementById('notification-list');
    if (!listContainer) return;
    
    // Clear existing content
    listContainer.innerHTML = '';
    
    if (this.notifications.length === 0) {
      // Show empty state
      listContainer.innerHTML = `
        <div class="notification-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.3;">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <p>No notifications</p>
        </div>
      `;
      return;
    }
    
    // Render each notification
    this.notifications.forEach(notification => {
      const item = this.createNotificationElement(notification);
      listContainer.appendChild(item);
    });
  },
  
  /**
   * Create notification element
   */
  createNotificationElement(notification) {
    const item = document.createElement('div');
    item.className = `notification-item ${notification.read ? '' : 'unread'}`;
    item.setAttribute('data-notification-id', notification.id);
    
    // Get icon based on type
    const icon = this.getIconForType(notification.type);
    
    // Format time
    const timeAgo = this.formatTimeAgo(notification.timestamp);
    
    item.innerHTML = `
      <div class="notification-item-header">
        <div class="notification-item-icon ${notification.type}">
          ${icon}
        </div>
        <div class="notification-item-content">
          <h4 class="notification-item-title">${notification.title}</h4>
          <p class="notification-item-message">${notification.message}</p>
          <span class="notification-item-time">${timeAgo}</span>
        </div>
      </div>
    `;
    
    // Add click handler
    item.addEventListener('click', () => {
      this.markAsRead(notification.id);
      
      // Execute action if provided
      if (notification.action && typeof notification.action === 'function') {
        notification.action();
      }
      
      this.closePanel();
    });
    
    return item;
  },
  
  /**
   * Get icon SVG for notification type
   */
  getIconForType(type) {
    const icons = {
      info: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
      success: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      warning: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      error: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
    };
    
    return icons[type] || icons.info;
  },
  
  /**
   * Format timestamp to relative time
   */
  formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    // Format as date
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },
  
  /**
   * Save notifications to localStorage
   */
  saveNotifications() {
    try {
      localStorage.setItem('recap_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  },
  
  /**
   * Load notifications from localStorage
   */
  loadNotifications() {
    try {
      const saved = localStorage.getItem('recap_notifications');
      if (saved) {
        this.notifications = JSON.parse(saved);
        console.log(`✓ Loaded ${this.notifications.length} notifications`);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.notifications = [];
    }
  },
  
  /**
   * Create sample notifications (for testing)
   */
  createSampleNotifications() {
    this.addNotification({
      title: 'Welcome to RECAP!',
      message: 'Your account has been successfully created. Start exploring capstone projects now.',
      type: 'success'
    });
    
    this.addNotification({
      title: 'New Project Uploaded',
      message: 'A new BSIT capstone project "IoT Smart Farming System" has been added to the repository.',
      type: 'info'
    });
    
    this.addNotification({
      title: 'Submission Approved',
      message: 'Your capstone project submission has been approved by your adviser.',
      type: 'success'
    });
    
    console.log('✓ Sample notifications created');
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Notifications;
}
