import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../database/connection.js';
import { authenticateToken, requireProfile } from '../middleware/auth.js';
import { findCompatibleMatches, calculateCompatibilityScore, getMatchExplanation } from '../services/matchingAlgorithm.js';

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
        gender: true,
        lookingFor: true,
        interests: true,
        photos: true,
        isVerified: true,
        isActive: true,
        createdAt: true
      }
    });

    // Get user's quiz answers count for personality score
    const answersCount = await prisma.userAnswer.count({
      where: { userId }
    });

    // Calculate personality score (0-100 based on number of questions answered)
    // Assuming 50 total questions for 100% score
    const totalQuestions = 50;
    const personalityScore = Math.min(100, Math.round((answersCount / totalQuestions) * 100));

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          personalityScore,
          questionsAnswered: answersCount
        }
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

// Update user profile (protected)
router.put('/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('age').optional().isInt({ min: 18, max: 100 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('location').optional().trim().isLength({ max: 100 }),
  body('interests').optional().isArray(),
  body('photos').optional().isArray(),
  body('gender').optional().isIn(['male', 'female', 'non-binary', 'other', 'prefer-not-to-say']),
  body('lookingFor').optional().isIn(['male', 'female', 'non-binary', 'everyone'])
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
    const { name, age, bio, location, interests, photos, gender, lookingFor } = req.body;

    // Build update data object
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (age !== undefined) updateData.age = age;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (interests !== undefined) updateData.interests = interests;
    if (photos !== undefined) updateData.photos = photos;
    if (gender !== undefined) updateData.gender = gender;
    if (lookingFor !== undefined) updateData.lookingFor = lookingFor;

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
        gender: true,
        lookingFor: true,
        interests: true,
        photos: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Get user's personality score
    const answersCount = await prisma.userAnswer.count({
      where: { userId }
    });
    const totalQuestions = 50;
    const personalityScore = Math.min(100, Math.round((answersCount / totalQuestions) * 100));

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          ...user,
          personalityScore,
          questionsAnswered: answersCount
        }
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

// Get potential matches (authenticated users with AI matching)
router.get('/matches', authenticateToken, requireProfile, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;

    console.log(`🔍 Finding matches for user ${userId}, limit: ${limit}, offset: ${offset}`);

    // Use AI matching algorithm to find compatible matches
    const compatibleMatches = await findCompatibleMatches(
      userId, 
      prisma, 
      parseInt(limit) + parseInt(offset)
    );

    console.log(`✅ Found ${compatibleMatches.length} compatible matches`);

    // Apply pagination
    const paginatedMatches = compatibleMatches.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    // Determine appropriate message based on results
    let message = 'Matches calculated using AI compatibility algorithm';
    if (compatibleMatches.length === 0) {
      // Check if current user has completed quiz
      const userAnswers = await prisma.userAnswer.count({
        where: { userId }
      });
      
      if (userAnswers === 0) {
        message = 'Complete your personality quiz to find compatible matches';
      } else {
        message = 'No compatible matches found. Try adjusting your preferences or check back later';
      }
    }

    res.json({
      success: true,
      data: {
        matches: paginatedMatches,
        totalCount: compatibleMatches.length,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: compatibleMatches.length > (parseInt(offset) + parseInt(limit))
        }
      },
      message
    });
  } catch (error) {
    console.error('❌ Get matches error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch matches',
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        details: error.toString()
      })
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

// Get compatibility explanation between two users
router.get('/compatibility/:userId', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.userId;

    // Get both users' answers
    const [currentUser, targetUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: currentUserId },
        include: {
          answers: {
            select: {
              questionId: true,
              answer: true
            }
          }
        }
      }),
      prisma.user.findUnique({
        where: { id: targetUserId },
        include: {
          answers: {
            select: {
              questionId: true,
              answer: true
            }
          }
        }
      })
    ]);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Convert answers to object format
    const currentUserAnswers = {};
    currentUser.answers.forEach(a => {
      currentUserAnswers[a.questionId] = a.answer;
    });

    const targetUserAnswers = {};
    targetUser.answers.forEach(a => {
      targetUserAnswers[a.questionId] = a.answer;
    });

    // Calculate compatibility score
    const compatibilityScore = calculateCompatibilityScore(
      currentUserAnswers,
      targetUserAnswers
    );

    // Get match explanation
    const explanation = getMatchExplanation(
      currentUserAnswers,
      targetUserAnswers
    );

    res.json({
      success: true,
      data: {
        compatibilityScore: Number(compatibilityScore.toFixed(1)),
        explanation,
        targetUser: {
          id: targetUser.id,
          name: targetUser.name,
          age: targetUser.age,
          bio: targetUser.bio,
          location: targetUser.location,
          interests: targetUser.interests,
          photos: targetUser.photos
        }
      }
    });
  } catch (error) {
    console.error('Get compatibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate compatibility'
    });
  }
});

export default router; 