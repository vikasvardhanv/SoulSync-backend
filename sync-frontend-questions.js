// Simple script to sync all frontend questions to backend database
// This ensures the backend has all questions that the frontend expects

const questionBank = [
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
    id: 'spontaneity',
    category: 'personality',
    question: "Are you more spontaneous or planned?",
    type: 'scale',
    emoji: '🎲',
    weight: 6,
    min: 1,
    max: 10,
    labels: ['Very Planned', 'Very Spontaneous']
  },
  {
    id: 'emotional_intelligence',
    category: 'personality',
    question: "Rate your emotional intelligence:",
    type: 'scale',
    emoji: '🧠',
    weight: 8,
    min: 1,
    max: 10,
    labels: ['Still Learning', 'Very High']
  },
  {
    id: 'social_energy',
    category: 'lifestyle',
    question: "After a long week, you prefer:",
    type: 'multiple',
    emoji: '🌙',
    weight: 7,
    options: [
      { value: 'party', label: 'Going out with friends', emoji: '🎉' },
      { value: 'date', label: 'Intimate dinner for two', emoji: '🍽️' },
      { value: 'home', label: 'Cozy night at home', emoji: '🏠' },
      { value: 'adventure', label: 'Trying something new', emoji: '🌟' }
    ]
  },
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
    id: 'relocation',
    category: 'relationship',
    question: "Would you relocate for love?",
    type: 'scale',
    emoji: '✈️',
    weight: 7,
    min: 1,
    max: 10,
    labels: ['Never', 'Absolutely']
  },
  {
    id: 'morning_person',
    category: 'lifestyle',
    question: "Are you a morning person or night owl?",
    type: 'scale',
    emoji: '🌅',
    weight: 5,
    min: 1,
    max: 10,
    labels: ['Night Owl', 'Morning Person']
  },
  {
    id: 'risk_tolerance',
    category: 'personality',
    question: "How do you feel about taking risks?",
    type: 'scale',
    emoji: '🎢',
    weight: 6,
    min: 1,
    max: 10,
    labels: ['Very Cautious', 'Love Taking Risks']
  },
  {
    id: 'social_preference',
    category: 'lifestyle',
    question: "Do you prefer small gatherings or big parties?",
    type: 'scale',
    emoji: '🎊',
    weight: 6,
    min: 1,
    max: 10,
    labels: ['Small Groups', 'Big Parties']
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
  }
];

// Sync function
async function syncQuestions() {
  console.log(`🚀 Syncing ${questionBank.length} questions to backend...`);
  
  try {
    const response = await fetch('https://soul-sync-backend.vercel.app/api/questions/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ questions: questionBank })
    });
    
    const result = await response.json();
    console.log('📊 Sync result:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Sync error:', error);
    return null;
  }
}

// Export for use in Node.js or just run if in browser console
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { questionBank, syncQuestions };
} else if (typeof window !== 'undefined') {
  window.syncQuestions = syncQuestions;
  window.questionBank = questionBank;
}

// Run immediately if in Node.js
if (typeof process !== 'undefined' && process.argv && process.argv[0].includes('node')) {
  syncQuestions();
}