// backend/src/services/matchingAlgorithm.js
/**
 * AI-Based Matching Algorithm for SoulSync
 * Analyzes personality quiz answers and calculates compatibility scores
 */

/**
 * Calculate compatibility score between two users based on their quiz answers
 * @param {Object} user1Answers - User 1's quiz answers
 * @param {Object} user2Answers - User 2's quiz answers
 * @returns {number} Compatibility score from 0-10
 */
export function calculateCompatibilityScore(user1Answers, user2Answers) {
  if (!user1Answers || !user2Answers) {
    return 5.0; // Neutral score if no answers
  }

  let totalScore = 0;
  let totalWeight = 0;

  // Category weights (how important each category is)
  const categoryWeights = {
    personality: 2.5,      // Most important
    values: 2.5,           // Most important
    lifestyle: 1.5,
    communication: 1.5,
    relationship: 1.0,
    compatibility: 1.0
  };

  // Calculate diversity bonus - users with more diverse answers get better matching
  const categoryDiversity = new Set();
  let totalAnswers = 0;

  // Process each answer
  for (const [questionId, answer1] of Object.entries(user1Answers)) {
    const answer2 = user2Answers[questionId];
    
    if (!answer2) continue; // Skip if other user hasn't answered

    totalAnswers++;
    
    // Get question metadata (category and type)
    const questionMeta = getQuestionMetadata(questionId);
    const weight = categoryWeights[questionMeta.category] || 1.0;
    
    categoryDiversity.add(questionMeta.category);

    // Calculate similarity score for this question (0-1)
    const similarity = calculateAnswerSimilarity(
      answer1,
      answer2,
      questionMeta.type
    );

    totalScore += similarity * weight;
    totalWeight += weight;
  }

  // Calculate final score (0-10 scale)
  const rawScore = totalWeight > 0 ? (totalScore / totalWeight) * 10 : 5.0;

  // Apply bonuses and penalties
  let finalScore = rawScore;

  // Diversity bonus - more categories answered = better accuracy
  const diversityBonus = (categoryDiversity.size / Object.keys(categoryWeights).length) * 0.5;
  finalScore += diversityBonus;

  // Answer completeness bonus - more total answers = higher confidence
  const completenessBonus = Math.min(1.0, totalAnswers / 20) * 0.5;
  finalScore += completenessBonus;

  // Bonus: Shared interests
  const interestBonus = calculateInterestBonus(user1Answers, user2Answers);
  finalScore += interestBonus;

  // Bonus: Compatible communication styles
  const communicationBonus = calculateCommunicationBonus(user1Answers, user2Answers);
  finalScore += communicationBonus;

  // Ensure score is between 0-10
  return Math.max(0, Math.min(10, finalScore));
}

/**
 * Calculate similarity between two answers
 * @param {any} answer1 - First user's answer
 * @param {any} answer2 - Second user's answer
 * @param {string} type - Question type (scale, multiple, text)
 * @returns {number} Similarity score from 0-1
 */
function calculateAnswerSimilarity(answer1, answer2, type) {
  switch (type) {
    case 'scale':
      // For scale questions (1-10), calculate how close the answers are
      const diff = Math.abs(answer1 - answer2);
      return 1 - (diff / 10); // Closer = higher score

    case 'multiple':
      // For multiple choice, exact match = 1, no match = 0
      return answer1 === answer2 ? 1.0 : 0.0;

    case 'text':
      // For text answers, do basic keyword matching
      const keywords1 = String(answer1).toLowerCase().split(/\s+/);
      const keywords2 = String(answer2).toLowerCase().split(/\s+/);
      const commonWords = keywords1.filter(word => keywords2.includes(word));
      return commonWords.length / Math.max(keywords1.length, keywords2.length);

    default:
      return 0.5; // Neutral if unknown type
  }
}

/**
 * Get question metadata (category and type)
 * This should match your question bank structure
 */
