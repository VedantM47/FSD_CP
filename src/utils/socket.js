// src/utils/socket.js
// Singleton wrapper around the Socket.IO server instance.
// Call initSocket(httpServer) once in index.js, then use getIO() anywhere.

import { Server } from 'socket.io';

let io = null;

/**
 * Initialise Socket.IO on the given HTTP server.
 * Should only be called once, from index.js.
 */
export const initSocket = (httpServer, allowedOrigin) => {
    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigin || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

/**
 * Returns the current Socket.IO server instance.
 * Always call initSocket first.
 */
export const getIO = () => {
    if (!io) throw new Error('Socket.IO not initialised. Call initSocket first.');
    return io;
};
