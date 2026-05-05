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
    // Check for direct answer first (faster, more accurate)
    if (typeof AIKnowledgeBase !== 'undefined') {
      const directAnswer = AIKnowledgeBase.findDirectAnswer(userMessage);
      if (directAnswer) {
        console.log('✓ Using direct answer from knowledge base');
        
        // Add to conversation history
        AIConfig.conversationHistory.push({
          role: 'user',
          content: userMessage
        });
        
        AIConfig.conversationHistory.push({
          role: 'assistant',
          content: directAnswer
        });
        
        return {
          message: directAnswer,
          provider: 'knowledge-base'
        };
      }
    }

    // Check if query requires live data analysis
    if (typeof AIDataContext !== 'undefined') {
      const dataAnalysis = await AIDataContext.analyzeQuery(userMessage);
      
      if (dataAnalysis && dataAnalysis.hasData) {
        console.log('✓ Query requires live data analysis');
        
        // Add user message to history
        AIConfig.conversationHistory.push({
          role: 'user',
          content: userMessage
        });
        
        // If data context provides complete answer, return it
        if (dataAnalysis.context) {
          AIConfig.conversationHistory.push({
            role: 'assistant',
            content: dataAnalysis.context
          });
          
          return {
            message: dataAnalysis.context,
            provider: 'data-analysis'
          };
        }
      } else if (dataAnalysis && !dataAnalysis.hasData) {
        // No data available
        return {
          message: dataAnalysis.message,
          provider: 'system'
        };
      }
    }

    // No direct answer found, use LLM
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
    // Build context with knowledge base
    const knowledgeContext = this.buildKnowledgeContext(userMessage);
    
    const messages = [
      { role: 'system', content: AIConfig.systemPrompt },
      { role: 'system', content: knowledgeContext },
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
  },

  /**
   * Build knowledge base context for AI
   */
  buildKnowledgeContext(userMessage) {
    if (typeof AIKnowledgeBase === 'undefined') {
      return '';
    }

    const message = userMessage.toLowerCase();
    let context = '**KNOWLEDGE BASE REFERENCE:**\n\n';

    // Check for how-to questions
    if (message.includes('how') || message.includes('search') || message.includes('find')) {
      if (message.includes('search') || message.includes('find')) {
        context += AIKnowledgeBase.howTo.search.answer + '\n\n';
      }
      if (message.includes('submit') || message.includes('upload')) {
        context += AIKnowledgeBase.howTo.submit.answer + '\n\n';
      }
      if (message.includes('save') || message.includes('favorite')) {
        context += AIKnowledgeBase.howTo.save.answer + '\n\n';
      }
      if (message.includes('cite') || message.includes('citation')) {
        context += AIKnowledgeBase.howTo.citation.answer + '\n\n';
      }
      if (message.includes('chat') || message.includes('conversation')) {
        context += AIKnowledgeBase.howTo.chatbot.answer + '\n\n';
      }
    }

    // Check for role/permission questions
    if (message.includes('role') || message.includes('permission') || message.includes('can i') || message.includes('access')) {
      context += '**USER ROLES:**\n';
      Object.keys(AIKnowledgeBase.roles).forEach(role => {
        const roleInfo = AIKnowledgeBase.roles[role];
        context += `- **${roleInfo.name}**: ${roleInfo.permissions.slice(0, 3).join(', ')}\n`;
      });
      context += '\n';
    }

    // Check for program questions
    if (message.includes('program') || message.includes('course') || message.includes('bsit') || message.includes('bscs')) {
      context += '**AVAILABLE PROGRAMS:**\n';
      AIKnowledgeBase.programs.forEach(prog => {
        context += `- **${prog.code}**: ${prog.name}\n`;
      });
      context += '\n';
    }

    // Check for FAIR principles
    if (message.includes('fair') || message.includes('principle')) {
      context += AIKnowledgeBase.howTo.fairPrinciples.answer + '\n\n';
    }

    // Check for troubleshooting
    if (message.includes('not working') || message.includes('error') || message.includes('problem') || message.includes('issue')) {
      context += '**COMMON ISSUES:**\n';
      Object.keys(AIKnowledgeBase.troubleshooting).forEach(key => {
        const issue = AIKnowledgeBase.troubleshooting[key];
        context += `- ${issue.issue}: ${issue.solutions[0]}\n`;
      });
      context += '\n';
    }

    return context.trim() || 'Use the knowledge base to provide accurate information.';
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIService;
}
