/**
 * Groq API Configuration
 * Handles AI-powered semantic search using Groq
 * 
 * API key is loaded from api-keys.js
 */

const GroqConfig = {
  // Groq API Configuration
  apiKey: API_KEYS.groq,
  apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
  
  // Model configuration
  model: 'llama-3.1-8b-instant', // Fast and efficient for search
  
  // Search parameters
  maxTokens: 500,
  temperature: 0.3, // Lower temperature for more focused results
  
  // System prompt for search
  systemPrompt: `You are an intelligent search assistant for a capstone project repository at CTU Daanbantayan Campus.

Your task is to analyze search queries and match them with relevant capstone projects based on semantic meaning, not just keywords.

When given a search query and a list of projects, you should:
1. Understand the intent and context of the search query
2. Match projects based on semantic similarity, not just exact keyword matches
3. Consider synonyms, related concepts, and contextual meaning
4. Return the IDs of the most relevant projects in order of relevance
5. Handle natural language queries (e.g., "projects about AI in agriculture")

Return ONLY a JSON array of project IDs in order of relevance, like: ["id1", "id2", "id3"]
If no relevant projects are found, return an empty array: []

Do not include any explanations, just the JSON array.`,

  // Fallback to simple search if API fails
  useFallback: false
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GroqConfig;
}
