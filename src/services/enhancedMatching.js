/**
 * Enhanced Matching Algorithm with Progressive Scoring
 * 
 * This service implements intelligent compatibility matching based on:
 * - Dynamic question weights and categories
 * - Progressive scoring with diversity bonus
 * - Real-time compatibility calculations
 * - User engagement optimization
 */

import prisma from '../database/connection.js';

/**
 * Calculate comprehensive compatibility score between two users
 * Uses dynamic weighting and category-based analysis
 */
export async function calculateEnhancedCompatibility(user1Id, user2Id) {
  console.log(`💕 Calculating enhanced compatibility between ${user1Id} and ${user2Id}`);

  try {
    // Get both users' answers with question details
    const [user1Answers, user2Answers] = await Promise.all([
      getUserAnswersWithQuestions(user1Id),
      getUserAnswersWithQuestions(user2Id)
    ]);

    if (user1Answers.length === 0 || user2Answers.length === 0) {
      console.log('⚠️ One or both users have no answers');
      return {
        compatibilityScore: 0,
        breakdown: {},
        explanation: 'Insufficient data for compatibility calculation',
        confidence: 0
      };
    }

    // Find common questions both users have answered
    const commonQuestions = findCommonQuestions(user1Answers, user2Answers);
    console.log(`🔗 Found ${commonQuestions.length} common questions`);

    if (commonQuestions.length === 0) {
      return {
        compatibilityScore: 0,
        breakdown: {},
        explanation: 'No common questions answered',
        confidence: 0
      };
    }

    // Calculate category-wise compatibility
    const categoryBreakdown = calculateCategoryCompatibility(commonQuestions);
    
    // Calculate overall weighted score
    const overallScore = calculateWeightedCompatibilityScore(categoryBreakdown);
    
    // Calculate confidence based on data completeness
    const confidence = calculateConfidenceScore(commonQuestions, user1Answers.length, user2Answers.length);

    // Generate explanation
    const explanation = generateCompatibilityExplanation(categoryBreakdown, confidence);

    return {
      compatibilityScore: Math.round(overallScore * 10) / 10, // Round to 1 decimal
      breakdown: categoryBreakdown,
      explanation,
      confidence,
      commonQuestions: commonQuestions.length,
      totalAnswers: {
        user1: user1Answers.length,
        user2: user2Answers.length
      }
    };

  } catch (error) {
    console.error('❌ Error calculating enhanced compatibility:', error);
    throw error;
  }
}

/**
 * Find compatible matches for a user with enhanced algorithm
 */
export async function findEnhancedMatches(userId, limit = 10, filters = {}) {
  console.log(`🎯 Finding enhanced matches for user ${userId} (limit: ${limit})`);

  try {
    // Get current user's profile and answers
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        age: true,
        gender: true,
        lookingFor: true,
        city: true,
        latitude: true,
        longitude: true
      }
    });

    if (!currentUser) {
      throw new Error('User not found');
    }

    // Get user's answers to determine their preferences
    const userAnswers = await getUserAnswersWithQuestions(userId);
    
    if (userAnswers.length < 3) {
      console.log('⚠️ User has too few answers for enhanced matching');
      return {
        matches: [],
        message: 'Answer at least 3 questions to unlock AI matching',
        recommendation: 'Complete your personality profile for better matches'
      };
    }

    // Build potential matches query based on user preferences (reciprocal filtering)
    const potentialMatchesWhere = {
      id: { not: userId },
      isActive: true,
      isVerified: true,
      // If user specified a lookingFor (not everyone), target's gender must match
      ...(currentUser.lookingFor && currentUser.lookingFor !== 'everyone' ? { gender: currentUser.lookingFor } : {})
    };

    // Apply age filters if provided
    if (filters.minAge || filters.maxAge) {
      potentialMatchesWhere.age = {};
      if (filters.minAge) potentialMatchesWhere.age.gte = parseInt(filters.minAge);
      if (filters.maxAge) potentialMatchesWhere.age.lte = parseInt(filters.maxAge);
    }

    // Get potential matches
    const potentialMatches = await prisma.user.findMany({
      where: potentialMatchesWhere,
      select: {
        id: true,
        name: true,
        age: true,
        bio: true,
        location: true,
        city: true,
        latitude: true,
        longitude: true,
        interests: true,
        photos: true,
        gender: true,
        lookingFor: true,
        createdAt: true
      },
      take: limit * 3 // Get more to allow for filtering
    });

    console.log(`🔍 Found ${potentialMatches.length} potential matches`);

    // Calculate compatibility for each potential match
    const matchesWithCompatibility = [];
    
    for (const match of potentialMatches) {
      // Enforce reciprocal preference: if the other user has a lookingFor value (not everyone) ensure it matches current user's gender
      if (match.lookingFor && match.lookingFor !== 'everyone' && currentUser.gender && match.lookingFor !== currentUser.gender) {
        continue; // Skip non-reciprocal preference
      }
      try {
        const compatibility = await calculateEnhancedCompatibility(userId, match.id);
        
        // Only include matches with meaningful compatibility scores
        if (compatibility.compatibilityScore > 0 && compatibility.confidence > 0.2) {
          matchesWithCompatibility.push({
            ...match,
            compatibility
          });
        }
      } catch (error) {
        console.error(`Error calculating compatibility with ${match.id}:`, error.message);
      }
    }

    // Sort by compatibility score (descending)
    const sortedMatches = matchesWithCompatibility
      .sort((a, b) => b.compatibility.compatibilityScore - a.compatibility.compatibilityScore)
      .slice(0, limit);

    console.log(`✨ Returning ${sortedMatches.length} enhanced matches`);

    return {
      matches: sortedMatches,
      algorithm: 'enhanced_ai_matching',
      totalAnalyzed: potentialMatches.length,
      userProfile: {
        answersCount: userAnswers.length,
        profileStrength: calculateProfileStrength(userAnswers.length)
      }
    };

  } catch (error) {
    console.error('❌ Error finding enhanced matches:', error);
    throw error;
  }
}

