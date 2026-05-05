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
    
    // Check if query requires live data
    const requiresData = 
      message.includes('longest title') ||
      message.includes('shortest title') ||
      message.includes('most recent') ||
      message.includes('latest project') ||
      message.includes('how many projects') ||
      message.includes('count') ||
      message.includes('list all') ||
      message.includes('show me all') ||
      message.includes('statistics') ||
      message.includes('most popular topic') ||
      message.includes('trending') ||
      message.includes('by year') ||
      message.includes('in 2024') ||
      message.includes('in 2025');
    
    if (!requiresData) {
      return null; // No data context needed
    }
    
    // Get projects and build context
    const projects = await this.getProjects();
    
    if (!projects || projects.length === 0) {
      return {
        hasData: false,
        message: 'No project data available at the moment.'
      };
    }
    
    // Build data context based on query type
    let context = '**LIVE PROJECT DATA:**\n\n';
    
    // Longest/Shortest title queries
    if (message.includes('longest title')) {
      const longest = this.findLongestTitle(projects);
      context += `**Longest Title:**\n`;
      context += `- **Title:** ${longest.title}\n`;
      context += `- **Length:** ${longest.title.length} characters\n`;
      context += `- **Authors:** ${longest.authors.join(', ')}\n`;
      context += `- **Year:** ${longest.year}\n`;
      context += `- **Program:** ${longest.program}\n\n`;
    }
    
    if (message.includes('shortest title')) {
      const shortest = this.findShortestTitle(projects);
      context += `**Shortest Title:**\n`;
      context += `- **Title:** ${shortest.title}\n`;
      context += `- **Length:** ${shortest.title.length} characters\n`;
      context += `- **Authors:** ${shortest.authors.join(', ')}\n`;
      context += `- **Year:** ${shortest.year}\n`;
      context += `- **Program:** ${shortest.program}\n\n`;
    }
    
    // Count queries
    if (message.includes('how many') || message.includes('count')) {
      const stats = this.getStatistics(projects);
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
    return projects.reduce((longest, current) => {
      return current.title.length > longest.title.length ? current : longest;
    });
  },

  /**
   * Find project with shortest title
   */
  findShortestTitle(projects) {
    return projects.reduce((shortest, current) => {
      return current.title.length < shortest.title.length ? current : shortest;
    });
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
