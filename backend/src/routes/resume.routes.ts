import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/resumes
 * Get all resumes for current user
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        atsScore: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(resumes);
  } catch (error: any) {
    console.error('[Get Resumes] Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get resumes'
    });
  }
});

/**
 * GET /api/resumes/:id
 * Get single resume by ID
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId: req.userId // Ensure user owns this resume
      }
    });

    if (!resume) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Resume not found'
      });
    }

    res.json(resume);
  } catch (error: any) {
    console.error('[Get Resume] Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get resume'
    });
  }
});

/**
 * POST /api/resumes
 * Create new resume
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, atsScore } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Title and content are required'
      });
    }

    const resume = await prisma.resume.create({
      data: {
        userId: req.userId!,
        title,
        content,
        atsScore: atsScore || null
      }
    });

    res.status(201).json({
      message: 'Resume created successfully',
      resume
    });
  } catch (error: any) {
    console.error('[Create Resume] Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create resume'
    });
  }
});

/**
 * PUT /api/resumes/:id
 * Update resume
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, atsScore } = req.body;

    // Check if resume exists and user owns it
    const existingResume = await prisma.resume.findFirst({
      where: { id, userId: req.userId }
    });

    if (!existingResume) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Resume not found'
      });
    }

    const resume = await prisma.resume.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(atsScore !== undefined && { atsScore })
      }
    });

    res.json({
      message: 'Resume updated successfully',
      resume
    });
  } catch (error: any) {
    console.error('[Update Resume] Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update resume'
    });
  }
});

/**
 * DELETE /api/resumes/:id
 * Delete resume
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if resume exists and user owns it
    const existingResume = await prisma.resume.findFirst({
      where: { id, userId: req.userId }
    });

    if (!existingResume) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Resume not found'
      });
    }

    await prisma.resume.delete({
      where: { id }
    });

    res.json({
      message: 'Resume deleted successfully'
    });
  } catch (error: any) {
    console.error('[Delete Resume] Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete resume'
    });
  }
});

export default router;
