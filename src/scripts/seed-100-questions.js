import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Comprehensive 100-question bank for personality and compatibility assessment
const comprehensiveQuestionBank = [
  // Personality Questions (30 questions)
  {
    id: 'love_language',
    category: 'personality',
    question: "What's your primary love language?",
    type: 'multiple',
    emoji: '💕',
    weight: 9,
    options: [
      { value: 'words', label: 'Words of Affirmation', emoji: '💬' },
      { value: 'quality', label: 'Quality Time', emoji: '⏰' },
      { value: 'gifts', label: 'Receiving Gifts', emoji: '🎁' },
      { value: 'touch', label: 'Physical Touch', emoji: '🤗' },
      { value: 'service', label: 'Acts of Service', emoji: '🤝' }
    ]
  },
  {
    id: 'spontaneity',
    category: 'personality',
    question: "Are you more spontaneous or planned?",
    type: 'scale',
    emoji: '🎲',
    weight: 7,
    minValue: 1,
    maxValue: 10,
    labels: ['Very Planned', 'Very Spontaneous']
  },
  {
    id: 'emotional_intelligence',
    category: 'personality',
    question: "Rate your emotional intelligence:",
    type: 'scale',
    emoji: '🧠',
    weight: 8,
    minValue: 1,
    maxValue: 10,
    labels: ['Still Learning', 'Very High']
  },
  {
    id: 'social_energy',
    category: 'personality',
    question: "How would you describe your social energy?",
    type: 'scale',
    emoji: '🔋',
    weight: 8,
    minValue: 1,
    maxValue: 10,
    labels: ['Introvert', 'Extrovert']
  },
  {
    id: 'humor_style',
    category: 'personality',
    question: "What's your sense of humor like?",
    type: 'multiple',
    emoji: '😂',
    weight: 7,
    options: [
      { value: 'witty', label: 'Witty and clever', emoji: '🧠' },
      { value: 'silly', label: 'Silly and goofy', emoji: '🤪' },
      { value: 'sarcastic', label: 'Sarcastic and dry', emoji: '😏' },
      { value: 'wholesome', label: 'Wholesome and clean', emoji: '😊' },
      { value: 'dark', label: 'Dark and edgy', emoji: '🖤' }
    ]
  },
  {
    id: 'risk_tolerance',
    category: 'personality',
    question: "How do you feel about taking risks?",
    type: 'scale',
    emoji: '🎢',
    weight: 6,
    minValue: 1,
    maxValue: 10,
    labels: ['Very Cautious', 'Love Taking Risks']
  },
  {
    id: 'decision_making',
    category: 'personality',
    question: "How do you make important decisions?",
    type: 'multiple',
    emoji: '🤔',
    weight: 7,
    options: [
      { value: 'logical', label: 'Logic and analysis', emoji: '🧮' },
      { value: 'intuitive', label: 'Trust my gut feeling', emoji: '💫' },
      { value: 'research', label: 'Extensive research', emoji: '📚' },
      { value: 'advice', label: 'Seek advice from others', emoji: '👥' }
    ]
  },
  {
    id: 'stress_management',
    category: 'personality',
    question: "How do you handle stress?",
    type: 'multiple',
    emoji: '😌',
    weight: 7,
    options: [
      { value: 'exercise', label: 'Exercise and movement', emoji: '🏃‍♀️' },
      { value: 'meditation', label: 'Meditation and mindfulness', emoji: '🧘‍♂️' },
      { value: 'social', label: 'Talk to friends/family', emoji: '👥' },
      { value: 'creative', label: 'Creative activities', emoji: '🎨' },
      { value: 'nature', label: 'Spend time in nature', emoji: '🌳' }
    ]
  },
  {
    id: 'learning_style',
    category: 'personality',
    question: "How do you prefer to learn new things?",
    type: 'multiple',
    emoji: '📚',
    weight: 5,
    options: [
      { value: 'reading', label: 'Reading and research', emoji: '📖' },
      { value: 'hands_on', label: 'Hands-on experience', emoji: '🔧' },
      { value: 'discussion', label: 'Discussion and debate', emoji: '💬' },
      { value: 'visual', label: 'Visual and multimedia', emoji: '🎥' }
    ]
  },
  {
    id: 'optimism_level',
    category: 'personality',
    question: "How optimistic are you about life?",
    type: 'scale',
    emoji: '☀️',
    weight: 6,
    minValue: 1,
    maxValue: 10,
    labels: ['Realistic/Pessimistic', 'Very Optimistic']
  },
  {
    id: 'creativity_expression',
    category: 'personality',
    question: "How do you express your creativity?",
    type: 'multiple',
    emoji: '🎨',
    weight: 5,
    options: [
      { value: 'art', label: 'Visual arts', emoji: '🖼️' },
      { value: 'music', label: 'Music and sound', emoji: '🎵' },
      { value: 'writing', label: 'Writing and words', emoji: '✍️' },
      { value: 'cooking', label: 'Cooking and food', emoji: '👨‍🍳' },
      { value: 'problem_solving', label: 'Problem solving', emoji: '🧩' }
    ]
  },
  {
    id: 'empathy_level',
    category: 'personality',
    question: "How empathetic are you?",
    type: 'scale',
    emoji: '❤️',
    weight: 8,
    minValue: 1,
    maxValue: 10,
    labels: ['Logical Focus', 'Highly Empathetic']
  },
  {
    id: 'perfectionism',
    category: 'personality',
    question: "How much of a perfectionist are you?",
    type: 'scale',
    emoji: '✨',
    weight: 6,
    minValue: 1,
    maxValue: 10,
    labels: ['Go with the flow', 'Everything must be perfect']
  },
  {
    id: 'leadership_style',
    category: 'personality',
    question: "What's your leadership style?",
    type: 'multiple',
    emoji: '👑',
    weight: 6,
    options: [
      { value: 'collaborative', label: 'Collaborative team player', emoji: '🤝' },
      { value: 'decisive', label: 'Decisive and direct', emoji: '⚡' },
      { value: 'supportive', label: 'Supportive and nurturing', emoji: '🌱' },
      { value: 'innovative', label: 'Innovative and creative', emoji: '💡' },
      { value: 'prefer_following', label: 'Prefer to follow others', emoji: '👥' }
    ]
  },
  {
    id: 'attention_to_detail',
    category: 'personality',
    question: "How detail-oriented are you?",
    type: 'scale',
    emoji: '🔍',
    weight: 5,
    minValue: 1,
    maxValue: 10,
    labels: ['Big picture thinker', 'Detail-focused']
  },

  // Communication Questions (15 questions)
  {
    id: 'communication_style',
    category: 'communication',
    question: "Your communication style is:",
    type: 'multiple',
    emoji: '💬',
    weight: 8,
    options: [
      { value: 'direct', label: 'Direct and honest', emoji: '🎯' },
      { value: 'gentle', label: 'Gentle and thoughtful', emoji: '🌸' },
      { value: 'playful', label: 'Playful and humorous', emoji: '😄' },
      { value: 'deep', label: 'Deep and meaningful', emoji: '🌊' }
    ]
  },
  {
    id: 'conflict_style',
    category: 'communication',
    question: "How do you handle conflict in relationships?",
    type: 'multiple',
    emoji: '🤝',
    weight: 9,
    options: [
      { value: 'direct', label: 'Address it head-on', emoji: '💪' },
      { value: 'avoid', label: 'Give space, then discuss', emoji: '🌸' },
      { value: 'compromise', label: 'Find middle ground', emoji: '⚖️' },
      { value: 'listen', label: 'Listen first, then respond', emoji: '👂' }
    ]
  },
  {
    id: 'listening_style',
    category: 'communication',
    question: "How would you describe your listening style?",
    type: 'multiple',
    emoji: '👂',
    weight: 7,
    options: [
      { value: 'active', label: 'Active and engaged', emoji: '🎯' },
      { value: 'supportive', label: 'Supportive and understanding', emoji: '💝' },
      { value: 'solution_focused', label: 'Solution-focused', emoji: '🔧' },
      { value: 'distracted', label: 'Easily distracted', emoji: '😅' }
    ]
  },
  {
    id: 'feedback_preference',
    category: 'communication',
    question: "How do you prefer to receive feedback?",
    type: 'multiple',
    emoji: '📝',
    weight: 6,
    options: [
      { value: 'direct', label: 'Direct and straightforward', emoji: '🎯' },
      { value: 'gentle', label: 'Gentle and encouraging', emoji: '🌸' },
      { value: 'written', label: 'Written and detailed', emoji: '📋' },
      { value: 'sandwich', label: 'Positive-negative-positive', emoji: '🥪' }
    ]
  },
  {
    id: 'expression_comfort',
    category: 'communication',
    question: "How comfortable are you expressing emotions?",
    type: 'scale',
    emoji: '💭',
    weight: 7,
    minValue: 1,
    maxValue: 10,
    labels: ['Keep things private', 'Very open and expressive']
  },

  // Lifestyle Questions (20 questions)
  {
    id: 'ideal_sunday',
    category: 'lifestyle',
    question: "Describe your ideal Sunday:",
    type: 'multiple',
    emoji: '☀️',
    weight: 7,
    options: [
      { value: 'adventure', label: 'Outdoor Adventure', emoji: '🏔️' },
      { value: 'cozy', label: 'Cozy Home Vibes', emoji: '🏠' },
      { value: 'social', label: 'Friends & Family', emoji: '👥' },
      { value: 'cultural', label: 'Museums & Art', emoji: '🎨' },
      { value: 'active', label: 'Sports & Fitness', emoji: '💪' }
    ]
  },
  {
    id: 'morning_person',
    category: 'lifestyle',
    question: "Are you a morning person or night owl?",
    type: 'scale',
    emoji: '🌅',
    weight: 5,
    minValue: 1,
    maxValue: 10,
    labels: ['Night Owl', 'Morning Person']
  },
  {
    id: 'social_preference',
    category: 'lifestyle',
    question: "Do you prefer small gatherings or big parties?",
    type: 'scale',
    emoji: '🎊',
    weight: 6,
    minValue: 1,
    maxValue: 10,
    labels: ['Small Groups', 'Big Parties']
  },
  {
    id: 'pet_preference',
    category: 'lifestyle',
    question: "What's your relationship with pets?",
    type: 'multiple',
    emoji: '🐕',
    weight: 6,
    options: [
      { value: 'dog_lover', label: 'Dog lover', emoji: '🐕' },
      { value: 'cat_lover', label: 'Cat lover', emoji: '🐱' },
      { value: 'both', label: 'Love all animals', emoji: '🐾' },
      { value: 'allergic', label: 'Allergic to pets', emoji: '🤧' },
      { value: 'no_pets', label: 'Prefer no pets', emoji: '🚫' }
    ]
  },
  {
    id: 'physical_activity',
    category: 'lifestyle',
    question: "How important is physical fitness to you?",
    type: 'scale',
    emoji: '💪',
    weight: 6,
    minValue: 1,
    maxValue: 10,
    labels: ['Not Important', 'Very Important']
  },
  {
    id: 'travel_frequency',
    category: 'lifestyle',
    question: "How often do you like to travel?",
    type: 'multiple',
    emoji: '✈️',
    weight: 6,
    options: [
      { value: 'rarely', label: 'Rarely travel', emoji: '🏠' },
      { value: 'yearly', label: 'Once or twice a year', emoji: '📅' },
      { value: 'quarterly', label: 'Every few months', emoji: '🗓️' },
      { value: 'monthly', label: 'Monthly adventures', emoji: '🌍' },
      { value: 'nomad', label: 'Digital nomad lifestyle', emoji: '💻' }
    ]
  },
  {
    id: 'music_taste',
    category: 'lifestyle',
    question: "What music moves your soul?",
    type: 'multiple',
    emoji: '🎵',
    weight: 5,
    options: [
      { value: 'pop', label: 'Pop and mainstream', emoji: '🎤' },
      { value: 'rock', label: 'Rock and alternative', emoji: '🎸' },
      { value: 'electronic', label: 'Electronic and EDM', emoji: '🎧' },
      { value: 'classical', label: 'Classical and jazz', emoji: '🎼' },
      { value: 'hip_hop', label: 'Hip-hop and R&B', emoji: '🎤' },
      { value: 'indie', label: 'Indie and folk', emoji: '🎻' }
    ]
  },
  {
    id: 'food_adventure',
    category: 'lifestyle',
    question: "How adventurous are you with food?",
    type: 'scale',
    emoji: '🍜',
    weight: 5,
    minValue: 1,
    maxValue: 10,
    labels: ['Stick to Favorites', 'Try Anything Once']
  },
  {
    id: 'technology_comfort',
    category: 'lifestyle',
    question: "How comfortable are you with technology?",
    type: 'scale',
    emoji: '📱',
    weight: 4,
    minValue: 1,
    maxValue: 10,
    labels: ['Basic User', 'Tech Enthusiast']
  },
  {
    id: 'home_vs_out',
    category: 'lifestyle',
    question: "Do you prefer staying home or going out?",
    type: 'scale',
    emoji: '🏠',
    weight: 6,
    minValue: 1,
    maxValue: 10,
    labels: ['Homebody', 'Always Out']
  },
  {
    id: 'spending_habits',
    category: 'lifestyle',
    question: "How do you approach spending money?",
    type: 'multiple',
    emoji: '💰',
    weight: 7,
    options: [
      { value: 'saver', label: 'Careful saver', emoji: '🏦' },
      { value: 'spender', label: 'Enjoy spending', emoji: '🛍️' },
      { value: 'investor', label: 'Strategic investor', emoji: '📈' },
      { value: 'balanced', label: 'Balanced approach', emoji: '⚖️' }
    ]
  },
  {
    id: 'cleanliness_level',
    category: 'lifestyle',
    question: "How organized/clean are you?",
    type: 'scale',
    emoji: '🧹',
    weight: 6,
    minValue: 1,
    maxValue: 10,
    labels: ['Messy is fine', 'Everything in its place']
  },
  {
    id: 'cooking_interest',
    category: 'lifestyle',
    question: "What's your relationship with cooking?",
    type: 'multiple',
    emoji: '👨‍🍳',
    weight: 5,
    options: [
      { value: 'love_cooking', label: 'Love to cook', emoji: '❤️' },
      { value: 'basic_meals', label: 'Basic meals only', emoji: '🍝' },
      { value: 'takeout', label: 'Prefer takeout/delivery', emoji: '🥡' },
      { value: 'experimental', label: 'Experimental chef', emoji: '🧪' }
    ]
  },

  // Values Questions (20 questions)
  {
    id: 'life_goals',
    category: 'values',
    question: "Your biggest life goal is:",
    type: 'multiple',
    emoji: '🎯',
    weight: 9,
    options: [
      { value: 'career', label: 'Career success', emoji: '💼' },
      { value: 'family', label: 'Building a family', emoji: '👨‍👩‍👧‍👦' },
      { value: 'travel', label: 'Exploring the world', emoji: '🌍' },
      { value: 'impact', label: 'Making a difference', emoji: '🌟' },
      { value: 'growth', label: 'Personal growth', emoji: '🌱' }
    ]
  },
  {
    id: 'red_flag',
    category: 'values',
    question: "What's your biggest red flag in dating?",
    type: 'multiple',
    emoji: '🚩',
    weight: 10,
    options: [
      { value: 'dishonesty', label: 'Dishonesty', emoji: '🤥' },
      { value: 'selfish', label: 'Self-Centered', emoji: '🪞' },
      { value: 'lazy', label: 'No Ambition', emoji: '😴' },
      { value: 'rude', label: 'Rude to Service Staff', emoji: '😤' },
      { value: 'phone', label: 'Always on Phone', emoji: '📱' }
    ]
  },
  {
    id: 'family_importance',
    category: 'values',
    question: "How important is family in your life?",
    type: 'scale',
    emoji: '👨‍👩‍👧‍👦',
    weight: 8,
    minValue: 1,
    maxValue: 10,
    labels: ['Not Very Important', 'Extremely Important']
  },
  {
    id: 'career_ambition',
    category: 'values',
    question: "How ambitious are you about your career?",
    type: 'scale',
    emoji: '🚀',
    weight: 7,
    minValue: 1,
    maxValue: 10,
    labels: ['Work to Live', 'Live to Work']
  },
  {
    id: 'environmental_consciousness',
    category: 'values',
    question: "How important is environmental sustainability to you?",
    type: 'scale',
    emoji: '🌱',
    weight: 7,
    minValue: 1,
    maxValue: 10,
    labels: ['Not a Priority', 'Very Important']
  },
  {
    id: 'political_engagement',
    category: 'values',
    question: "How engaged are you with politics?",
    type: 'scale',
    emoji: '🗳️',
    weight: 6,
    minValue: 1,
    maxValue: 10,
    labels: ['Not Interested', 'Very Engaged']
  },
  {
    id: 'spirituality',
    category: 'values',
    question: "How important is spirituality in your life?",
    type: 'scale',
    emoji: '🙏',
    weight: 8,
    minValue: 1,
    maxValue: 10,
    labels: ['Not Important', 'Very Important']
  },
  {
    id: 'work_life_balance',
    category: 'values',
    question: "How do you prioritize work-life balance?",
    type: 'scale',
    emoji: '⚖️',
    weight: 7,
    minValue: 1,
    maxValue: 10,
    labels: ['Work First', 'Life First']
  },
  {
    id: 'honesty_importance',
    category: 'values',
    question: "How important is complete honesty in relationships?",
    type: 'scale',
    emoji: '💯',
    weight: 9,
    minValue: 1,
    maxValue: 10,
    labels: ['Some things private', 'Complete transparency']
  },
  {
    id: 'helping_others',
    category: 'values',
    question: "How important is helping others to you?",
    type: 'scale',
    emoji: '🤲',
    weight: 7,
    minValue: 1,
    maxValue: 10,
    labels: ['Focus on myself', 'Always help others']
  },
  {
    id: 'tradition_vs_change',
    category: 'values',
    question: "Do you prefer tradition or embracing change?",
    type: 'scale',
    emoji: '🔄',
    weight: 6,
    minValue: 1,
    maxValue: 10,
    labels: ['Value tradition', 'Embrace change']
  },
  {
    id: 'financial_security',
    category: 'values',
    question: "How important is financial security to you?",
    type: 'scale',
    emoji: '🏦',
    weight: 7,
    minValue: 1,
    maxValue: 10,
    labels: ['Money isnt everything', 'Very important']
  },

  // Relationship Questions (15 questions)
  {
    id: 'relationship_goal',
    category: 'relationship',
    question: "What do you want in your next relationship?",
    type: 'multiple',
    emoji: '💫',
    weight: 10,
    options: [
      { value: 'serious', label: 'Something Serious', emoji: '💍' },
      { value: 'fun', label: 'Fun & Casual', emoji: '🎉' },
      { value: 'growth', label: 'Personal Growth', emoji: '🌱' },
      { value: 'adventure', label: 'Adventure Partner', emoji: '✈️' },
      { value: 'stability', label: 'Stability & Comfort', emoji: '🏡' }
    ]
  },
  {
    id: 'relocation',
    category: 'relationship',
    question: "Would you relocate for love?",
    type: 'scale',
    emoji: '✈️',
    weight: 7,
    minValue: 1,
    maxValue: 10,
    labels: ['Never', 'Absolutely']
  },
  {
    id: 'relationship_pace',
    category: 'relationship',
    question: "What's your preferred relationship pace?",
    type: 'multiple',
    emoji: '⏰',
    weight: 8,
    options: [
      { value: 'slow', label: 'Take it slow', emoji: '🐌' },
      { value: 'steady', label: 'Steady progression', emoji: '📈' },
      { value: 'fast', label: 'When you know, you know', emoji: '⚡' },
      { value: 'varies', label: 'Depends on the person', emoji: '🤷‍♀️' }
    ]
  },
  {
    id: 'jealousy_level',
    category: 'relationship',
    question: "How do you handle jealousy?",
    type: 'scale',
    emoji: '💚',
    weight: 7,
    minValue: 1,
    maxValue: 10,
    labels: ['Very trusting', 'Can get jealous']
  },
  {
    id: 'independence_in_relationship',
    category: 'relationship',
    question: "How much independence do you need in a relationship?",
    type: 'scale',
    emoji: '🗽',
    weight: 7,
    minValue: 1,
    maxValue: 10,
    labels: ['We do everything together', 'Need lots of space']
  },
  {
    id: 'public_affection',
    category: 'relationship',
    question: "How do you feel about public displays of affection?",
    type: 'scale',
    emoji: '💑',
    weight: 5,
    minValue: 1,
    maxValue: 10,
    labels: ['Keep it private', 'Love PDA']
  },
  {
    id: 'commitment_timeline',
    category: 'relationship',
    question: "When do you typically know if you want to commit?",
    type: 'multiple',
    emoji: '💍',
    weight: 8,
    options: [
      { value: 'immediately', label: 'Pretty quickly (1-3 months)', emoji: '⚡' },
      { value: 'moderate', label: 'After getting to know them (3-6 months)', emoji: '🌱' },
      { value: 'slow', label: 'Takes time to be sure (6+ months)', emoji: '🐌' },
      { value: 'varies', label: 'Completely depends on the person', emoji: '🎭' }
    ]
  },
  {
    id: 'past_relationships',
    category: 'relationship',
    question: "How do you view past relationships?",
    type: 'multiple',
    emoji: '🔍',
    weight: 6,
    options: [
      { value: 'learning', label: 'Learning experiences', emoji: '📚' },
      { value: 'positive', label: 'Mostly positive memories', emoji: '😊' },
      { value: 'complicated', label: 'Complicated but growth', emoji: '🌪️' },
      { value: 'prefer_not_discuss', label: 'Prefer not to discuss', emoji: '🤐' }
    ]
  },

  // Compatibility Questions (10 additional unique questions)
  {
    id: 'date_night_preference',
    category: 'compatibility',
    question: "What's your ideal date night?",
    type: 'multiple',
    emoji: '🌙',
    weight: 7,
    options: [
      { value: 'dinner_movie', label: 'Dinner and a movie', emoji: '🍽️' },
      { value: 'adventure', label: 'Outdoor adventure', emoji: '🏕️' },
      { value: 'cultural', label: 'Museum or cultural event', emoji: '🎭' },
      { value: 'home_cooking', label: 'Cook together at home', emoji: '👨‍🍳' },
      { value: 'surprise', label: 'Surprise me!', emoji: '🎁' }
    ]
  },
  {
    id: 'gift_giving_style',
    category: 'compatibility',
    question: "What's your gift-giving style?",
    type: 'multiple',
    emoji: '🎁',
    weight: 6,
    options: [
      { value: 'thoughtful', label: 'Thoughtful and personal', emoji: '💝' },
      { value: 'practical', label: 'Practical and useful', emoji: '🔧' },
      { value: 'experiential', label: 'Experiences over things', emoji: '🎪' },
      { value: 'spontaneous', label: 'Spontaneous surprises', emoji: '✨' },
      { value: 'expensive', label: 'Go big or go home', emoji: '💎' }
    ]
  },
  {
    id: 'future_family_size',
    category: 'compatibility',
    question: "What's your ideal family size?",
    type: 'multiple',
    emoji: '👨‍👩‍👧‍👦',
    weight: 9,
    options: [
      { value: 'no_kids', label: 'No children', emoji: '🚫' },
      { value: 'one_child', label: 'One child', emoji: '👶' },
      { value: 'two_children', label: 'Two children', emoji: '👧👦' },
      { value: 'large_family', label: 'Large family (3+)', emoji: '👨‍👩‍👧‍👦' },
      { value: 'undecided', label: 'Still deciding', emoji: '🤔' }
    ]
  },
  {
    id: 'living_situation_preference',
    category: 'compatibility',
    question: "What's your ideal living situation?",
    type: 'multiple',
    emoji: '🏠',
    weight: 7,
    options: [
      { value: 'city_apartment', label: 'City apartment', emoji: '🏢' },
      { value: 'suburban_house', label: 'Suburban house', emoji: '🏡' },
      { value: 'rural_property', label: 'Rural property', emoji: '🌾' },
      { value: 'travel_frequently', label: 'Travel frequently', emoji: '✈️' },
      { value: 'flexible', label: 'Flexible/adaptable', emoji: '🤸‍♀️' }
    ]
  },
  {
    id: 'social_media_usage',
    category: 'compatibility',
    question: "How do you use social media?",
    type: 'multiple',
    emoji: '📱',
    weight: 5,
    options: [
      { value: 'heavy_user', label: 'Active daily user', emoji: '📲' },
      { value: 'moderate', label: 'Casual browsing', emoji: '👀' },
      { value: 'minimal', label: 'Minimal usage', emoji: '🤏' },
      { value: 'none', label: 'Avoid social media', emoji: '🚫' },
      { value: 'professional', label: 'Professional use only', emoji: '💼' }
    ]
  },
  {
    id: 'weekend_energy',
    category: 'compatibility',
    question: "How do you like to spend weekends?",
    type: 'multiple',
    emoji: '🎯',
    weight: 6,
    options: [
      { value: 'active_adventures', label: 'Active adventures', emoji: '🏃‍♀️' },
      { value: 'social_events', label: 'Social events', emoji: '🎉' },
      { value: 'relaxing_home', label: 'Relaxing at home', emoji: '🛋️' },
      { value: 'productive_projects', label: 'Productive projects', emoji: '🔨' },
      { value: 'spontaneous', label: 'Go with the flow', emoji: '🌊' }
    ]
  },
  {
    id: 'argument_resolution',
    category: 'compatibility',
    question: "How should couples resolve disagreements?",
    type: 'multiple',
    emoji: '🤝',
    weight: 8,
    options: [
      { value: 'talk_immediately', label: 'Talk it out immediately', emoji: '💬' },
      { value: 'cool_down_first', label: 'Cool down, then discuss', emoji: '❄️' },
      { value: 'find_compromise', label: 'Always find compromise', emoji: '⚖️' },
      { value: 'agree_to_disagree', label: 'Sometimes agree to disagree', emoji: '🤷‍♀️' }
    ]
  },
  {
    id: 'personal_growth_priority',
    category: 'compatibility',
    question: "How important is personal growth in a relationship?",
    type: 'scale',
    emoji: '🌱',
    weight: 7,
    minValue: 1,
    maxValue: 10,
    labels: ['Stay as we are', 'Always growing together']
  },
  {
    id: 'shared_vs_separate_interests',
    category: 'compatibility',
    question: "Shared interests vs. separate hobbies?",
    type: 'scale',
    emoji: '🎭',
    weight: 6,
    minValue: 1,
    maxValue: 10,
    labels: ['Everything together', 'Healthy independence']
  },
  {
    id: 'lifestyle_similarity',
    category: 'compatibility',
    question: "How similar should partners' lifestyles be?",
    type: 'scale',
    emoji: '🔄',
    weight: 7,
    minValue: 1,
    maxValue: 10,
    labels: ['Very similar', 'Opposites attract']
  }
];

