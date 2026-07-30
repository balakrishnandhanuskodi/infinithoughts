import xml2js from 'xml2js';
import js2xmlparser from 'js2xmlparser';

interface ParsedArticle {
  id: string;
  metadata: {
    title: string;
    slug: string;
    excerpt: string;
    author?: { name?: string; anonymous?: boolean };
    issue: {
      issue_id: string;
      issue_number: number;
      month: string;
      year: number;
    };
    publication_date: string;
    created_date?: string;
    updated_date?: string;
    reading_time_minutes?: number;
    word_count?: number;
    page_number?: number;
    theme?: string;
  };
  content: any;
  media?: any;
  tags?: any;
}

export class XMLParser {
  private xmlParser = new xml2js.Parser({
    explicitArray: false,
    mergeAttrs: true,
  });

  /**
   * Parse XML string to JavaScript object
   */
  async parseXML(xmlString: string): Promise<ParsedArticle> {
    try {
      const result = await this.xmlParser.parseStringPromise(xmlString);
      return result.article;
    } catch (error) {
      throw new Error(`Failed to parse XML: ${error}`);
    }
  }

  /**
   * Serialize JavaScript object to XML string
   */
  serializeToXML(article: ParsedArticle): string {
    try {
      return js2xmlparser.parse('article', article, {
        declaration: { encoding: 'UTF-8', version: '1.0' },
        format: {
          doubleQuotes: true,
          indent: '  ',
          newline: '\n',
          pretty: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to serialize to XML: ${error}`);
    }
  }

  /**
   * Convert XML content to HTML for rendering
   */
  contentToHTML(contentObj: any): string {
    if (!contentObj) return '';

    let html = '';
    const elements = Array.isArray(contentObj) ? contentObj : [contentObj];

    for (const element of elements) {
      html += this.elementToHTML(element);
    }

    return html;
  }

  /**
   * Convert individual XML element to HTML
   */
  private elementToHTML(element: any): string {
    if (!element) return '';

    // Handle text content
    if (typeof element === 'string') {
      return this.escapeHtml(element);
    }

    // Heading
    if (element.heading) {
      const level = element.heading.level || 1;
      const text = typeof element.heading === 'string' ? element.heading : element.heading._;
      return `<h${level}>${this.escapeHtml(text)}</h${level}>`;
    }

    // Subheading
    if (element.subheading) {
      const level = element.subheading.level || 2;
      const text = typeof element.subheading === 'string' ? element.subheading : element.subheading._;
      return `<h${level}>${this.escapeHtml(text)}</h${level}>`;
    }

    // Paragraph
    if (element.paragraph) {
      const content = this.formatParagraphContent(element.paragraph);
      return `<p>${content}</p>`;
    }

    // Pull Quote
    if (element.pull_quote) {
      const quote = element.pull_quote.quote || '';
      const attribution = element.pull_quote.attribution || '';
      return `<blockquote class="pull-quote">
        <p>${this.escapeHtml(quote)}</p>
        ${attribution ? `<p class="attribution">— ${this.escapeHtml(attribution)}</p>` : ''}
      </blockquote>`;
    }

    // Blockquote
    if (element.blockquote) {
      const text = typeof element.blockquote === 'string' ? element.blockquote : element.blockquote._;
      const source = element.blockquote.source || '';
      return `<blockquote class="blockquote">
        <p>${this.escapeHtml(text)}</p>
        ${source ? `<p class="source">Source: ${this.escapeHtml(source)}</p>` : ''}
      </blockquote>`;
    }

    // List
    if (element.list) {
      const type = element.list.type === 'ordered' ? 'ol' : 'ul';
      const items = Array.isArray(element.list.item) ? element.list.item : [element.list.item];
      const itemsHTML = items
        .map((item: any) => `<li>${this.escapeHtml(typeof item === 'string' ? item : item._)}</li>`)
        .join('');
      return `<${type}>${itemsHTML}</${type}>`;
    }

    // Image Reference
    if (element.image_ref) {
      const src = element.image_ref.src || '';
      const alt = element.image_ref.alt || '';
      const caption = element.image_ref.caption || '';
      const credit = element.image_ref.credit || '';
      return `<figure>
        <img src="${src}" alt="${this.escapeHtml(alt)}" />
        ${caption ? `<figcaption>${this.escapeHtml(caption)}` : '<figcaption>'}
        ${credit ? `<p class="credit">Photo by ${this.escapeHtml(credit)}</p>` : ''}
        </figcaption>
      </figure>`;
    }

    // Section
    if (element.section) {
      const title = element.section.title ? `<h3>${this.escapeHtml(element.section.title)}</h3>` : '';
      const content = this.contentToHTML(element.section);
      return `<section>${title}${content}</section>`;
    }

    return '';
  }

  /**
   * Format paragraph content with inline elements (bold, italic, links)
   */
  private formatParagraphContent(paragraphObj: any): string {
    if (typeof paragraphObj === 'string') {
      return this.escapeHtml(paragraphObj);
    }

    let html = '';

    if (paragraphObj._) {
      html += this.escapeHtml(paragraphObj._);
    }

    if (paragraphObj.bold) {
      const boldText = Array.isArray(paragraphObj.bold) ? paragraphObj.bold.join('') : paragraphObj.bold;
      html += `<strong>${this.escapeHtml(boldText)}</strong>`;
    }

    if (paragraphObj.italic) {
      const italicText = Array.isArray(paragraphObj.italic) ? paragraphObj.italic.join('') : paragraphObj.italic;
      html += `<em>${this.escapeHtml(italicText)}</em>`;
    }

    if (paragraphObj.link) {
      const link = Array.isArray(paragraphObj.link) ? paragraphObj.link[0] : paragraphObj.link;
      const href = link.href || '#';
      const text = link._ || 'Link';
      html += `<a href="${href}" target="${link.target || '_self'}">${this.escapeHtml(text)}</a>`;
    }

    if (paragraphObj.underline) {
      const underlineText = Array.isArray(paragraphObj.underline) ? paragraphObj.underline.join('') : paragraphObj.underline;
      html += `<u>${this.escapeHtml(underlineText)}</u>`;
    }

    return html;
  }

  /**
   * Extract plain text from XML content (for search/embeddings)
   */
  extractText(contentObj: any): string {
    if (!contentObj) return '';

    let text = '';
    const elements = Array.isArray(contentObj) ? contentObj : [contentObj];

    for (const element of elements) {
      if (typeof element === 'string') {
        text += ' ' + element;
      } else if (element.heading) {
        text += ' ' + (typeof element.heading === 'string' ? element.heading : element.heading._);
      } else if (element.paragraph) {
        text += ' ' + (typeof element.paragraph === 'string' ? element.paragraph : element.paragraph._);
      } else if (element.pull_quote?.quote) {
        text += ' ' + element.pull_quote.quote;
      } else if (element.blockquote) {
        text += ' ' + (typeof element.blockquote === 'string' ? element.blockquote : element.blockquote._);
      }
    }

    return text.trim();
  }

  /**
   * Calculate reading time (approx 200 words per minute)
   */
  calculateReadingTime(text: string): number {
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / 200);
  }

  /**
   * Calculate word count
   */
  calculateWordCount(text: string): number {
    return text.split(/\s+/).length;
  }

  /**
   * Validate article structure
   */
  validateArticle(article: ParsedArticle): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!article.id) errors.push('Missing required field: id');
    if (!article.metadata?.title) errors.push('Missing required field: metadata.title');
    if (!article.metadata?.slug) errors.push('Missing required field: metadata.slug');
    if (!article.metadata?.excerpt) errors.push('Missing required field: metadata.excerpt');
    if (!article.metadata?.issue?.issue_id) errors.push('Missing required field: metadata.issue.issue_id');
    if (!article.content) errors.push('Missing required field: content');

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * HTML escape utility
   */
  private escapeHtml(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

export default new XMLParser();
