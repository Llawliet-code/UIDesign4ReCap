# 🔧 Code Refactoring Guide

**How to reorganize your code for better structure**

---

## 📁 New Folder Structure

```
TempUICAPSTONEREP/
├── index.html                    ← Clean HTML (no inline styles/scripts)
├── assets/
│   ├── css/
│   │   ├── base.css             ← Reset & variables
│   │   ├── layout.css           ← Grid, navigation, structure
│   │   ├── components.css       ← Buttons, cards, forms
│   │   ├── pages.css            ← Page-specific styles
│   │   └── utilities.css        ← Helper classes
│   ├── js/
│   │   ├── config.js            ← Configuration & constants
│   │   ├── theme.js             ← Dark mode functionality
│   │   ├── navigation.js        ← Page switching & tabs
│   │   ├── search.js            ← Search & filters
│   │   ├── chat.js              ← Chatbot functionality
│   │   ├── dashboard.js         ← Dashboard features
│   │   └── main.js              ← Initialize everything
│   └── images/
│       └── (future images)
└── docs/
    ├── README.md
    ├── QUICK_START.md
    ├── FEATURES.md
    └── TROUBLESHOOTING.md
```

---

## 🎯 Step-by-Step Refactoring

### Step 1: Create Folder Structure

```bash
# Create folders
mkdir assets
mkdir assets\css
mkdir assets\js
mkdir assets\images
mkdir docs

# Move existing docs
move README.md docs\
move QUICK_START.md docs\
move FEATURES.md docs\
move TROUBLESHOOTING.md docs\
```

---

### Step 2: Split CSS into Modules

#### **assets/css/base.css** - Foundation
```css
/* Variables, resets, fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  /* Light mode colors */
  --ctu-blue: #1A4F8A;
  --ctu-orange: #E87722;
  /* ... all CSS variables ... */
}

[data-theme="dark"] {
  /* Dark mode colors */
}

body {
  font-family: 'Inter', sans-serif;
  background: var(--surface-2);
  color: var(--text-primary);
}
```

#### **assets/css/layout.css** - Structure
```css
/* Navigation, grids, page structure */
.nav { /* ... */ }
.page-tabs { /* ... */ }
.content-grid { /* ... */ }
.sidebar { /* ... */ }
```

#### **assets/css/components.css** - Reusable Parts
```css
/* Buttons, cards, forms, modals */
.btn { /* ... */ }
.result-card { /* ... */ }
.chat-panel { /* ... */ }
```

#### **assets/css/pages.css** - Page-Specific
```css
/* Hero, dashboard, detail page styles */
.hero { /* ... */ }
.dash-header { /* ... */ }
.detail-grid { /* ... */ }
```

#### **assets/css/utilities.css** - Helpers
```css
/* Utility classes */
.fade-in { /* ... */ }
.ripple { /* ... */ }
.sr-only { /* ... */ }
```

---

### Step 3: Split JavaScript into Modules

#### **assets/js/config.js** - Settings
```javascript
// Configuration and constants
const CONFIG = {
  SEARCH_DEBOUNCE_MS: 300,
  ANIMATION_DURATION: 250,
  THEME_STORAGE_KEY: 'theme',
  SUGGESTION_RESPONSES: {
    'How do I upload my abstract?': '...',
    // ... more responses
  }
};

export default CONFIG;
```

#### **assets/js/theme.js** - Dark Mode
```javascript
// Theme management
class ThemeManager {
  constructor() {
    this.init();
  }

  init() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setTheme(saved || (prefersDark ? 'dark' : 'light'));
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.updateIcon(theme);
  }

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    this.setTheme(current === 'light' ? 'dark' : 'light');
  }

  updateIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

export default ThemeManager;
```

