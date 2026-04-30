# 🎨 Inline Styles to Remove

**List of all inline styles in your HTML and their CSS class replacements**

---

## 📋 Inline Styles Found

### Navigation Section

```html
<!-- REMOVE THIS -->
<button class="btn btn-ghost" style="font-size:12px">About</button>

<!-- REPLACE WITH -->
<button class="btn btn-ghost btn-small">About</button>
```

**Add to CSS:**
```css
.btn-small {
  font-size: 12px;
}
```

---

### Filter Section

```html
<!-- REMOVE THIS -->
<div class="filter-title">Program <span style="font-size:10px;color:var(--text-hint)">▼</span></div>

<!-- REPLACE WITH -->
<div class="filter-title">Program <span class="filter-arrow">▼</span></div>
```

**Already in CSS:**
```css
.filter-arrow {
  font-size: 10px;
  color: var(--text-hint);
}
```

---

### Filter Input

```html
<!-- REMOVE THIS -->
<input
  type="text"
  class="filter-keyword-input"
  placeholder="e.g. Arduino, React..."
  style="width:100%;padding:7px 10px;border-radius:6px;border:0.5px solid var(--border);font-size:12px;font-family:inherit;outline:none;color:var(--text-primary)"
/>

<!-- REPLACE WITH -->
<input
  type="text"
  class="filter-keyword-input"
  placeholder="e.g. Arduino, React..."
/>
```

**Already in CSS:**
```css
.filter-keyword-input {
  width: 100%;
  padding: 7px 10px;
  border-radius: 6px;
  border: 0.5px solid var(--border);
  font-size: 12px;
  font-family: inherit;
  outline: none;
  color: var(--text-primary);
}
```

---

### Buttons

```html
<!-- REMOVE THIS -->
<button class="btn btn-blue ripple" style="width:100%;margin-top:4px;font-size:13px">
  Apply Filters
</button>

<!-- REPLACE WITH -->
<button class="btn btn-blue ripple btn-full-width mt-1 btn-small">
  Apply Filters
</button>
```

**Add to CSS:**
```css
.btn-full-width {
  width: 100%;
}

.mt-1 {
  margin-top: 4px;
}

.mt-2 {
  margin-top: 6px;
}
```

---

### Dashboard Section

```html
<!-- REMOVE THIS -->
<div style="font-size:13px;color:var(--text-secondary);margin-top:2px">
  Last login: April 26, 2026
</div>

<!-- REPLACE WITH -->
<div class="text-small text-secondary mt-1">
  Last login: April 26, 2026
</div>
```

**Add to CSS:**
```css
.text-small {
  font-size: 13px;
}

.text-secondary {
  color: var(--text-secondary);
}
```

---

### Saved Research Section

```html
<!-- REMOVE THIS -->
<div style="font-size:13px;font-weight:500;color:var(--text-primary);margin-bottom:12px">
  My Saved Research
</div>

<!-- REPLACE WITH -->
<div class="section-heading">
  My Saved Research
</div>
```

**Add to CSS:**
```css
.section-heading {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 12px;
}
```

---

### Adviser Panel

```html
<!-- REMOVE THIS -->
<div style="font-size:15px;font-weight:500;color:var(--text-primary);margin-bottom:4px">
  Title Originality Validator
</div>

<!-- REPLACE WITH -->
<div class="panel-title">
  Title Originality Validator
</div>
```

**Add to CSS:**
```css
.panel-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.panel-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 14px;
}
```

---

### Validation Results

```html
<!-- REMOVE THIS -->
<div style="font-size:13px;font-weight:500;color:var(--text-primary);margin-bottom:8px">
  Similarity Results
</div>

<!-- REPLACE WITH -->
<div class="results-title">
  Similarity Results
</div>
```

```html
<!-- REMOVE THIS -->
<span style="flex:1;font-size:12px;color:var(--text-secondary)">
  Plant Disease Detection Using CNN — Reyes, 2024
</span>

<!-- REPLACE WITH -->
<span class="val-project-name">
  Plant Disease Detection Using CNN — Reyes, 2024
</span>
```

**Add to CSS:**
```css
.results-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.val-project-name {
  flex: 1;
  font-size: 12px;
  color: var(--text-secondary);
}
```

---

### Warning Box

```html
<!-- REMOVE THIS -->
<div style="margin-top:10px;padding:8px 12px;background:var(--ctu-orange-light);border-radius:6px;font-size:12px;color:var(--ctu-orange)">
  ⚠ Moderate overlap detected...
</div>

<!-- REPLACE WITH -->
<div class="alert alert-warning">
  ⚠ Moderate overlap detected...
</div>
```

