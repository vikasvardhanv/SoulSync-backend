import express from 'express';
import { body, validationResult, query as queryValidator } from 'express-validator';
import prisma from '../database/connection.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all questions (with optional filtering)
router.get('/', optionalAuth, [
  queryValidator('category').optional().isIn(['personality', 'compatibility', 'lifestyle', 'values', 'communication', 'relationship']),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
  queryValidator('offset').optional().isInt({ min: 0 }),
  queryValidator('weight').optional().isInt({ min: 1, max: 10 })
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

    const { category, limit = 50, offset = 0, weight } = req.query;
    const userId = req.user?.id;

    // Build where clause
    const whereClause = {
      isActive: true
    };

    if (category) {
      whereClause.category = category;
    }

    if (weight) {
      whereClause.weight = {
        gte: parseInt(weight)
      };
    }

    const questions = await prisma.question.findMany({
      where: whereClause,
      orderBy: [
        { weight: 'desc' },
        { createdAt: 'asc' }
      ],
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // If user is authenticated, get their answers
    let userAnswers = {};
    if (userId) {
      const answers = await prisma.userAnswer.findMany({
        where: { userId },
        select: {
          questionId: true,
          answer: true
        }
      });
      
      userAnswers = answers.reduce((acc, answer) => {
        acc[answer.questionId] = answer.answer;
        return acc;
      }, {});
    }

    res.json({
      success: true,
      data: {
        questions,
        userAnswers,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: questions.length
        }
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch questions'
    });
  }
});

// Get question by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const question = await prisma.question.findFirst({
      where: {
        id,
        isActive: true
      }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Get user's answer if authenticated
    let userAnswer = null;
    if (userId) {
      const answer = await prisma.userAnswer.findUnique({
        where: {
          userId_questionId: {
            userId,
            questionId: id
          }
        },
        select: {
          answer: true
        }
      });
      userAnswer = answer?.answer || null;
    }

    res.json({
      success: true,
      data: {
        question,
        userAnswer
      }
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch question'
    });
  }
});

// Get random questions
router.get('/random/:count', optionalAuth, [
  queryValidator('category').optional().isIn(['personality', 'compatibility', 'lifestyle', 'values', 'communication', 'relationship']),
  queryValidator('exclude').optional().isArray()
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

    const { count } = req.params;
    const { category, exclude = [] } = req.query;
    const userId = req.user?.id;

    // Validate count parameter
    const countNum = parseInt(count);
    if (isNaN(countNum) || countNum < 1 || countNum > 50) {
      return res.status(400).json({
        success: false,
        message: 'Count must be a number between 1 and 50'
      });
    }

    // Build where clause
    const whereClause = {
      isActive: true
    };

    if (category) {
      whereClause.category = category;
    }

    if (exclude.length > 0) {
      whereClause.id = {
        notIn: exclude
      };
    }

    // Get all matching questions first, then randomize in JavaScript
    const allQuestions = await prisma.question.findMany({
      where: whereClause
    });

    // Shuffle the array and take the requested count
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const questions = shuffled.slice(0, countNum);

    // Get user's answers if authenticated
    let userAnswers = {};
    if (userId && questions.length > 0) {
      const questionIds = questions.map(q => q.id);
      const answers = await prisma.userAnswer.findMany({
        where: {
          userId,
          questionId: {
            in: questionIds
          }
        },
        select: {
          questionId: true,
          answer: true
        }
      });
      
      userAnswers = answers.reduce((acc, answer) => {
        acc[answer.questionId] = answer.answer;
        return acc;
      }, {});
    }

    res.json({
      success: true,
      data: {
        questions,
        userAnswers
      }
    });
  } catch (error) {
    console.error('Get random questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch random questions'
    });
  }
});

// Submit user answer
router.post('/:id/answer', authenticateToken, [
  body('answer').notEmpty()
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
    const { answer } = req.body;
    const userId = req.user.id;

    // Check if question exists
    const question = await prisma.question.findFirst({
      where: {
        id,
        isActive: true
      }
    });
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Validate answer based on question type
    if (question.type === 'scale') {
      const value = parseInt(answer);
      if (isNaN(value) || value < question.minValue || value > question.maxValue) {
        return res.status(400).json({
          success: false,
          message: `Answer must be between ${question.minValue} and ${question.maxValue}`
        });
      }
    } else if (question.type === 'multiple') {
      const validOptions = question.options.map(opt => opt.value);
      if (!validOptions.includes(answer)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid option selected'
        });
      }
    }

    // Upsert answer
    await prisma.userAnswer.upsert({
      where: {
        userId_questionId: {
          userId,
          questionId: id
        }
      },
      update: {
        answer
      },
      create: {
        userId,
        questionId: id,
        answer
      }
    });

    res.json({
      success: true,
      message: 'Answer submitted successfully'
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit answer'
    });
  }
});

// Get user's answers
router.get('/answers/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const answers = await prisma.userAnswer.findMany({
      where: { userId },
      include: {
        question: {
          select: {
            id: true,
            question: true,
            category: true,
            type: true,
            emoji: true,
            weight: true
          }
        }
      },
      orderBy: [
        { question: { weight: 'desc' } },
        { createdAt: 'asc' }
      ]
    });

    // Transform to match expected format
    const transformedAnswers = answers.map(answer => ({
      question_id: answer.questionId,
      answer: answer.answer,
      question: answer.question.question,
      category: answer.question.category,
      type: answer.question.type,
      emoji: answer.question.emoji
    }));

    res.json({
      success: true,
      data: {
        answers: transformedAnswers
      }
    });
  } catch (error) {
    console.error('Get user answers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user answers'
    });
  }
});

// Get questions by category
router.get('/category/:category', optionalAuth, [
  queryValidator('category').isIn(['personality', 'compatibility', 'lifestyle', 'values', 'communication', 'relationship'])
], async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.user?.id;

    const questions = await prisma.question.findMany({
      where: {
        category,
        isActive: true
      },
      orderBy: {
        weight: 'desc'
      }
    });

    // Get user's answers if authenticated
    let userAnswers = {};
    if (userId && questions.length > 0) {
      const questionIds = questions.map(q => q.id);
      const answers = await prisma.userAnswer.findMany({
        where: {
          userId,
          questionId: {
            in: questionIds
          }
        },
        select: {
          questionId: true,
          answer: true
        }
      });
      
      userAnswers = answers.reduce((acc, answer) => {
        acc[answer.questionId] = answer.answer;
        return acc;
      }, {});
    }

    res.json({
      success: true,
      data: {
        questions,
        userAnswers,
        category
      }
    });
  } catch (error) {
    console.error('Get questions by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch questions by category'
    });
  }
});

export default router; 