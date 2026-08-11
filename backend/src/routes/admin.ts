import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/client';
import articleService from '../services/articleService';
import xmlParser from '../services/xmlParser';

const router = Router();

// POST /api/admin/import-xml - Bulk import XML articles
router.post('/import-xml', async (req: Request, res: Response) => {
  try {
    const { xml_files } = req.body;

    if (!Array.isArray(xml_files) || xml_files.length === 0) {
      return res.status(400).json({ error: 'xml_files array is required' });
    }

    const batchId = `batch-${uuidv4()}`;
    const results = {
      batch_id: batchId,
      imported: 0,
      failed: 0,
      errors: [] as any[],
    };

    // Process each XML file
    for (const filePath of xml_files) {
      try {
        // Read XML file (from local or S3 in production)
        const xmlContent = fs.readFileSync(filePath, 'utf-8');

        // Parse XML
        const parsedArticle = await xmlParser.parseXML(xmlContent);

        // Validate
        const validation = xmlParser.validateArticle(parsedArticle);
        if (!validation.valid) {
          results.failed++;
          results.errors.push({
            file: filePath,
            errors: validation.errors,
          });
          continue;
        }

        // Convert content to HTML
        const contentHTML = xmlParser.contentToHTML(parsedArticle.content);
        const plainText = xmlParser.extractText(parsedArticle.content);
        const readingTime = xmlParser.calculateReadingTime(plainText);
        const wordCount = xmlParser.calculateWordCount(plainText);

        // Create article in database
        const article = await articleService.createArticle({
          title: parsedArticle.metadata.title,
          slug: parsedArticle.metadata.slug,
          excerpt: parsedArticle.metadata.excerpt,
          content_html: contentHTML,
          content_json: parsedArticle,
          issue_id: parsedArticle.metadata.issue.issue_id,
          reading_time_minutes: readingTime,
          word_count: wordCount,
          page_number: parsedArticle.metadata.page_number,
          theme: parsedArticle.metadata.theme,
          featured_image_url: parsedArticle.media?.featured_image?.src,
          source: 'xml',
          xml_file_path: filePath,
          publication_date: parsedArticle.metadata.publication_date
            ? new Date(parsedArticle.metadata.publication_date)
            : undefined,
          created_date: parsedArticle.metadata.created_date
            ? new Date(parsedArticle.metadata.created_date)
            : undefined,
        });

        // Archive original XML
        const archiveQuery = `
          INSERT INTO articles_xml_raw (article_id, xml_content, xml_file_path, import_batch_id)
          VALUES ($1, $2, $3, $4)
        `;
        await pool.query(archiveQuery, [
          article.id,
          xmlContent,
          filePath,
          batchId,
        ]);

        results.imported++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          file: filePath,
          error: error.message,
        });
      }
    }

    // Log batch import
    const logQuery = `
      INSERT INTO xml_import_logs (batch_id, total_files, successful, failed, errors, completed_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await pool.query(logQuery, [
      batchId,
      xml_files.length,
      results.imported,
      results.failed,
      JSON.stringify(results.errors),
      new Date(),
    ]);

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/import-logs - Get import history
router.get('/import-logs', async (req: Request, res: Response) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const query = `
      SELECT id, batch_id, total_files, successful, failed, completed_at
      FROM xml_import_logs
      ORDER BY completed_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/import-logs/:batch_id - Get import details
router.get('/import-logs/:batch_id', async (req: Request, res: Response) => {
  try {
    const { batch_id } = req.params;

    const query = `
      SELECT * FROM xml_import_logs
      WHERE batch_id = $1
    `;

    const result = await pool.query(query, [batch_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Import batch not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/articles/:id/source - Get article source (XML or CMS)
router.get('/articles/:id/source', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const article = await articleService.getArticleById(id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    if (article.source === 'xml') {
      // Fetch raw XML
      const query = `
        SELECT xml_content FROM articles_xml_raw
        WHERE article_id = $1
      `;
      const result = await pool.query(query, [id]);

      res.json({
        source: 'xml',
        xml_file_path: article.xml_file_path,
        xml_content: result.rows[0]?.xml_content || null,
        parsed_json: article.content_json,
      });
    } else {
      res.json({
        source: 'cms',
        parsed_json: article.content_json,
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/dashboard - Admin dashboard stats
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const stats = await Promise.all([
      pool.query('SELECT COUNT(*) FROM articles'),
      pool.query("SELECT COUNT(*) FROM articles WHERE status = 'DRAFT'"),
      pool.query("SELECT COUNT(*) FROM articles WHERE status = 'PUBLISHED'"),
      pool.query("SELECT COUNT(*) FROM articles WHERE status = 'IN_MODERATION'"),
      pool.query("SELECT COUNT(*) FROM articles WHERE status = 'READY_FOR_PROOF'"),
    ]);

    res.json({
      total_articles: parseInt(stats[0].rows[0].count, 10),
      draft: parseInt(stats[1].rows[0].count, 10),
      published: parseInt(stats[2].rows[0].count, 10),
      in_moderation: parseInt(stats[3].rows[0].count, 10),
      ready_for_proof: parseInt(stats[4].rows[0].count, 10),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
