/**
 * AI Service
 * Handles AI chatbot with automatic fallback between Mistral and Gemini
 */

const AIService = {
  isInitialized: false,
  mistralAvailable: true,
  geminiAvailable: true,

  /**
   * Initialize AI service
   */
  async init() {
    try {
      // Test Mistral connection
      await this.testMistral();
      
      this.isInitialized = true;
      console.log('✓ AI Chatbot initialized (Mistral primary, Gemini fallback)');
      
    } catch (error) {
      console.warn('⚠️ AI initialization warning:', error);
      this.isInitialized = true; // Still initialize, will test on first use
    }
  },

  /**
   * Test Mistral API
   */
  async testMistral() {
    try {
      const response = await fetch(AIConfig.mistral.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIConfig.mistral.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: AIConfig.mistral.model,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 10
        })
      });

      this.mistralAvailable = response.ok;
      
      if (response.ok) {
        console.log('✓ Mistral AI connected');
      } else {
        console.warn('⚠️ Mistral AI unavailable, will use Gemini');
      }
      
      return response.ok;
    } catch (error) {
      this.mistralAvailable = false;
      console.warn('⚠️ Mistral test failed:', error.message);
      return false;
    }
  },

  /**
   * Send message to AI (with automatic fallback)
   */
  async sendMessage(userMessage) {
    // Add user message to history
    AIConfig.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    // Try Mistral first
    if (this.mistralAvailable) {
      try {
        console.log('🤖 Trying Mistral AI...');
        const response = await this.sendToMistral(userMessage);
        
        // Add AI response to history
        AIConfig.conversationHistory.push({
          role: 'assistant',
          content: response
        });
        
        return {
          message: response,
          provider: 'mistral'
        };
        
      } catch (error) {
        console.warn('⚠️ Mistral failed, falling back to Gemini:', error.message);
        this.mistralAvailable = false;
      }
    }

    // Fallback to Gemini
    if (this.geminiAvailable) {
      try {
        console.log('🤖 Using Gemini AI (fallback)...');
        const response = await this.sendToGemini(userMessage);
        
        // Add AI response to history
        AIConfig.conversationHistory.push({
          role: 'assistant',
          content: response
        });
        
        return {
          message: response,
          provider: 'gemini'
        };
        
      } catch (error) {
        console.error('❌ Gemini also failed:', error.message);
        this.geminiAvailable = false;
        throw new Error('Both AI providers are unavailable');
      }
    }

    throw new Error('No AI providers available');
  },

  /**
   * Send message to Mistral AI
   */
  async sendToMistral(userMessage) {
    const messages = [
      { role: 'system', content: AIConfig.systemPrompt },
      ...AIConfig.conversationHistory.slice(-6) // Last 3 exchanges
    ];

    const response = await fetch(AIConfig.mistral.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIConfig.mistral.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: AIConfig.mistral.model,
        messages: messages,
        max_tokens: AIConfig.mistral.maxTokens,
        temperature: AIConfig.mistral.temperature
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  },

  /**
   * Send message to Google Gemini
   */
  async sendToGemini(userMessage) {
    // Gemini uses a different format
    const url = `${AIConfig.gemini.apiUrl}?key=${AIConfig.gemini.apiKey}`;
    
    // Build conversation context
    const context = AIConfig.conversationHistory.slice(-6)
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');
    
    const fullPrompt = `${AIConfig.systemPrompt}\n\nConversation:\n${context}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: AIConfig.gemini.temperature,
          maxOutputTokens: AIConfig.gemini.maxTokens
        }
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I could not generate a response.';
  },

  /**
   * Get suggested questions based on context
   */
  getSuggestions() {
    const suggestions = [
      "How do I search for projects?",
      "Show me IoT projects from 2024",
      "What programs are available?",
      "How do I upload a project?",
      "Explain the FAIR principles"
    ];

    return suggestions;
  },

  /**
   * Clear conversation history
   */
  clearHistory() {
    AIConfig.conversationHistory = [];
    console.log('✓ Conversation history cleared');
  },

  /**
   * Get current provider status
   */
  getStatus() {
    return {
      mistral: this.mistralAvailable ? '✓ Available' : '✗ Unavailable',
      gemini: this.geminiAvailable ? '✓ Available' : '✗ Unavailable',
      current: this.mistralAvailable ? 'Mistral' : (this.geminiAvailable ? 'Gemini' : 'None')
    };
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIService;
}
