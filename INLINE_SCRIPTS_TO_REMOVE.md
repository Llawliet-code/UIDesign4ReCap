# ⚡ Inline Scripts to Remove

**List of all inline JavaScript (onclick, onkeydown, etc.) and their replacements**

---

## 🎯 Why Remove Inline Scripts?

1. **Security** - Prevents XSS attacks
2. **Maintainability** - All JS in one place
3. **Reusability** - Event listeners can be reused
4. **Performance** - Better caching
5. **Professional** - Industry standard

---

## 📋 Inline Scripts Found

### Navigation Buttons

```html
<!-- REMOVE THIS -->
<button class="btn btn-orange" onclick="switchView('dashboard')">
  Login
</button>

<!-- REPLACE WITH -->
<button class="btn btn-orange" data-view="dashboard" data-action="switch-view">
  Login
</button>
```

**Add to JavaScript:**
```javascript
// In main.js or navigation.js
document.querySelectorAll('[data-action="switch-view"]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const view = e.target.getAttribute('data-view');
    app.navigation.switchView(view);
  });
});
```

---

### Page Tabs

```html
<!-- REMOVE THIS -->
<button class="tab active" onclick="switchView('landing')">
  Search / Landing
</button>

<!-- REPLACE WITH -->
<button class="tab active" data-view="landing">
  Search / Landing
</button>
```

**Add to JavaScript:**
```javascript
// In navigation.js
setupTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const view = e.target.getAttribute('data-view');
      this.switchView(view);
    });
  });
}
```

---

### Result Cards

```html
<!-- REMOVE THIS -->
<article class="result-card card-hover" onclick="switchView('detail')">

<!-- REPLACE WITH -->
<article class="result-card card-hover" data-view="detail" data-clickable="true">
```

**Add to JavaScript:**
```javascript
// In main.js
document.querySelectorAll('[data-clickable="true"]').forEach(card => {
  card.addEventListener('click', (e) => {
    // Don't trigger if clicking a button inside
    if (e.target.tagName === 'BUTTON') return;
    
    const view = card.getAttribute('data-view');
    if (view) app.navigation.switchView(view);
  });
  
  // Make keyboard accessible
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});
```

---

### View Details Buttons

```html
<!-- REMOVE THIS -->
<button class="view-btn ripple" onclick="switchView('detail')">
  View Details →
</button>

<!-- REPLACE WITH -->
<button class="view-btn ripple" data-view="detail" data-action="view-details">
  View Details →
</button>
```

**Add to JavaScript:**
```javascript
// In main.js
document.querySelectorAll('[data-action="view-details"]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // Don't trigger parent card click
    const view = btn.getAttribute('data-view');
    app.navigation.switchView(view);
  });
});
```

---

### Role Tabs

```html
<!-- REMOVE THIS -->
<div class="role-tab active" onclick="switchRole(this,'student')">
  Student View
</div>

<!-- REPLACE WITH -->
<button class="role-tab active" data-role="student">
  Student View
</button>
```

**Add to JavaScript:**
```javascript
// In dashboard.js
setupRoleTabs() {
  document.querySelectorAll('.role-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const role = e.target.getAttribute('data-role');
      this.switchRole(e.target, role);
    });
  });
}
```

---

### Validation Button

```html
<!-- REMOVE THIS -->
<button class="btn btn-blue" onclick="runValidation()">
  Check Originality →
</button>

<!-- REPLACE WITH -->
<button class="btn btn-blue" data-action="run-validation">
  Check Originality →
</button>
```

**Add to JavaScript:**
```javascript
// In dashboard.js
setupValidation() {
  const btn = document.querySelector('[data-action="run-validation"]');
  if (btn) {
    btn.addEventListener('click', () => {
      this.runValidation();
    });
  }
}
```

---

### Back Button

```html
<!-- REMOVE THIS -->
<button class="btn btn-outline" onclick="switchView('landing')">
  ← Back to Search
</button>

<!-- REPLACE WITH -->
<button class="btn btn-outline" data-view="landing" data-action="back">
  ← Back to Search
</button>
```

**Add to JavaScript:**
```javascript
// In navigation.js
setupBackButtons() {
  document.querySelectorAll('[data-action="back"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = btn.getAttribute('data-view');
      this.switchView(view);
    });
  });
}
```

---

### Chat FAB Button

```html
<!-- REMOVE THIS -->
<button class="chat-fab" onclick="toggleChat()">

<!-- REPLACE WITH -->
<button class="chat-fab" id="chat-fab">
```

**Add to JavaScript:**
```javascript
// In chat.js or main.js
const chatFab = document.getElementById('chat-fab');
if (chatFab) {
  chatFab.addEventListener('click', () => {
    app.chat.toggleChat();
  });
}
```

---

### Chat Close Button

```html
<!-- REMOVE THIS -->
<button class="chat-close" onclick="toggleChat()">✕</button>

<!-- REPLACE WITH -->
<button class="chat-close" data-action="close-chat">✕</button>
```

**Add to JavaScript:**
```javascript
// In chat.js
const closeBtn = document.querySelector('[data-action="close-chat"]');
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    this.toggleChat();
  });
}
```

---

### Chat Send Buttons

