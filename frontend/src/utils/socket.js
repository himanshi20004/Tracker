import { io } from 'socket.io-client';
import { SOCKET_BASE_URL } from './api';

let socketInstance = null;
let currentToken = null;

export const getSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return null;
    }

    if (socketInstance && currentToken === token) {
        if (!socketInstance.connected) {
            socketInstance.connect();
        }
        return socketInstance;
    }

    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }

    currentToken = token;
    socketInstance = io(SOCKET_BASE_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
    });

    return socketInstance;
};

export const disconnectSocket = () => {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
    currentToken = null;
};