**Add to CSS:**
```css
.alert {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
}

.alert-warning {
  background: var(--ctu-orange-light);
  color: var(--ctu-orange);
}
```

---

### Librarian Panel

```html
<!-- REMOVE THIS -->
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">

<!-- REPLACE WITH -->
<div class="stats-grid">
```

```html
<!-- REMOVE THIS -->
<div class="stat-num" style="color:var(--ctu-orange)">7</div>

<!-- REPLACE WITH -->
<div class="stat-num stat-num-warning">7</div>
```

```html
<!-- REMOVE THIS -->
<div class="stat-num" style="color:#27ae60">12</div>

<!-- REPLACE WITH -->
<div class="stat-num stat-num-success">12</div>
```

**Add to CSS:**
```css
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-num-warning {
  color: var(--ctu-orange);
}

.stat-num-success {
  color: #27ae60;
}
```

---

### Upload Table

```html
<!-- REMOVE THIS -->
<div style="background:var(--surface);border-radius:var(--radius-lg);border:0.5px solid var(--border);padding:20px">

<!-- REPLACE WITH -->
<div class="upload-table-container">
```

```html
<!-- REMOVE THIS -->
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">

<!-- REPLACE WITH -->
<div class="table-header">
```

```html
<!-- REMOVE THIS -->
<div style="font-size:14px;font-weight:500">Recent Uploads</div>

<!-- REPLACE WITH -->
<div class="table-title">Recent Uploads</div>
```

```html
<!-- REMOVE THIS -->
<button class="btn btn-orange" style="font-size:12px;padding:6px 14px">

<!-- REPLACE WITH -->
<button class="btn btn-orange btn-small btn-compact">
```

**Add to CSS:**
```css
.upload-table-container {
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 0.5px solid var(--border);
  padding: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-title {
  font-size: 14px;
  font-weight: 500;
}

.btn-compact {
  padding: 6px 14px;
}
```

---

### Table Grid

```html
<!-- REMOVE THIS -->
<div style="font-size:12px;color:var(--text-hint);margin-bottom:8px;display:grid;grid-template-columns:2fr 1fr 1fr 80px;gap:12px;padding:0 8px">

<!-- REPLACE WITH -->
<div class="table-grid table-header-row">
```

```html
<!-- REMOVE THIS -->
<div style="display:flex;flex-direction:column;gap:2px">

<!-- REPLACE WITH -->
<div class="table-body">
```

```html
<!-- REMOVE THIS -->
<div style="display:grid;grid-template-columns:2fr 1fr 1fr 80px;gap:12px;padding:8px;border-radius:6px;background:var(--surface-2);font-size:12px">

<!-- REPLACE WITH -->
<div class="table-row table-row-highlight">
```

**Add to CSS:**
```css
.table-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 80px;
  gap: 12px;
  padding: 8px;
}

.table-header-row {
  font-size: 12px;
  color: var(--text-hint);
  margin-bottom: 8px;
  padding: 0 8px;
}

.table-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.table-row {
  border-radius: 6px;
  font-size: 12px;
}

.table-row-highlight {
  background: var(--surface-2);
}

.table-row-warning {
  background: var(--ctu-orange-light);
}
```

---

### Table Cell Styles

```html
<!-- REMOVE THIS -->
<span style="color:var(--text-primary)">Smart Attendance...</span>

<!-- REPLACE WITH -->
<span class="table-cell-primary">Smart Attendance...</span>
```

```html
<!-- REMOVE THIS -->
<span style="color:var(--text-secondary)">BSIT</span>

<!-- REPLACE WITH -->
<span class="table-cell-secondary">BSIT</span>
```

```html
<!-- REMOVE THIS -->
<span style="color:#27ae60;font-weight:500">Published</span>

<!-- REPLACE WITH -->
<span class="status-badge status-success">Published</span>
```

```html
<!-- REMOVE THIS -->
<span style="color:var(--ctu-orange);font-weight:500">Pending</span>

<!-- REPLACE WITH -->
<span class="status-badge status-pending">Pending</span>
```

**Add to CSS:**
```css
.table-cell-primary {
  color: var(--text-primary);
}

.table-cell-secondary {
  color: var(--text-secondary);
}

.status-badge {
  font-weight: 500;
}

.status-success {
  color: #27ae60;
}

.status-pending {
  color: var(--ctu-orange);
}
```

---

### Detail Page

```html
<!-- REMOVE THIS -->
<button class="btn btn-outline" style="font-size:12px;padding:5px 12px">

<!-- REPLACE WITH -->
<button class="btn btn-outline btn-small btn-compact-sm">
```

