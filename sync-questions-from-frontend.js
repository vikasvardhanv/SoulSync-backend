#!/usr/bin/env node

/**
 * Sync questions from frontend question bank to database
 * Run this script to ensure all frontend questions exist in the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Frontend question bank (copy from soulsync-frontend/src/data/questionBank.ts)
const frontendQuestions = [
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
    question: 'Describe your ideal Sunday:',
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
    question: 'What do you want in your next relationship?',
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
    question: 'How do you handle conflict in relationships?',
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
    question: 'Are you more spontaneous or planned?',
    type: 'scale',
    emoji: '🎲',
    weight: 6,
    min: 1,
    max: 10,
    labels: ['Very Planned', 'Very Spontaneous']
  },
  {
    id: 'social_energy',
    category: 'personality',
    question: 'After a long day, do you recharge alone or with others?',
    type: 'scale',
    emoji: '🔋',
    weight: 7,
    min: 1,
    max: 10,
    labels: ['Alone Time', 'Social Time']
  },
  {
    id: 'life_goals',
    category: 'values',
    question: 'What matters most to you in the next 5 years?',
    type: 'multiple',
    emoji: '🎯',
    weight: 10,
    options: [
      { value: 'career', label: 'Career Success', emoji: '💼' },
      { value: 'family', label: 'Building a Family', emoji: '👶' },
      { value: 'travel', label: 'Travel & Adventure', emoji: '🌍' },
      { value: 'growth', label: 'Personal Development', emoji: '📚' },
      { value: 'stability', label: 'Financial Stability', emoji: '💰' }
    ]
  },
  {
    id: 'communication_style',
    category: 'communication',
    question: 'When upset, I prefer to:',
    type: 'multiple',
    emoji: '💬',
    weight: 9,
    options: [
      { value: 'talk', label: 'Talk it out immediately', emoji: '🗣️' },
      { value: 'space', label: 'Take space, then discuss', emoji: '🌙' },
      { value: 'write', label: 'Write/text my feelings', emoji: '✍️' },
      { value: 'process', label: 'Process alone first', emoji: '🧘' }
    ]
  }
];

async function syncQuestions() {
  console.log('🔄 Starting question sync...');
  
  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const q of frontendQuestions) {
    try {
      const existing = await prisma.question.findUnique({
        where: { id: q.id }
      });

      const questionData = {
        id: q.id,
        question: q.question,
        category: q.category,
        type: q.type,
        emoji: q.emoji || null,
        weight: q.weight,
        isActive: true,
        options: q.options || [],
        minValue: q.min || null,
        maxValue: q.max || null
      };

      if (existing) {
        await prisma.question.update({
          where: { id: q.id },
          data: questionData
        });
        console.log(`✅ Updated: ${q.id}`);
        updated++;
      } else {
        await prisma.question.create({
          data: questionData
        });
        console.log(`➕ Added: ${q.id}`);
        added++;
      }
    } catch (error) {
      console.error(`❌ Error with ${q.id}:`, error.message);
      skipped++;
    }
  }

  console.log('\n📊 Sync Complete:');
  console.log(`   Added: ${added}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${frontendQuestions.length}`);

  await prisma.$disconnect();
}

syncQuestions().catch((error) => {
  console.error('💥 Sync failed:', error);
  process.exit(1);
});
