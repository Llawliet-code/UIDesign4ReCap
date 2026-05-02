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
  
  const moonSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  const sunSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  const themeIcon = document.querySelector('.theme-icon');
  if (themeIcon) {
    themeIcon.innerHTML = theme === 'dark' ? sunSVG : moonSVG;
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
 * @param {string} v - View name: 'landing' | 'detail' | 'chatbot' | 'dashboard'
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
  const idx = { landing: 0, detail: 1,  chatbot: 2,  dashboard: 3}[v];
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
  button.innerHTML = isSaved ? '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> Save' : '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> Saved';
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


/* =====================
   FILTER SECTION TOGGLE
   ===================== */

/**
 * Toggle filter section open/closed
 * @param {HTMLElement} button - The filter title button
 */
function toggleFilterSection(button) {
  const isExpanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', !isExpanded);
  
  const content = button.nextElementSibling;
  if (content) {
    content.style.display = isExpanded ? 'none' : 'flex';
  }
}

/* =====================
   FILTER UPDATES
   ===================== */

/**
 * Update filters and show active filter chips
 */
function updateFilters() {
  const activeFilters = [];
  
  // Collect all checked filters
  document.querySelectorAll('.filter-content input[type="checkbox"]:checked').forEach(checkbox => {
    const label = document.querySelector(`label[for="${checkbox.id}"]`);
    if (label) {
      activeFilters.push({
        id: checkbox.id,
        text: label.textContent.trim()
      });
    }
  });
  
  // Update filter chips display
  updateFilterChips(activeFilters);
  
  // Update results count (simulated)
  updateResultsCount(activeFilters.length);
}

/**
 * Update active filter chips in sidebar
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
      <span class="filter-chip-remove" onclick="removeFilter('${filter.id}')" aria-label="Remove ${filter.text} filter" role="button" tabindex="0">×</span>
    `;
    container.appendChild(chip);
  });
}

/**
 * Clear all filters
 */
function clearAllFilters() {
  // Uncheck all checkboxes
  document.querySelectorAll('.filter-content input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = false;
  });
  
  // Clear keyword input
  const keywordInput = document.getElementById('keyword-input');
  if (keywordInput) {
    keywordInput.value = '';
  }
  
  // Update display
  updateFilters();
}

/**
 * Update results count display
 * @param {number} filterCount - Number of active filters
 */
function updateResultsCount(filterCount) {
  const totalElement = document.getElementById('results-total');
  if (totalElement) {
    // Simulate different result counts based on filters
    const baseCounts = [42, 38, 35, 31, 28, 24, 20];
    const count = baseCounts[Math.min(filterCount, baseCounts.length - 1)];
    totalElement.textContent = count;
  }
}

/* =====================
   KEYWORD SEARCH
   ===================== */

let keywordTimeout;

/**
 * Debounced keyword search
 * @param {string} value - Search keyword
 */
function debouncedKeywordSearch(value) {
  clearTimeout(keywordTimeout);
  
  keywordTimeout = setTimeout(() => {
    if (value.trim()) {
      console.log('Searching for keyword:', value);
      // Add keyword as a filter chip
      addKeywordChip(value);
    }
  }, 500);
}

/**
 * Add keyword as filter chip
 * @param {string} keyword - The keyword to add
 */
function addKeywordChip(keyword) {
  const container = document.getElementById('active-filters');
  if (!container) return;
  
  // Check if keyword chip already exists
  const existingChips = container.querySelectorAll('.filter-chip');
  for (let chip of existingChips) {
    if (chip.textContent.includes(keyword)) {
      return; // Already exists
    }
  }
  
  const chip = document.createElement('div');
  chip.className = 'filter-chip';
  chip.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:3px"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>${keyword}
    <span class="filter-chip-remove" onclick="removeKeywordChip(this)" aria-label="Remove ${keyword} filter" role="button" tabindex="0">×</span>
  `;
  container.appendChild(chip);
}

/**
 * Remove keyword chip
 * @param {HTMLElement} element - The remove button element
 */
function removeKeywordChip(element) {
  const chip = element.closest('.filter-chip');
  if (chip) {
    chip.remove();
  }
  
  // Clear keyword input
  const keywordInput = document.getElementById('keyword-input');
  if (keywordInput) {
    keywordInput.value = '';
  }
}

/* =====================
   NATURAL LANGUAGE SEARCH TOGGLE
   ===================== */

/**
 * Toggle natural language search
 */
function toggleNLSearch() {
  const toggle = document.querySelector('.search-toggle');
  if (!toggle) return;
  
  const isChecked = toggle.getAttribute('aria-checked') === 'true';
  toggle.setAttribute('aria-checked', !isChecked);
  
  // Visual feedback
  const pill = toggle.querySelector('.toggle-pill');
  if (pill) {
    pill.style.background = isChecked ? 'var(--text-hint)' : 'var(--ctu-orange)';
  }
  
  console.log('Natural Language Search:', !isChecked ? 'ON' : 'OFF');
}

/* =====================
   SORT RESULTS
   ===================== */

/**
 * Sort search results
 * @param {string} sortType - Sort type: 'relevant', 'newest', 'oldest'
 */
function sortResults(sortType) {
  console.log('Sorting by:', sortType);
  
  // Show loading state
  showLoadingSkeleton();
  
  // Simulate sorting delay
  setTimeout(() => {
    hideLoadingSkeleton();
    
    // Update results (in real app, this would re-fetch/re-sort data)
    const resultsQuery = document.getElementById('results-query');
    if (resultsQuery) {
      resultsQuery.textContent = resultsQuery.textContent + ' (sorted)';
    }
  }, 500);
}

/* =====================
   AUTH MODAL FUNCTIONS (Placeholders)
   ===================== */

/**
 * Open authentication modal
 * @param {string} mode - 'login' or 'register'
 */
function openAuthModal(mode) {
  console.log('Opening auth modal:', mode);
  alert(`${mode === 'login' ? 'Login' : 'Sign Up'} functionality will be connected to Firebase`);
}

/**
 * Handle logout
 */
function handleLogout() {
  console.log('Logging out...');
  alert('Logout functionality will be connected to Firebase');
}

/* =====================
   INITIALIZATION - UPDATE
   ===================== */

// Update the DOMContentLoaded event listener
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
  
  // Initialize filters - show initial filter chips
  updateFilters();
  
  console.log('✨ CTU RECAP Enhanced - All systems ready!');
});
