import * as pdfjsLib from 'pdfjs-dist';
import { createCanvas } from 'canvas';
import path from 'path';
import storageService from './storageService';
import pdfProcessingService from './pdfProcessingService';

// Set up PDF.js worker
const pdfjsWorkerPath = path.join(__dirname, '../../node_modules/pdfjs-dist/build/pdf.worker.js');
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerPath;

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

          // Upload to Supabase Storage
          const filename = `issue-${issueNumber}-${year}-page-${pageNum}.png`;
          const storagePath = `pages/${filename}`;

          await storageService.uploadPageImage(filename, pageBuffer, 'image/png');
          const pageUrl = storageService.getPublicUrl(storagePath);

          // Create flipbook page record
          const pageRecord = await pdfProcessingService.createFlipbookPage(
            issueId,
            pageNum,
            storagePath,
            pageUrl, // Use page image URL as thumbnail
            pageUrl, // Use page image URL for mobile
            pageUrl  // Use page image URL for desktop
          );

          console.log(`✅ [pageExtraction] Page ${pageNum} extracted and saved`);

          extractedPages.push({
            page_number: pageNum,
            storage_path: storagePath,
            url: pageUrl,
            id: pageRecord.id,
          });
        } catch (pageError) {
          console.error(`❌ [pageExtraction] Error extracting page ${pageNum}:`, pageError);
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
