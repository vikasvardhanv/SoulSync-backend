import app from '../src/server.js';

// Export a request handler for Vercel serverless functions
// Wrapping the Express app in a function ensures compatibility with Vercel's Node builder
export default function handler(req, res) {
	return app(req, res);
}