import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/users/profile
 * Get user profile
 */
router.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            resumes: true,
            jobs: true,
            applications: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    res.json(user);
  } catch (error: any) {
    console.error('[Get Profile] Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get profile'
    });
  }
});

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name is required'
      });
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error: any) {
    console.error('[Update Profile] Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update profile'
    });
  }
});

/**
 * GET /api/users/usage
 * Get API usage statistics
 */
router.get('/usage', async (req: AuthRequest, res: Response) => {
  try {
    const usage = await prisma.apiUsage.groupBy({
      by: ['provider', 'model'],
      where: { userId: req.userId },
      _sum: {
        inputTokens: true,
        outputTokens: true,
        totalCost: true
      },
      _count: {
        id: true
      }
    });

    // Calculate totals
    const totals = {
      totalRequests: usage.reduce((sum, u) => sum + u._count.id, 0),
      totalInputTokens: usage.reduce((sum, u) => sum + (u._sum.inputTokens || 0), 0),
      totalOutputTokens: usage.reduce((sum, u) => sum + (u._sum.outputTokens || 0), 0),
      totalCost: usage.reduce((sum, u) => sum + (u._sum.totalCost || 0), 0)
    };

    res.json({
      usage,
      totals
    });
  } catch (error: any) {
    console.error('[Get Usage] Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get usage statistics'
    });
  }
});

export default router;
