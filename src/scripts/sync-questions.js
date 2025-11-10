#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the frontend question bank
const frontendPath = path.join(__dirname, '../../../soulsync-frontend/src/data/questionBank.ts');

let questionBank = [];

try {
  console.log('📖 Reading frontend question bank from:', frontendPath);
  
  // Read the TypeScript file
  const content = fs.readFileSync(frontendPath, 'utf8');
  
  // Extract the questionBank array (simple parsing)
  const match = content.match(/export const questionBank[^=]*=\s*(\[[\s\S]*?\]);/);
  
  if (match) {
    // Clean up the TypeScript to make it valid JSON-like
    let questionsStr = match[1];
    
    // Remove TypeScript-specific syntax and convert to JSON
    questionsStr = questionsStr
      .replace(/(\w+):/g, '"$1":') // Convert property names to strings
      .replace(/'/g, '"') // Convert single quotes to double quotes
      .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
    
    try {
      questionBank = JSON.parse(questionsStr);
      console.log(`✅ Successfully parsed ${questionBank.length} questions from frontend`);
    } catch (parseError) {
      console.error('❌ Failed to parse question bank:', parseError.message);
      
      // Fallback: manually extract questions
      const questionMatches = content.match(/{\s*id:\s*['"]([^'"]+)['"]/g);
      if (questionMatches) {
        console.log(`🔄 Found ${questionMatches.length} question IDs, using fallback method`);
        
        // Manually construct basic question structure for sync
        questionBank = [
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
          // Add all the other critical questions...
        ];
      }
    }
  }
} catch (error) {
  console.error('❌ Error reading frontend question bank:', error.message);
  console.log('🔄 Using fallback question set...');
  
  // Fallback question bank with critical questions
  questionBank = [
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
    }
  ];
}

// Sync with backend
async function syncQuestions() {
  const BACKEND_URL = process.env.BACKEND_URL || 'https://soul-sync-backend.vercel.app';
  
  try {
    console.log(`🚀 Syncing ${questionBank.length} questions to ${BACKEND_URL}/api/questions/sync`);
    
    const response = await fetch(`${BACKEND_URL}/api/questions/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ questions: questionBank })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Question sync successful!');
      console.log(`📊 Summary: ${result.summary.added} added, ${result.summary.updated} updated, ${result.summary.skipped} skipped`);
      return result;
    } else {
      console.error('❌ Question sync failed:', result.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error syncing questions:', error.message);
    return null;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncQuestions().then(result => {
    if (result) {
      console.log('🎉 Question sync completed successfully!');
      process.exit(0);
    } else {
      console.error('💥 Question sync failed!');
      process.exit(1);
    }
  });
}

export { questionBank, syncQuestions };