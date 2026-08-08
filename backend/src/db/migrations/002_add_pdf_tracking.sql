-- Phase 2: PDF Magazine Upload & Flipbook

-- Add columns to issues table for PDF tracking
ALTER TABLE issues
ADD COLUMN IF NOT EXISTS pdf_filename TEXT,
ADD COLUMN IF NOT EXISTS pdf_size_bytes INT,
ADD COLUMN IF NOT EXISTS pdf_status VARCHAR(50) DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS total_pages INT,
ADD COLUMN IF NOT EXISTS upload_completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS processing_error TEXT;

-- Add columns to flipbook_pages for page tracking
ALTER TABLE flipbook_pages
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS page_width INT,
ADD COLUMN IF NOT EXISTS page_height INT,
ADD COLUMN IF NOT EXISTS file_size INT;

-- Create pdf_processing_logs table for debugging
CREATE TABLE IF NOT EXISTS pdf_processing_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  step VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  message TEXT,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for new tables/columns
CREATE INDEX IF NOT EXISTS idx_issues_pdf_status ON issues(pdf_status);
CREATE INDEX IF NOT EXISTS idx_pdf_processing_logs_issue_id ON pdf_processing_logs(issue_id);
CREATE INDEX IF NOT EXISTS idx_pdf_processing_logs_created_at ON pdf_processing_logs(created_at);
