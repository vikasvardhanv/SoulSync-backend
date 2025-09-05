import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../database/connection.js';
import { authenticateToken, requireProfile } from '../middleware/auth.js';

const router = express.Router();

// Create a match
router.post('/', authenticateToken, requireProfile, [
  body('matchedUserId').isUUID(),
  body('compatibilityScore').optional().isFloat({ min: 0, max: 10 })
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
    const { matchedUserId, compatibilityScore } = req.body;

    // Check if trying to match with self
    if (userId === matchedUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot match with yourself'
      });
    }

    // Check if matched user exists and is active
    const matchedUser = await prisma.user.findFirst({
      where: {
        id: matchedUserId,
        isActive: true
      },
      select: {
        id: true,
        name: true
      }
    });

    if (!matchedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if match already exists
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          {
            userInitiatorId: userId,
            userReceiverId: matchedUserId
          },
          {
            userInitiatorId: matchedUserId,
            userReceiverId: userId
          }
        ]
      }
    });

    if (existingMatch) {
      return res.status(409).json({
        success: false,
        message: 'Match already exists'
      });
    }

    // Check daily match limit (max 2 matches per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dailyMatches = await prisma.match.count({
      where: {
        userInitiatorId: userId,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });
    
    if (dailyMatches >= 2) {
      return res.status(400).json({
        success: false,
        message: 'Daily match limit reached (max 2 matches per day)'
      });
    }

    // Create match
    const match = await prisma.match.create({
      data: {
        userInitiatorId: userId,
        userReceiverId: matchedUserId,
        compatibilityScore: compatibilityScore || null
      },
      include: {
        userInitiator: {
          select: {
            id: true,
            name: true,
            age: true,
            bio: true,
            location: true,
            interests: true,
            photos: true
          }
        },
        userReceiver: {
          select: {
            id: true,
            name: true,
            age: true,
            bio: true,
            location: true,
            interests: true,
            photos: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Match created successfully',
      data: {
        match
      }
    });
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create match'
    });
  }
});

// Update match status
router.put('/:id/status', authenticateToken, [
  body('status').isIn(['accepted', 'rejected'])
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

    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Check if match exists and user is part of it
    const match = await prisma.match.findFirst({
      where: {
        id,
        OR: [
          { userInitiatorId: userId },
          { userReceiverId: userId }
        ]
      }
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Update match status
    const updatedMatch = await prisma.match.update({
      where: { id },
      data: { status },
      include: {
        userInitiator: {
          select: {
            id: true,
            name: true,
            age: true,
            bio: true,
            location: true,
            interests: true,
            photos: true
          }
        },
        userReceiver: {
          select: {
            id: true,
            name: true,
            age: true,
            bio: true,
            location: true,
            interests: true,
            photos: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Match status updated successfully',
      data: {
        match: updatedMatch
      }
    });
  } catch (error) {
    console.error('Update match status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update match status'
    });
  }
});

// Get match by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const match = await prisma.match.findFirst({
      where: {
        id,
        OR: [
          { userInitiatorId: userId },
          { userReceiverId: userId }
        ]
      },
      include: {
        userInitiator: {
          select: {
            id: true,
            name: true,
            age: true,
            bio: true,
            location: true,
            interests: true,
            photos: true
          }
        },
        userReceiver: {
          select: {
            id: true,
            name: true,
            age: true,
            bio: true,
            location: true,
            interests: true,
            photos: true
          }
        }
      }
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    res.json({
      success: true,
      data: {
        match
      }
    });
  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch match'
    });
  }
});

// Delete match
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if match exists and user is part of it
    const match = await prisma.match.findFirst({
      where: {
        id,
        OR: [
          { userInitiatorId: userId },
          { userReceiverId: userId }
        ]
      }
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Delete match
    await prisma.match.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Match deleted successfully'
    });
  } catch (error) {
    console.error('Delete match error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete match'
    });
  }
});

// Get pending matches
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const pendingMatches = await prisma.match.findMany({
      where: {
        OR: [
          { userInitiatorId: userId },
          { userReceiverId: userId }
        ],
        status: 'pending'
      },
      include: {
        userInitiator: {
          select: {
            id: true,
            name: true,
            age: true,
            bio: true,
            location: true,
            interests: true,
            photos: true
          }
        },
        userReceiver: {
          select: {
            id: true,
            name: true,
            age: true,
            bio: true,
            location: true,
            interests: true,
            photos: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform matches to include the other user's info
    const transformedMatches = pendingMatches.map(match => {
      const isInitiator = match.userInitiatorId === userId;
      const otherUser = isInitiator ? match.userReceiver : match.userInitiator;
      
      return {
        ...match,
        user: otherUser
      };
    });

    res.json({
      success: true,
      data: {
        matches: transformedMatches
      }
    });
  } catch (error) {
    console.error('Get pending matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending matches'
    });
  }
});

// Get accepted matches
router.get('/accepted', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const acceptedMatches = await prisma.match.findMany({
      where: {
        OR: [
          { userInitiatorId: userId },
          { userReceiverId: userId }
        ],
        status: 'accepted'
      },
      include: {
        userInitiator: {
          select: {
            id: true,
            name: true,
            age: true,
            bio: true,
            location: true,
            interests: true,
            photos: true
          }
        },
        userReceiver: {
          select: {
            id: true,
            name: true,
            age: true,
            bio: true,
            location: true,
            interests: true,
            photos: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform matches to include the other user's info
    const transformedMatches = acceptedMatches.map(match => {
      const isInitiator = match.userInitiatorId === userId;
      const otherUser = isInitiator ? match.userReceiver : match.userInitiator;
      
      return {
        ...match,
        user: otherUser
      };
    });

    res.json({
      success: true,
      data: {
        matches: transformedMatches
      }
    });
  } catch (error) {
    console.error('Get accepted matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accepted matches'
    });
  }
});

export default router; 