/**
 * Groq Service
 * Handles AI-powered semantic search using Groq API
 */

const GroqService = {
  isInitialized: false,
  useFallback: false,
  projectsCache: [],

  /**
   * Initialize Groq service
   */
  async init() {
    try {
      // Test API connection
      const testResponse = await this.testConnection();
      
      if (testResponse) {
        this.isInitialized = true;
        console.log('✓ Groq AI Search initialized successfully');
      } else {
        console.warn('⚠️ Groq API test failed. Using fallback search.');
        this.useFallback = true;
      }
      
    } catch (error) {
      console.warn('⚠️ Groq initialization failed. Using fallback search.', error);
      this.useFallback = true;
    }
  },

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const response = await fetch(GroqConfig.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GroqConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: GroqConfig.model,
          messages: [
            { role: 'user', content: 'test' }
          ],
          max_tokens: 10
        })
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  },

  /**
   * Update projects cache for semantic search
   */
  updateProjectsCache(projects) {
    this.projectsCache = projects;
    console.log(`✓ Updated projects cache: ${projects.length} projects`);
  },

  /**
   * Semantic search using Groq AI
   */
  async semanticSearch(query, projects = null) {
    // Use fallback if Groq is not available
    if (this.useFallback) {
      console.log('Using fallback search (Firebase)');
      return await Database.searchProjects(query);
    }

    // Use cached projects if not provided
    const searchProjects = projects || this.projectsCache;

    if (searchProjects.length === 0) {
      console.warn('No projects available for search');
      return [];
    }

    try {
      // Prepare project summaries for AI
      const projectSummaries = this.prepareProjectSummaries(searchProjects);

      // Create prompt for AI
      const userPrompt = `Search Query: "${query}"

Available Projects:
${projectSummaries}

Return the IDs of projects most relevant to the search query, ordered by relevance.`;

      // Call Groq API
      const response = await fetch(GroqConfig.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GroqConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: GroqConfig.model,
          messages: [
            { role: 'system', content: GroqConfig.systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: GroqConfig.maxTokens,
          temperature: GroqConfig.temperature
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || '[]';

      // Parse AI response
      const relevantIds = this.parseAIResponse(aiResponse);

      // Get full project objects in order of relevance
      const results = this.getProjectsByIds(searchProjects, relevantIds);

      console.log(`✓ Groq AI found ${results.length} relevant results`);

      return results;

    } catch (error) {
      console.error('Groq search error:', error);
      // Fallback to Firebase search
      return await Database.searchProjects(query);
    }
  },

  /**
   * Prepare project summaries for AI
   */
  prepareProjectSummaries(projects) {
    return projects.map(project => {
      const authors = Array.isArray(project.authors) ? project.authors.join(', ') : '';
      const topics = Array.isArray(project.topics) ? project.topics.join(', ') : '';
      const keywords = Array.isArray(project.keywords) ? project.keywords.join(', ') : '';
      
      return `ID: ${project.id}
Title: ${project.title || 'Untitled'}
Authors: ${authors}
Year: ${project.year || 'N/A'}
Program: ${project.program || 'N/A'}
Topics: ${topics}
Keywords: ${keywords}
Abstract: ${this.truncate(project.abstract, 200)}
---`;
    }).join('\n');
  },

  /**
   * Parse AI response to extract project IDs
   */
  parseAIResponse(response) {
    try {
      // Try to parse as JSON array
      const cleaned = response.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const ids = JSON.parse(cleaned);
      
      if (Array.isArray(ids)) {
        return ids;
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing AI response:', error);
      
      // Try to extract IDs using regex as fallback
      const idMatches = response.match(/"([a-zA-Z0-9_-]+)"/g);
      if (idMatches) {
        return idMatches.map(match => match.replace(/"/g, ''));
      }
      
      return [];
    }
  },

  /**
   * Get projects by IDs in order
   */
  getProjectsByIds(projects, ids) {
    const results = [];
    
    for (const id of ids) {
      const project = projects.find(p => p.id === id);
      if (project) {
        results.push(project);
      }
    }
    
    return results;
  },

  /**
   * Truncate text
   */
  truncate(text, length) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  },

  /**
   * Simple keyword search (fallback)
   */
  async keywordSearch(query, projects) {
    const lowerQuery = query.toLowerCase();
    
    return projects.filter(project => {
      const searchText = `
        ${project.title || ''}
        ${Array.isArray(project.authors) ? project.authors.join(' ') : ''}
        ${project.abstract || ''}
        ${Array.isArray(project.keywords) ? project.keywords.join(' ') : ''}
        ${Array.isArray(project.topics) ? project.topics.join(' ') : ''}
      `.toLowerCase();
      
      return searchText.includes(lowerQuery);
    });
  },

  /**
   * Natural language query understanding
   */
  async naturalLanguageSearch(query) {
    // Use semantic search for natural language queries
    return await this.semanticSearch(query);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GroqService;
}
