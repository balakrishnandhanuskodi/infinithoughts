import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import { createCanvas } from 'canvas';
import storageService from './storageService';
import pdfProcessingService from './pdfProcessingService';

// Configuration constants
const UPLOAD_MAX_RETRIES = 3;
const UPLOAD_RETRY_DELAY_MS = 1000;
const MAX_HEAP_THRESHOLD = 0.85; // 85% of max heap = trigger GC
const EXTRACTION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes per extraction

// Polyfill: DOMMatrix for advanced PDF rendering (SVG, transformations, etc.)
// Some PDFs use features that require DOMMatrix API which doesn't exist in Node.js
// PDF.js specifically needs a proper DOMMatrix-like object with all required properties
if (!(globalThis as any).DOMMatrix) {
  // Create a proper DOMMatrix-like object that PDF.js can work with
  class DOMMatrix {
    m11: number = 1; // a
    m12: number = 0; // b
    m21: number = 0; // c
    m22: number = 1; // d
    m41: number = 0; // e
    m42: number = 0; // f

    // Alias properties for 2D matrix access
    get a(): number { return this.m11; }
    get b(): number { return this.m12; }
    get c(): number { return this.m21; }
    get d(): number { return this.m22; }
    get e(): number { return this.m41; }
    get f(): number { return this.m42; }

    set a(v: number) { this.m11 = v; }
    set b(v: number) { this.m12 = v; }
    set c(v: number) { this.m21 = v; }
    set d(v: number) { this.m22 = v; }
    set e(v: number) { this.m41 = v; }
    set f(v: number) { this.m42 = v; }

    // 3D properties (for full compatibility)
    m13: number = 0;
    m14: number = 0;
    m23: number = 0;
    m24: number = 0;
    m31: number = 0;
    m32: number = 0;
    m33: number = 1;
    m34: number = 0;
    m43: number = 0;
    m44: number = 1;

    constructor(matrix?: string | number[]) {
      if (Array.isArray(matrix) && matrix.length >= 6) {
        [this.m11, this.m12, this.m21, this.m22, this.m41, this.m42] = matrix;
      }
    }

    multiply(other: DOMMatrix): DOMMatrix {
      const result = new DOMMatrix();
      result.m11 = this.m11 * other.m11 + this.m21 * other.m12;
      result.m12 = this.m12 * other.m11 + this.m22 * other.m12;
      result.m21 = this.m11 * other.m21 + this.m21 * other.m22;
      result.m22 = this.m12 * other.m21 + this.m22 * other.m22;
      result.m41 = this.m11 * other.m41 + this.m21 * other.m42 + this.m41;
      result.m42 = this.m12 * other.m41 + this.m22 * other.m42 + this.m42;
      return result;
    }

    translate(x: number, y: number): DOMMatrix {
      const result = new DOMMatrix();
      result.m11 = this.m11;
      result.m12 = this.m12;
      result.m21 = this.m21;
      result.m22 = this.m22;
      result.m41 = this.m41 + x;
      result.m42 = this.m42 + y;
      return result;
    }

    scale(x: number, y: number = x): DOMMatrix {
      const result = new DOMMatrix();
      result.m11 = this.m11 * x;
      result.m12 = this.m12 * x;
      result.m21 = this.m21 * y;
      result.m22 = this.m22 * y;
      result.m41 = this.m41;
      result.m42 = this.m42;
      return result;
    }

    rotate(angle: number): DOMMatrix {
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const result = new DOMMatrix();
      result.m11 = this.m11 * cos + this.m21 * sin;
      result.m12 = this.m12 * cos + this.m22 * sin;
      result.m21 = this.m11 * -sin + this.m21 * cos;
      result.m22 = this.m12 * -sin + this.m22 * cos;
      result.m41 = this.m41;
      result.m42 = this.m42;
      return result;
    }

    inverse(): DOMMatrix {
      const det = this.m11 * this.m22 - this.m12 * this.m21;
      if (det === 0) throw new Error('Matrix is not invertible');
      const result = new DOMMatrix();
      result.m11 = this.m22 / det;
      result.m12 = -this.m12 / det;
      result.m21 = -this.m21 / det;
      result.m22 = this.m11 / det;
      result.m41 = (this.m21 * this.m42 - this.m22 * this.m41) / det;
      result.m42 = (this.m12 * this.m41 - this.m11 * this.m42) / det;
      return result;
    }

    toString(): string {
      return `matrix(${this.m11}, ${this.m12}, ${this.m21}, ${this.m22}, ${this.m41}, ${this.m42})`;
    }

    get isIdentity(): boolean {
      return this.m11 === 1 && this.m12 === 0 && this.m21 === 0 &&
             this.m22 === 1 && this.m41 === 0 && this.m42 === 0;
    }
  }
  (globalThis as any).DOMMatrix = DOMMatrix;
  console.log(`📐 [pageExtraction] Enhanced DOMMatrix polyfill installed for advanced PDF rendering`);
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

      // Load PDF from buffer (convert Buffer to Uint8Array for PDF.js compatibility)
      // Both canvasFactory and disableWorker: true provide canvas module protection
      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
        canvasFactory,
        disableWorker: true
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
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        try {
          console.log(`📸 [pageExtraction] Extracting page ${pageNum}/${pageCount}...`);
          checkAndCleanMemory();

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