function getQuestionMetadata(questionId) {
  // Map question IDs to their categories and types
  // This is a simplified version - in production, fetch from database
  const metadata = {
    // Personality questions (scale: 1-10)
    'personality_1': { category: 'personality', type: 'scale' },
    'personality_2': { category: 'personality', type: 'scale' },
    'personality_3': { category: 'personality', type: 'scale' },
    'personality_4': { category: 'personality', type: 'scale' },
    'personality_5': { category: 'personality', type: 'scale' },

    // Values questions (scale: 1-10)
    'values_1': { category: 'values', type: 'scale' },
    'values_2': { category: 'values', type: 'scale' },
    'values_3': { category: 'values', type: 'scale' },
    'values_4': { category: 'values', type: 'scale' },

    // Lifestyle questions (multiple choice)
    'lifestyle_1': { category: 'lifestyle', type: 'multiple' },
    'lifestyle_2': { category: 'lifestyle', type: 'multiple' },
    'lifestyle_3': { category: 'lifestyle', type: 'multiple' },

    // Communication questions (scale)
    'communication_1': { category: 'communication', type: 'scale' },
    'communication_2': { category: 'communication', type: 'scale' },

    // Relationship questions (multiple choice)
    'relationship_1': { category: 'relationship', type: 'multiple' },
    'relationship_2': { category: 'relationship', type: 'multiple' },
  };

  return metadata[questionId] || { category: 'other', type: 'scale' };
}

/**
 * Calculate bonus for shared interests
 */
function calculateInterestBonus(user1Answers, user2Answers) {
  const interests1 = user1Answers.interests || [];
  const interests2 = user2Answers.interests || [];

  if (!Array.isArray(interests1) || !Array.isArray(interests2)) {
    return 0;
  }

  const commonInterests = interests1.filter(interest => 
    interests2.includes(interest)
  );

  // Up to 1.0 bonus for shared interests
  return Math.min(1.0, commonInterests.length * 0.2);
}

/**
 * Calculate bonus for compatible communication styles
 */
function calculateCommunicationBonus(user1Answers, user2Answers) {
  // Check if both users have similar communication preferences
  const comm1 = user1Answers.communication_1; // How often they want to communicate
  const comm2 = user2Answers.communication_1;

  if (!comm1 || !comm2) return 0;

  const diff = Math.abs(comm1 - comm2);
  
  // If communication preferences are very similar, give bonus
  if (diff <= 2) {
    return 0.5; // Good compatibility bonus
  } else if (diff <= 4) {
    return 0.2; // Moderate compatibility
  }
  
  return 0; // No bonus
}

/**
 * Basic profile matching when quiz data is not available
 * @param {string} userId - The user to find matches for
 * @param {Object} prisma - Prisma client instance
 * @param {number} limit - Number of matches to return
 * @returns {Promise<Array>} Array of users with basic compatibility
 */
async function findBasicProfileMatches(userId, prisma, limit = 10) {
  try {
    console.log('🔄 Using basic profile matching');
    
    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!currentUser) {
      return [];
    }

    // Get existing matches to exclude
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
    excludedIds.push(userId); // Exclude self

    // Get potential matches based on basic criteria
    const basicMatches = await prisma.user.findMany({
      where: {
        id: { notIn: excludedIds },
        isActive: true,
        age: currentUser.age ? {
          gte: Math.max(18, currentUser.age - 10),
          lte: currentUser.age + 10
        } : undefined
      },
      select: {
        id: true,
        name: true,
        age: true,
        bio: true,
        location: true,
        interests: true,
        photos: true
      },
      take: limit
    });

    // Add a basic compatibility score based on shared interests and location
    const scoredBasicMatches = basicMatches.map(match => {
      let score = 5.0; // Base score

      // Location similarity
      if (currentUser.location && match.location && 
          currentUser.location.toLowerCase() === match.location.toLowerCase()) {
        score += 1.0;
      }

      // Shared interests
      if (currentUser.interests && match.interests) {
        const userInterests = currentUser.interests.map(i => i.toLowerCase());
        const matchInterests = match.interests.map(i => i.toLowerCase());
        const sharedInterests = userInterests.filter(i => matchInterests.includes(i));
        score += (sharedInterests.length * 0.5);
      }

      // Age compatibility (closer ages get higher scores)
      if (currentUser.age && match.age) {
        const ageDiff = Math.abs(currentUser.age - match.age);
        score += Math.max(0, 2.0 - (ageDiff * 0.2));
      }

      return {
        ...match,
        compatibilityScore: Math.min(10, Number(score.toFixed(1)))
      };
    });

    return scoredBasicMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    
  } catch (error) {
    console.error('❌ Error in basic profile matching:', error);
    return [];
  }
}

/**
 * Find top compatible matches for a user
 * @param {string} userId - The user to find matches for
 * @param {Object} prisma - Prisma client instance
 * @param {number} limit - Number of matches to return
 * @returns {Promise<Array>} Array of users with compatibility scores
 */
