const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { createUserAndToken } = require('./setup');

jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: jest.fn().mockResolvedValue({
                response: { text: () => 'Mocked step-by-step answer.' },
            }),
        }),
    })),
}));

describe('AI Doubt, Timetable, Chat & Upload Security', () => {
    test('Unauthenticated users cannot access /solveDoubt; authenticated users get validated response', async () => {
        const unauthRes = await request(app)
            .post('/api/v1/solveDoubt')
            .send({ doubt: 'What is gravity?' });
        expect(unauthRes.status).toBe(401);

        const { token } = await createUserAndToken({ email: 'ai@example.com' });

        const emptyRes = await request(app)
            .post('/api/v1/solveDoubt')
            .set('Authorization', `Bearer ${token}`)
            .send({ doubt: '   ' });
        expect(emptyRes.status).toBe(400);

        const oversizedRes = await request(app)
            .post('/api/v1/solveDoubt')
            .set('Authorization', `Bearer ${token}`)
            .send({ doubt: 'a'.repeat(2005) });
        expect(oversizedRes.status).toBe(400);

        const validRes = await request(app)
            .post('/api/v1/solveDoubt')
            .set('Authorization', `Bearer ${token}`)
            .send({ doubt: 'Explain Newton first law' });
        expect(validRes.status).toBe(200);
        expect(validRes.body.answer).toBe('Mocked step-by-step answer.');
    });

    test('Timetable enforces ownership and deletes exact event index', async () => {
        const { user: owner, token: ownerToken } = await createUserAndToken({
            email: 'owner@example.com',
        });
        const { token: intruderToken } = await createUserAndToken({
            username: 'intruder',
            email: 'intruder@example.com',
        });

        const date = '2026-11-26';

        // Add 3 events as owner
        await request(app)
            .post(`/api/v1/timetable/${owner._id}`)
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({ date, detail: 'Event 0' });
        await request(app)
            .post(`/api/v1/timetable/${owner._id}`)
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({ date, detail: 'Event 1' });
        await request(app)
            .post(`/api/v1/timetable/${owner._id}`)
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({ date, detail: 'Event 2' });

        // Unauthenticated PUT/DELETE rejected
        const unauthPut = await request(app)
            .put(`/api/v1/timetable/${owner._id}`)
            .send({ date, index: 0, detail: 'Hacked' });
        expect(unauthPut.status).toBe(401);

        const unauthDel = await request(app)
            .delete(`/api/v1/timetable/${owner._id}/1?date=${date}`);
        expect(unauthDel.status).toBe(401);

        // Intruder cannot modify or delete owner's timetable
        const intruderPut = await request(app)
            .put(`/api/v1/timetable/${owner._id}`)
            .set('Authorization', `Bearer ${intruderToken}`)
            .send({ date, index: 0, detail: 'Hacked' });
        expect(intruderPut.status).toBe(403);

        const intruderDel = await request(app)
            .delete(`/api/v1/timetable/${owner._id}/1?date=${date}`)
            .set('Authorization', `Bearer ${intruderToken}`);
        expect(intruderDel.status).toBe(403);

        // Owner deletes index 1 -> Event 0 and Event 2 remain
        const delRes = await request(app)
            .delete(`/api/v1/timetable/${owner._id}/1?date=${date}`)
            .set('Authorization', `Bearer ${ownerToken}`);
        expect(delRes.status).toBe(200);
        expect(delRes.body.timetable[date]).toEqual(['Event 0', 'Event 2']);
    });

    test('Chat messages persist, return valid socketReceipt, and validate inputs', async () => {
        const { user: u1, token: t1 } = await createUserAndToken({
            username: 'alice',
            email: 'alice@example.com',
        });
        const { user: u2, token: t2 } = await createUserAndToken({
            username: 'bob',
            email: 'bob@example.com',
        });

        const sendRes = await request(app)
            .post(`/api/v1/send/${u2._id}`)
            .set('Authorization', `Bearer ${t1}`)
            .send({ content: 'Hello Bob!' });

        expect(sendRes.status).toBe(201);
        expect(sendRes.body.content).toBe('Hello Bob!');
        expect(sendRes.body.socketReceipt).toBeDefined();

        const decoded = jwt.verify(sendRes.body.socketReceipt, process.env.JWT_SECRET);
        expect(decoded.sender).toBe(u1._id.toString());
        expect(decoded.receiverId).toBe(u2._id.toString());

        const readRes = await request(app)
            .get(`/api/v1/read/${u1._id}`)
            .set('Authorization', `Bearer ${t2}`);
        expect(readRes.status).toBe(200);
        expect(readRes.body.length).toBe(1);
        expect(readRes.body[0].content).toBe('Hello Bob!');
    });

    test('Non-admin cannot upload resource', async () => {
        const { token: studentToken } = await createUserAndToken({
            email: 'uploader@example.com',
            role: 'user',
        });

        const res = await request(app)
            .post('/api/v1/resource')
            .set('Authorization', `Bearer ${studentToken}`)
            .field('title', 'Cheat Sheet')
            .field('description', 'Test')
            .attach('file', Buffer.from('%PDF-1.4\n'), 'notes.pdf');

        expect(res.status).toBe(403);
    });
});
