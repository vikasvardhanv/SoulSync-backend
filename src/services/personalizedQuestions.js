/**
 * Personalized Question Selection Service
 * 
 * This service implements intelligent question selection based on:
 * - User's current answers and gaps
 * - Category diversity requirements
 * - High-weight questions for better matching
 * - Progressive difficulty/depth
 * - User engagement optimization
 */

import prisma from '../database/connection.js';

/**
 * Get personalized next questions for a user based on their profile gaps
 * Implements the progressive matching algorithm with diversity bonus
 */
export async function getPersonalizedQuestions(userId, limit = 5) {
  console.log(`🎯 Getting personalized questions for user ${userId} (limit: ${limit})`);

  try {
    // 1. Get user's current answers and analyze their profile
    const userAnswers = await prisma.userAnswer.findMany({
      where: { userId },
      include: {
        question: {
          select: {
            id: true,
            category: true,
            weight: true
          }
        }
      }
    });

    const answeredQuestionIds = userAnswers.map(a => a.questionId);
    console.log(`📝 User has answered ${userAnswers.length} questions`);

    // 2. Analyze category distribution and gaps
    const categoryStats = analyzeCategoryDistribution(userAnswers);
    console.log(`📊 Category stats:`, categoryStats);

    // 3. Get all available questions (not answered yet)
    const availableQuestions = await prisma.question.findMany({
      where: {
        id: { notIn: answeredQuestionIds },
        isActive: true
      },
      orderBy: [
        { weight: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    console.log(`🎲 Found ${availableQuestions.length} available questions`);

    // 4. Apply intelligent selection algorithm
    const selectedQuestions = selectQuestionsWithDiversityBonus(
      availableQuestions,
      categoryStats,
      userAnswers.length,
      parseInt(limit)
    );

    // 5. Calculate improvement potential
    const improvementPotential = calculateImprovementPotential(
      userAnswers.length,
      selectedQuestions.length
    );

    return {
      questions: selectedQuestions,
      analytics: {
        totalAnswered: userAnswers.length,
        categoryStats,
        improvementPotential,
        matchingReadiness: calculateMatchingReadiness(userAnswers.length),
        recommendations: generateRecommendations(userAnswers.length, categoryStats)
      }
    };

  } catch (error) {
    console.error('❌ Error getting personalized questions:', error);
    throw error;
  }
}

/**
 * Analyze user's answer distribution across categories
 */
function analyzeCategoryDistribution(userAnswers) {
  const categories = ['personality', 'communication', 'lifestyle', 'values', 'relationship', 'compatibility'];
  const stats = {};

  categories.forEach(category => {
    const categoryAnswers = userAnswers.filter(a => a.question.category === category);
    const totalWeight = categoryAnswers.reduce((sum, a) => sum + a.question.weight, 0);
    const averageWeight = categoryAnswers.length > 0 ? totalWeight / categoryAnswers.length : 0;

    stats[category] = {
      count: categoryAnswers.length,
      totalWeight,
      averageWeight,
      completionScore: Math.min(10, categoryAnswers.length) // 0-10 scale
    };
  });

  return stats;
}

/**
 * Smart question selection with diversity bonus algorithm
 * Ensures well-rounded profiles while prioritizing high-impact questions
 */
function selectQuestionsWithDiversityBonus(availableQuestions, categoryStats, currentAnswerCount, limit) {
  console.log(`🧠 Running diversity bonus algorithm for ${limit} questions`);

  // Group questions by category
  const questionsByCategory = {};
  availableQuestions.forEach(q => {
    if (!questionsByCategory[q.category]) {
      questionsByCategory[q.category] = [];
    }
    questionsByCategory[q.category].push(q);
  });

  // Sort each category by weight (high to low)
  Object.keys(questionsByCategory).forEach(category => {
    questionsByCategory[category].sort((a, b) => b.weight - a.weight);
  });

  const selectedQuestions = [];
  const categories = Object.keys(questionsByCategory);

  // Phase 1: Essential high-weight questions (if user has < 5 answers)
  if (currentAnswerCount < 5) {
    console.log('📈 Phase 1: Selecting essential high-weight questions');
    const highWeightQuestions = availableQuestions
      .filter(q => q.weight >= 8)
      .slice(0, Math.min(3, limit));
    
    selectedQuestions.push(...highWeightQuestions);
  }

  // Phase 2: Category diversity (ensure representation across categories)
  if (selectedQuestions.length < limit) {
    console.log('🌈 Phase 2: Ensuring category diversity');
    
    // Find categories with lowest completion scores
    const sortedCategories = categories.sort((a, b) => {
      const scoreA = categoryStats[a]?.completionScore || 0;
      const scoreB = categoryStats[b]?.completionScore || 0;
      return scoreA - scoreB;
    });

    // Add one question from each under-represented category
    for (const category of sortedCategories) {
      if (selectedQuestions.length >= limit) break;
      
      const categoryQuestions = questionsByCategory[category] || [];
      const availableFromCategory = categoryQuestions.filter(q => 
        !selectedQuestions.find(sq => sq.id === q.id)
      );

      if (availableFromCategory.length > 0) {
        selectedQuestions.push(availableFromCategory[0]);
        console.log(`➕ Added question from ${category}: ${availableFromCategory[0].id}`);
      }
    }
  }

  // Phase 3: Fill remaining slots with highest weight questions
  if (selectedQuestions.length < limit) {
    console.log('⚡ Phase 3: Filling with highest weight questions');
    
    const remainingQuestions = availableQuestions
      .filter(q => !selectedQuestions.find(sq => sq.id === q.id))
      .sort((a, b) => b.weight - a.weight);

    const needed = limit - selectedQuestions.length;
    selectedQuestions.push(...remainingQuestions.slice(0, needed));
  }

  console.log(`✅ Selected ${selectedQuestions.length} questions with diversity bonus`);
  return selectedQuestions.slice(0, limit);
}

/**
 * Calculate potential improvement in matching from answering additional questions
 */
function calculateImprovementPotential(currentAnswers, additionalQuestions) {
  // Base improvement: 5% per question for first 20 questions
  let baseImprovement = additionalQuestions * 5;
  
  // Diminishing returns after 10 questions
  if (currentAnswers > 10) {
    const diminishingFactor = Math.max(0.3, 1 - ((currentAnswers - 10) * 0.1));
    baseImprovement *= diminishingFactor;
  }

  // Bonus for reaching milestones
  const currentMilestone = Math.floor(currentAnswers / 5) * 5;
  const futureAnswers = currentAnswers + additionalQuestions;
  const futureMilestone = Math.floor(futureAnswers / 5) * 5;
  
  if (futureMilestone > currentMilestone) {
    baseImprovement += 10; // 10% bonus for milestone
  }

  return Math.min(50, Math.round(baseImprovement));
}

/**
 * Calculate overall matching readiness score (0-100%)
 */
function calculateMatchingReadiness(answerCount) {
  if (answerCount < 5) return Math.round((answerCount / 5) * 25); // 0-25% for basic matching
  if (answerCount < 15) return 25 + Math.round(((answerCount - 5) / 10) * 50); // 25-75% for good matching
  return 75 + Math.min(25, Math.round((answerCount - 15) * 2)); // 75-100% for excellent matching
}

/**
 * Generate personalized recommendations based on user's current profile
 */
function generateRecommendations(answerCount, categoryStats) {
  const recommendations = [];

  // Basic completion recommendations
  if (answerCount < 5) {
    recommendations.push({
      type: 'essential',
      priority: 'high',
      message: 'Answer 5 basic questions to unlock AI matching',
      action: 'complete_basic_profile',
      questionsNeeded: 5 - answerCount
    });
  } else if (answerCount < 15) {
    recommendations.push({
      type: 'improvement',
      priority: 'medium',
      message: `Answer ${15 - answerCount} more questions for optimal matching`,
      action: 'improve_accuracy',
      questionsNeeded: 15 - answerCount
    });
  }

  // Category-specific recommendations
  const categories = Object.keys(categoryStats);
  const underRepresentedCategories = categories.filter(cat => 
    (categoryStats[cat]?.completionScore || 0) < 3
  );

  if (underRepresentedCategories.length > 0) {
    recommendations.push({
      type: 'diversity',
      priority: 'medium',
      message: `Explore ${underRepresentedCategories[0]} questions for a well-rounded profile`,
      action: 'category_focus',
      category: underRepresentedCategories[0]
    });
  }

  // Milestone recommendations
  const nextMilestone = Math.ceil(answerCount / 5) * 5;
  if (nextMilestone - answerCount <= 3 && answerCount < 25) {
    recommendations.push({
      type: 'milestone',
      priority: 'low',
      message: `${nextMilestone - answerCount} questions away from your next milestone!`,
      action: 'reach_milestone',
      questionsNeeded: nextMilestone - answerCount
    });
  }

  return recommendations;
}

/**
 * Get questions for a specific category with smart ordering
 */
export async function getQuestionsByCategory(category, userId = null, limit = 10) {
  console.log(`📚 Getting ${category} questions (limit: ${limit})`);

  try {
    const whereClause = {
      category,
      isActive: true
    };

    // Exclude already answered questions if user is provided
    if (userId) {
      const userAnswers = await prisma.userAnswer.findMany({
        where: { userId },
        select: { questionId: true }
      });
      
      if (userAnswers.length > 0) {
        whereClause.id = {
          notIn: userAnswers.map(a => a.questionId)
        };
      }
    }

    const questions = await prisma.question.findMany({
      where: whereClause,
      orderBy: [
        { weight: 'desc' },
        { createdAt: 'asc' }
      ],
      take: parseInt(limit)
    });

    return questions;

  } catch (error) {
    console.error(`❌ Error getting ${category} questions:`, error);
    throw error;
  }
}

/**
 * Get high-impact questions for users who want maximum matching improvement
 */
export async function getHighImpactQuestions(userId, limit = 5) {
  console.log(`💎 Getting high-impact questions for user ${userId}`);

  try {
    const userAnswers = await prisma.userAnswer.findMany({
      where: { userId },
      select: { questionId: true }
    });

    const answeredIds = userAnswers.map(a => a.questionId);

    // Get questions with weight 8+ that haven't been answered
    const highImpactQuestions = await prisma.question.findMany({
      where: {
        id: { notIn: answeredIds },
        weight: { gte: 8 },
        isActive: true
      },
      orderBy: [
        { weight: 'desc' },
        { createdAt: 'asc' }
      ],
      take: parseInt(limit)
    });

    return highImpactQuestions;

  } catch (error) {
    console.error('❌ Error getting high-impact questions:', error);
    throw error;
  }
}

/**
 * Calculate user's personality profile scores based on their answers
 */
export async function calculatePersonalityProfile(userId) {
  console.log(`🧬 Calculating personality profile for user ${userId}`);

  try {
    const userAnswers = await prisma.userAnswer.findMany({
      where: { userId },
      include: {
        question: {
          select: {
            id: true,
            category: true,
            type: true,
            weight: true,
            options: true
          }
        }
      }
    });

    const profile = {
      totalQuestions: userAnswers.length,
      categoryScores: {},
      traits: {},
      completionPercentage: 0,
      strengths: [],
      recommendations: []
    };

    // Calculate category scores
    const categories = ['personality', 'communication', 'lifestyle', 'values', 'relationship', 'compatibility'];
    
    categories.forEach(category => {
      const categoryAnswers = userAnswers.filter(a => a.question.category === category);
      const totalWeight = categoryAnswers.reduce((sum, a) => sum + a.question.weight, 0);
      const averageWeight = categoryAnswers.length > 0 ? totalWeight / categoryAnswers.length : 0;
      
      profile.categoryScores[category] = {
        answeredQuestions: categoryAnswers.length,
        totalWeight,
        averageWeight,
        completionScore: Math.min(100, (categoryAnswers.length / 5) * 100)
      };
    });

    // Calculate overall completion
    const totalPossibleQuestions = await prisma.question.count({ where: { isActive: true } });
    profile.completionPercentage = Math.round((userAnswers.length / totalPossibleQuestions) * 100);

    // Identify strengths (categories with high completion)
    profile.strengths = categories.filter(cat => 
      profile.categoryScores[cat].completionScore >= 60
    );

    return profile;

  } catch (error) {
    console.error('❌ Error calculating personality profile:', error);
    throw error;
  }
}

export default {
  getPersonalizedQuestions,
  getQuestionsByCategory,
  getHighImpactQuestions,
  calculatePersonalityProfile
};