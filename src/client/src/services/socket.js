// src/services/socket.js
// Singleton Socket.IO client — shared across the whole React app.
// Connects lazily on first import so we don't open a socket for unauthenticated pages.

import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:8080';

// Lazy singleton — created once, reused everywhere
let socket = null;

export const getSocket = () => {
    if (!socket) {
        socket = io(BACKEND_URL, {
            withCredentials: true,
            // Use websocket first, fall back to polling
            transports: ['websocket', 'polling'],
            autoConnect: true,
        });

        socket.on('connect', () => {
            console.log('Socket.IO connected:', socket.id);
        });
        socket.on('disconnect', () => {
            console.log('Socket.IO disconnected');
        });
        socket.on('connect_error', (err) => {
            console.warn('Socket.IO connection error:', err.message);
        });
    }
    return socket;
};

export default getSocket;
