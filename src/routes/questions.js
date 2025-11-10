import express from 'express';
import { body, validationResult, query as queryValidator } from 'express-validator';
import prisma from '../database/connection.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { 
  getPersonalizedQuestions, 
  getQuestionsByCategory as getPersonalizedCategoryQuestions,
  getHighImpactQuestions,
  calculatePersonalityProfile 
} from '../services/personalizedQuestions.js';

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

// Get personalized additional questions for better matching
router.get('/additional-for-matching', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 5 } = req.query;

    console.log(`🎯 Getting additional questions for user ${userId} to improve matching`);

    // Get user's current answers
    const userAnswers = await prisma.userAnswer.findMany({
      where: { userId },
      select: { questionId: true }
    });

    const answeredQuestionIds = userAnswers.map(a => a.questionId);
    console.log(`📝 User has answered ${answeredQuestionIds.length} questions`);

    // Get questions user hasn't answered yet, prioritized by weight and category diversity
    const unansweredQuestions = await prisma.question.findMany({
      where: {
        id: { notIn: answeredQuestionIds },
        isActive: true
      },
      orderBy: [
        { weight: 'desc' }, // Higher weight questions first
        { category: 'asc' }, // Diverse categories
        { createdAt: 'asc' }
      ],
      take: parseInt(limit) * 3 // Get more to allow for category filtering
    });

    // Ensure category diversity in the selected questions
    const categorizedQuestions = {};
    const selectedQuestions = [];

    // Group by category
    unansweredQuestions.forEach(q => {
      if (!categorizedQuestions[q.category]) {
        categorizedQuestions[q.category] = [];
      }
      categorizedQuestions[q.category].push(q);
    });

    // Select questions from different categories to ensure diversity
    const categories = Object.keys(categorizedQuestions);
    let categoryIndex = 0;

    while (selectedQuestions.length < parseInt(limit) && categoryIndex < categories.length * 3) {
      const category = categories[categoryIndex % categories.length];
      const questionsInCategory = categorizedQuestions[category];
      
      if (questionsInCategory && questionsInCategory.length > 0) {
        const question = questionsInCategory.shift();
        if (question && !selectedQuestions.find(q => q.id === question.id)) {
          selectedQuestions.push(question);
        }
      }
      categoryIndex++;
    }

    // If we still need more questions, fill from remaining
    if (selectedQuestions.length < parseInt(limit)) {
      const remaining = unansweredQuestions.filter(q => 
        !selectedQuestions.find(sq => sq.id === q.id)
      ).slice(0, parseInt(limit) - selectedQuestions.length);
      selectedQuestions.push(...remaining);
    }

    // Calculate potential improvement score
    const potentialImprovement = calculatePotentialMatchingImprovement(
      answeredQuestionIds.length,
      selectedQuestions.length
    );

    res.json({
      success: true,
      data: {
        questions: selectedQuestions.slice(0, parseInt(limit)),
        currentAnswersCount: answeredQuestionIds.length,
        potentialImprovement,
        message: `Answer ${selectedQuestions.length} more questions to improve your match probability by ${potentialImprovement}%`
      }
    });

  } catch (error) {
    console.error('❌ Get additional questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch additional questions'
    });
  }
});

/**
 * Calculate potential improvement in matching probability
 */
function calculatePotentialMatchingImprovement(currentAnswers, additionalQuestions) {
  const baseImprovement = Math.min(25, additionalQuestions * 5); // 5% per question, max 25%
  const diminishingReturns = currentAnswers > 10 ? Math.max(0.5, 1 - (currentAnswers - 10) * 0.05) : 1;
  return Math.round(baseImprovement * diminishingReturns);
}