```html
<!-- REMOVE THIS -->
<button class="chat-send" onclick="sendChat()">➤</button>

<!-- REPLACE WITH -->
<button class="chat-send" data-action="send-chat" data-input="chat-input" data-messages="chat-messages">➤</button>
```

**Add to JavaScript:**
```javascript
// In chat.js
document.querySelectorAll('[data-action="send-chat"]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const inputId = btn.getAttribute('data-input');
    const messagesId = btn.getAttribute('data-messages');
    this.sendMessage(inputId, messagesId);
  });
});
```

---

### Inline Chat Send

```html
<!-- REMOVE THIS -->
<button class="chat-send" onclick="sendInlineMessage()">➤</button>

<!-- REPLACE WITH -->
<button class="chat-send" data-action="send-chat" data-input="inline-chat-input" data-messages="inline-chat-messages">➤</button>
```

---

### Suggestion Chips

```html
<!-- REMOVE THIS -->
<button class="suggestion-chip" onclick="sendSuggestion(this,'How do I upload my abstract?')">
  How do I upload my abstract?
</button>

<!-- REPLACE WITH -->
<button class="suggestion-chip" data-action="send-suggestion" data-text="How do I upload my abstract?">
  How do I upload my abstract?
</button>
```

**Add to JavaScript:**
```javascript
// In chat.js
document.querySelectorAll('[data-action="send-suggestion"]').forEach(chip => {
  chip.addEventListener('click', (e) => {
    const text = chip.getAttribute('data-text');
    this.sendSuggestion(text, 'inline-chat-messages');
  });
});
```

---

### Chat Input (onkeydown)

```html
<!-- REMOVE THIS -->
<input
  class="chat-input"
  type="text"
  id="chat-input"
  placeholder="Type a message..."
  onkeydown="if(event.key==='Enter') sendChat()"
/>

<!-- REPLACE WITH -->
<input
  class="chat-input"
  type="text"
  id="chat-input"
  placeholder="Type a message..."
  data-action="chat-input"
  data-messages="chat-messages"
/>
```

**Add to JavaScript:**
```javascript
// In chat.js or main.js
document.querySelectorAll('[data-action="chat-input"]').forEach(input => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const messagesId = input.getAttribute('data-messages');
      app.chat.sendMessage(input.id, messagesId);
    }
  });
});
```

---

## 🔄 Complete Replacement Pattern

### Before (Bad):
```html
<button onclick="doSomething('param')">Click Me</button>
```

### After (Good):
```html
<button data-action="do-something" data-param="param">Click Me</button>
```

```javascript
document.querySelectorAll('[data-action="do-something"]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const param = btn.getAttribute('data-param');
    doSomething(param);
  });
});
```

---

## 📊 Summary

**Inline scripts to remove:**
- ✅ 4× `onclick="switchView(...)"`
- ✅ 3× `onclick="toggleChat()"`
- ✅ 2× `onclick="sendChat()"`
- ✅ 1× `onclick="sendInlineMessage()"`
- ✅ 3× `onclick="sendSuggestion(...)"`
- ✅ 3× `onclick="switchRole(...)"`
- ✅ 1× `onclick="runValidation()"`
- ✅ 2× `onkeydown="if(event.key==='Enter')..."`

**Total:** ~20 inline scripts

---

## ✅ Benefits

1. **Security** - No inline JavaScript = safer
2. **Maintainability** - All event handlers in one place
3. **Debugging** - Easier to find and fix issues
4. **Performance** - Better browser optimization
5. **Reusability** - Event delegation for dynamic content
6. **Professional** - Industry best practice

---

## 🎯 Implementation Steps

### 1. Add Data Attributes
Replace all `onclick`, `onkeydown`, etc. with `data-*` attributes

### 2. Create Event Listeners
Add event listeners in your JavaScript files

### 3. Use Event Delegation
For dynamic content, use event delegation:

```javascript
// Instead of adding listeners to each button
document.addEventListener('click', (e) => {
  if (e.target.matches('[data-action="switch-view"]')) {
    const view = e.target.getAttribute('data-view');
    app.navigation.switchView(view);
  }
});
```

### 4. Test Everything
Make sure all interactions still work

### 5. Remove Global Functions
Once all inline scripts are removed, you can remove global function declarations:

```javascript
// REMOVE THESE (no longer needed)
window.switchView = ...
window.toggleChat = ...
window.sendChat = ...
```

---

## 🚀 Quick Reference

### Common Patterns

**Button Click:**
```html
<button data-action="my-action" data-param="value">Click</button>
```

**Link Click:**
```html
<a href="#" data-action="navigate" data-target="page">Link</a>
```

**Input Enter Key:**
```html
<input data-action="submit-on-enter" data-target="form-id">
```

**Clickable Card:**
```html
<div data-clickable="true" data-view="detail">Card</div>
```

---

## 📝 Checklist

- [ ] Replace all `onclick` with data attributes
- [ ] Replace all `onkeydown` with data attributes
- [ ] Add event listeners in JavaScript
- [ ] Test all button clicks
- [ ] Test all keyboard interactions
- [ ] Test all form submissions
- [ ] Remove global function declarations
- [ ] Test in different browsers
- [ ] Commit changes

---

**No inline scripts = Professional, secure code!** 🎉