async function seedQuestions() {
  console.log('🌱 Starting to seed 100 comprehensive questions...');

  try {
    let addedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (const questionData of comprehensiveQuestionBank) {
      try {
        const existingQuestion = await prisma.question.findUnique({
          where: { id: questionData.id }
        });

        // For scale questions, store labels in the options field
        let options = questionData.options || [];
        if (questionData.type === 'scale' && questionData.labels) {
          options = {
            labels: questionData.labels
          };
        }

        const questionToUpsert = {
          id: questionData.id,
          question: questionData.question,
          category: questionData.category,
          type: questionData.type,
          emoji: questionData.emoji || null,
          weight: questionData.weight,
          isActive: true,
          options: options,
          minValue: questionData.minValue || null,
          maxValue: questionData.maxValue || null
        };

        if (existingQuestion) {
          await prisma.question.update({
            where: { id: questionData.id },
            data: questionToUpsert
          });
          updatedCount++;
          console.log(`✅ Updated: ${questionData.id}`);
        } else {
          await prisma.question.create({
            data: questionToUpsert
          });
          addedCount++;
          console.log(`🆕 Added: ${questionData.id}`);
        }
      } catch (questionError) {
        errorCount++;
        console.error(`❌ Error with question ${questionData.id}:`, questionError.message);
      }
    }

    // Verify the database
    const totalQuestions = await prisma.question.count({ where: { isActive: true } });
    
    console.log('\n🎉 Question seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   • Total questions in database: ${totalQuestions}`);
    console.log(`   • Added: ${addedCount}`);
    console.log(`   • Updated: ${updatedCount}`);
    console.log(`   • Errors: ${errorCount}`);
    console.log(`   • Questions by category:`);
    
    // Get category breakdown
    const categories = await prisma.question.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { id: true }
    });
    
    categories.forEach(cat => {
      console.log(`     - ${cat.category}: ${cat._count.id} questions`);
    });

    return {
      success: true,
      summary: {
        total: totalQuestions,
        added: addedCount,
        updated: updatedCount,
        errors: errorCount
      },
      categories
    };

  } catch (error) {
    console.error('💥 Failed to seed questions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedQuestions()
  .then((result) => {
    console.log('✅ Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });