/* =============================================
   CTU RECAP - Enhanced JavaScript with Modern Features
   Dark Mode, Accessibility, Animations, & More
   ============================================= */

/* =====================
   THEME MANAGEMENT (Dark Mode)
   ===================== */

/**
 * Initialize theme from localStorage or system preference
 */
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  setTheme(theme, false);
}

/**
 * Set the theme and update UI
 * @param {string} theme - 'light' or 'dark'
 * @param {boolean} save - Whether to save to localStorage
 */
function setTheme(theme, save = true) {
  document.documentElement.setAttribute('data-theme', theme);
  
  const themeIcon = document.querySelector('.theme-icon');
  if (themeIcon) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
  
  if (save) {
    localStorage.setItem('theme', theme);
  }
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
}

/* =====================
   VIEW NAVIGATION with Accessibility
   ===================== */

/**
 * Switches the active view/tab in the app with ARIA support
 * @param {string} v - View name: 'landing' | 'dashboard' | 'detail' | 'chatbot'
 */
function switchView(v) {
  // Update views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
    view.setAttribute('aria-hidden', 'true');
  });
  
  // Update tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
    tab.setAttribute('aria-selected', 'false');
    tab.setAttribute('tabindex', '-1');
  });

  // Activate selected view
  const activeView = document.getElementById('view-' + v);
  if (activeView) {
    activeView.classList.add('active');
    activeView.setAttribute('aria-hidden', 'false');
  }

  // Activate selected tab
  const idx = { landing: 0, dashboard: 1, detail: 2, chatbot: 3 }[v];
  const tabs = document.querySelectorAll('.tab');
  if (tabs[idx]) {
    tabs[idx].classList.add('active');
    tabs[idx].setAttribute('aria-selected', 'true');
    tabs[idx].setAttribute('tabindex', '0');
  }

  // Smooth scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Focus management for accessibility
  if (activeView) {
    const firstFocusable = activeView.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 100);
    }
  }
}

/* =====================
   KEYBOARD NAVIGATION
   ===================== */

/**
 * Handle keyboard navigation for tabs
 */
function setupKeyboardNavigation() {
  const tabs = document.querySelectorAll('.tab');
  
  tabs.forEach((tab, index) => {
    tab.addEventListener('keydown', (e) => {
      let newIndex = index;
      
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        newIndex = (index + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        newIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        newIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        newIndex = tabs.length - 1;
      } else {
        return;
      }
      
      tabs[newIndex].click();
      tabs[newIndex].focus();
    });
  });
}

/* =====================
   SEARCH with Debounce
   ===================== */

let searchTimeout;

/**
 * Debounced search handler
 * @param {string} query - Search query
 */
function handleSearch(query) {
  clearTimeout(searchTimeout);
  
  searchTimeout = setTimeout(() => {
    console.log('Searching for:', query);
    // Show loading skeleton
    showLoadingSkeleton();
    
    // Simulate API call
    setTimeout(() => {
      hideLoadingSkeleton();
      updateResults(query);
    }, 800);
  }, 300);
}

/**
 * Show loading skeleton
 */
function showLoadingSkeleton() {
  const skeleton = document.getElementById('loading-skeleton');
  if (skeleton) {
    skeleton.style.display = 'block';
    skeleton.setAttribute('aria-busy', 'true');
  }
}

/**
 * Hide loading skeleton
 */
function hideLoadingSkeleton() {
  const skeleton = document.getElementById('loading-skeleton');
  if (skeleton) {
    skeleton.style.display = 'none';
    skeleton.setAttribute('aria-busy', 'false');
  }
}

/**
 * Update search results
 * @param {string} query - Search query
 */
function updateResults(query) {
  const resultsCount = document.querySelector('.results-count');
  if (resultsCount) {
    resultsCount.innerHTML = `Showing <strong>42</strong> results for "${query}"`;
  }
}

/* =====================
   FILTER MANAGEMENT
   ===================== */

/**
 * Handle filter changes and update active filter chips
 */
function handleFilterChange() {
  const activeFilters = [];
  
  // Collect checked filters
  document.querySelectorAll('.filter-checkbox:checked').forEach(checkbox => {
    const label = document.querySelector(`label[for="${checkbox.id}"]`);
    if (label) {
      activeFilters.push({
        id: checkbox.id,
        text: label.textContent
      });
    }
  });
  
  // Update filter chips display
  updateFilterChips(activeFilters);
}

