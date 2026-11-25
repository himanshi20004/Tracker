const request = require('supertest');
const app = require('../app');
const Task = require('../models/taskmodels');
const Quiz = require('../models/quizmodel');
const Score = require('../models/score');
const User = require('../models/usermodels');
const { createUserAndToken } = require('./setup');

describe('Points, Gamification, Quizzes & Concurrency', () => {
    test('User cannot modify points or completedTasks directly via /user/update', async () => {
        const { user, token } = await createUserAndToken({ points: 10 });

        const res = await request(app)
            .patch('/api/v1/user/update')
            .set('Authorization', `Bearer ${token}`)
            .send({ points: 99999 });

        expect(res.status).toBe(403);
        const fresh = await User.findById(user._id);
        expect(fresh.points).toBe(10);
    });

    test('Completing the same task twice or concurrently never awards duplicate points', async () => {
        const { user: admin } = await createUserAndToken({
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin',
        });
        const { user: student, token: studentToken } = await createUserAndToken({
            username: 'student',
            email: 'student@example.com',
            points: 0,
        });

        const task = await Task.create({
            title: 'Read Chapter 1',
            description: 'Complete reading',
            points: 50,
            deadline: new Date(Date.now() + 86400000),
            createdBy: admin._id,
        });

        // Fire 10 concurrent completion requests
        const responses = await Promise.all(
            Array.from({ length: 10 }, () =>
                request(app)
                    .post('/api/v1/complete-task')
                    .set('Authorization', `Bearer ${studentToken}`)
                    .send({ taskId: task._id.toString() })
            )
        );

        const successes = responses.filter((r) => r.status === 200);
        const failures = responses.filter((r) => r.status === 400);

        expect(successes.length).toBe(1);
        expect(failures.length).toBe(9);

        const freshStudent = await User.findById(student._id);
        expect(freshStudent.points).toBe(50);
        expect(freshStudent.completedTasks.length).toBe(1);
    });

    test('Quiz answers remain hidden from students before submission', async () => {
        const { user: admin } = await createUserAndToken({
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin',
        });
        const { token: studentToken } = await createUserAndToken({
            username: 'student',
            email: 'student@example.com',
        });

        const quiz = await Quiz.create({
            title: 'Physics Quiz',
            timer: 120,
            totalPoints: 20,
            deadline: new Date(Date.now() + 86400000),
            createdBy: admin._id,
            questions: [
                {
                    questionText: 'Unit of Force?',
                    options: ['Newton', 'Joule', 'Watt', 'Pascal'],
                    correctAnswer: 0,
                    points: 20,
                },
            ],
        });

        const listRes = await request(app)
            .get('/api/v1/getquizzes')
            .set('Authorization', `Bearer ${studentToken}`);
        expect(listRes.status).toBe(200);
        expect(listRes.body.quizzes[0].questions[0].correctAnswer).toBeUndefined();

        const singleRes = await request(app)
            .get(`/api/v1/quizzes/${quiz._id}`)
            .set('Authorization', `Bearer ${studentToken}`);
        expect(singleRes.status).toBe(200);
        expect(singleRes.body.quiz.questions[0].correctAnswer).toBeUndefined();
    });

    test('Submitting quiz prevents duplicate questionId scoring and concurrent duplicate rewards', async () => {
        const { user: admin } = await createUserAndToken({
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin',
        });
        const { user: student, token: studentToken } = await createUserAndToken({
            username: 'student',
            email: 'student@example.com',
            points: 0,
        });

        const quiz = await Quiz.create({
            title: 'Math Quiz',
            timer: 120,
            totalPoints: 25,
            deadline: new Date(Date.now() + 86400000),
            createdBy: admin._id,
            questions: [
                {
                    questionText: '2 + 2 = ?',
                    options: ['3', '4', '5', '6'],
                    correctAnswer: 1,
                    points: 25,
                },
            ],
        });

        const qId = quiz.questions[0]._id.toString();

        // Attempt duplicate questionId exploit concurrently 8 times
        const responses = await Promise.all(
            Array.from({ length: 8 }, () =>
                request(app)
                    .post(`/api/v1/quizzes/${quiz._id}/submit`)
                    .set('Authorization', `Bearer ${studentToken}`)
                    .send({
                        quizId: quiz._id.toString(),
                        answers: [
                            { questionId: qId, answer: 1 },
                            { questionId: qId, answer: 1 },
                            { questionId: qId, answer: 1 },
                        ],
                    })
            )
        );

        const successes = responses.filter((r) => r.status === 200);
        const failures = responses.filter((r) => r.status === 400);

        expect(successes.length).toBe(1);
        expect(failures.length).toBe(7);
        expect(successes[0].body.score).toBe(25);

        const freshStudent = await User.findById(student._id);
        expect(freshStudent.points).toBe(25);

        const scores = await Score.find({ user: student._id, quiz: quiz._id });
        expect(scores.length).toBe(1);
    });
});
