import prisma from './src/database/connection.js';

// Question bank from frontend (matching the structure)
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
      { value: 'both', label: 'Love both!', emoji: '🐕🐱' },
      { value: 'other', label: 'Other pets', emoji: '🐢' },
      { value: 'none', label: 'Not a pet person', emoji: '🚫' }
    ]
  },
  {
    id: 'social_battery',
    category: 'personality',
    question: "How would you describe your social energy?",
    type: 'scale',
    emoji: '🔋',
    weight: 8,
    min: 1,
    max: 10,
    labels: ['Introvert', 'Extrovert']
  },
  {
    id: 'future_goals',
    category: 'values',
    question: "What's most important for your future?",
    type: 'multiple',
    emoji: '🌟',
    weight: 9,
    options: [
      { value: 'career', label: 'Career success', emoji: '💼' },
      { value: 'family', label: 'Family and relationships', emoji: '👨‍👩‍👧‍👦' },
      { value: 'travel', label: 'Travel and experiences', emoji: '✈️' },
      { value: 'stability', label: 'Financial stability', emoji: '💰' },
      { value: 'impact', label: 'Making a difference', emoji: '🌍' }
    ]
  }
];

async function syncQuestions() {
  try {
    console.log('🔄 Syncing frontend questions with backend database...');
    
    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const questionData of questionBank) {
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
        };

        if (existingQuestion) {
          // Update existing question
          await prisma.question.update({
            where: { id: questionData.id },
            data: questionToCreate
          });
          console.log(`✅ Updated: ${questionData.id}`);
          updatedCount++;
        } else {
          // Create new question
          await prisma.question.create({
            data: questionToCreate
          });
          console.log(`🆕 Added: ${questionData.id} - ${questionData.question}`);
          addedCount++;
        }
      } catch (questionError) {
        console.error(`❌ Error with question ${questionData.id}:`, questionError.message);
        skippedCount++;
      }
    }

    console.log('\\n📊 Sync Summary:');
    console.log(`✅ Added: ${addedCount} questions`);
    console.log(`🔄 Updated: ${updatedCount} questions`);
    console.log(`⚠️ Skipped: ${skippedCount} questions`);
    console.log(`📝 Total processed: ${questionBank.length} questions`);

    // Verify the humor_style question specifically
    const humorQuestion = await prisma.question.findUnique({
      where: { id: 'humor_style' }
    });

    if (humorQuestion) {
      console.log('\\n🎯 humor_style question verification:');
      console.log('✅ Question exists in database');
      console.log('ID:', humorQuestion.id);
      console.log('Question:', humorQuestion.question);
      console.log('Options:', JSON.stringify(humorQuestion.options, null, 2));
    } else {
      console.log('\\n❌ humor_style question still not found!');
    }

    await prisma.$disconnect();
    console.log('\\n🎉 Question sync completed!');

  } catch (error) {
    console.error('❌ Sync failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

syncQuestions();