import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/jobs
 * Get all jobs for current user
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        applications: {
          select: {
            id: true,
            status: true,
            appliedAt: true
          }
        }
      }
    });

    res.json(jobs);
  } catch (error: any) {
    console.error('[Get Jobs] Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get jobs'
    });
  }
});

/**
 * POST /api/jobs
 * Create new job
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, company, description, url, location, salary } = req.body;

    if (!title || !company || !description) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Title, company, and description are required'
      });
    }

    const job = await prisma.job.create({
      data: {
        userId: req.userId!,
        title,
        company,
        description,
        url: url || null,
        location: location || null,
        salary: salary || null
      }
    });

    res.status(201).json({
      message: 'Job created successfully',
      job
    });
  } catch (error: any) {
    console.error('[Create Job] Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create job'
    });
  }
});

export default router;
