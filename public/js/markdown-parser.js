/**
 * Lightweight Markdown Parser
 * Converts markdown-formatted text to HTML for AI responses
 * 
 * This is a CLIENT-SIDE parser that handles the AI's formatted output.
 * The AI generates markdown, and this parser converts it to HTML.
 */

const MarkdownParser = {
  /**
   * Parse markdown text to HTML
   * @param {string} text - Markdown formatted text from AI
   * @returns {string} HTML formatted text
   */
  parse(text) {
    if (!text) return '';

    let html = text;

    // 1. Escape HTML to prevent XSS attacks
    html = this.escapeHtml(html);

    // 2. Convert **bold** to <strong>
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 3. Convert *italic* to <em> (but not if it's part of **)
    html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');

    // 4. Convert `inline code` to <code>
    html = html.replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>');

    // 5. Convert numbered lists (1. 2. 3.)
    html = html.replace(/^(\d+)\.\s+(.+)$/gm, '<div class="ai-list-item ai-numbered"><span class="ai-list-number">$1.</span><span>$2</span></div>');

    // 6. Convert bullet points (• or -)
    html = html.replace(/^[•-]\s+(.+)$/gm, '<div class="ai-list-item ai-bullet"><span class="ai-bullet-point">•</span><span>$1</span></div>');

    // 7. Convert section headers (lines ending with :)
    html = html.replace(/^([^:\n]+):$/gm, '<div class="ai-section-header">$1:</div>');

    // 8. Convert double line breaks to paragraph breaks
    html = html.replace(/\n\n/g, '<br><br>');

    // 9. Convert single line breaks to <br>
    html = html.replace(/\n/g, '<br>');

    return html;
  },

  /**
   * Escape HTML to prevent XSS attacks
   * @param {string} text - Raw text
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Strip all HTML tags (for plain text storage)
   * @param {string} html - HTML text
   * @returns {string} Plain text
   */
  stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MarkdownParser;
}
