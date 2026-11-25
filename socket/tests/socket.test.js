const { io: Client } = require('socket.io-client');
const jwt = require('jsonwebtoken');
const { createSocketServer } = require('../index');

const TEST_SECRET = 'socket_test_secret_12345';

describe('Socket.IO Authentication, Authorization & Real-Time Messaging', () => {
    let server;
    let io;
    let baseUrl;
    let onlineUsers;
    const activeClients = [];

    const connectClient = (opts = {}) => {
        const client = Client(baseUrl, {
            reconnection: false,
            ...opts,
        });
        activeClients.push(client);
        return client;
    };

    beforeAll((done) => {
        const instance = createSocketServer(TEST_SECRET);
        server = instance.server;
        io = instance.io;
        onlineUsers = instance.onlineUsers;

        server.listen(0, '127.0.0.1', () => {
            const { port } = server.address();
            baseUrl = `http://127.0.0.1:${port}`;
            done();
        });
    });

    afterEach(() => {
        while (activeClients.length > 0) {
            const c = activeClients.pop();
            if (c && c.connected) c.disconnect();
            else if (c) c.close();
        }
    });

    afterAll((done) => {
        io.close();
        server.close(done);
    });

    test('Rejects unauthenticated socket connections', (done) => {
        const client = connectClient();
        client.on('connect_error', (err) => {
            try {
                expect(err.message).toMatch(/Authentication required|Invalid/i);
                client.close();
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    test('Delivers real-time newMessage only to intended authorized participant', (done) => {
        const tokenA = jwt.sign({ id: 'userA', role: 'user' }, TEST_SECRET, { expiresIn: '5m' });
        const tokenB = jwt.sign({ id: 'userB', role: 'user' }, TEST_SECRET, { expiresIn: '5m' });
        const tokenC = jwt.sign({ id: 'userC', role: 'user' }, TEST_SECRET, { expiresIn: '5m' });

        const clientA = connectClient({ auth: { token: tokenA } });
        const clientB = connectClient({ auth: { token: tokenB } });
        const clientC = connectClient({ auth: { token: tokenC } });

        let connected = 0;
        let receivedC = false;
        clientC.on('newMessage', () => {
            receivedC = true;
        });

        clientB.on('newMessage', (msg) => {
            try {
                expect(msg.content).toBe('Real-time hello!');
                expect(msg.sender).toBe('userA');
                setTimeout(() => {
                    try {
                        expect(receivedC).toBe(false);
                        done();
                    } catch (e) {
                        done(e);
                    }
                }, 100);
            } catch (e) {
                done(e);
            }
        });

        const onConnect = () => {
            connected += 1;
            if (connected === 3) {
                const receipt = jwt.sign(
                    {
                        _id: 'msg-1',
                        conversationId: 'conv-1',
                        sender: 'userA',
                        receiverId: 'userB',
                        content: 'Real-time hello!',
                        createdAt: new Date().toISOString(),
                    },
                    TEST_SECRET,
                    { expiresIn: '2m' }
                );
                clientA.emit('sendMessage', { socketReceipt: receipt });
            }
        };

        clientA.on('connect', onConnect);
        clientB.on('connect', onConnect);
        clientC.on('connect', onConnect);
    });

    test('Rejects unauthorized join attempt for another user room', (done) => {
        const tokenA = jwt.sign({ id: 'userA', role: 'user' }, TEST_SECRET, { expiresIn: '5m' });
        const clientA = connectClient({ auth: { token: tokenA } });

        clientA.on('connect', () => {
            clientA.emit('join', 'userB');
        });

        clientA.on('socketError', (err) => {
            try {
                expect(err.message).toMatch(/Unauthorized/i);
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    test('Cleans up onlineUsers map on disconnect', (done) => {
        const tokenD = jwt.sign({ id: 'userD', role: 'user' }, TEST_SECRET, { expiresIn: '5m' });
        const clientD = connectClient({ auth: { token: tokenD } });

        clientD.on('connect', () => {
            expect(onlineUsers.has('userD')).toBe(true);
            clientD.disconnect();
            setTimeout(() => {
                try {
                    expect(onlineUsers.has('userD')).toBe(false);
                    done();
                } catch (e) {
                    done(e);
                }
            }, 100);
        });
    });
});