export async function findCompatibleMatches(userId, prisma, limit = 10) {
  try {
    console.log(`🤖 Starting AI matching for user: ${userId}`);
    
    // Get current user's answers
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        answers: {
          select: {
            questionId: true,
            answer: true
          }
        }
      }
    });

    console.log(`👤 Current user found:`, {
      id: currentUser?.id,
      name: currentUser?.name,
      answersCount: currentUser?.answers?.length || 0
    });

    if (!currentUser) {
      throw new Error('User not found');
    }

    if (!currentUser.answers || currentUser.answers.length === 0) {
      console.log('⚠️  User has not completed personality quiz');
      // Return empty array instead of throwing error for better UX
      return [];
    }

    // Convert answers to object format
    const currentUserAnswers = {};
    currentUser.answers.forEach(a => {
      currentUserAnswers[a.questionId] = a.answer;
    });

    console.log(`📝 Current user has ${Object.keys(currentUserAnswers).length} answers`);

    // Get existing matches to exclude
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
    excludedIds.push(userId); // Exclude self

    console.log(`🚫 Excluding ${excludedIds.length} users (existing matches + self)`);

    // Get potential matches (users who have completed quiz)
    const potentialMatches = await prisma.user.findMany({
      where: {
        id: { notIn: excludedIds },
        isActive: true,
        answers: {
          some: {} // Has at least one answer
        }
      },
      include: {
        answers: {
          select: {
            questionId: true,
            answer: true
          }
        }
      },
      take: 100 // Get more candidates to score
    });

    console.log(`🎯 Found ${potentialMatches.length} potential matches to score`);

    // If no users with quiz answers, fall back to basic profile matching
    if (potentialMatches.length === 0) {
      console.log('🔄 No users with quiz answers found, falling back to basic profile matching');
      return await findBasicProfileMatches(userId, prisma, limit);
    }

    // Calculate compatibility scores for each potential match
    const scoredMatches = potentialMatches.map(match => {
      const matchAnswers = {};
      match.answers.forEach(a => {
        matchAnswers[a.questionId] = a.answer;
      });

      const compatibilityScore = calculateCompatibilityScore(
        currentUserAnswers,
        matchAnswers
      );

      return {
        id: match.id,
        name: match.name,
        age: match.age,
        bio: match.bio,
        location: match.location,
        interests: match.interests,
        photos: match.photos,
        compatibilityScore: Number(compatibilityScore.toFixed(1)),
        answers: match.answers // Include for frontend if needed
      };
    });

    // Sort by compatibility score (highest first) and return top matches
    const topMatches = scoredMatches
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, limit)
      .filter(match => match.compatibilityScore >= 6.0); // Only show decent matches

    console.log(`🏆 Returning ${topMatches.length} top matches (score >= 6.0)`);

    return topMatches;

  } catch (error) {
    console.error('❌ Error finding compatible matches:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

/**
 * Get match explanation (why they're compatible)
 * @param {Object} user1Answers - User 1's answers
 * @param {Object} user2Answers - User 2's answers
 * @returns {Object} Explanation of compatibility
 */
export function getMatchExplanation(user1Answers, user2Answers) {
  const explanation = {
    strengths: [],
    challenges: [],
    commonInterests: []
  };

  // Find common interests
  const interests1 = user1Answers.interests || [];
  const interests2 = user2Answers.interests || [];
  explanation.commonInterests = interests1.filter(i => interests2.includes(i));

  // Analyze personality compatibility
  const personalityDiff = Math.abs(
    (user1Answers.personality_1 || 5) - (user2Answers.personality_1 || 5)
  );
  
  if (personalityDiff <= 2) {
    explanation.strengths.push('Similar personality types');
  } else if (personalityDiff >= 6) {
    explanation.challenges.push('Different personality approaches');
  }

  // Analyze values compatibility
  const valuesDiff = Math.abs(
    (user1Answers.values_1 || 5) - (user2Answers.values_1 || 5)
  );
  
  if (valuesDiff <= 2) {
    explanation.strengths.push('Aligned core values');
  }

  // Communication style
  const commDiff = Math.abs(
    (user1Answers.communication_1 || 5) - (user2Answers.communication_1 || 5)
  );
  
  if (commDiff <= 2) {
    explanation.strengths.push('Compatible communication styles');
  }

  return explanation;
}

export default {
  calculateCompatibilityScore,
  findCompatibleMatches,
  getMatchExplanation
};
