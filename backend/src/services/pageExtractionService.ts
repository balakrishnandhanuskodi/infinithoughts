import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import { createCanvas } from 'canvas';
import storageService from './storageService';
import pdfProcessingService from './pdfProcessingService';

// Configuration constants
const UPLOAD_MAX_RETRIES = 3;
const UPLOAD_RETRY_DELAY_MS = 1000;
const MAX_HEAP_THRESHOLD = 0.85; // 85% of max heap = trigger GC
const EXTRACTION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes per extraction

// Verify polyfills are available and log status
if ((globalThis as any).DOMMatrix) {
  console.log(`✅ [pageExtraction] DOMMatrix polyfill is available globally`);
} else {
  console.warn(`⚠️  [pageExtraction] WARNING: DOMMatrix polyfill not found!`);
}

// Ensure canvas is available globally for PDF.js to access
try {
  require.cache[require.resolve('canvas')] = require.cache[require.resolve('canvas')] || require('canvas');
  (globalThis as any).canvas = require('canvas');
  (globalThis as any).createCanvas = createCanvas;
  console.log(`📄 [pageExtraction] Canvas available globally for PDF.js`);
} catch (err) {
  console.warn(`⚠️  [pageExtraction] Failed to set global canvas:`, err);
}

// Helper: Delay utility
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Check and manage memory
const checkAndCleanMemory = () => {
  if (global.gc) {
    const memUsage = process.memoryUsage();
    const heapLimit = (memUsage as any).heapLimit || (memUsage as any).heapMax || 2147483648; // fallback to 2GB
    const heapPercent = memUsage.heapUsed / heapLimit;

    if (heapPercent > MAX_HEAP_THRESHOLD) {
      console.log(`🧹 [pageExtraction] Memory at ${(heapPercent * 100).toFixed(1)}%, forcing garbage collection`);
      global.gc();
      const newMemUsage = process.memoryUsage();
      console.log(`   Before GC: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
      console.log(`   After GC: ${Math.round(newMemUsage.heapUsed / 1024 / 1024)}MB`);
    } else {
      console.log(`📊 [pageExtraction] Memory: ${(heapPercent * 100).toFixed(1)}% (${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(heapLimit / 1024 / 1024)}MB)`);
    }
  }
};

// Helper: Upload with retry logic
const uploadWithRetry = async (
  filename: string,
  buffer: Buffer,
  contentType: string,
  pageNum: number,
  maxRetries = UPLOAD_MAX_RETRIES
): Promise<void> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await storageService.uploadPageImage(filename, buffer, contentType);
      if (attempt > 1) {
        console.log(`✅ [pageExtraction] Page ${pageNum} uploaded after ${attempt} attempts`);
      }
      return;
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        const backoffMs = UPLOAD_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(`⏳ [pageExtraction] Upload retry ${attempt}/${maxRetries} for page ${pageNum} in ${backoffMs}ms...`);
        await delay(backoffMs);
      } else {
        console.error(`❌ [pageExtraction] Upload failed after ${maxRetries} attempts for page ${pageNum}`);
      }
    }
  }

  throw lastError || new Error(`Failed to upload page ${pageNum} after ${maxRetries} attempts`);
};

// PDF.js's built-in NodeCanvasFactory lazily calls require('canvas') while
// processing image-heavy pages. Supply a factory backed by the module imported
// above so all canvas allocation uses the API process's known-good binding.
const canvasFactory = {
  create(width: number, height: number) {
    const canvas = createCanvas(width, height);
    return { canvas, context: canvas.getContext('2d') };
  },
  reset(canvasAndContext: { canvas: ReturnType<typeof createCanvas> }, width: number, height: number) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  },
  destroy(canvasAndContext: { canvas: ReturnType<typeof createCanvas> }) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
  },
};

// Note: PDF.js will attempt to use canvas for rendering
// Canvas is imported at the top of this file and available globally
// Both canvasFactory and disableWorker: true provide defense-in-depth protection

export class PageExtractionService {
  /**
   * Extract pages from PDF buffer and save as images
   * Includes memory management, retry logic, and timeout handling
   */
  async extractPagesAsImages(
    buffer: Buffer,
    issueId: string,
    issueNumber: number,
    year: number
  ): Promise<{ pageCount: number; extractedPages: any[] }> {
    const extractionPromise = this.performExtraction(buffer, issueId, issueNumber, year);

    // Wrap with timeout
    const timeoutPromise = new Promise<{ pageCount: number; extractedPages: any[] }>(
      (_, reject) =>
        setTimeout(
          () => reject(new Error(`Page extraction timeout after ${EXTRACTION_TIMEOUT_MS / 1000}s`)),
          EXTRACTION_TIMEOUT_MS
        )
    );

    return Promise.race([extractionPromise, timeoutPromise]);
  }

  /**
   * Perform the actual extraction with memory management
   */
  private async performExtraction(
    buffer: Buffer,
    issueId: string,
    issueNumber: number,
    year: number
  ): Promise<{ pageCount: number; extractedPages: any[] }> {
    try {
      console.log(`📄 [pageExtraction] Starting page extraction for issue ${issueNumber}/${year}`);

      // Configure PDF.js to avoid SVG rendering which requires full DOM support
      // Set global options before loading
      (pdfjsLib as any).GlobalWorkerOptions = (pdfjsLib as any).GlobalWorkerOptions || {};

      // Load PDF from buffer (convert Buffer to Uint8Array for PDF.js compatibility)
      // Both canvasFactory and disableWorker: true provide canvas module protection
      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
        canvasFactory,
        disableWorker: true,
        disableFontFace: false,
        rangeChunkSize: 65536,
        cMapUrl: undefined,
        cMapPacked: false
      } as any).promise;
      const pageCount = pdf.numPages;

      console.log(`📄 [pageExtraction] PDF has ${pageCount} pages`);
      checkAndCleanMemory();

      const extractedPages: Array<{
        page_number: number;
        storage_path: string;
        url: string;
        id: string;
      }> = [];
      const pendingDbInserts: Array<{
        issueId: string;
        pageNumber: number;
        storagePath: string;
        thumbnailUrl?: string;
        mobileUrl?: string;
        desktopUrl?: string;
      }> = [];
      const pageUrlMap = new Map<number, { url: string; storagePath: string }>();
      const failedPages: { pageNum: number; error: string }[] = [];
      const BATCH_SIZE = 10; // Insert DB records in batches of 10

      // PHASE 1: Extract and upload all pages
      console.log(`⏳ [pageExtraction] PHASE 1: Extracting and uploading ${pageCount} pages...`);

      // Log progress: extraction starting
      try {
        await pdfProcessingService.logProcessingStep(
          issueId,
          'EXTRACTION_STARTED',
          'PROCESSING',
          `Starting extraction of ${pageCount} pages`
        );
      } catch (err) {
        console.warn(`⚠️  [pageExtraction] Failed to log extraction start:`, err);
      }

      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        try {
          console.log(`📸 [pageExtraction] Extracting page ${pageNum}/${pageCount}...`);

          // Log page extraction start
          try {
            await pdfProcessingService.logProcessingStep(
              issueId,
              `PAGE_${pageNum}_EXTRACTING`,
              'PROCESSING',
              `Extracting page ${pageNum}/${pageCount}`
            );
          } catch (logErr) {
            console.warn(`⚠️  [pageExtraction] Failed to log page ${pageNum} start:`, logErr);
          }

          checkAndCleanMemory();

          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2 }); // 2x scale for better quality

          // Create canvas
          const canvas = createCanvas(viewport.width, viewport.height);
          const context = canvas.getContext('2d');

          // Render page to canvas with fallback for SVG rendering issues
          let renderError: Error | null = null;
          try {
            await page.render({
              canvasContext: context,
              viewport: viewport,
            }).promise;
          } catch (err) {
            renderError = err as Error;
            const errorMsg = renderError.message || String(renderError);

            // If SVG/DOMMatrix error, retry with simpler rendering options
            if (errorMsg.includes('DOMMatrix') || errorMsg.includes('SVG')) {
              console.warn(`⚠️  [pageExtraction] SVG rendering failed on page ${pageNum}, retrying with text extraction...`);
              try {
                // Fallback: Try rendering without annotations
                await page.render({
                  canvasContext: context,
                  viewport: viewport,
                  intent: 'display' as any
                }).promise;
                renderError = null; // Recovery successful
                console.log(`✅ [pageExtraction] Page ${pageNum} recovered with fallback rendering`);
              } catch (fallbackErr) {
                // If fallback also fails, this page cannot be extracted
                throw renderError;
              }
            } else {
              throw err;
            }
          }

          // Convert canvas to PNG buffer
          const pageBuffer = canvas.toBuffer('image/png');
          console.log(`📦 [pageExtraction] Page ${pageNum} buffer size: ${(pageBuffer.length / 1024).toFixed(2)}KB`);

          // CRITICAL FIX #1: Gentle canvas cleanup to free memory without breaking module state
          try {
            const ctx = context as any;
            // Clear the canvas but don't zero dimensions (keeps module state intact)
            ctx?.clearRect?.(0, 0, canvas.width, canvas.height);
            // Let canvas object be garbage collected naturally
          } catch (cleanupErr) {
            console.warn(`⚠️  [pageExtraction] Canvas cleanup warning for page ${pageNum}:`, cleanupErr);
          }

          // Upload to Supabase Storage with retry logic (CRITICAL FIX #2)
          const filename = `issue-${issueNumber}-${year}-page-${pageNum}.png`;
          const storagePath = `pages/${filename}`;

          try {
            console.log(`⏳ [pageExtraction] Uploading page ${pageNum}...`);
            await uploadWithRetry(filename, pageBuffer, 'image/png', pageNum);
            console.log(`✅ [pageExtraction] Page ${pageNum} uploaded to storage`);

            // Log page upload success
            try {
              await pdfProcessingService.logProcessingStep(
                issueId,
                `PAGE_${pageNum}_UPLOADED`,
                'COMPLETED',
                `Page ${pageNum} extracted and uploaded successfully`
              );
            } catch (logErr) {
              console.warn(`⚠️  [pageExtraction] Failed to log page ${pageNum} upload:`, logErr);
            }

            // Only store URL and prepare for batch DB insert AFTER successful upload
            const pageUrl = storageService.getPublicUrl(storagePath);
            console.log(`🔗 [pageExtraction] Page ${pageNum} URL: ${pageUrl}`);

            pageUrlMap.set(pageNum, { url: pageUrl, storagePath });

            // Queue for batch DB insert (CRITICAL FIX #4)
            pendingDbInserts.push({
              issueId,
              pageNumber: pageNum,
              storagePath,
              thumbnailUrl: pageUrl,
              mobileUrl: pageUrl,
              desktopUrl: pageUrl,
            });
          } catch (uploadError) {
            const errorMsg = uploadError instanceof Error ? uploadError.message : String(uploadError);
            console.error(`❌ [pageExtraction] FAILED to upload page ${pageNum}: ${errorMsg}`);

            // Log page upload failure
            try {
              await pdfProcessingService.logProcessingStep(
                issueId,
                `PAGE_${pageNum}_FAILED`,
                'FAILED',
                undefined,
                errorMsg
              );
            } catch (logErr) {
              console.warn(`⚠️  [pageExtraction] Failed to log page ${pageNum} error:`, logErr);
            }

            failedPages.push({ pageNum, error: errorMsg });
          }
        } catch (pageError) {
          const errorMsg = pageError instanceof Error ? pageError.message : String(pageError);
          console.error(`❌ [pageExtraction] Error processing page ${pageNum}: ${errorMsg}`);
          failedPages.push({ pageNum, error: errorMsg });
        }
      }

      // PHASE 2: Batch insert all database records (CRITICAL FIX #4: Performance improvement)
      console.log(`📝 [pageExtraction] PHASE 2: Batch inserting ${pendingDbInserts.length} database records...`);
      for (let i = 0; i < pendingDbInserts.length; i += BATCH_SIZE) {
        const batch = pendingDbInserts.slice(i, i + BATCH_SIZE);
        try {
          const batchResult = await pdfProcessingService.createFlipbookPagesBatch(batch);
          console.log(`✅ [pageExtraction] Batch ${Math.floor(i / BATCH_SIZE) + 1}: inserted ${batchResult.ids.length} records`);

          // Add to extracted pages
          batch.forEach((page, idx) => {
            const id = batchResult.ids[idx];
            extractedPages.push({
              page_number: page.pageNumber,
              storage_path: page.storagePath,
              url: pageUrlMap.get(page.pageNumber)?.url || '',
              id,
            });
          });
        } catch (batchError) {
          const errorMsg = batchError instanceof Error ? batchError.message : String(batchError);
          console.error(`❌ [pageExtraction] Batch insert failed: ${errorMsg}`);
          // Mark batch pages as failed
          batch.forEach(page => {
            failedPages.push({ pageNum: page.pageNumber, error: `Batch DB insert: ${errorMsg}` });
          });
        }
      }

      const successRate = Math.round((extractedPages.length / pageCount) * 100);
      console.log(`✅ [pageExtraction] Completed extraction for ${extractedPages.length}/${pageCount} pages (${successRate}%)`);

      if (failedPages.length > 0) {
        console.warn(`⚠️  [pageExtraction] Failed pages: ${failedPages.map(p => p.pageNum).join(', ')}`);
        failedPages.forEach(fp => {
          console.warn(`   - Page ${fp.pageNum}: ${fp.error}`);
        });
      }

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
