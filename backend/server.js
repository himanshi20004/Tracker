const app = require('./app');
const dotenv = require('dotenv');
const connectDatabse = require('./config/db');
const dns = require('dns'); // Import dns module

// ═══ THE CRITICAL FIX FOR "FETCH FAILED" ═══
// Force Node.js to prefer IPv4 over IPv6. 
// Google APIs often fail on local Windows machines because of IPv6 defaults.
dns.setDefaultResultOrder('ipv4first');

// Handling Uncaught Exceptions
process.on("uncaughtException", err => {
    console.log(`Error: ${err.message}`);
    process.exit(1);
});

// Load environment variables
dotenv.config({ path: "./config/config.env" });

// Connect to the database
connectDatabse();

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", err => {
    console.log(`Error: ${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});