/**
 * Update active filter chips
 * @param {Array} filters - Array of active filters
 */
function updateFilterChips(filters) {
  const container = document.getElementById('active-filters');
  if (!container) return;
  
  container.innerHTML = '';
  
  filters.forEach(filter => {
    const chip = document.createElement('div');
    chip.className = 'filter-chip';
    chip.innerHTML = `
      ${filter.text}
      <span class="filter-chip-remove" onclick="removeFilter('${filter.id}')" aria-label="Remove ${filter.text} filter">×</span>
    `;
    container.appendChild(chip);
  });
}

/**
 * Remove a filter
 * @param {string} filterId - ID of the filter to remove
 */
function removeFilter(filterId) {
  const checkbox = document.getElementById(filterId);
  if (checkbox) {
    checkbox.checked = false;
    handleFilterChange();
  }
}

/* =====================
   DASHBOARD ROLE TABS
   ===================== */

/**
 * Switches the active role panel in the dashboard.
 * @param {HTMLElement} el - The clicked role tab element
 * @param {string} role - Role name: 'student' | 'adviser' | 'librarian'
 */
function switchRole(el, role) {
  document.querySelectorAll('.role-tab').forEach(x => x.classList.remove('active'));
  el.classList.add('active');

  ['student', 'adviser', 'librarian'].forEach(r => {
    const panel = document.getElementById('dash-' + r);
    if (panel) panel.style.display = (r === role) ? 'block' : 'none';
  });
}

/* =====================
   FLOATING CHATBOT (FAB)
   ===================== */

/**
 * Toggles the floating chat panel open/closed.
 */
function toggleChat() {
  const panel = document.getElementById('chat-panel');
  panel.classList.toggle('open');
  
  // Update ARIA attributes
  const isOpen = panel.classList.contains('open');
  panel.setAttribute('aria-hidden', !isOpen);
  
  // Focus management
  if (isOpen) {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
      setTimeout(() => chatInput.focus(), 100);
    }
  }
}

/**
 * Sends a message in the floating chat panel with typing indicator.
 */
function sendChat() {
  const input = document.getElementById('chat-input');
  const messages = document.getElementById('chat-messages');

  if (!input.value.trim()) return;

  // Append user message
  const userMsg = document.createElement('div');
  userMsg.className = 'msg msg-user';
  userMsg.textContent = input.value;
  userMsg.setAttribute('role', 'log');
  messages.appendChild(userMsg);

  input.value = '';
  messages.scrollTop = messages.scrollHeight;
  
  // Show typing indicator
  showTypingIndicator(messages);
  
  // Simulate bot response
  setTimeout(() => {
    hideTypingIndicator(messages);
    
    const botMsg = document.createElement('div');
    botMsg.className = 'msg msg-bot';
    botMsg.textContent = "Let me search the repository for you... I'll find the most relevant capstone projects matching your query.";
    botMsg.setAttribute('role', 'log');
    messages.appendChild(botMsg);
    
    messages.scrollTop = messages.scrollHeight;
  }, 1200);
}

/**
 * Show typing indicator
 * @param {HTMLElement} container - Messages container
 */
function showTypingIndicator(container) {
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.id = 'typing-indicator-temp';
  indicator.innerHTML = '<span></span><span></span><span></span>';
  indicator.setAttribute('aria-label', 'Assistant is typing');
  container.appendChild(indicator);
  container.scrollTop = container.scrollHeight;
}

/**
 * Hide typing indicator
 * @param {HTMLElement} container - Messages container
 */
function hideTypingIndicator(container) {
  const indicator = container.querySelector('#typing-indicator-temp');
  if (indicator) {
    indicator.remove();
  }
}

/* =====================
   INLINE CHATBOT (CHATBOT VIEW)
   ===================== */

/** Predefined responses for suggestion chips */
const suggestionResponses = {
  'How do I upload my abstract?':
    'To upload your abstract, log in with your student account, go to Dashboard, and click "Submit Capstone Metadata". Fill in the required fields and your adviser will receive a validation request automatically.',
  'Show me IoT projects from 2024 using Arduino':
    'I found 6 IoT projects from 2024 using Arduino! The top result is "IoT-Based Soil Moisture Detection" by Fernandez & Bautista. Click to view all 6 results in the search page.',
  'Summarize research trends in 2025':
    'In 2025, the top research trends from CTU capstone projects include: Machine Learning & AI (34%), IoT & Hardware Systems (28%), Web & Mobile Applications (22%), and Data Analytics (16%). ML adoption grew 40% compared to 2024.'
};

