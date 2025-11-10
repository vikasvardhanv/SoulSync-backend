import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise during tests
global.originalConsoleLog = console.log;
global.originalConsoleInfo = console.info;
global.originalConsoleWarn = console.warn;
global.originalConsoleError = console.error;

beforeAll(() => {
  // Silence console output during tests unless explicitly needed
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  // Restore console methods
  console.log = global.originalConsoleLog;
  console.info = global.originalConsoleInfo;
  console.warn = global.originalConsoleWarn;
  console.error = global.originalConsoleError;
});