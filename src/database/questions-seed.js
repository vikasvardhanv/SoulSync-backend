// Comprehensive questions database for SoulSync
// This file contains all questions that can be migrated to the database

export const questionsData = [
  // PERSONALITY QUESTIONS
  {
    id: 'pers_001',
    question: 'How do you typically spend your ideal Friday night?',
    category: 'personality',
    type: 'multiple',
    emoji: '🌙',
    weight: 8,
    options: [
      { value: 'cozy_home', label: 'Cozy night at home with a good book or movie', score: 1 },
      { value: 'friends_out', label: 'Out with friends at a bar or restaurant', score: 2 },
      { value: 'adventure', label: 'Trying something new and adventurous', score: 3 },
      { value: 'creative', label: 'Working on a creative project or hobby', score: 4 },
      { value: 'social_event', label: 'Attending a social event or party', score: 5 }
    ]
  },
  {
    id: 'pers_002',
    question: 'What energizes you most?',
    category: 'personality',
    type: 'multiple',
    emoji: '⚡',
    weight: 9,
    options: [
      { value: 'alone_time', label: 'Quiet alone time to recharge', score: 1 },
      { value: 'small_groups', label: 'Intimate conversations with close friends', score: 2 },
      { value: 'large_groups', label: 'Being around lots of people and energy', score: 3 },
      { value: 'new_experiences', label: 'Trying new experiences and challenges', score: 4 },
      { value: 'helping_others', label: 'Helping others and making a difference', score: 5 }
    ]
  },
  {
    id: 'pers_003',
    question: 'How do you handle stress?',
    category: 'personality',
    type: 'multiple',
    emoji: '🧘',
    weight: 8,
    options: [
      { value: 'exercise', label: 'Physical exercise or sports', score: 1 },
      { value: 'meditation', label: 'Meditation or mindfulness practices', score: 2 },
      { value: 'talk_it_out', label: 'Talking it through with friends or family', score: 3 },
      { value: 'creative_outlet', label: 'Creative outlets like art, music, or writing', score: 4 },
      { value: 'problem_solve', label: 'Analyzing and problem-solving immediately', score: 5 }
    ]
  },
  {
    id: 'pers_004',
    question: 'What describes your decision-making style?',
    category: 'personality',
    type: 'multiple',
    emoji: '🤔',
    weight: 7,
    options: [
      { value: 'intuitive', label: 'I trust my gut instincts', score: 1 },
      { value: 'analytical', label: 'I analyze all the facts and data', score: 2 },
      { value: 'collaborative', label: 'I seek advice from others first', score: 3 },
      { value: 'quick', label: 'I make decisions quickly and adapt as needed', score: 4 },
      { value: 'cautious', label: 'I take time to consider all possibilities', score: 5 }
    ]
  },
  {
    id: 'pers_005',
    question: 'How important is spontaneity in your life?',
    category: 'personality',
    type: 'scale',
    emoji: '🎲',
    weight: 6,
    minValue: 1,
    maxValue: 10,
    scaleLabels: ['I prefer detailed plans', 'I love spontaneous adventures']
  },

  // COMPATIBILITY QUESTIONS
  {
    id: 'comp_001',
    question: 'How important is physical attraction in a relationship?',
    category: 'compatibility',
    type: 'scale',
    emoji: '💫',
    weight: 8,
    minValue: 1,
    maxValue: 10,
    scaleLabels: ['Not very important', 'Extremely important']
  },
  {
    id: 'comp_002',
    question: 'What role should humor play in a relationship?',
    category: 'compatibility',
    type: 'multiple',
    emoji: '😄',
    weight: 7,
    options: [
      { value: 'essential', label: 'Essential - we must laugh together daily', score: 1 },
      { value: 'important', label: 'Important - humor makes everything better', score: 2 },
      { value: 'nice_to_have', label: 'Nice to have but not crucial', score: 3 },
      { value: 'situational', label: 'Depends on the situation and mood', score: 4 },
      { value: 'serious_focus', label: 'I prefer deeper, more serious connections', score: 5 }
    ]
  },
  {
    id: 'comp_003',
    question: 'How do you prefer to resolve conflicts?',
    category: 'compatibility',
    type: 'multiple',
    emoji: '🤝',
    weight: 9,
    options: [
      { value: 'immediate_talk', label: 'Address it immediately and talk it through', score: 1 },
      { value: 'cool_down_first', label: 'Take time to cool down, then discuss calmly', score: 2 },
      { value: 'compromise', label: 'Focus on finding a compromise quickly', score: 3 },
      { value: 'avoid_conflict', label: 'Try to avoid conflict when possible', score: 4 },
      { value: 'seek_help', label: 'Get outside perspective or professional help', score: 5 }
    ]
  },
  {
    id: 'comp_004',
    question: 'What\'s your ideal balance of together time vs. personal space?',
    category: 'compatibility',
    type: 'multiple',
    emoji: '⚖️',
    weight: 8,
    options: [
      { value: 'mostly_together', label: 'Spend most free time together', score: 1 },
      { value: 'together_weekends', label: 'Together on weekends, independent weekdays', score: 2 },
      { value: 'balanced_mix', label: 'Healthy mix of together time and independence', score: 3 },
      { value: 'independent_focused', label: 'Maintain strong independence with quality time', score: 4 },
      { value: 'very_independent', label: 'Highly independent with occasional deep connection', score: 5 }
    ]
  },
  {
    id: 'comp_005',
    question: 'How important is it that your partner shares your hobbies?',
    category: 'compatibility',
    type: 'scale',
    emoji: '🎯',
    weight: 6,
    minValue: 1,
    maxValue: 10,
    scaleLabels: ['Different interests are exciting', 'Shared hobbies are essential']
  },

  // LIFESTYLE QUESTIONS
  {
    id: 'life_001',
    question: 'What\'s your ideal living situation?',
    category: 'lifestyle',
    type: 'multiple',
    emoji: '🏠',
    weight: 7,
    options: [
      { value: 'city_apartment', label: 'City apartment with urban conveniences', score: 1 },
      { value: 'suburban_house', label: 'Suburban house with yard and space', score: 2 },
      { value: 'rural_property', label: 'Rural property with nature and privacy', score: 3 },
      { value: 'travel_nomad', label: 'Flexible lifestyle, travel frequently', score: 4 },
      { value: 'minimalist', label: 'Minimalist living, location less important', score: 5 }
    ]
  },
  {
    id: 'life_002',
    question: 'How do you approach work-life balance?',
    category: 'lifestyle',
    type: 'multiple',
    emoji: '⚖️',
    weight: 8,
    options: [
      { value: 'work_focused', label: 'Career-focused, work comes first', score: 1 },
      { value: 'balanced_approach', label: 'Balanced approach, both are important', score: 2 },
      { value: 'life_focused', label: 'Life-focused, work enables lifestyle', score: 3 },
      { value: 'flexible_schedule', label: 'Flexible schedule, work around life events', score: 4 },
      { value: 'entrepreneurial', label: 'Entrepreneurial, create my own balance', score: 5 }
    ]
  },
  {
    id: 'life_003',
    question: 'What\'s your relationship with money?',
    category: 'lifestyle',
    type: 'multiple',
    emoji: '💰',
    weight: 7,
    options: [
      { value: 'saver', label: 'I\'m a saver, security is important', score: 1 },
      { value: 'balanced_spender', label: 'Balanced - save for goals, spend on experiences', score: 2 },
      { value: 'experience_spender', label: 'Spend on experiences and memories', score: 3 },
      { value: 'minimalist_approach', label: 'Minimalist approach, money isn\'t everything', score: 4 },
      { value: 'generous_giver', label: 'Generous with others, money is for sharing', score: 5 }
    ]
  },
  {
    id: 'life_004',
    question: 'How important is fitness and health in your daily life?',
    category: 'lifestyle',
    type: 'scale',
    emoji: '💪',
    weight: 6,
    minValue: 1,
    maxValue: 10,
    scaleLabels: ['Not a priority', 'Central to my lifestyle']
  },
  {
    id: 'life_005',
    question: 'What\'s your ideal vacation style?',
    category: 'lifestyle',
    type: 'multiple',
    emoji: '✈️',
    weight: 5,
    options: [
      { value: 'luxury_relaxation', label: 'Luxury resort, relaxation and pampering', score: 1 },
      { value: 'adventure_exploration', label: 'Adventure travel, exploring new places', score: 2 },
      { value: 'cultural_immersion', label: 'Cultural immersion, learning and experiencing', score: 3 },
      { value: 'nature_outdoor', label: 'Nature and outdoor activities', score: 4 },
      { value: 'staycation', label: 'Staycation, exploring local area', score: 5 }
    ]
  },

  // VALUES QUESTIONS
  {
    id: 'val_001',
    question: 'What matters most to you in life?',
    category: 'values',
    type: 'multiple',
    emoji: '🌟',
    weight: 10,
    options: [
      { value: 'family_relationships', label: 'Family and close relationships', score: 1 },
      { value: 'personal_growth', label: 'Personal growth and self-improvement', score: 2 },
      { value: 'career_achievement', label: 'Career success and achievement', score: 3 },
      { value: 'making_difference', label: 'Making a positive difference in the world', score: 4 },
      { value: 'freedom_independence', label: 'Freedom and independence', score: 5 }
    ]
  },
  {
    id: 'val_002',
    question: 'How important is spirituality or religion in your life?',
    category: 'values',
    type: 'scale',
    emoji: '🙏',
    weight: 8,
    minValue: 1,
    maxValue: 10,
    scaleLabels: ['Not important at all', 'Central to my identity']
  },
  {
    id: 'val_003',
    question: 'What\'s your approach to environmental responsibility?',
    category: 'values',
    type: 'multiple',
    emoji: '🌱',
    weight: 6,
    options: [
      { value: 'very_conscious', label: 'Very conscious, make eco-friendly choices daily', score: 1 },
      { value: 'moderately_conscious', label: 'Moderately conscious, do what I can', score: 2 },
      { value: 'basic_recycling', label: 'Basic recycling and conservation', score: 3 },
      { value: 'not_priority', label: 'Not a major priority for me', score: 4 },
      { value: 'skeptical', label: 'Skeptical about environmental claims', score: 5 }
    ]
  },
  {
    id: 'val_004',
    question: 'How do you view political involvement?',
    category: 'values',
    type: 'multiple',
    emoji: '🗳️',
    weight: 7,
    options: [
      { value: 'very_active', label: 'Very active, politics affect everything', score: 1 },
      { value: 'stay_informed', label: 'Stay informed, vote regularly', score: 2 },
      { value: 'basic_participation', label: 'Basic participation, vote in major elections', score: 3 },
      { value: 'avoid_politics', label: 'Prefer to avoid political discussions', score: 4 },
      { value: 'apolitical', label: 'Not interested in politics', score: 5 }
    ]
  },
  {
    id: 'val_005',
    question: 'What\'s your view on personal growth and self-improvement?',
    category: 'values',
    type: 'scale',
    emoji: '📈',
    weight: 7,
    minValue: 1,
    maxValue: 10,
    scaleLabels: ['I\'m happy as I am', 'Always working to improve myself']
  },

  // COMMUNICATION QUESTIONS
  {
    id: 'comm_001',
    question: 'How do you prefer to communicate in relationships?',
    category: 'communication',
    type: 'multiple',
    emoji: '💬',
    weight: 9,
    options: [
      { value: 'direct_honest', label: 'Direct and honest, even if it\'s difficult', score: 1 },
      { value: 'gentle_tactful', label: 'Gentle and tactful, consider feelings first', score: 2 },
      { value: 'humor_lightness', label: 'Use humor to lighten serious conversations', score: 3 },
      { value: 'written_reflection', label: 'Prefer written communication for important topics', score: 4 },
      { value: 'nonverbal_actions', label: 'Actions speak louder than words', score: 5 }
    ]
  },
  {
    id: 'comm_002',
    question: 'How often do you like to check in with your partner?',
    category: 'communication',
    type: 'multiple',
    emoji: '📱',
    weight: 7,
    options: [
      { value: 'constant_contact', label: 'Constant contact throughout the day', score: 1 },
      { value: 'regular_checkins', label: 'Regular check-ins, few times a day', score: 2 },
      { value: 'daily_summary', label: 'Daily summary of how things went', score: 3 },
      { value: 'when_needed', label: 'When needed or something important happens', score: 4 },
      { value: 'independent_communication', label: 'Very independent, communicate when together', score: 5 }
    ]
  },
  {
    id: 'comm_003',
    question: 'How do you express affection?',
    category: 'communication',
    type: 'multiple',
    emoji: '❤️',
    weight: 8,
    options: [
      { value: 'words_affirmation', label: 'Words of affirmation and verbal appreciation', score: 1 },
      { value: 'physical_touch', label: 'Physical touch and closeness', score: 2 },
      { value: 'acts_service', label: 'Acts of service and doing things for them', score: 3 },
      { value: 'gifts_surprises', label: 'Gifts and thoughtful surprises', score: 4 },
      { value: 'quality_time', label: 'Quality time and undivided attention', score: 5 }
    ]
  },
  {
    id: 'comm_004',
    question: 'How do you handle disagreements about important topics?',
    category: 'communication',
    type: 'multiple',
    emoji: '🤔',
    weight: 8,
    options: [
      { value: 'debate_discuss', label: 'Enjoy debating and discussing different viewpoints', score: 1 },
      { value: 'find_common_ground', label: 'Focus on finding common ground', score: 2 },
      { value: 'agree_to_disagree', label: 'Agree to disagree and respect differences', score: 3 },
      { value: 'avoid_disagreement', label: 'Try to avoid disagreements', score: 4 },
      { value: 'research_together', label: 'Research and learn together to understand better', score: 5 }
    ]
  },
  {
    id: 'comm_005',
    question: 'What\'s your preferred way to receive feedback?',
    category: 'communication',
    type: 'multiple',
    emoji: '🎯',
    weight: 6,
    options: [
      { value: 'direct_immediate', label: 'Direct and immediate feedback', score: 1 },
      { value: 'gentle_private', label: 'Gentle feedback in private', score: 2 },
      { value: 'constructive_solutions', label: 'Constructive feedback with solutions', score: 3 },
      { value: 'positive_sandwich', label: 'Positive feedback sandwich approach', score: 4 },
      { value: 'written_thoughtful', label: 'Written, thoughtful feedback I can process', score: 5 }
    ]
  },

  // RELATIONSHIP QUESTIONS
  {
    id: 'rel_001',
    question: 'What are you looking for in a relationship right now?',
    category: 'relationship',
    type: 'multiple',
    emoji: '💕',
    weight: 10,
    options: [
      { value: 'serious_longterm', label: 'Serious, long-term relationship leading to marriage', score: 1 },
      { value: 'committed_exclusive', label: 'Committed, exclusive relationship', score: 2 },
      { value: 'dating_see_where_goes', label: 'Dating to see where it goes naturally', score: 3 },
      { value: 'casual_fun', label: 'Casual dating and having fun', score: 4 },
      { value: 'friendship_first', label: 'Friendship first, relationship if it develops', score: 5 }
    ]
  },
  {
    id: 'rel_002',
    question: 'How important is marriage to you?',
    category: 'relationship',
    type: 'scale',
    emoji: '💍',
    weight: 9,
    minValue: 1,
    maxValue: 10,
    scaleLabels: ['Not important at all', 'Essential life goal']
  },
  {
    id: 'rel_003',
    question: 'How do you feel about having children?',
    category: 'relationship',
    type: 'multiple',
    emoji: '👶',
    weight: 10,
    options: [
      { value: 'definitely_want', label: 'Definitely want children', score: 1 },
      { value: 'probably_want', label: 'Probably want children', score: 2 },
      { value: 'unsure_open', label: 'Unsure, but open to the possibility', score: 3 },
      { value: 'probably_not', label: 'Probably don\'t want children', score: 4 },
      { value: 'definitely_not', label: 'Definitely don\'t want children', score: 5 }
    ]
  },
  {
    id: 'rel_004',
    question: 'What\'s most important in a romantic partner?',
    category: 'relationship',
    type: 'multiple',
    emoji: '🌟',
    weight: 9,
    options: [
      { value: 'emotional_intelligence', label: 'Emotional intelligence and empathy', score: 1 },
      { value: 'shared_values', label: 'Shared values and life goals', score: 2 },
      { value: 'intellectual_connection', label: 'Intellectual connection and stimulation', score: 3 },
      { value: 'physical_chemistry', label: 'Physical chemistry and attraction', score: 4 },
      { value: 'reliability_stability', label: 'Reliability and stability', score: 5 }
    ]
  },
  {
    id: 'rel_005',
    question: 'How do you view past relationships?',
    category: 'relationship',
    type: 'multiple',
    emoji: '🔄',
    weight: 6,
    options: [
      { value: 'learning_experiences', label: 'Learning experiences that helped me grow', score: 1 },
      { value: 'good_memories', label: 'Good memories, grateful for the time shared', score: 2 },
      { value: 'mixed_feelings', label: 'Mixed feelings, some good and some bad', score: 3 },
      { value: 'prefer_not_discuss', label: 'Prefer not to discuss past relationships', score: 4 },
      { value: 'cautious_because_past', label: 'Cautious in new relationships because of past hurt', score: 5 }
    ]
  },

  // ADDITIONAL DEEP QUESTIONS
  {
    id: 'deep_001',
    question: 'What\'s your biggest fear in relationships?',
    category: 'compatibility',
    type: 'multiple',
    emoji: '😰',
    weight: 8,
    options: [
      { value: 'losing_independence', label: 'Losing my independence and identity', score: 1 },
      { value: 'being_hurt_betrayed', label: 'Being hurt or betrayed', score: 2 },
      { value: 'not_being_enough', label: 'Not being good enough for my partner', score: 3 },
      { value: 'growing_apart', label: 'Growing apart over time', score: 4 },
      { value: 'commitment_forever', label: 'The commitment and "forever" aspect', score: 5 }
    ]
  },
  {
    id: 'deep_002',
    question: 'How do you define success in life?',
    category: 'values',
    type: 'multiple',
    emoji: '🏆',
    weight: 8,
    options: [
      { value: 'happiness_fulfillment', label: 'Personal happiness and fulfillment', score: 1 },
      { value: 'positive_impact', label: 'Making a positive impact on others', score: 2 },
      { value: 'achievement_recognition', label: 'Achievement and recognition in my field', score: 3 },
      { value: 'financial_security', label: 'Financial security and stability', score: 4 },
      { value: 'balanced_life', label: 'A balanced, well-rounded life', score: 5 }
    ]
  },
  {
    id: 'deep_003',
    question: 'What role does physical intimacy play in relationships?',
    category: 'relationship',
    type: 'scale',
    emoji: '🔥',
    weight: 8,
    minValue: 1,
    maxValue: 10,
    scaleLabels: ['Not very important', 'Extremely important']
  },
  {
    id: 'deep_004',
    question: 'How do you handle jealousy?',
    category: 'compatibility',
    type: 'multiple',
    emoji: '😤',
    weight: 7,
    options: [
      { value: 'communicate_openly', label: 'Communicate openly about my feelings', score: 1 },
      { value: 'work_through_internally', label: 'Work through it internally first', score: 2 },
      { value: 'need_reassurance', label: 'Need reassurance from my partner', score: 3 },
      { value: 'rarely_feel_jealous', label: 'I rarely feel jealous', score: 4 },
      { value: 'struggle_with_jealousy', label: 'I struggle with jealousy and trust', score: 5 }
    ]
  },
  {
    id: 'deep_005',
    question: 'What\'s your approach to personal boundaries?',
    category: 'communication',
    type: 'multiple',
    emoji: '🚧',
    weight: 7,
    options: [
      { value: 'clear_firm_boundaries', label: 'Clear, firm boundaries that I communicate well', score: 1 },
      { value: 'flexible_situational', label: 'Flexible boundaries depending on the situation', score: 2 },
      { value: 'struggle_setting_boundaries', label: 'I struggle with setting boundaries', score: 3 },
      { value: 'boundaries_through_actions', label: 'I set boundaries through actions, not words', score: 4 },
      { value: 'minimal_boundaries', label: 'I prefer minimal boundaries in close relationships', score: 5 }
    ]
  }
];

// Function to seed questions into database
export const seedQuestions = async (prisma) => {
  console.log('🌱 Seeding questions database...');
  
  try {
    // Clear existing questions (optional)
    await prisma.question.deleteMany({});
    
    // Insert all questions
    for (const questionData of questionsData) {
      await prisma.question.create({
        data: {
          id: questionData.id,
          question: questionData.question,
          category: questionData.category,
          type: questionData.type,
          emoji: questionData.emoji,
          weight: questionData.weight,
          options: questionData.options || null,
          minValue: questionData.minValue || null,
          maxValue: questionData.maxValue || null,
          isActive: true
        }
      });
    }
    
    console.log(`✅ Successfully seeded ${questionsData.length} questions`);
    return { success: true, count: questionsData.length };
  } catch (error) {
    console.error('❌ Error seeding questions:', error);
    throw error;
  }
};

export default questionsData;