/**
 * Handles clicking a suggestion chip in the inline chatbot.
 * @param {HTMLElement} btn - The clicked suggestion button
 * @param {string} text - The suggestion text
 */
function sendSuggestion(btn, text) {
  document.getElementById('inline-suggestions').style.display = 'none';

  const messages = document.getElementById('inline-chat-messages');

  const userMsg = document.createElement('div');
  userMsg.className = 'msg msg-user';
  userMsg.textContent = text;
  messages.appendChild(userMsg);
  
  // Show typing indicator
  const typingIndicator = document.getElementById('typing-indicator');
  if (typingIndicator) {
    typingIndicator.style.display = 'flex';
  }

  setTimeout(() => {
    // Hide typing indicator
    if (typingIndicator) {
      typingIndicator.style.display = 'none';
    }
    
    const botMsg = document.createElement('div');
    botMsg.className = 'msg msg-bot';
    botMsg.textContent = suggestionResponses[text] || 'Great question! Let me look that up in the repository for you.';
    messages.appendChild(botMsg);
    messages.scrollTop = messages.scrollHeight;
  }, 1000);
}

/**
 * Sends a typed message in the inline chatbot view.
 */
function sendInlineMessage() {
  const input = document.getElementById('inline-chat-input');
  if (!input.value.trim()) return;

  const messages = document.getElementById('inline-chat-messages');
  document.getElementById('inline-suggestions').style.display = 'none';

  const userMsg = document.createElement('div');
  userMsg.className = 'msg msg-user';
  userMsg.textContent = input.value;
  messages.appendChild(userMsg);

  input.value = '';
  
  // Show typing indicator
  const typingIndicator = document.getElementById('typing-indicator');
  if (typingIndicator) {
    typingIndicator.style.display = 'flex';
  }

  setTimeout(() => {
    // Hide typing indicator
    if (typingIndicator) {
      typingIndicator.style.display = 'none';
    }
    
    const botMsg = document.createElement('div');
    botMsg.className = 'msg msg-bot';
    botMsg.textContent = "I'm searching the repository for that. I'll surface the most relevant capstone studies for you right away!";
    messages.appendChild(botMsg);
    messages.scrollTop = messages.scrollHeight;
  }, 1000);
}

/* =====================
   ADVISER VALIDATION
   ===================== */

/**
 * Placeholder for the title originality validation logic.
 * Will be connected to the AI backend in production.
 */
function runValidation() {
  return true;
}

/* =====================
   SAVE BUTTON TOGGLE
   ===================== */

/**
 * Toggle save button state
 * @param {HTMLElement} button - The save button
 */
function toggleSave(button) {
  const isSaved = button.getAttribute('aria-pressed') === 'true';
  button.setAttribute('aria-pressed', !isSaved);
  button.innerHTML = isSaved ? '<span aria-hidden="true">☆</span> Save' : '<span aria-hidden="true">★</span> Saved';
  button.style.color = isSaved ? '' : 'var(--ctu-orange)';
  button.style.borderColor = isSaved ? '' : 'var(--ctu-orange)';
}

/* =====================
   INITIALIZATION
   ===================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  initTheme();
  
  // Setup theme toggle button
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Setup keyboard navigation
  setupKeyboardNavigation();
  
  // Setup search input
  const searchBar = document.getElementById('main-search');
  if (searchBar) {
    searchBar.addEventListener('input', (e) => handleSearch(e.target.value));
  }
  
  // Setup filter checkboxes
  document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', handleFilterChange);
  });
  
  // Setup inline chat input
  const inlineInput = document.getElementById('inline-chat-input');
  if (inlineInput) {
    inlineInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') sendInlineMessage();
    });
  }
  
  // Setup floating chat input
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') sendChat();
    });
  }
  
  // Setup save buttons
  document.querySelectorAll('.save-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSave(btn);
    });
  });
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light', false);
    }
  });
  
  // Initialize filter chips
  handleFilterChange();
  
  console.log('✨ CTU RECAP Enhanced - All systems ready!');
});
