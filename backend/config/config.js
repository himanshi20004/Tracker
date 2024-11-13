const dotenv = require('dotenv');
dotenv.config();

const config = {
    DB_URI: process.env.DB_URI || "mongodb://localhost:27017/AcademicTracker",
    PORT: process.env.PORT || 5000,
    JWT_SECRET: process.env.JWT_SECRET || "your_default_jwt_secret",
    JWT_EXPIRE: process.env.JWT_EXPIRE || "5d",
    COOKIE_EXPIRE: process.env.COOKIE_EXPIRE || 5,
    SMTP_SERVICE: process.env.SMTP_SERVICE || "gmail",
    SMTP_PASSWORD: process.env.SMTP_PASSWORD || "",
    SMTP_EMAIL: process.env.SMTP_EMAIL || "example@gmail.com",
    SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
    SMTP_PORT: process.env.SMTP_PORT || 465
};

module.exports = config;