/**
 * Get user answers with full question details
 */
async function getUserAnswersWithQuestions(userId) {
  return await prisma.userAnswer.findMany({
    where: { userId },
    include: {
      question: {
        select: {
          id: true,
          question: true,
          category: true,
          type: true,
          weight: true,
          options: true,
          minValue: true,
          maxValue: true
        }
      }
    }
  });
}

/**
 * Find questions that both users have answered
 */
function findCommonQuestions(user1Answers, user2Answers) {
  const user1QuestionIds = new Set(user1Answers.map(a => a.questionId));
  
  return user2Answers
    .filter(a => user1QuestionIds.has(a.questionId))
    .map(user2Answer => {
      const user1Answer = user1Answers.find(a => a.questionId === user2Answer.questionId);
      return {
        question: user2Answer.question,
        user1Answer: user1Answer.answer,
        user2Answer: user2Answer.answer
      };
    });
}

/**
 * Calculate compatibility breakdown by category
 */
function calculateCategoryCompatibility(commonQuestions) {
  const categories = ['personality', 'communication', 'lifestyle', 'values', 'relationship', 'compatibility'];
  const breakdown = {};

  categories.forEach(category => {
    const categoryQuestions = commonQuestions.filter(q => q.question.category === category);
    
    if (categoryQuestions.length === 0) {
      breakdown[category] = {
        score: 0,
        weight: 0,
        questionsCount: 0,
        confidence: 0
      };
      return;
    }

    let totalWeight = 0;
    let weightedScore = 0;

    categoryQuestions.forEach(({ question, user1Answer, user2Answer }) => {
      const questionWeight = question.weight;
      const compatibility = calculateQuestionCompatibility(question, user1Answer, user2Answer);
      
      totalWeight += questionWeight;
      weightedScore += compatibility * questionWeight;
    });

    const categoryScore = totalWeight > 0 ? (weightedScore / totalWeight) * 10 : 0;
    const confidence = Math.min(1, categoryQuestions.length / 3); // Confidence based on question count

    breakdown[category] = {
      score: Math.round(categoryScore * 10) / 10,
      weight: totalWeight,
      questionsCount: categoryQuestions.length,
      confidence: Math.round(confidence * 100) / 100
    };
  });

  return breakdown;
}

/**
 * Calculate compatibility for a single question
 */
function calculateQuestionCompatibility(question, answer1, answer2) {
  if (question.type === 'scale') {
    // For scale questions, calculate similarity based on distance
    const min = question.minValue || 1;
    const max = question.maxValue || 10;
    const range = max - min;
    
    const value1 = parseFloat(answer1);
    const value2 = parseFloat(answer2);
    
    if (isNaN(value1) || isNaN(value2)) return 0;
    
    const distance = Math.abs(value1 - value2);
    const similarity = 1 - (distance / range);
    return Math.max(0, similarity);
    
  } else if (question.type === 'multiple') {
    // For multiple choice, exact match gets full score
    return answer1 === answer2 ? 1 : 0;
    
  } else {
    // For text questions, use simple string comparison
    return answer1.toLowerCase() === answer2.toLowerCase() ? 1 : 0;
  }
}

/**
 * Calculate overall weighted compatibility score
 */
