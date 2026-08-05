import pool from '../db/client';
import { v4 as uuidv4 } from 'uuid';

export interface ArticleInput {
  title: string;
  slug: string;
  excerpt: string;
  content_html: string;
  content_json?: any;
  issue_id: string;
  reading_time_minutes?: number;
  word_count?: number;
  page_number?: number;
  theme?: string;
  featured_image_url?: string;
  source: 'xml' | 'cms';
  xml_file_path?: string;
  author_id?: string;
  publication_date?: Date | string;
  created_date?: Date | string;
  status?: string;
}

export interface ArticleOutput extends ArticleInput {
  id: string;
  status: string;
  current_reviewer_id?: string;
  created_at: Date;
  updated_at: Date;
  published_at?: Date;
}

export class ArticleService {
  /**
   * Create a new article
   */
  async createArticle(data: ArticleInput): Promise<ArticleOutput> {
    const id = uuidv4();
    const now = new Date();

    const query = `
      INSERT INTO articles (
        id, title, slug, excerpt, content_html, content_json,
        issue_id, reading_time_minutes, word_count, page_number,
        theme, featured_image_url, source, xml_file_path,
        author_id, publication_date, created_date,
        status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *
    `;

    const values = [
      id,
      data.title,
      data.slug,
      data.excerpt,
      data.content_html,
      JSON.stringify(data.content_json),
      data.issue_id,
      data.reading_time_minutes || null,
      data.word_count || null,
      data.page_number || null,
      data.theme || null,
      data.featured_image_url || null,
      data.source,
      data.xml_file_path || null,
      data.author_id || null,
      data.publication_date || null,
      data.created_date || null,
      'DRAFT',
      now,
      now,
    ];

    try {
      const result = await pool.query(query, values);
      return this.formatArticle(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to create article: ${error}`);
    }
  }

  /**
   * Get article by ID
   */
  async getArticleById(id: string): Promise<ArticleOutput | null> {
    const query = 'SELECT * FROM articles WHERE id = $1';

    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) return null;
      return this.formatArticle(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to fetch article: ${error}`);
    }
  }

  /**
   * List articles with filtering
   */
  async listArticles(filters?: {
    status?: string;
    issue_id?: string;
    source?: 'xml' | 'cms';
    limit?: number;
    offset?: number;
  }): Promise<{ articles: ArticleOutput[]; total: number }> {
    let query = 'SELECT * FROM articles WHERE 1=1';
    const values: any[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      query += ` AND status = $${paramIndex}`;
      values.push(filters.status);
      paramIndex++;
    }

    if (filters?.issue_id) {
      query += ` AND issue_id = $${paramIndex}`;
      values.push(filters.issue_id);
      paramIndex++;
    }

    if (filters?.source) {
      query += ` AND source = $${paramIndex}`;
      values.push(filters.source);
      paramIndex++;
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count, 10);

    // Add pagination
    const limit = filters?.limit || 10;
    const offset = filters?.offset || 0;
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    try {
      const result = await pool.query(query, values);
      return {
        articles: result.rows.map((row) => this.formatArticle(row)),
        total,
      };
    } catch (error) {
      throw new Error(`Failed to list articles: ${error}`);
    }
  }

  /**
   * Update article
   */
  async updateArticle(id: string, data: Partial<ArticleInput>): Promise<ArticleOutput> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        updates.push(`${key} = $${paramIndex}`);
        values.push(key === 'content_json' ? JSON.stringify(value) : value);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return this.getArticleById(id) as Promise<ArticleOutput>;
    }

    updates.push(`updated_at = $${paramIndex}`);
    values.push(new Date());
    paramIndex++;

    const query = `
      UPDATE articles
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    values.push(id);

    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) throw new Error('Article not found');
      return this.formatArticle(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to update article: ${error}`);
    }
  }

  /**
   * Change article status
   */
  async updateStatus(
    articleId: string,
    newStatus: string,
    userId: string,
    reason?: string
  ): Promise<ArticleOutput> {
    const article = await this.getArticleById(articleId);
    if (!article) throw new Error('Article not found');

    const oldStatus = article.status;

    // Update article status
    const updated = await this.updateArticle(articleId, {
      status: newStatus as any,
      current_reviewer_id: userId as any,
    });

    // Log status change
    const logQuery = `
      INSERT INTO article_status_history (
        article_id, old_status, new_status, changed_by_user_id, reason_or_comment
      ) VALUES ($1, $2, $3, $4, $5)
    `;
    await pool.query(logQuery, [articleId, oldStatus, newStatus, userId, reason || null]);

    return updated;
  }

  /**
   * Publish article (final status change)
   */
  async publishArticle(articleId: string, userId: string): Promise<ArticleOutput> {
    const article = await this.getArticleById(articleId);
    if (!article) throw new Error('Article not found');

    const publishedAt = new Date();
    const updated = await this.updateArticle(articleId, {
      status: 'PUBLISHED' as any,
      published_at: publishedAt as any,
    });

    // Log publish action
    const logQuery = `
      INSERT INTO article_status_history (
        article_id, old_status, new_status, changed_by_user_id, reason_or_comment
      ) VALUES ($1, $2, $3, $4, $5)
    `;
    await pool.query(logQuery, [articleId, article.status, 'PUBLISHED', userId, 'Article published']);

    return updated;
  }

  /**
   * Get articles by status (for approval queues)
   */
  async getArticlesByStatus(status: string): Promise<ArticleOutput[]> {
    const query = `
      SELECT * FROM articles
      WHERE status = $1
      ORDER BY created_at ASC
    `;

    try {
      const result = await pool.query(query, [status]);
      return result.rows.map((row) => this.formatArticle(row));
    } catch (error) {
      throw new Error(`Failed to fetch articles by status: ${error}`);
    }
  }

  /**
   * Get related articles (by tags/theme)
   */
  async getRelatedArticles(articleId: string, limit: number = 5): Promise<ArticleOutput[]> {
    const query = `
      SELECT a.* FROM articles a
      JOIN article_tags at1 ON a.id = at1.article_id
      JOIN article_tags at2 ON at1.tag_id = at2.tag_id
      WHERE at2.article_id = $1 AND a.id != $1 AND a.status = 'PUBLISHED'
      GROUP BY a.id
      ORDER BY a.published_at DESC
      LIMIT $2
    `;

    try {
      const result = await pool.query(query, [articleId, limit]);
      return result.rows.map((row) => this.formatArticle(row));
    } catch (error) {
      throw new Error(`Failed to fetch related articles: ${error}`);
    }
  }

  /**
   * Format article row from database
   */
  private formatArticle(row: any): ArticleOutput {
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      content_html: row.content_html,
      content_json: typeof row.content_json === 'string' ? JSON.parse(row.content_json) : row.content_json,
      issue_id: row.issue_id,
      reading_time_minutes: row.reading_time_minutes,
      word_count: row.word_count,
      page_number: row.page_number,
      theme: row.theme,
      featured_image_url: row.featured_image_url,
      source: row.source,
      xml_file_path: row.xml_file_path,
      author_id: row.author_id,
      publication_date: row.publication_date ? new Date(row.publication_date) : undefined,
      created_date: row.created_date ? new Date(row.created_date) : undefined,
      status: row.status,
      current_reviewer_id: row.current_reviewer_id,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      published_at: row.published_at ? new Date(row.published_at) : undefined,
    };
  }
}

export default new ArticleService();
