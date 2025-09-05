import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../database/connection.js';
import { authenticateToken, requireProfile } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        bio: true,
        location: true,
        interests: true,
        photos: true,
        isVerified: true,
        isActive: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('age').optional().isInt({ min: 18, max: 100 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('location').optional().trim().isLength({ max: 100 }),
  body('interests').optional().isArray(),
  body('photos').optional().isArray()
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
    const { name, age, bio, location, interests, photos } = req.body;

    // Build update data object
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (age !== undefined) updateData.age = age;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (interests !== undefined) updateData.interests = interests;
    if (photos !== undefined) updateData.photos = photos;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        bio: true,
        location: true,
        interests: true,
        photos: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Get potential matches (public endpoint, no auth required)
router.get('/potential-matches', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    // Get active verified users for public display
    const potentialMatches = await prisma.user.findMany({
      where: {
        isActive: true,
        isVerified: true,
        age: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        age: true,
        bio: true,
        location: true,
        interests: true,
        photos: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        matches: potentialMatches,
        totalCount: potentialMatches.length,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      }
    });
  } catch (error) {
    console.error('Get potential matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch potential matches'
    });
  }
});

// Get potential matches (authenticated users)
router.get('/matches', authenticateToken, requireProfile, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;

    // Get user's existing matches to exclude them
    const existingMatches = await prisma.match.findMany({
      where: {
        OR: [
          { userInitiatorId: userId },
          { userReceiverId: userId }
        ]
      },
      select: {
        userInitiatorId: true,
        userReceiverId: true
      }
    });

    const excludedIds = existingMatches.map(m => 
      m.userInitiatorId === userId ? m.userReceiverId : m.userInitiatorId
    );
    excludedIds.push(userId);

    // Get potential matches
    const potentialMatches = await prisma.user.findMany({
      where: {
        id: {
          notIn: excludedIds
        },
        isActive: true,
        age: {
          not: null
        },
        bio: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        age: true,
        bio: true,
        location: true,
        interests: true,
        photos: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        matches: potentialMatches,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: potentialMatches.length
        }
      }
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch matches'
    });
  }
});

// Get user's matches
router.get('/matches/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const matches = await prisma.match.findMany({
      where: {
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform matches to include the other user's info
    const transformedMatches = matches.map(match => {
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
    console.error('Get my matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch matches'
    });
  }
});

// Delete user account
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Soft delete - mark as inactive
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });

    // Delete refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId }
    });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
});

export default router; 