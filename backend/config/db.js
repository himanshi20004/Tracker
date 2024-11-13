const mongoose = require('mongoose');

const connectDatabse = () => {
    console.log(`Connecting to database at ${process.env.DB_URI}`);
    mongoose.connect(process.env.DB_URI)
        .then((data) => {
            console.log(`MongoDB connected with server: ${data.connection.host}`);
        })
        .catch(err => {
            console.error(`Database connection error: ${err.message}`);
            process.exit(1);
        });
};

module.exports = connectDatabse;