#### **assets/js/navigation.js** - Page Switching
```javascript
// Navigation and tab management
class NavigationManager {
  switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
      view.setAttribute('aria-hidden', 'true');
    });

    // Show selected view
    const activeView = document.getElementById(`view-${viewName}`);
    if (activeView) {
      activeView.classList.add('active');
      activeView.setAttribute('aria-hidden', 'false');
    }

    // Update tabs
    this.updateTabs(viewName);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateTabs(viewName) {
    const tabs = document.querySelectorAll('.tab');
    const index = { landing: 0, dashboard: 1, detail: 2, chatbot: 3 }[viewName];
    
    tabs.forEach((tab, i) => {
      const isActive = i === index;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive);
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  }

  setupKeyboardNav() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach((tab, index) => {
      tab.addEventListener('keydown', (e) => {
        this.handleTabKeydown(e, tabs, index);
      });
    });
  }

  handleTabKeydown(event, tabs, currentIndex) {
    let newIndex = currentIndex;
    
    switch(event.key) {
      case 'ArrowRight':
        event.preventDefault();
        newIndex = (currentIndex + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }
    
    tabs[newIndex].click();
    tabs[newIndex].focus();
  }
}

export default NavigationManager;
```

#### **assets/js/search.js** - Search & Filters
```javascript
// Search and filter functionality
class SearchManager {
  constructor() {
    this.searchTimeout = null;
    this.activeFilters = [];
  }

  handleSearch(query) {
    clearTimeout(this.searchTimeout);
    
    this.searchTimeout = setTimeout(() => {
      console.log('Searching for:', query);
      this.showLoading();
      
      // Simulate API call
      setTimeout(() => {
        this.hideLoading();
        this.updateResults(query);
      }, 800);
    }, 300); // Debounce delay
  }

  showLoading() {
    const skeleton = document.getElementById('loading-skeleton');
    if (skeleton) {
      skeleton.style.display = 'block';
      skeleton.setAttribute('aria-busy', 'true');
    }
  }

  hideLoading() {
    const skeleton = document.getElementById('loading-skeleton');
    if (skeleton) {
      skeleton.style.display = 'none';
      skeleton.setAttribute('aria-busy', 'false');
    }
  }

  updateResults(query) {
    const resultsCount = document.querySelector('.results-count');
    if (resultsCount) {
      resultsCount.innerHTML = `Showing <strong>42</strong> results for "${query}"`;
    }
  }

  handleFilterChange() {
    this.activeFilters = [];
    
    document.querySelectorAll('.filter-checkbox:checked').forEach(checkbox => {
      const label = document.querySelector(`label[for="${checkbox.id}"]`);
      if (label) {
        this.activeFilters.push({
          id: checkbox.id,
          text: label.textContent
        });
      }
    });
    
    this.updateFilterChips();
  }

  updateFilterChips() {
    const container = document.getElementById('active-filters');
    if (!container) return;
    
    container.innerHTML = '';
    
    this.activeFilters.forEach(filter => {
      const chip = document.createElement('div');
      chip.className = 'filter-chip';
      chip.innerHTML = `
        ${filter.text}
        <span class="filter-chip-remove" 
              data-filter-id="${filter.id}" 
              aria-label="Remove ${filter.text} filter">×</span>
      `;
      container.appendChild(chip);
    });
    
    // Add event listeners to remove buttons
    container.querySelectorAll('.filter-chip-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filterId = e.target.getAttribute('data-filter-id');
        this.removeFilter(filterId);
      });
    });
  }

  removeFilter(filterId) {
    const checkbox = document.getElementById(filterId);
    if (checkbox) {
      checkbox.checked = false;
      this.handleFilterChange();
    }
  }
}

export default SearchManager;
```

