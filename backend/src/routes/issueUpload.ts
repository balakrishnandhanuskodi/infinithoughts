import { Router, Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import storageService from '../services/storageService';
import pdfProcessingService from '../services/pdfProcessingService';
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

    console.log(`✅ [issueUpload] Issue created successfully: ${issueId}`);

    res.status(201).json({
      id: issue.id,
      issue_number: issue.issue_number,
      month: issue.month,
      year: issue.year,
      pdf_url: issue.pdf_url,
      total_pages: issue.total_pages,
      pdf_status: issue.pdf_status,
      created_at: issue.created_at,
      message: 'PDF uploaded successfully. Pages are ready for flipbook viewer.',
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

export default router;
