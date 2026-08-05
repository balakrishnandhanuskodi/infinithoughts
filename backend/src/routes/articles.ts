import { Router, Request, Response } from 'express';
import { z } from 'zod';
import articleService from '../services/articleService';
import xmlParser from '../services/xmlParser';

const router = Router();

// Schemas for validation
const CreateArticleSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().min(1),
  content_html: z.string().min(1),
  content_json: z.any().optional(),
  issue_id: z.string().uuid(),
  reading_time_minutes: z.number().optional(),
  word_count: z.number().optional(),
  page_number: z.number().optional(),
  theme: z.string().optional(),
  featured_image_url: z.string().optional(),
  source: z.enum(['xml', 'cms']),
  xml_file_path: z.string().optional(),
  author_id: z.string().uuid().optional(),
  publication_date: z.string().datetime().optional(),
  created_date: z.string().datetime().optional(),
  status: z.string().optional(),
});

const UpdateArticleSchema = CreateArticleSchema.partial();

const UpdateStatusSchema = z.object({
  status: z.enum(['DRAFT', 'IN_MODERATION', 'READY_FOR_PROOF', 'IN_PROOF', 'PROOFED', 'IN_APPROVAL', 'PUBLISHED', 'REJECTED']),
  userId: z.string().uuid(),
  reason: z.string().optional(),
});

// POST /api/articles - Create article
router.post('/', async (req: Request, res: Response) => {
  try {
    const validated = CreateArticleSchema.parse(req.body);
    const article = await articleService.createArticle(validated);
    res.status(201).json(article);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/articles - List articles
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, issue_id, source, limit, offset } = req.query;

    const filters = {
      status: status as string | undefined,
      issue_id: issue_id as string | undefined,
      source: source as 'xml' | 'cms' | undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    };

    const result = await articleService.listArticles(filters);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/articles/:id - Get article by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const article = await articleService.getArticleById(id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/articles/:id - Update article
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validated = UpdateArticleSchema.parse(req.body);
    const article = await articleService.updateArticle(id, validated);
    res.json(article);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/articles/:id/status - Update article status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validated = UpdateStatusSchema.parse(req.body);

    const article = await articleService.updateStatus(
      id,
      validated.status,
      validated.userId,
      validated.reason
    );

    res.json(article);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/articles/:id/publish - Publish article
router.post('/:id/publish', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const article = await articleService.publishArticle(id, userId);

    // TODO: Trigger Elasticsearch indexing webhook
    // TODO: Trigger email notifications webhook

    res.json(article);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/articles/:id/related - Get related articles
router.get('/:id/related', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit } = req.query;

    const articles = await articleService.getRelatedArticles(
      id,
      limit ? parseInt(limit as string, 10) : 5
    );

    res.json(articles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/articles/by-status/:status - Get articles by status (admin)
router.get('/by-status/:status', async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const articles = await articleService.getArticlesByStatus(status);
    res.json(articles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