#### **assets/js/chat.js** - Chatbot
```javascript
// Chatbot functionality
class ChatManager {
  constructor() {
    this.suggestionResponses = {
      'How do I upload my abstract?': '...',
      'Show me IoT projects from 2024 using Arduino': '...',
      'Summarize research trends in 2025': '...'
    };
  }

  toggleChat() {
    const panel = document.getElementById('chat-panel');
    panel.classList.toggle('open');
    
    const isOpen = panel.classList.contains('open');
    panel.setAttribute('aria-hidden', !isOpen);
    
    if (isOpen) {
      const input = document.getElementById('chat-input');
      if (input) setTimeout(() => input.focus(), 100);
    }
  }

  sendMessage(inputId, messagesId) {
    const input = document.getElementById(inputId);
    const messages = document.getElementById(messagesId);
    
    if (!input.value.trim()) return;
    
    // Add user message
    this.addMessage(messages, input.value, 'user');
    input.value = '';
    
    // Show typing indicator
    this.showTyping(messages);
    
    // Simulate bot response
    setTimeout(() => {
      this.hideTyping(messages);
      this.addMessage(messages, "Let me search the repository for you...", 'bot');
    }, 1200);
  }

  addMessage(container, text, type) {
    const msg = document.createElement('div');
    msg.className = `msg msg-${type}`;
    msg.textContent = text;
    msg.setAttribute('role', 'log');
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  }

  showTyping(container) {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing-temp';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
  }

  hideTyping(container) {
    const indicator = container.querySelector('#typing-temp');
    if (indicator) indicator.remove();
  }

  sendSuggestion(text, messagesId) {
    const messages = document.getElementById(messagesId);
    const suggestions = document.getElementById('inline-suggestions');
    
    if (suggestions) suggestions.style.display = 'none';
    
    this.addMessage(messages, text, 'user');
    this.showTyping(messages);
    
    setTimeout(() => {
      this.hideTyping(messages);
      const response = this.suggestionResponses[text] || 'Great question!';
      this.addMessage(messages, response, 'bot');
    }, 1000);
  }
}

export default ChatManager;
```

#### **assets/js/dashboard.js** - Dashboard
```javascript
// Dashboard functionality
class DashboardManager {
  switchRole(element, role) {
    // Update tabs
    document.querySelectorAll('.role-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    element.classList.add('active');
    
    // Show/hide panels
    ['student', 'adviser', 'librarian'].forEach(r => {
      const panel = document.getElementById(`dash-${r}`);
      if (panel) {
        panel.style.display = (r === role) ? 'block' : 'none';
      }
    });
  }

  toggleSave(button) {
    const isSaved = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', !isSaved);
    
    const icon = button.querySelector('span[aria-hidden]');
    if (icon) {
      icon.textContent = isSaved ? '☆' : '★';
    }
    
    button.style.color = isSaved ? '' : 'var(--ctu-orange)';
    button.style.borderColor = isSaved ? '' : 'var(--ctu-orange)';
  }

  runValidation() {
    // Placeholder for validation logic
    console.log('Running validation...');
    return true;
  }
}

export default DashboardManager;
```

#### **assets/js/main.js** - Initialize Everything
```javascript
// Main application initialization
import ThemeManager from './theme.js';
import NavigationManager from './navigation.js';
import SearchManager from './search.js';
import ChatManager from './chat.js';
import DashboardManager from './dashboard.js';

class App {
  constructor() {
    this.theme = new ThemeManager();
    this.navigation = new NavigationManager();
    this.search = new SearchManager();
    this.chat = new ChatManager();
    this.dashboard = new DashboardManager();
    
    this.init();
  }

  init() {
    // Setup event listeners
    this.setupThemeToggle();
    this.setupSearch();
    this.setupFilters();
    this.setupChat();
    this.setupSaveButtons();
    this.navigation.setupKeyboardNav();
    
    console.log('✨ CTU RECAP - All systems ready!');
  }

  setupThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => this.theme.toggle());
    }
  }

  setupSearch() {
    const searchBar = document.getElementById('main-search');
    if (searchBar) {
      searchBar.addEventListener('input', (e) => {
        this.search.handleSearch(e.target.value);
      });
    }
  }

  setupFilters() {
    document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.search.handleFilterChange();
      });
    });
  }

  setupChat() {
    // Floating chat
    const chatFab = document.getElementById('chat-fab');
    if (chatFab) {
      chatFab.addEventListener('click', () => this.chat.toggleChat());
    }

    // Chat inputs
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.chat.sendMessage('chat-input', 'chat-messages');
        }
      });
    }

    const inlineInput = document.getElementById('inline-chat-input');
    if (inlineInput) {
      inlineInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.chat.sendMessage('inline-chat-input', 'inline-chat-messages');
        }
      });
    }
  }

  setupSaveButtons() {
    document.querySelectorAll('.save-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dashboard.toggleSave(btn);
      });
    });
  }
}

// Make functions globally available for onclick handlers
window.switchView = (view) => app.navigation.switchView(view);
window.switchRole = (el, role) => app.dashboard.switchRole(el, role);
window.toggleChat = () => app.chat.toggleChat();
window.sendChat = () => app.chat.sendMessage('chat-input', 'chat-messages');
window.sendInlineMessage = () => app.chat.sendMessage('inline-chat-input', 'inline-chat-messages');
window.sendSuggestion = (btn, text) => app.chat.sendSuggestion(text, 'inline-chat-messages');
window.runValidation = () => app.dashboard.runValidation();

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new App();
});
```

