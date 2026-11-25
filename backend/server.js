const path = require('path');
const dns = require('dns');
const dotenv = require('dotenv');

dns.setDefaultResultOrder('ipv4first');

dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });
dotenv.config();

if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is missing.');
    process.exit(1);
}

const app = require('./app');
const connectDatabase = require('./config/db');

process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});

const PORT = process.env.PORT || 5000;
let server;

connectDatabase()
    .then(() => {
        server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error(`Database connection error: ${err.message}`);
        process.exit(1);
    });

process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    if (server) {
        server.close(() => process.exit(1));
    } else {
        process.exit(1);
    }
});
