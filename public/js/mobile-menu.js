/**
 * Mobile Menu Handler
 * Manages responsive navigation menu
 */

const MobileMenu = {
  /**
   * Initialize mobile menu
   */
  init() {
    const menuBtn = document.getElementById('nav-mobile-menu-btn');
    const menu = document.getElementById('nav-mobile-menu');
    
    if (!menuBtn || !menu) return;
    
    // Toggle menu on button click
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMenu();
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
        this.closeMenu();
      }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('active')) {
        this.closeMenu();
      }
    });
    
    // Update menu items based on auth state
    this.updateMenuItems();
    
    console.log('✓ Mobile menu initialized');
  },
  
  /**
   * Toggle mobile menu
   */
  toggleMenu() {
    const menu = document.getElementById('nav-mobile-menu');
    const menuBtn = document.getElementById('nav-mobile-menu-btn');
    
    if (!menu || !menuBtn) return;
    
    const isActive = menu.classList.toggle('active');
    menuBtn.setAttribute('aria-expanded', isActive);
    
    // Update menu items when opening
    if (isActive) {
      this.updateMenuItems();
    }
  },
  
  /**
   * Close mobile menu
   */
  closeMenu() {
    const menu = document.getElementById('nav-mobile-menu');
    const menuBtn = document.getElementById('nav-mobile-menu-btn');
    
    if (!menu || !menuBtn) return;
    
    menu.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
  },
  
  /**
   * Update menu items based on authentication state
   */
  updateMenuItems() {
    const isLoggedIn = typeof Auth !== 'undefined' && Auth.currentUser !== null;
    
    // Auth items (login/signup)
    const authItems = document.querySelectorAll('.mobile-auth-item');
    authItems.forEach(item => {
      item.style.display = isLoggedIn ? 'none' : 'flex';
    });
    
    // User menu item
    const userItem = document.getElementById('mobile-user-item');
    if (userItem) {
      if (isLoggedIn) {
        userItem.classList.remove('hidden');
        userItem.style.display = 'flex';
        
        // Update user name
        const userNameText = document.getElementById('mobile-user-name-text');
        if (userNameText && Auth.currentUser) {
          userNameText.textContent = Auth.currentUser.name || 'User Menu';
        }
      } else {
        userItem.classList.add('hidden');
        userItem.style.display = 'none';
      }
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileMenu;
}