---

### Step 4: Clean HTML File

#### **index.html** - No Inline Styles/Scripts
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="CTU Daanbantayan Campus AI-Integrated Capstone Repository">
  <title>CTU Capstone Repository</title>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Styles -->
  <link rel="stylesheet" href="assets/css/base.css">
  <link rel="stylesheet" href="assets/css/layout.css">
  <link rel="stylesheet" href="assets/css/components.css">
  <link rel="stylesheet" href="assets/css/pages.css">
  <link rel="stylesheet" href="assets/css/utilities.css">
</head>
<body>
  <!-- Skip link for accessibility -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <div class="app">
    <!-- Navigation -->
    <nav class="nav" role="navigation">
      <!-- Nav content (NO inline styles) -->
    </nav>

    <!-- Page tabs -->
    <div class="page-tabs" role="tablist">
      <!-- Tabs (NO onclick, use event listeners) -->
    </div>

    <!-- Views -->
    <div class="view active" id="view-landing">
      <!-- Landing page content -->
    </div>

    <!-- More views... -->
  </div>

  <!-- Scripts (at end of body) -->
  <script type="module" src="assets/js/main.js"></script>
</body>
</html>
```

---

## ✅ Benefits of This Structure

### 1. **Separation of Concerns**
- HTML = Structure
- CSS = Presentation
- JS = Behavior

### 2. **Easy to Maintain**
- Find code quickly
- Update one file at a time
- No hunting for inline styles

### 3. **Reusable Code**
- Components can be reused
- Consistent styling
- DRY (Don't Repeat Yourself)

### 4. **Better Performance**
- CSS/JS files can be cached
- Smaller HTML file
- Faster page loads

### 5. **Team-Friendly**
- Multiple people can work on different files
- Clear file organization
- Easy to understand

### 6. **Professional**
- Industry standard
- Scalable
- Maintainable

---

## 🎯 Quick Wins

### Remove These Inline Styles:
```html
<!-- BEFORE (Bad) -->
<div style="font-size:13px;color:var(--text-secondary)">Text</div>

<!-- AFTER (Good) -->
<div class="text-small text-secondary">Text</div>
```

### Remove These Inline Scripts:
```html
<!-- BEFORE (Bad) -->
<button onclick="switchView('dashboard')">Login</button>

<!-- AFTER (Good) -->
<button class="btn-login" data-view="dashboard">Login</button>
```

Then in JavaScript:
```javascript
document.querySelector('.btn-login').addEventListener('click', (e) => {
  const view = e.target.getAttribute('data-view');
  switchView(view);
});
```

---

## 📝 Implementation Checklist

- [ ] Create folder structure
- [ ] Split CSS into 5 files
- [ ] Split JS into 6 files
- [ ] Remove all inline styles from HTML
- [ ] Remove all inline scripts from HTML
- [ ] Add CSS classes instead of inline styles
- [ ] Use event listeners instead of onclick
- [ ] Test all functionality
- [ ] Update file paths in HTML
- [ ] Commit changes

---

## 🚀 Next Steps

1. **Backup current code** (you already have it in git!)
2. **Create new folder structure**
3. **Copy and split CSS** into modules
4. **Copy and split JS** into modules
5. **Clean HTML** file
6. **Test everything**
7. **Commit** when working

---

**This structure will make your code professional and easy to maintain!** 🎉
