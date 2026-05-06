/**
 * AI Data Context Module
 * Provides live project data to AI for analysis and queries
 */

const AIDataContext = {
  cachedProjects: null,
  cacheTimestamp: null,
  cacheDuration: 5 * 60 * 1000, // 5 minutes

  /**
   * Initialize and cache project data
   */
  async initialize() {
    try {
      await this.refreshCache();
      console.log('✓ AI Data Context initialized');
      return true;
    } catch (error) {
      console.error('Error initializing AI Data Context:', error);
      return false;
    }
  },

  /**
   * Refresh project data cache
   */
  async refreshCache() {
    try {
      if (typeof Database === 'undefined') {
        console.warn('Database module not available');
        return false;
      }

      const projects = await Database.fetchProjects();
      this.cachedProjects = projects;
      this.cacheTimestamp = Date.now();
      
      console.log(`✓ Cached ${projects.length} projects for AI analysis`);
      return true;
    } catch (error) {
      console.error('Error refreshing cache:', error);
      return false;
    }
  },

  /**
   * Get cached projects (refresh if stale)
   */
  async getProjects() {
    const now = Date.now();
    const isStale = !this.cacheTimestamp || (now - this.cacheTimestamp > this.cacheDuration);
    
    if (!this.cachedProjects || isStale) {
      await this.refreshCache();
    }
    
    return this.cachedProjects || [];
  },

  /**
   * Analyze query and extract data if needed
   */
  async analyzeQuery(userMessage) {
    const message = userMessage.toLowerCase();
    console.log(`🔍 Analyzing query: "${userMessage}"`);
    
    // Check if query requires live data
    const requiresData = 
      message.includes('longest title') ||
      message.includes('longest capstone') ||
      message.includes('shortest title') ||
      message.includes('shortest capstone') ||
      message.includes('most recent') ||
      message.includes('latest project') ||
      message.includes('how many') ||
      message.includes('count') ||
      message.includes('total') ||
      message.includes('number of') ||
      message.includes('stored') ||
      message.includes('list all') ||
      message.includes('show me all') ||
      message.includes('statistics') ||
      message.includes('most popular topic') ||
      message.includes('trending') ||
      message.includes('by year') ||
      message.includes('in 2024') ||
      message.includes('in 2025') ||
      message.includes('abstract') ||
      message.includes('show me') ||
      message.includes('find') ||
      message.includes('search for') ||
      message.includes('about') ||
      message.includes('details') ||
      message.includes('information') ||
      message.includes('metadata') ||
      message.includes('author') ||
      message.includes('adviser') ||
      message.includes('year completed') ||
      message.includes('program') ||
      message.includes('keywords') ||
      message.includes('topics') ||
      message.includes('findings') ||
      message.includes('methodology');
    
    console.log(`📊 Requires data: ${requiresData}`);
    
    if (!requiresData) {
      return null; // No data context needed
    }
    
    // Get projects and build context
    const projects = await this.getProjects();
    console.log(`📦 Fetched ${projects ? projects.length : 0} projects from cache/database`);
    
    if (!projects || projects.length === 0) {
      console.error('❌ No projects available');
      return {
        hasData: false,
        message: 'No project data available at the moment.'
      };
    }
    
    // Build data context based on query type
    let context = '**LIVE PROJECT DATA:**\n\n';
    
    // Longest/Shortest title queries
    if (message.includes('longest title') || message.includes('longest capstone')) {
      const longest = this.findLongestTitle(projects);
      if (longest) {
        console.log(`📏 Found longest title: "${longest.title}" (${longest.title.length} chars)`);
        context += `**Longest Title:**\n`;
        context += `- **Title:** ${longest.title}\n`;
        context += `- **Length:** ${longest.title.length} characters\n`;
        context += `- **Authors:** ${Array.isArray(longest.authors) ? longest.authors.join(', ') : longest.authors}\n`;
        context += `- **Year:** ${longest.year}\n`;
        context += `- **Program:** ${longest.program}\n\n`;
      } else {
        console.error('❌ Could not find longest title');
        context += `**Error:** Could not determine longest title from available data.\n\n`;
      }
    }
    
    if (message.includes('shortest title') || message.includes('shortest capstone')) {
      const shortest = this.findShortestTitle(projects);
      if (shortest) {
        console.log(`📏 Found shortest title: "${shortest.title}" (${shortest.title.length} chars)`);
        context += `**Shortest Title:**\n`;
        context += `- **Title:** ${shortest.title}\n`;
        context += `- **Length:** ${shortest.title.length} characters\n`;
        context += `- **Authors:** ${Array.isArray(shortest.authors) ? shortest.authors.join(', ') : shortest.authors}\n`;
        context += `- **Year:** ${shortest.year}\n`;
        context += `- **Program:** ${shortest.program}\n\n`;
      } else {
        console.error('❌ Could not find shortest title');
        context += `**Error:** Could not determine shortest title from available data.\n\n`;
      }
    }
    
    // Count queries - catch more variations
    if (message.includes('how many') || message.includes('count') || 
        message.includes('total') || message.includes('number of') || 
        message.includes('stored')) {
      const stats = this.getStatistics(projects);
      console.log(`📊 Building statistics context: ${stats.total} total projects`);
      context += `**Repository Statistics:**\n`;
      context += `- **Total Projects:** ${stats.total}\n`;
      context += `- **Programs:** ${Object.keys(stats.byProgram).map(p => `${p} (${stats.byProgram[p]})`).join(', ')}\n`;
      context += `- **Years:** ${Object.keys(stats.byYear).map(y => `${y} (${stats.byYear[y]})`).join(', ')}\n`;
      context += `- **Most Popular Topic:** ${stats.topTopic.name} (${stats.topTopic.count} projects)\n\n`;
    }
    
    // Recent/Latest queries
    if (message.includes('most recent') || message.includes('latest')) {
      const recent = this.getRecentProjects(projects, 3);
      context += `**Most Recent Projects:**\n`;
      recent.forEach((proj, idx) => {
        context += `${idx + 1}. **${proj.title}**\n`;
        context += `   - Authors: ${proj.authors.join(', ')}\n`;
        context += `   - Year: ${proj.year} | Program: ${proj.program}\n`;
        context += `   - Topics: ${proj.topics.join(', ')}\n\n`;
      });
    }
    
    // Year-specific queries
    const yearMatch = message.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      const yearProjects = projects.filter(p => p.year === year);
      context += `**Projects from ${year}:**\n`;
      context += `- **Total:** ${yearProjects.length} projects\n`;
      if (yearProjects.length > 0) {
        const topTopics = this.getTopTopics(yearProjects, 3);
        context += `- **Top Topics:** ${topTopics.map(t => `${t.name} (${t.count})`).join(', ')}\n`;
        context += `- **Programs:** ${[...new Set(yearProjects.map(p => p.program))].join(', ')}\n\n`;
      }
    }
    
    // Topic/trending queries
    if (message.includes('popular topic') || message.includes('trending')) {
      const topTopics = this.getTopTopics(projects, 5);
      context += `**Most Popular Topics:**\n`;
      topTopics.forEach((topic, idx) => {
        context += `${idx + 1}. **${topic.name}** - ${topic.count} projects (${topic.percentage}%)\n`;
      });
      context += '\n';
    }
    
    // Specific project search queries
    if (message.includes('abstract') || message.includes('show me') || 
        message.includes('find') || message.includes('search for') ||
        message.includes('about') || message.includes('details') ||
        message.includes('information') || message.includes('metadata')) {
      
      console.log('🔍 Searching for specific project in query...');
      
      // Try to find matching projects by searching keywords in the query
      const searchResults = this.searchProjectsInQuery(projects, userMessage);
      const exactMatches = searchResults.exact;
      const similarMatches = searchResults.similar;
      
      console.log(`📦 Found ${exactMatches.length} exact match(es) and ${similarMatches.length} similar match(es)`);
      
      // CASE 1: Exact matches found - show full details
      if (exactMatches.length > 0) {
        context += `**Exact Match Found:**\n\n`;
        
        // Show up to 3 exact matches with FULL details
        exactMatches.slice(0, 3).forEach((proj, idx) => {
          context += `**Project ${idx + 1}:**\n`;
          context += `- **Title:** ${proj.title}\n`;
          context += `- **Authors:** ${Array.isArray(proj.authors) ? proj.authors.join(', ') : proj.authors || 'Not Available'}\n`;
          context += `- **Adviser:** ${proj.adviser || 'Not Available'}\n`;
          context += `- **Year:** ${proj.year || 'Not Available'}\n`;
          context += `- **Program:** ${proj.program || 'Not Available'}\n`;
          
          if (proj.abstract) {
            context += `- **Abstract:** ${proj.abstract}\n`;
          } else {
            context += `- **Abstract:** Not Available\n`;
          }
          
          if (proj.keywords && Array.isArray(proj.keywords) && proj.keywords.length > 0) {
            context += `- **Keywords:** ${proj.keywords.join(', ')}\n`;
          }
          
          if (proj.topics && Array.isArray(proj.topics) && proj.topics.length > 0) {
            context += `- **Topics:** ${proj.topics.join(', ')}\n`;
          }
          
          if (proj.methodology) {
            context += `- **Methodology:** ${proj.methodology}\n`;
          }
          
          if (proj.findings) {
            context += `- **Findings:** ${proj.findings}\n`;
          }
          
          if (proj.futureResearch && Array.isArray(proj.futureResearch) && proj.futureResearch.length > 0) {
            context += `- **Future Research:** ${proj.futureResearch.join('; ')}\n`;
          }
          
          context += '\n';
        });
        
        if (exactMatches.length > 3) {
          context += `*Note: ${exactMatches.length - 3} more exact match(es) found.*\n\n`;
        }
      }
      // CASE 2: No exact match, but similar matches found - show suggestions
      else if (similarMatches.length > 0) {
        context += `**No Exact Match Found**\n\n`;
        context += `I couldn't find an exact match for your query, but here are some similar projects you might be looking for:\n\n`;
        context += `**Did you mean:**\n\n`;
        
        similarMatches.forEach((proj, idx) => {
          context += `${idx + 1}. **${proj.title}**\n`;
          context += `   - Authors: ${Array.isArray(proj.authors) ? proj.authors.join(', ') : proj.authors || 'Not Available'}\n`;
          context += `   - Year: ${proj.year || 'N/A'} | Program: ${proj.program || 'N/A'}\n`;
          if (proj.topics && Array.isArray(proj.topics) && proj.topics.length > 0) {
            context += `   - Topics: ${proj.topics.join(', ')}\n`;
          }
          context += '\n';
        });
        
        context += `**Instructions for AI:** Present these as "Did you mean?" suggestions. Ask the user to clarify which project they want, or provide more specific keywords.\n\n`;
      }
      // CASE 3: No matches at all - show default message
      else {
        console.log('⚠️ No matching or similar projects found');
        context += `**No Matching Projects Found**\n\n`;
        context += `I searched the database but couldn't find any projects matching your query.\n\n`;
        context += `**Suggestions:**\n`;
        context += `- Check the spelling of the project title\n`;
        context += `- Try using different keywords\n`;
        context += `- Use broader search terms (e.g., "IoT" instead of full title)\n`;
        context += `- Ask "How many projects are there?" to see what's available\n\n`;
        context += `**Instructions for AI:** DO NOT suggest any specific projects. Only provide the suggestions above.\n\n`;
      }
    }
    
    // Add final verification
    context += `\n---\n⚠️ VERIFICATION: The database currently contains exactly ${projects.length} projects. Use this exact number in your response.\n`;
    
    return {
      hasData: true,
      context: context,
      projectCount: projects.length
    };
  },

  /**
   * Find project with longest title
   */
  findLongestTitle(projects) {
    if (!projects || projects.length === 0) {
      console.error('❌ No projects available for findLongestTitle');
      return null;
    }
    
    try {
      return projects.reduce((longest, current) => {
        if (!current.title) {
          console.warn('⚠️ Project missing title:', current);
          return longest;
        }
        return current.title.length > longest.title.length ? current : longest;
      });
    } catch (error) {
      console.error('❌ Error in findLongestTitle:', error);
      return null;
    }
  },

  /**
   * Find project with shortest title
   */
  findShortestTitle(projects) {
    if (!projects || projects.length === 0) {
      console.error('❌ No projects available for findShortestTitle');
      return null;
    }
    
    try {
      return projects.reduce((shortest, current) => {
        if (!current.title) {
          console.warn('⚠️ Project missing title:', current);
          return shortest;
        }
        return current.title.length < shortest.title.length ? current : shortest;
      });
    } catch (error) {
      console.error('❌ Error in findShortestTitle:', error);
      return null;
    }
  },

  /**
   * Get repository statistics
   */
  getStatistics(projects) {
    const stats = {
      total: projects.length,
      byProgram: {},
      byYear: {},
      byTopic: {}
    };
    
    projects.forEach(proj => {
      // Count by program
      stats.byProgram[proj.program] = (stats.byProgram[proj.program] || 0) + 1;
      
      // Count by year
      stats.byYear[proj.year] = (stats.byYear[proj.year] || 0) + 1;
      
      // Count by topic
      if (proj.topics && Array.isArray(proj.topics)) {
        proj.topics.forEach(topic => {
          stats.byTopic[topic] = (stats.byTopic[topic] || 0) + 1;
        });
      }
    });
    
    // Find top topic
    const topicEntries = Object.entries(stats.byTopic);
    const topTopic = topicEntries.length > 0
      ? topicEntries.reduce((a, b) => a[1] > b[1] ? a : b)
      : ['None', 0];
    
    stats.topTopic = {
      name: topTopic[0],
      count: topTopic[1]
    };
    
    return stats;
  },

  /**
   * Get most recent projects
   */
  getRecentProjects(projects, limit = 5) {
    return projects
      .sort((a, b) => {
        // Sort by year descending, then by createdAt if available
        if (b.year !== a.year) return b.year - a.year;
        if (b.createdAt && a.createdAt) {
          return b.createdAt.seconds - a.createdAt.seconds;
        }
        return 0;
      })
      .slice(0, limit);
  },

  /**
   * Get top topics with counts
   */
  getTopTopics(projects, limit = 5) {
    const topicCounts = {};
    
    projects.forEach(proj => {
      if (proj.topics && Array.isArray(proj.topics)) {
        proj.topics.forEach(topic => {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        });
      }
    });
    
    const total = projects.length;
    
    return Object.entries(topicCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: ((count / total) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },

  /**
   * Search projects by keyword
   */
  searchProjects(projects, keyword) {
    const lowerKeyword = keyword.toLowerCase();
    
    return projects.filter(proj => {
      const searchText = `${proj.title} ${proj.authors.join(' ')} ${proj.abstract || ''} ${proj.topics.join(' ')}`.toLowerCase();
      return searchText.includes(lowerKeyword);
    });
  },
  
  /**
   * Search for projects mentioned in user query
   * Extracts potential project titles and searches for matches
   * Returns object with exact matches and similar matches
   */
  searchProjectsInQuery(projects, query) {
    const lowerQuery = query.toLowerCase();
    const exactMatches = [];
    const similarMatches = [];
    
    // Search by matching words in title
    for (const project of projects) {
      if (!project.title) continue;
      
      const titleLower = project.title.toLowerCase();
      const titleWords = titleLower.split(/\s+/).filter(w => w.length > 3); // Words longer than 3 chars
      
      // Count how many significant words from the title appear in the query
      let matchCount = 0;
      for (const word of titleWords) {
        if (lowerQuery.includes(word)) {
          matchCount++;
        }
      }
      
      // Calculate match percentage
      const matchPercentage = titleWords.length > 0 ? (matchCount / titleWords.length) * 100 : 0;
      
      // Exact match: 60% or more words match
      if (matchPercentage >= 60) {
        exactMatches.push({
          project: project,
          matchScore: matchCount,
          matchPercentage: matchPercentage
        });
      }
      // Similar match: 30-59% words match
      else if (matchPercentage >= 30 && matchPercentage < 60) {
        similarMatches.push({
          project: project,
          matchScore: matchCount,
          matchPercentage: matchPercentage
        });
      }
    }
    
    // Sort by match score (highest first)
    exactMatches.sort((a, b) => b.matchScore - a.matchScore);
    similarMatches.sort((a, b) => b.matchScore - a.matchScore);
    
    return {
      exact: exactMatches.map(r => r.project),
      similar: similarMatches.slice(0, 5).map(r => r.project) // Max 5 similar
    };
  },

  /**
   * Get summary for AI context
   */
  getSummary(projects) {
    const stats = this.getStatistics(projects);
    const topTopics = this.getTopTopics(projects, 3);
    
    return `Repository contains ${stats.total} projects across ${Object.keys(stats.byProgram).length} programs. Top topics: ${topTopics.map(t => t.name).join(', ')}.`;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIDataContext;
}
