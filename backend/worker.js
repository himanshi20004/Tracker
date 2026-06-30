const serverless = require('serverless-http');
const app = require('./app'); // Import your existing Express app
const connectDatabase = require('./config/db');

// Wrap your Express app for the serverless environment
const handler = serverless(app);

module.exports = {
    async fetch(request, env, ctx) {
        // 1. Map Cloudflare environment variables to process.env so your existing config works
        process.env.DB_URI = env.DB_URI;
        process.env.JWT_SECRET = env.JWT_SECRET;
        process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
        // Add any others you need here...

        // 2. Connect to the database
        // Note: We have to call this on every cold start in a serverless environment
        try {
            await connectDatabase();
        } catch (error) {
            console.error("Database connection failed:", error);
            return new Response("Internal Server Error: Database", { status: 500 });
        }

        // 3. Pass the request to your Express app
        return handler(request, ctx);
    }
};