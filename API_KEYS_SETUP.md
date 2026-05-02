# 🔑 API Keys Setup Guide

## ⚠️ Important Security Note

The API keys have been removed from the source code for security reasons. You need to add your own API keys to use the AI features.

## 🚀 Quick Setup

### Option 1: Use the Setup Page (Recommended)

1. Open `public/setup-api-keys.html` in your browser
2. Enter your API keys:
   - **Groq API Key** (for semantic search)
   - **Mistral API Key** (for AI chatbot - primary)
   - **Google Gemini API Key** (for AI chatbot - fallback)
3. Click "Save API Keys"
4. Done! The keys are stored in your browser's localStorage

### Option 2: Manual Setup

Edit the config files and replace the placeholder values:

**`public/js/groq-config.js`:**
```javascript
apiKey: 'YOUR_GROQ_API_KEY_HERE'
```

**`public/js/ai-config.js`:**
```javascript
mistral: {
  apiKey: 'YOUR_MISTRAL_API_KEY_HERE'
},
gemini: {
  apiKey: 'YOUR_GEMINI_API_KEY_HERE'
}
```

## 🔗 Get Your Free API Keys

### 1. Groq API (for Semantic Search)
- Website: https://console.groq.com
- Sign up for free
- Go to API Keys section
- Create a new API key
- Copy the key (starts with `gsk_...`)

### 2. Mistral AI (for Chatbot - Primary)
- Website: https://console.mistral.ai
- Sign up for free
- Go to API Keys section
- Create a new API key
- Copy the key

### 3. Google Gemini (for Chatbot - Fallback)
- Website: https://makersuite.google.com/app/apikey
- Sign in with Google account
- Click "Create API Key"
- Copy the key (starts with `AIza...`)

## 🔒 Security Best Practices

### For Development (Current Setup)
- ✅ API keys stored in localStorage (browser only)
- ✅ Keys not committed to Git
- ⚠️ Keys visible in browser DevTools

### For Production (Recommended)
- ✅ Move API keys to backend server
- ✅ Create a proxy API endpoint
- ✅ Never expose keys in client-side code
- ✅ Use environment variables

## 📝 Example Production Setup

Create a backend API proxy:

```javascript
// backend/api/search.js
export default async function handler(req, res) {
  const { query } = req.body;
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: query }]
    })
  });
  
  const data = await response.json();
  res.json(data);
}
```

Then update your frontend to call your backend instead of the AI APIs directly.

## ❓ Troubleshooting

### "API Key not found" error
- Make sure you've entered the keys in `setup-api-keys.html`
- Check that localStorage has the keys (open DevTools → Application → Local Storage)

### "API request failed" error
- Verify your API keys are correct
- Check that you haven't exceeded free tier limits
- Ensure you have internet connection

### Features not working
- Open browser console (F12) to see error messages
- Verify all three API keys are set
- Try refreshing the page

## 📞 Support

If you need help:
1. Check the browser console for errors
2. Verify API keys are valid
3. Check API provider status pages
4. Review the documentation at each provider's website