function calculateWeightedCompatibilityScore(categoryBreakdown) {
  const categories = Object.keys(categoryBreakdown);
  let totalWeight = 0;
  let weightedSum = 0;

  categories.forEach(category => {
    const { score, weight, confidence } = categoryBreakdown[category];
    const adjustedWeight = weight * confidence; // Reduce weight for low-confidence categories
    
    totalWeight += adjustedWeight;
    weightedSum += score * adjustedWeight;
  });

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Calculate confidence score based on data completeness
 */
function calculateConfidenceScore(commonQuestions, user1Answers, user2Answers) {
  const minAnswers = Math.min(user1Answers, user2Answers);
  const dataCompleteness = Math.min(1, minAnswers / 10); // Max confidence at 10+ answers
  
  const questionCoverage = Math.min(1, commonQuestions.length / 8); // Max confidence at 8+ common questions
  
  return Math.round((dataCompleteness * 0.6 + questionCoverage * 0.4) * 100) / 100;
}

/**
 * Generate human-readable compatibility explanation
 */
function generateCompatibilityExplanation(categoryBreakdown, confidence) {
  const categories = Object.keys(categoryBreakdown);
  const strongCategories = categories.filter(cat => 
    categoryBreakdown[cat].score >= 7 && categoryBreakdown[cat].questionsCount > 0
  );
  const weakCategories = categories.filter(cat => 
    categoryBreakdown[cat].score < 4 && categoryBreakdown[cat].questionsCount > 0
  );

  let explanation = '';

  if (confidence < 0.3) {
    explanation = 'Limited data available for accurate compatibility assessment. Answer more questions to improve accuracy.';
  } else if (strongCategories.length === 0) {
    explanation = 'Low compatibility across most areas. Consider exploring different matches.';
  } else if (strongCategories.length >= 3) {
    explanation = `High compatibility in ${strongCategories.slice(0, 2).join(' and ')}. Strong potential for a meaningful connection.`;
  } else {
    explanation = `Good compatibility in ${strongCategories[0]}. ${weakCategories.length > 0 ? `Areas for growth include ${weakCategories[0]}.` : 'Overall promising match.'}`;
  }

  return explanation;
}

/**
 * Calculate profile strength based on answer count and diversity
 */
function calculateProfileStrength(answerCount) {
  if (answerCount < 5) return 'Basic';
  if (answerCount < 15) return 'Good';
  if (answerCount < 25) return 'Strong';
  return 'Excellent';
}

/**
 * Get matching insights for a user
 */
export async function getMatchingInsights(userId) {
  console.log(`📊 Getting matching insights for user ${userId}`);

  try {
    const userAnswers = await getUserAnswersWithQuestions(userId);
    const answerCount = userAnswers.length;

    // Analyze category distribution
    const categories = ['personality', 'communication', 'lifestyle', 'values', 'relationship', 'compatibility'];
    const categoryAnalysis = {};

    categories.forEach(category => {
      const categoryAnswers = userAnswers.filter(a => a.question.category === category);
      categoryAnalysis[category] = {
        answered: categoryAnswers.length,
        totalWeight: categoryAnswers.reduce((sum, a) => sum + a.question.weight, 0),
        averageWeight: categoryAnswers.length > 0 ? 
          categoryAnswers.reduce((sum, a) => sum + a.question.weight, 0) / categoryAnswers.length : 0
      };
    });

    // Calculate matching readiness
    const matchingReadiness = Math.min(100, Math.round((answerCount / 20) * 100));
    
    // Generate recommendations
    const recommendations = [];
    
    if (answerCount < 5) {
      recommendations.push({
        type: 'critical',
        message: 'Complete at least 5 questions to enable AI matching',
        priority: 'high',
        questionsNeeded: 5 - answerCount
      });
    } else if (answerCount < 15) {
      recommendations.push({
        type: 'improvement',
        message: `Answer ${15 - answerCount} more questions to optimize your matches`,
        priority: 'medium',
        questionsNeeded: 15 - answerCount
      });
    }

    // Check for category gaps
    const underRepresentedCategories = categories.filter(cat => 
      categoryAnalysis[cat].answered < 2
    );

    if (underRepresentedCategories.length > 0) {
      recommendations.push({
        type: 'diversity',
        message: `Strengthen your ${underRepresentedCategories[0]} profile for better matches`,
        priority: 'medium',
        category: underRepresentedCategories[0]
      });
    }

    return {
      matchingReadiness,
      profileStrength: calculateProfileStrength(answerCount),
      categoryAnalysis,
      recommendations,
      totalAnswers: answerCount,
      estimatedMatches: Math.max(0, Math.floor((answerCount - 3) * 2))
    };

  } catch (error) {
    console.error('❌ Error getting matching insights:', error);
    throw error;
  }
}

export default {
  calculateEnhancedCompatibility,
  findEnhancedMatches,
  getMatchingInsights
};