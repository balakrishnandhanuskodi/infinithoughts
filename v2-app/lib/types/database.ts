export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'user' | 'creator' | 'moderator' | 'admin'
  created_at: string
  updated_at: string
}

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  author_id: string
  featured_image_url: string | null
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Magazine {
  id: string
  issue_number: number
  month: string | null
  year: number
  title: string
  description: string | null
  cover_image_url: string | null
  pdf_filename: string | null
  pdf_storage_path: string | null
  total_pages: number
  status: 'uploading' | 'processing' | 'ready' | 'failed'
  error_message: string | null
  uploaded_by: string
  created_at: string
  updated_at: string
}

export interface MagazinePage {
  id: string
  magazine_id: string
  page_number: number
  image_url: string
  storage_path: string
  created_at: string
}

export interface ProcessingLog {
  id: string
  magazine_id: string
  step: string
  status: 'started' | 'processing' | 'completed' | 'failed'
  message: string | null
  error_message: string | null
  created_at: string
}
