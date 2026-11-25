const mongoose = require('mongoose');

const connectDatabase = async () => {
    if (!process.env.DB_URI) {
        throw new Error('DB_URI environment variable is not set');
    }

    const data = await mongoose.connect(process.env.DB_URI);
    console.log(`MongoDB connected with host: ${data.connection.host}`);
    return data;
};

module.exports = connectDatabase;
