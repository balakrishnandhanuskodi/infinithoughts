import pdfParse from 'pdf-parse';
import pool from '../db/client';
import { v4 as uuidv4 } from 'uuid';

export class PDFProcessingService {
  /**
   * Extract metadata from PDF buffer
   */
  async extractPDFMetadata(buffer: Buffer): Promise<{ pages: number; text: string }> {
    try {
      const data = await pdfParse(buffer);
      return {
        pages: data.numpages,
        text: data.text,
      };
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error}`);
    }
  }

  /**
   * Log PDF processing step
   */
  async logProcessingStep(
    issueId: string,
    step: string,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
    message?: string,
    error?: string
  ): Promise<void> {
    const query = `
      INSERT INTO pdf_processing_logs (issue_id, step, status, message, error)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await pool.query(query, [issueId, step, status, message || null, error || null]);
  }

  /**
   * Update issue PDF status
   */
  async updateIssueStatus(
    issueId: string,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
    metadata?: {
      pdf_filename?: string;
      pdf_size_bytes?: number;
      total_pages?: number;
      processing_error?: string;
      upload_completed_at?: Date;
    }
  ): Promise<void> {
    let query = `
      UPDATE issues
      SET pdf_status = $1, updated_at = NOW()
    `;
    const values: any[] = [status];
    let paramIndex = 2;

    if (metadata?.pdf_filename) {
      query += `, pdf_filename = $${paramIndex}`;
      values.push(metadata.pdf_filename);
      paramIndex++;
    }

    if (metadata?.pdf_size_bytes) {
      query += `, pdf_size_bytes = $${paramIndex}`;
      values.push(metadata.pdf_size_bytes);
      paramIndex++;
    }

    if (metadata?.total_pages) {
      query += `, total_pages = $${paramIndex}`;
      values.push(metadata.total_pages);
      paramIndex++;
    }

    if (metadata?.processing_error) {
      query += `, processing_error = $${paramIndex}`;
      values.push(metadata.processing_error);
      paramIndex++;
    }

    if (metadata?.upload_completed_at) {
      query += `, upload_completed_at = $${paramIndex}`;
      values.push(metadata.upload_completed_at);
      paramIndex++;
    }

    query += ` WHERE id = $${paramIndex}`;
    values.push(issueId);

    await pool.query(query, values);
  }

  /**
   * Create flipbook page entry
   */
  async createFlipbookPage(
    issueId: string,
    pageNumber: number,
    storagePath: string,
    thumbnailUrl?: string,
    mobileUrl?: string,
    desktopUrl?: string
  ): Promise<{ id: string }> {
    const id = uuidv4();
    const query = `
      INSERT INTO flipbook_pages
        (id, issue_id, page_number, storage_path, thumbnail_url, mobile_url, desktop_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;

    const result = await pool.query(query, [
      id,
      issueId,
      pageNumber,
      storagePath,
      thumbnailUrl || null,
      mobileUrl || null,
      desktopUrl || null,
    ]);

    return { id: result.rows[0].id };
  }

  /**
   * Get flipbook pages for an issue
   */
  async getFlipbookPages(issueId: string): Promise<any[]> {
    const query = `
      SELECT * FROM flipbook_pages
      WHERE issue_id = $1
      ORDER BY page_number ASC
    `;

    const result = await pool.query(query, [issueId]);
    return result.rows;
  }

  /**
   * Delete flipbook pages for an issue
   */
  async deleteFlipbookPages(issueId: string): Promise<void> {
    const query = `DELETE FROM flipbook_pages WHERE issue_id = $1`;
    await pool.query(query, [issueId]);
  }
}

export default new PDFProcessingService();
