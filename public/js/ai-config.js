/**
 * AI Chatbot Configuration
 * Handles multiple AI providers with automatic fallback
 */

const AIConfig = {
  // Primary AI: Mistral AI
  mistral: {
    apiKey: '',
    apiUrl: 'https://api.mistral.ai/v1/chat/completions',
    model: 'mistral-tiny', // Fast and free tier friendly
    maxTokens: 1000,
    temperature: 0.7
  },

  // Fallback AI: Google Gemini
  gemini: {
    apiKey: '',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    model: 'gemini-pro',
    maxTokens: 1000,
    temperature: 0.7
  },

  // System prompt for chatbot
  systemPrompt: `You are a helpful AI assistant for the CTU Daanbantayan Campus Capstone Repository (RECAP).

Your role is to:
1. Help users find capstone projects
2. Answer questions about the repository
3. Explain how to use the system
4. Provide information about projects, research topics, and academic programs
5. Guide students, advisers, and librarians

Be friendly, concise, and helpful. If you don't know something, admit it honestly.

Available programs: BSIT, BSCS, BSED, BSAgriBusiness
Common topics: Machine Learning, IoT, Web Development, Mobile Apps, Data Analytics

Keep responses under 150 words unless the user asks for more detail.`,

  // Current provider (will switch on failure)
  currentProvider: 'mistral',

  // Conversation history
  conversationHistory: []
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIConfig;
}