```html
<!-- REMOVE THIS -->
<div style="margin-bottom:16px">

<!-- REPLACE WITH -->
<div class="mb-3">
```

```html
<!-- REMOVE THIS -->
<div style="margin-bottom:20px">

<!-- REPLACE WITH -->
<div class="mb-4">
```

**Add to CSS:**
```css
.btn-compact-sm {
  padding: 5px 12px;
}

.mb-3 {
  margin-bottom: 16px;
}

.mb-4 {
  margin-bottom: 20px;
}
```

---

### FAIR Principles

```html
<!-- REMOVE THIS -->
<div class="fair-dot" style="background:#1A4F8A"></div>

<!-- REPLACE WITH -->
<div class="fair-dot fair-dot-blue"></div>
```

```html
<!-- REMOVE THIS -->
<div class="fair-dot" style="background:#27ae60"></div>

<!-- REPLACE WITH -->
<div class="fair-dot fair-dot-green"></div>
```

```html
<!-- REMOVE THIS -->
<div class="fair-dot" style="background:#E87722"></div>

<!-- REPLACE WITH -->
<div class="fair-dot fair-dot-orange"></div>
```

```html
<!-- REMOVE THIS -->
<div class="fair-dot" style="background:#8e44ad"></div>

<!-- REPLACE WITH -->
<div class="fair-dot fair-dot-purple"></div>
```

**Add to CSS:**
```css
.fair-dot-blue { background: #1A4F8A; }
.fair-dot-green { background: #27ae60; }
.fair-dot-orange { background: #E87722; }
.fair-dot-purple { background: #8e44ad; }
```

---

### Project Info

```html
<!-- REMOVE THIS -->
<div style="display:flex;flex-direction:column;gap:6px">

<!-- REPLACE WITH -->
<div class="info-list">
```

```html
<!-- REMOVE THIS -->
<div style="display:flex;justify-content:space-between;font-size:12px">

<!-- REPLACE WITH -->
<div class="info-row">
```

```html
<!-- REMOVE THIS -->
<span style="color:var(--text-secondary)">Year</span>

<!-- REPLACE WITH -->
<span class="info-label">Year</span>
```

```html
<!-- REMOVE THIS -->
<span style="font-weight:500">2024</span>

<!-- REPLACE WITH -->
<span class="info-value">2024</span>
```

```html
<!-- REMOVE THIS -->
<span style="color:var(--text-hint);font-style:italic">Restricted (Library only)</span>

<!-- REPLACE WITH -->
<span class="info-note">Restricted (Library only)</span>
```

**Add to CSS:**
```css
.info-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.info-label {
  color: var(--text-secondary);
}

.info-value {
  font-weight: 500;
}

.info-note {
  color: var(--text-hint);
  font-style: italic;
}
```

---

### Chatbot View

```html
<!-- REMOVE THIS -->
<div style="max-width:560px;margin:0 auto">

<!-- REPLACE WITH -->
<div class="chat-container">
```

```html
<!-- REMOVE THIS -->
<div style="text-align:center;margin-bottom:24px">

<!-- REPLACE WITH -->
<div class="chat-intro">
```

```html
<!-- REMOVE THIS -->
<div style="font-size:18px;font-weight:500;color:var(--text-primary);margin-bottom:4px">

<!-- REPLACE WITH -->
<div class="chat-intro-title">
```

```html
<!-- REMOVE THIS -->
<div style="font-size:13px;color:var(--text-secondary)">

<!-- REPLACE WITH -->
<div class="chat-intro-subtitle">
```

```html
<!-- REMOVE THIS -->
<div style="background:var(--surface);border-radius:var(--radius-lg);border:0.5px solid var(--border);overflow:hidden">

<!-- REPLACE WITH -->
<div class="chat-box">
```

**Add to CSS:**
```css
.chat-container {
  max-width: 560px;
  margin: 0 auto;
}

.chat-intro {
  text-align: center;
  margin-bottom: 24px;
}

.chat-intro-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.chat-intro-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
}

.chat-box {
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 0.5px solid var(--border);
  overflow: hidden;
}
```

---

## 📊 Summary

**Total inline styles to remove:** ~50+

**CSS classes to add:** ~40

**Benefits:**
- ✅ Cleaner HTML
- ✅ Reusable styles
- ✅ Easier maintenance
- ✅ Better performance
- ✅ Professional code

---

## 🎯 Quick Action Plan

1. **Copy all CSS additions** to `assets/css/utilities.css`
2. **Find and replace** inline styles in HTML
3. **Test each section** after changes
4. **Commit** when working

---

**Remove inline styles = Professional code!** 🎉
