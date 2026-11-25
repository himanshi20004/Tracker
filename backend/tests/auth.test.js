const request = require('supertest');
const crypto = require('crypto');
const app = require('../app');
const User = require('../models/usermodels');
const { createUserAndToken } = require('./setup');

jest.mock('../utils/sendEmail', () => jest.fn().mockResolvedValue(true));
const sendEmail = require('../utils/sendEmail');

describe('Authentication, Authorization & Password Management', () => {
    test('Student can register and password hash is never returned', async () => {
        const res = await request(app)
            .post('/api/v1/register')
            .send({
                username: 'aryan',
                email: 'aryan@example.com',
                password: 'Password123!',
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.user.role).toBe('user');
        expect(res.body.user.password).toBeUndefined();
    });

    test('Public registration as admin is rejected with 403', async () => {
        const res = await request(app)
            .post('/api/v1/register')
            .send({
                username: 'hacker',
                email: 'hacker@example.com',
                password: 'Password123!',
                role: 'admin',
            });

        expect(res.status).toBe(403);
        const created = await User.findOne({ email: 'hacker@example.com' });
        expect(created).toBeNull();
    });

    test('/me and /admin/users never expose password hashes or reset tokens', async () => {
        const { token: studentToken } = await createUserAndToken({
            email: 's1@example.com',
            role: 'user',
        });
        const { token: adminToken } = await createUserAndToken({
            username: 'admin1',
            email: 'admin1@example.com',
            role: 'admin',
        });

        const meRes = await request(app)
            .get('/api/v1/me')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(meRes.status).toBe(200);
        expect(meRes.body.user.password).toBeUndefined();
        expect(meRes.body.user.resetPasswordToken).toBeUndefined();

        const adminUsersRes = await request(app)
            .get('/api/v1/admin/users')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(adminUsersRes.status).toBe(200);
        expect(adminUsersRes.body.users.length).toBe(2);
        adminUsersRes.body.users.forEach((u) => {
            expect(u.password).toBeUndefined();
            expect(u.resetPasswordToken).toBeUndefined();
        });
    });

    test('Student cannot access admin endpoints', async () => {
        const { user: student, token: studentToken } = await createUserAndToken({
            email: 's2@example.com',
            role: 'user',
        });

        const usersRes = await request(app)
            .get('/api/v1/admin/users')
            .set('Authorization', `Bearer ${studentToken}`);
        expect(usersRes.status).toBe(403);

        const roleRes = await request(app)
            .put(`/api/v1/admin/user/${student._id}`)
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ role: 'admin' });
        expect(roleRes.status).toBe(403);

        const taskRes = await request(app)
            .post('/api/v1/task')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
                title: 'Test',
                description: 'Desc',
                points: 10,
                deadline: new Date(Date.now() + 86400000).toISOString(),
            });
        expect(taskRes.status).toBe(403);

        const quizRes = await request(app)
            .post('/api/v1/postquizzes')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ title: 'Q', timer: 60, deadline: new Date(), questions: [] });
        expect(quizRes.status).toBe(403);
    });

    test('updatePassword requires correct oldPassword and rejects wrong oldPassword', async () => {
        const { token } = await createUserAndToken({
            email: 'pw@example.com',
            password: 'OldPassword123!',
        });

        const wrongRes = await request(app)
            .put('/api/v1/password/update')
            .set('Authorization', `Bearer ${token}`)
            .send({
                oldPassword: 'WrongPassword!',
                newPassword: 'NewPassword123!',
                confirmPassword: 'NewPassword123!',
            });
        expect(wrongRes.status).toBe(400);

        const okRes = await request(app)
            .put('/api/v1/password/update')
            .set('Authorization', `Bearer ${token}`)
            .send({
                oldPassword: 'OldPassword123!',
                newPassword: 'NewPassword123!',
                confirmPassword: 'NewPassword123!',
            });
        expect(okRes.status).toBe(200);
        expect(okRes.body.token).toBeDefined();
        expect(okRes.body.user.password).toBeUndefined();
    });

    test('Password reset hashes token in DB, resets password, and prevents token reuse', async () => {
        const { user } = await createUserAndToken({
            email: 'reset@example.com',
            password: 'InitialPassword1!',
        });

        const forgotRes = await request(app)
            .post('/api/v1/password/forgot')
            .send({ email: 'reset@example.com' });

        expect(forgotRes.status).toBe(200);
        expect(sendEmail).toHaveBeenCalledTimes(1);

        const emailBody = sendEmail.mock.calls[0][0].message;
        const match = emailBody.match(/\/reset-password\/([a-f0-9]+)/);
        expect(match).not.toBeNull();
        const rawToken = match[1];

        const dbUser = await User.findById(user._id).select('+resetPasswordToken +resetPasswordExpire');
        const expectedHashed = crypto.createHash('sha256').update(rawToken).digest('hex');
        expect(dbUser.resetPasswordToken).toBe(expectedHashed);

        const resetRes = await request(app)
            .put(`/api/v1/password/reset/${rawToken}`)
            .send({
                password: 'BrandNewPassword1!',
                confirmPassword: 'BrandNewPassword1!',
            });
        expect(resetRes.status).toBe(200);

        // Token reuse must fail
        const reuseRes = await request(app)
            .put(`/api/v1/password/reset/${rawToken}`)
            .send({
                password: 'AnotherPassword1!',
                confirmPassword: 'AnotherPassword1!',
            });
        expect(reuseRes.status).toBe(400);

        // Login with new password succeeds
        const loginRes = await request(app)
            .post('/api/v1/login')
            .send({ email: 'reset@example.com', password: 'BrandNewPassword1!' });
        expect(loginRes.status).toBe(200);
    });

    test('NoSQL injection login attempt is blocked', async () => {
        await createUserAndToken({ email: 'victim@example.com', password: 'Password123!' });
        const res = await request(app)
            .post('/api/v1/login')
            .send({ email: { $ne: '' }, password: { $ne: '' } });

        expect(res.status).toBe(400);
    });
});