// Submit answer to a question with progress tracking
router.post('/:id/answer', authenticateToken, [
  body('answer').notEmpty().withMessage('Answer is required')
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

    const { id: questionId } = req.params;
    const { answer } = req.body;
    const userId = req.user.id;

    console.log(`📝 User ${userId} answering question ${questionId}`);

    // Check if question exists and is active
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
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

    // Upsert the answer (create or update)
    const userAnswer = await prisma.userAnswer.upsert({
      where: {
        userId_questionId: {
          userId,
          questionId
        }
      },
      update: {
        answer,
        updatedAt: new Date()
      },
      create: {
        userId,
        questionId,
        answer
      }
    });

    // Get updated progress stats
    const totalAnswered = await prisma.userAnswer.count({
      where: { userId }
    });

    const totalQuestions = await prisma.question.count({
      where: { isActive: true }
    });

    // Calculate matching improvement
    const matchingReadiness = Math.min(100, Math.round((totalAnswered / 20) * 100));
    const wasFirstAnswer = totalAnswered === 1;
    const reachedMilestone = [5, 10, 15, 20, 25].includes(totalAnswered);

    // Check if user now qualifies for better matches
    let newMatchesPossible = false;
    if (totalAnswered >= 5) {
      // User now has enough answers for AI matching
      newMatchesPossible = true;
    }

    res.json({
      success: true,
      data: {
        answer: userAnswer,
        progress: {
          totalAnswered,
          totalQuestions,
          completionPercentage: Math.round((totalAnswered / totalQuestions) * 100),
          matchingReadiness,
          milestones: {
            wasFirstAnswer,
            reachedMilestone,
            milestoneNumber: reachedMilestone ? totalAnswered : null
          },
          newMatchesPossible
        }
      },
      message: wasFirstAnswer 
        ? 'Great start! Answer a few more questions to unlock AI matching'
        : reachedMilestone 
          ? `Milestone reached! ${totalAnswered} questions answered - your matching accuracy has improved`
          : newMatchesPossible 
            ? 'Answer saved! Check your matches to see new compatible people'
            : 'Answer saved! Keep going to improve your match quality'
    });

  } catch (error) {
    console.error('❌ Submit answer error:', error);
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

// DYNAMIC SYNC ENDPOINT - Sync frontend question bank with database
router.post('/sync', async (req, res) => {
  try {
    console.log('🔄 Starting dynamic question sync from frontend question bank...');
    
    // Import the complete frontend question bank
    const frontendQuestionBank = req.body.questions || [];
    
    if (!frontendQuestionBank.length) {
      return res.status(400).json({
        success: false,
        message: 'No questions provided in request body. Send questions array in request body.'
      });
    }
    
    console.log(`📝 Received ${frontendQuestionBank.length} questions from frontend`);
    
    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const questionData of frontendQuestionBank) {
      try {
        // Check if question already exists
        const existingQuestion = await prisma.question.findUnique({
          where: { id: questionData.id }
        });

        const questionToCreate = {
          id: questionData.id,
          question: questionData.question,
          category: questionData.category,
          type: questionData.type,
          emoji: questionData.emoji || null,
          weight: questionData.weight,
          isActive: true,
          options: questionData.options || [],
          minValue: questionData.min || null,
          maxValue: questionData.max || null,
          labels: questionData.labels || null
        };

        if (existingQuestion) {
          // Update existing question
          await prisma.question.update({
            where: { id: questionData.id },
            data: questionToCreate
          });
          updatedCount++;
        } else {
          // Create new question
          await prisma.question.create({
            data: questionToCreate
          });
          addedCount++;
        }
      } catch (questionError) {
        console.error(`❌ Error with question ${questionData.id}:`, questionError.message);
        skippedCount++;
      }
    }

    // Verify the critical missing questions
    const verifications = await Promise.all([
      prisma.question.findUnique({ where: { id: 'life_goals' } }),
      prisma.question.findUnique({ where: { id: 'communication_style' } })
    ]);

    const results = {
      success: true,
      message: 'Question sync completed',
      summary: {
        added: addedCount,
        updated: updatedCount,
        skipped: skippedCount,
        total: frontendQuestionBank.length
      },
      verification: {
        life_goals: !!verifications[0],
        communication_style: !!verifications[1]
      }
    };

    console.log('✅ Production sync completed:', results);
    
    return res.status(200).json(results);

  } catch (error) {
    console.error('❌ Production sync failed:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Question sync failed',
      error: error.message 
    });
  }
});

// Get personalized next questions for optimal matching
router.get('/personalized', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 5 } = req.query;

    console.log(`🎯 Getting personalized questions for user ${userId}`);

    const result = await getPersonalizedQuestions(userId, parseInt(limit));

    res.json({
      success: true,
      data: result,
      message: `Here are ${result.questions.length} personalized questions to boost your matching potential by ${result.analytics.improvementPotential}%`
    });

  } catch (error) {
    console.error('❌ Get personalized questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get personalized questions'
    });
  }
});

// Get high-impact questions for maximum matching improvement
router.get('/high-impact', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 5 } = req.query;

    console.log(`💎 Getting high-impact questions for user ${userId}`);

    const questions = await getHighImpactQuestions(userId, parseInt(limit));

    res.json({
      success: true,
      data: {
        questions,
        impact: `These ${questions.length} questions will maximize your matching accuracy`
      },
      message: 'High-impact questions for optimal matching'
    });

  } catch (error) {
    console.error('❌ Get high-impact questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get high-impact questions'
    });
  }
});

// Get user's personality profile and insights
router.get('/profile/insights', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`🧬 Getting personality profile insights for user ${userId}`);

    const profile = await calculatePersonalityProfile(userId);

    res.json({
      success: true,
      data: profile,
      message: `Your profile is ${profile.completionPercentage}% complete across ${Object.keys(profile.categoryScores).length} categories`
    });

  } catch (error) {
    console.error('❌ Get personality profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get personality profile'
    });
  }
});

export default router; 