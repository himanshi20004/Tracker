const app = require('./app');
const dotenv = require('dotenv');
const connectDatabse = require('./config/db');

// Handling Uncaught Exceptions
process.on("uncaughtException", err => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down server due to unexpected error.');
    process.exit(1);
});

// Load environment variables from config.env
dotenv.config({ path: "./config/config.env" });


// Connect to the database
connectDatabse();

// Start the server
const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", err => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down server due to unhandled promise rejection.');
    server.close(() => {
        process.exit(1); // Exit after closing server
    });
});
