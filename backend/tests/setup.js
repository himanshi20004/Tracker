const fs = require('fs');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/usermodels');

let mongoServer;

const LOCAL_MONGOD = 'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe';

beforeAll(async () => {
    process.env.JWT_SECRET = 'test_super_secret_jwt_key_123456';
    process.env.JWT_EXPIRE = '1d';
    process.env.COOKIE_EXPIRE = '1';
    process.env.NODE_ENV = 'test';
    process.env.GEMINI_API_KEY = 'fake-test-gemini-key';

    const createOpts = {};
    if (process.env.MONGOMS_SYSTEM_BINARY) {
        createOpts.binary = { systemBinary: process.env.MONGOMS_SYSTEM_BINARY };
    } else if (fs.existsSync(LOCAL_MONGOD)) {
        createOpts.binary = { systemBinary: LOCAL_MONGOD };
    }

    mongoServer = await MongoMemoryServer.create(createOpts);
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
}, 60000);

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
        await collections[key].deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});

const createUserAndToken = async ({
    username = 'student1',
    email = 'student1@example.com',
    password = 'Password123!',
    role = 'user',
    points = 0,
} = {}) => {
    const user = await User.create({ username, email, password, role, points });
    const token = user.getJWTToken();
    return { user, token };
};

module.exports = { createUserAndToken };
