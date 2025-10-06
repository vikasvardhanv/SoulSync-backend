// Extract all questions from frontend questionBank.ts
import fs from 'fs';

// Read the questionBank.ts file
const questionBankContent = fs.readFileSync('/Users/vikashvardhan/Downloads/soulsync-frontend/src/data/questionBank.ts', 'utf8');

// Extract the questionBank array using regex
const questionBankMatch = questionBankContent.match(/export const questionBank: Question\[\] = \[([\s\S]*?)\];\s*\/\/ Helper/);

if (questionBankMatch) {
  console.log('✅ Found questionBank array');
  
  // Write extracted questions to a JSON file for easier processing
  const questionsData = questionBankMatch[1];
  fs.writeFileSync('/Users/vikashvardhan/Downloads/soulsync-backend/extracted-questions.js', 
    `export const questions = [${questionsData}];`
  );
  console.log('📄 Extracted questions saved to extracted-questions.js');
} else {
  console.log('❌ Could not find questionBank array');
}