# Logo Not Showing - Troubleshooting Guide 🔍

## Current Setup

**Logo File:** `THE_LOGO.png` (205 KB)
**Location:** `C:\Users\Acer\Desktop\UIDesign4ReCap\THE_LOGO.png`
**HTML File:** `C:\Users\Acer\Desktop\UIDesign4ReCap\TempUICAPSTONEREP\index.html`
**Path in HTML:** `../THE_LOGO.png` (goes up one folder)

## Quick Fixes to Try

### Fix 1: Move Logo to Same Folder
The easiest solution - move the logo into the TempUICAPSTONEREP folder:

1. **Copy the file:**
   - From: `C:\Users\Acer\Desktop\UIDesign4ReCap\THE_LOGO.png`
   - To: `C:\Users\Acer\Desktop\UIDesign4ReCap\TempUICAPSTONEREP\THE_LOGO.png`

2. **Update HTML** (change `../THE_LOGO.png` to `THE_LOGO.png`):
   ```html
   <img src="THE_LOGO.png" alt="RECAP System Logo" class="nav-logo-img" />
   ```

### Fix 2: Move Logo to Assets Folder (Recommended)
Better organization:

1. **Copy the file:**
   - From: `C:\Users\Acer\Desktop\UIDesign4ReCap\THE_LOGO.png`
   - To: `C:\Users\Acer\Desktop\UIDesign4ReCap\TempUICAPSTONEREP\assets\images\THE_LOGO.png`

2. **Update HTML:**
   ```html
   <img src="assets/images/THE_LOGO.png" alt="RECAP System Logo" class="nav-logo-img" />
   ```

### Fix 3: Check Browser Console
1. Open your page in browser
2. Press F12 to open Developer Tools
3. Go to "Console" tab
4. Look for errors like:
   - `404 (Not Found)` - File path is wrong
   - `Failed to load resource` - File doesn't exist at that path

### Fix 4: Hard Refresh
Sometimes the browser caches the old version:
- **Windows:** Ctrl + F5 or Ctrl + Shift + R
- **Mac:** Cmd + Shift + R

## Diagnostic Steps

### Step 1: Verify File Exists
Open Command Prompt and run:
```cmd
cd C:\Users\Acer\Desktop\UIDesign4ReCap
dir THE_LOGO.png
```
Should show: `THE_LOGO.png` with file size

### Step 2: Check HTML Path
Open `TempUICAPSTONEREP\index.html` and find:
```html
<img src="../THE_LOGO.png" alt="RECAP System Logo" class="nav-logo-img" />
```

The `../` means "go up one folder", so:
- HTML is at: `UIDesign4ReCap\TempUICAPSTONEREP\index.html`
- Logo should be at: `UIDesign4ReCap\THE_LOGO.png` ✅

### Step 3: Test Direct Access
Try opening the logo directly in browser:
1. Open browser
2. Type in address bar: `file:///C:/Users/Acer/Desktop/UIDesign4ReCap/THE_LOGO.png`
3. If logo shows → file exists and is valid
4. If error → file might be corrupted or wrong location

### Step 4: Check CSS
The logo should have these styles in `css/styles.css`:
```css
.nav-logo-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  flex-shrink: 0;
  transition: transform var(--transition-fast);
  cursor: pointer;
}
```

### Step 5: Inspect Element
1. Open page in browser
2. Right-click where logo should be
3. Click "Inspect" or "Inspect Element"
4. Look for the `<img>` tag
5. Check if `src` attribute shows correct path
6. Check if any CSS is hiding it (`display: none`, `visibility: hidden`, etc.)

## Common Issues & Solutions

### Issue 1: 404 Error in Console
**Problem:** File path is incorrect
**Solution:** 
- Move logo to `TempUICAPSTONEREP` folder
- Update HTML to `src="THE_LOGO.png"`

### Issue 2: Logo Shows as Broken Image Icon
**Problem:** File is corrupted or wrong format
**Solution:**
- Re-save the logo as PNG
- Make sure it's a valid image file
- Try opening it in image viewer first

### Issue 3: Logo is There But Too Small/Hidden
**Problem:** CSS sizing issue
**Solution:** Increase size in CSS:
```css
.nav-logo-img {
  width: 60px !important;
  height: 60px !important;
  background: white; /* Add background to see it */
}
```

### Issue 4: Logo Shows in Light Mode But Not Dark Mode
**Problem:** Logo might be dark colored
**Solution:** Add filter for dark mode:
```css
[data-theme="dark"] .nav-logo-img {
  filter: brightness(1.5);
  /* or */
  background: white;
  padding: 4px;
  border-radius: 6px;
}
```

### Issue 5: Path Works Locally But Not on Server
**Problem:** Relative paths can be tricky
**Solution:** Use absolute path from root:
```html
<img src="/THE_LOGO.png" alt="RECAP System Logo" class="nav-logo-img" />
```

## Recommended Solution (Easiest)

**Copy logo to same folder as HTML:**

1. **Copy file:**
   ```cmd
   copy "C:\Users\Acer\Desktop\UIDesign4ReCap\THE_LOGO.png" "C:\Users\Acer\Desktop\UIDesign4ReCap\TempUICAPSTONEREP\THE_LOGO.png"
   ```

2. **Update HTML** - Change line 25 in `index.html`:
   ```html
   <!-- FROM: -->
   <img src="../THE_LOGO.png" alt="RECAP System Logo" class="nav-logo-img" />
   
   <!-- TO: -->
   <img src="THE_LOGO.png" alt="RECAP System Logo" class="nav-logo-img" />
   ```

3. **Refresh browser** (Ctrl + F5)

## Testing Checklist

- [ ] Logo file exists at correct location
- [ ] HTML path matches file location
- [ ] Browser console shows no 404 errors
- [ ] CSS styles are applied (check with Inspect Element)
- [ ] Hard refresh performed (Ctrl + F5)
- [ ] Logo shows in browser
- [ ] Logo shows on hover
- [ ] Logo works in both light and dark mode

## Still Not Working?

### Debug Mode
Add this temporarily to see what's happening:

**In HTML (after the img tag):**
```html
<img src="../THE_LOGO.png" alt="RECAP System Logo" class="nav-logo-img" 
     onerror="console.error('Logo failed to load!'); this.style.border='2px solid red';" 
     onload="console.log('Logo loaded successfully!');" />
```

This will:
- Show red border if logo fails to load
- Log messages in console

### Alternative: Use Base64
If path issues persist, embed the logo directly:

1. Convert logo to base64: https://www.base64-image.de/
2. Replace in HTML:
   ```html
   <img src="data:image/png;base64,iVBORw0KG..." alt="RECAP System Logo" class="nav-logo-img" />
   ```

## Need More Help?

Share these details:
1. Screenshot of browser console (F12 → Console tab)
2. Screenshot of where logo should appear
3. Result of: `dir THE_LOGO.png` command
4. Browser you're using (Chrome, Firefox, Edge, etc.)

---

**Most likely solution: Copy THE_LOGO.png into TempUICAPSTONEREP folder and change src to "THE_LOGO.png"**
