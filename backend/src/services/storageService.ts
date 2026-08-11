import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) {
  throw new Error('❌ SUPABASE_URL environment variable is not set');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    global: {
      fetch: fetch,
      headers: {},
    },
  }
);

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'magazines';

export class StorageService {
  /**
   * Upload PDF file to Supabase Storage
   */
  async uploadPDF(filename: string, buffer: Buffer, contentType: string = 'application/pdf') {
    try {
      console.log(`📤 [storageService] Uploading ${filename} to ${BUCKET_NAME} bucket`);

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(`pdfs/${filename}`, buffer, {
          contentType,
          upsert: false,
        });

      if (error) {
        throw new Error(`Failed to upload PDF: ${error.message}`);
      }

      console.log(`✅ [storageService] PDF uploaded: ${filename}`);
      return data;
    } catch (error) {
      console.error(`❌ [storageService] Upload failed:`, error);
      throw error;
    }
  }

  /**
   * Upload flipbook page image to storage
   */
  async uploadPageImage(filename: string, buffer: Buffer, contentType: string = 'image/png') {
    try {
      console.log(`📤 [storageService] Uploading page image: ${filename}`);

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(`pages/${filename}`, buffer, {
          contentType,
          upsert: false,
        });

      if (error) {
        throw new Error(`Failed to upload page image: ${error.message}`);
      }

      console.log(`✅ [storageService] Page image uploaded: ${filename}`);
      return data;
    } catch (error) {
      console.error(`❌ [storageService] Page upload failed:`, error);
      throw error;
    }
  }

  /**
   * Get public URL for a stored file
   */
  getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * Delete file from storage
   */
  async deleteFile(path: string) {
    try {
      console.log(`🗑️  [storageService] Deleting: ${path}`);

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([path]);

      if (error) {
        throw new Error(`Failed to delete file: ${error.message}`);
      }

      console.log(`✅ [storageService] File deleted: ${path}`);
    } catch (error) {
      console.error(`❌ [storageService] Delete failed:`, error);
      throw error;
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(directory: string) {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(directory);

      if (error) {
        throw new Error(`Failed to list files: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error(`❌ [storageService] List failed:`, error);
      throw error;
    }
  }
}

export default new StorageService();
