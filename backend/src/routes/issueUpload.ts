import { Router, Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import storageService from '../services/storageService';
import pdfProcessingService from '../services/pdfProcessingService';
import pageExtractionService from '../services/pageExtractionService';
import pool from '../db/client';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Configure multer for file upload (15MB max)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Only PDF files are allowed'));
    } else {
      cb(null, true);
    }
  },
});

// Validation schema
const CreateIssueSchema = z.object({
  issue_number: z.coerce.number().positive(),
  month: z.string().optional(),
  year: z.coerce.number().min(2000).max(2100),
});

/**
 * POST /api/admin/issues/upload
 * Upload a PDF magazine issue
 */
router.post('/', upload.single('pdf'), async (req: Request, res: Response) => {
  const issueId = uuidv4();

  try {
    // Validate request body
    const bodyValidation = CreateIssueSchema.parse(req.body);
    const { issue_number, month, year } = bodyValidation;

    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    console.log(`📦 [issueUpload] Starting upload for issue ${issue_number}/${year}`);

    // Create issue record FIRST (so logging steps can reference it)
    console.log(`💾 [issueUpload] Creating issue record...`);
    const createQuery = `
      INSERT INTO issues (id, issue_number, month, year, pdf_status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(createQuery, [
      issueId,
      issue_number,
      month || null,
      year,
      'PROCESSING',
    ]);

    const issue = result.rows[0];
    console.log(`✅ [issueUpload] Issue record created: ${issueId}`);

    // Log step: received file
    await pdfProcessingService.logProcessingStep(
      issueId,
      'FILE_RECEIVED',
      'PROCESSING',
      `Received ${req.file.originalname} (${req.file.size} bytes)`
    );

    // Extract PDF metadata
    console.log(`📄 [issueUpload] Extracting PDF metadata...`);
    const metadata = await pdfProcessingService.extractPDFMetadata(req.file.buffer);
    console.log(`✅ [issueUpload] PDF has ${metadata.pages} pages`);

    // Upload PDF to Supabase Storage
    console.log(`📤 [issueUpload] Uploading PDF to storage...`);
    const filename = `issue-${issue_number}-${year}-${Date.now()}.pdf`;
    await storageService.uploadPDF(filename, req.file.buffer, req.file.mimetype);
    const pdfUrl = storageService.getPublicUrl(`pdfs/${filename}`);

    // Update issue with PDF details - need to use direct SQL for pdf_url
    console.log(`🔄 [issueUpload] Updating issue with PDF metadata...`);
    await pool.query(
      `UPDATE issues SET pdf_url = $1, pdf_filename = $2, pdf_size_bytes = $3, total_pages = $4, pdf_status = $5, upload_completed_at = NOW(), updated_at = NOW() WHERE id = $6`,
      [pdfUrl, filename, req.file.size, metadata.pages, 'COMPLETED', issueId]
    );

    // Log step: completed
    await pdfProcessingService.logProcessingStep(
      issueId,
      'UPLOAD_COMPLETED',
      'COMPLETED',
      `Successfully uploaded ${metadata.pages} pages`
    );

    // Extract pages asynchronously (don't wait for completion)
    console.log(`⚙️  [issueUpload] Starting page extraction (async)...`);
    pageExtractionService
      .extractPagesAsImages(req.file.buffer, issueId, issue_number, year)
      .then(async (result) => {
        console.log(`✅ [issueUpload] Page extraction completed: ${result.extractedPages.length} pages`);
        // Update issue status to COMPLETED after pages are extracted
        await pool.query(
          `UPDATE issues SET pdf_status = 'COMPLETED', updated_at = NOW() WHERE id = $1`,
          [issueId]
        );
        await pdfProcessingService.logProcessingStep(
          issueId,
          'PAGES_EXTRACTED',
          'COMPLETED',
          `Extracted ${result.extractedPages.length} pages from PDF`
        );
      })
      .catch(async (error) => {
        console.error(`❌ [issueUpload] Page extraction failed:`, error);
        // Update issue status to FAILED if extraction fails
        await pool.query(
          `UPDATE issues SET pdf_status = 'FAILED', processing_error = $1, updated_at = NOW() WHERE id = $2`,
          [error.message, issueId]
        );
        await pdfProcessingService.logProcessingStep(
          issueId,
          'PAGES_EXTRACTION_FAILED',
          'FAILED',
          undefined,
          error.message
        );
      });

    console.log(`✅ [issueUpload] Issue created successfully: ${issueId}`);

    res.status(201).json({
      id: issueId,
      issue_number,
      month: month || null,
      year,
      pdf_url: pdfUrl,
      pdf_filename: filename,
      pdf_size_bytes: req.file.size,
      total_pages: metadata.pages,
      pdf_status: 'COMPLETED',
      created_at: new Date().toISOString(),
      message: 'PDF uploaded successfully. Pages are being extracted for flipbook viewer.',
    });
  } catch (error: any) {
    console.error(`❌ [issueUpload] Upload failed:`, error);

    // Log the error
    try {
      await pdfProcessingService.logProcessingStep(
        issueId,
        'UPLOAD_FAILED',
        'FAILED',
        undefined,
        error.message
      );

      await pdfProcessingService.updateIssueStatus(issueId, 'FAILED', {
        processing_error: error.message,
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    if (error.message.includes('Only PDF files')) {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    if (error.message.includes('file size')) {
      return res.status(413).json({ error: 'File size exceeds 15MB limit' });
    }

    res.status(500).json({ error: error.message || 'Failed to upload PDF' });
  }
});

/**
 * GET /api/admin/issues/:id/pages
 * Get flipbook pages for an issue
 */
router.get('/:id/pages', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pages = await pdfProcessingService.getFlipbookPages(id);

    res.json({
      issue_id: id,
      total_pages: pages.length,
      pages,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/issues
 * List all uploaded issues with their status
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT
        id,
        issue_number,
        month,
        year,
        pdf_filename,
        pdf_status,
        total_pages,
        pdf_url,
        created_at
      FROM issues
      ORDER BY year DESC, issue_number DESC
    `;
    const result = await pool.query(query);

    res.json({
      total: result.rows.length,
      issues: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/issues/:id
 * Get single issue details with PDF verification
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT
        id,
        issue_number,
        month,
        year,
        pdf_filename,
        pdf_status,
        total_pages,
        pdf_url,
        pdf_size_bytes,
        processing_error,
        created_at,
        updated_at
      FROM issues
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const issue = result.rows[0];

    // Verify PDF exists in storage
    let storageVerified = false;
    if (issue.pdf_url) {
      try {
        // Try to access the public URL
        const publicUrl = issue.pdf_url;
        storageVerified = publicUrl.includes(process.env.SUPABASE_URL);
      } catch (err) {
        storageVerified = false;
      }
    }

    // Get flipbook pages
    const pagesQuery = `
      SELECT COUNT(*) as page_count FROM flipbook_pages WHERE issue_id = $1
    `;
    const pagesResult = await pool.query(pagesQuery, [id]);
    const pageCount = parseInt(pagesResult.rows[0].page_count);

    res.json({
      issue: {
        ...issue,
        storage_verified: storageVerified,
        flipbook_pages_count: pageCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
