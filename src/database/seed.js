#!/usr/bin/env node

// Seed script for SoulSync database
import { seedQuestions } from './questions-seed.js';
import prisma from './connection.js';

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Seed questions
    const result = await seedQuestions(prisma);
    
    console.log(`✅ Seeding completed successfully!`);
    console.log(`📊 Seeded ${result.count} questions`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();