import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's subscription
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: {
        subscription: subscription || { plan: 'free', status: 'active' }
      }
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription'
    });
  }
});

// Create subscription
router.post('/', authenticateToken, [
  body('plan').isIn(['premium', 'vip']),
  body('paypalSubscriptionId').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { plan, paypalSubscriptionId } = req.body;

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Cancel any existing active subscriptions
    await prisma.subscription.updateMany({
      where: {
        userId,
        status: 'active'
      },
      data: {
        status: 'cancelled'
      }
    });

    // Create new subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        plan,
        paypalSubscriptionId: paypalSubscriptionId || null,
        expiresAt
      }
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        subscription
      }
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription'
    });
  }
});

// Cancel subscription
router.put('/cancel', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Cancel subscription
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'cancelled' }
    });

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
});

// Get subscription history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: {
        subscriptions
      }
    });
  } catch (error) {
    console.error('Get subscription history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription history'
    });
  }
});

// Check if user has premium features
router.get('/premium/check', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const hasPremium = subscription && ['premium', 'vip'].includes(subscription.plan);

    res.json({
      success: true,
      data: {
        hasPremium,
        subscription: subscription || null
      }
    });
  } catch (error) {
    console.error('Check premium error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check premium status'
    });
  }
});

export default router; 