import * as pdfjsLib from 'pdfjs-dist';
import { createCanvas } from 'canvas';
import path from 'path';
import storageService from './storageService';
import pdfProcessingService from './pdfProcessingService';

// Set up PDF.js worker - use require.resolve for reliable path resolution
try {
  const pdfjsWorkerPath = require.resolve('pdfjs-dist/build/pdf.worker.js');
  console.log(`📄 [pageExtraction] Setting PDF.js worker: ${pdfjsWorkerPath}`);
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerPath;
} catch (err) {
  console.error(`❌ [pageExtraction] Failed to resolve PDF.js worker:`, err);
  // Fallback: try to set it anyway
  try {
    const fallbackPath = path.join(__dirname, '../../node_modules/pdfjs-dist/build/pdf.worker.js');
    console.log(`📄 [pageExtraction] Using fallback worker path: ${fallbackPath}`);
    pdfjsLib.GlobalWorkerOptions.workerSrc = fallbackPath;
  } catch (fallbackErr) {
    console.error(`❌ [pageExtraction] Failed to set fallback worker:`, fallbackErr);
  }
}

export class PageExtractionService {
  /**
   * Extract pages from PDF buffer and save as images
   */
  async extractPagesAsImages(
    buffer: Buffer,
    issueId: string,
    issueNumber: number,
    year: number
  ): Promise<{ pageCount: number; extractedPages: any[] }> {
    try {
      console.log(`📄 [pageExtraction] Starting page extraction for issue ${issueNumber}/${year}`);

      // Load PDF from buffer
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const pageCount = pdf.numPages;

      console.log(`📄 [pageExtraction] PDF has ${pageCount} pages`);

      const extractedPages = [];

      // Extract each page
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        try {
          console.log(`📸 [pageExtraction] Extracting page ${pageNum}/${pageCount}...`);

          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2 }); // 2x scale for better quality

          // Create canvas
          const canvas = createCanvas(viewport.width, viewport.height);
          const context = canvas.getContext('2d');

          // Render page to canvas
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          // Convert canvas to PNG buffer
          const pageBuffer = canvas.toBuffer('image/png');
          console.log(`📦 [pageExtraction] Page ${pageNum} buffer size: ${pageBuffer.length} bytes`);

          // Upload to Supabase Storage (MUST succeed before continuing)
          const filename = `issue-${issueNumber}-${year}-page-${pageNum}.png`;
          const storagePath = `pages/${filename}`;

          try {
            console.log(`⏳ [pageExtraction] Uploading page ${pageNum}...`);
            await storageService.uploadPageImage(filename, pageBuffer, 'image/png');
            console.log(`✅ [pageExtraction] Page ${pageNum} uploaded to storage`);
          } catch (uploadError) {
            console.error(`❌ [pageExtraction] FAILED to upload page ${pageNum}:`, uploadError);
            throw uploadError; // Re-throw to stop processing this page
          }

          // Only get URL and create DB record AFTER successful upload
          const pageUrl = storageService.getPublicUrl(storagePath);
          console.log(`🔗 [pageExtraction] Page ${pageNum} URL: ${pageUrl}`);

          // Create flipbook page record
          try {
            const pageRecord = await pdfProcessingService.createFlipbookPage(
              issueId,
              pageNum,
              storagePath,
              pageUrl,
              pageUrl,
              pageUrl
            );
            console.log(`📝 [pageExtraction] Page ${pageNum} database record created`);

            extractedPages.push({
              page_number: pageNum,
              storage_path: storagePath,
              url: pageUrl,
              id: pageRecord.id,
            });

            console.log(`✅ [pageExtraction] Page ${pageNum} completed`);
          } catch (dbError) {
            console.error(`❌ [pageExtraction] FAILED to create DB record for page ${pageNum}:`, dbError);
            throw dbError;
          }
        } catch (pageError) {
          console.error(`❌ [pageExtraction] Error processing page ${pageNum}:`, pageError);
          // Continue with next page instead of failing entire extraction
        }
      }

      console.log(`✅ [pageExtraction] Completed extraction for ${extractedPages.length}/${pageCount} pages`);

      return {
        pageCount,
        extractedPages,
      };
    } catch (error) {
      console.error('❌ [pageExtraction] Page extraction failed:', error);
      throw error;
    }
  }
}

export default new PageExtractionService();
