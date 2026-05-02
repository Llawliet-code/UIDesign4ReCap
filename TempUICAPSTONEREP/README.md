# TempUICAPSTONEREP - Temporary UI Files

## ⚠️ Important Notice

This folder contains **temporary/backup** files from the UI development process.

---

## 📁 Contents

- `js/groq-config.js` - Groq AI configuration (uses centralized API keys)
- `js/groq-service.js` - Groq AI service implementation

---

## 🔑 API Keys Configuration

These files now use the **centralized API keys system**.

**To configure API keys:**
1. Edit: `public/js/api-keys.js`
2. All files (including these) will automatically use the new keys

---

## 🚀 Usage

### If you want to use these files:

1. **Make sure `api-keys.js` is loaded first:**
   ```html
   <script src="js/api-keys.js"></script>
   <script src="TempUICAPSTONEREP/js/groq-config.js"></script>
   <script src="TempUICAPSTONEREP/js/groq-service.js"></script>
   ```

2. **The files will automatically read from `API_KEYS` object:**
   ```javascript
   // groq-config.js automatically uses:
   apiKey: API_KEYS.groq
   ```

---

## 📝 Note

The **production files** are in `public/js/`:
- `public/js/groq-config.js` ✅ (Active)
- `public/js/groq-service.js` ✅ (Active)

This folder is for **reference/backup only**.

---

## 🗑️ Can I Delete This?

Yes! If you're not using these files, you can safely delete this entire folder.

The working implementation is in `public/js/`.

---

## 🔒 Security

✅ **No hardcoded API keys** - Uses centralized configuration
✅ **Ignored by Git** - Listed in `.gitignore`
✅ **Safe to share** - No sensitive data when using centralized keys
