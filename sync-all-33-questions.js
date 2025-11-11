import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Complete frontend question bank - ALL 33 questions
const frontendQuestions = [
  // Personality Questions
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
  // Additional Personality Questions
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
    id: 'money_attitude',
    category: 'values',
    question: "What's your attitude toward money?",
    type: 'multiple',
    emoji: '💰',
    weight: 8,
    options: [
      { value: 'saver', label: 'Save for the future', emoji: '🏦' },
      { value: 'spender', label: 'Enjoy it while you can', emoji: '🛍️' },
      { value: 'investor', label: 'Invest for growth', emoji: '📈' },
      { value: 'balanced', label: 'Balance saving and spending', emoji: '⚖️' }
    ]
  },
  {
    id: 'family_importance',
    category: 'values',
    question: "How important is family in your life?",
    type: 'scale',
    emoji: '👨‍👩‍👧‍👦',
    weight: 8,
    min: 1,
    max: 10,
    labels: ['Not Very Important', 'Extremely Important']
  },
  {
    id: 'career_ambition',
    category: 'values',
    question: "How ambitious are you about your career?",
    type: 'scale',
    emoji: '🚀',
    weight: 7,
    min: 1,
    max: 10,
    labels: ['Work to Live', 'Live to Work']
  },
  {
    id: 'physical_activity',
    category: 'lifestyle',
    question: "How important is physical fitness to you?",
    type: 'scale',
    emoji: '💪',
    weight: 6,
    min: 1,
    max: 10,
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
    min: 1,
    max: 10,
    labels: ['Stick to Favorites', 'Try Anything Once']
  },
  {
    id: 'technology_comfort',
    category: 'lifestyle',
    question: "How comfortable are you with technology?",
    type: 'scale',
    emoji: '📱',
    weight: 4,
    min: 1,
    max: 10,
    labels: ['Basic User', 'Tech Enthusiast']
  },
  {
    id: 'environmental_consciousness',
    category: 'values',
    question: "How important is environmental sustainability to you?",
    type: 'scale',
    emoji: '🌱',
    weight: 7,
    min: 1,
    max: 10,
    labels: ['Not a Priority', 'Very Important']
  },
  {
    id: 'political_engagement',
    category: 'values',
    question: "How engaged are you with politics?",
    type: 'scale',
    emoji: '🗳️',
    weight: 6,
    min: 1,
    max: 10,
    labels: ['Not Interested', 'Very Engaged']
  },
  {
    id: 'spirituality',
    category: 'values',
    question: "How important is spirituality in your life?",
    type: 'scale',
    emoji: '🙏',
    weight: 8,
    min: 1,
    max: 10,
    labels: ['Not Important', 'Very Important']
  },
  {
    id: 'work_life_balance',
    category: 'values',
    question: "How do you prioritize work-life balance?",
    type: 'scale',
    emoji: '⚖️',
    weight: 7,
    min: 1,
    max: 10,
    labels: ['Work First', 'Life First']
  }
];

async function syncQuestions() {
  try {
    console.log('🔄 Starting complete question sync (33 questions) from frontend...');
    
    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const questionData of frontendQuestions) {
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
          maxValue: questionData.max || null
          // Note: labels are stored in frontend only, not in database
        };

        if (existingQuestion) {
          // Update existing question
          await prisma.question.update({
            where: { id: questionData.id },
            data: questionToCreate
          });
          console.log(`✅ Updated: ${questionData.id} (${questionData.type})`);
          updatedCount++;
        } else {
          // Create new question
          await prisma.question.create({
            data: questionToCreate
          });
          console.log(`➕ Added: ${questionData.id} (${questionData.type})`);
          addedCount++;
        }
      } catch (questionError) {
        console.error(`❌ Error with question ${questionData.id}:`, questionError.message);
        skippedCount++;
      }
    }

    console.log('\n📊 Sync Summary:');
    console.log(`✅ Added: ${addedCount}`);
    console.log(`🔄 Updated: ${updatedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`📝 Total processed: ${frontendQuestions.length}`);

    // Verify critical slider questions
    console.log('\n🎚️ Verifying slider questions (scale type):');
    const sliderQuestions = ['spontaneity', 'spirituality', 'relocation', 'emotional_intelligence', 'morning_person', 'risk_tolerance'];
    
    for (const qId of sliderQuestions) {
      const q = await prisma.question.findUnique({ where: { id: qId } });
      if (q) {
        console.log(`✅ ${qId}: minValue=${q.minValue}, maxValue=${q.maxValue}, type=${q.type}`);
      } else {
        console.log(`❌ ${qId}: NOT FOUND`);
      }
    }

  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncQuestions();
