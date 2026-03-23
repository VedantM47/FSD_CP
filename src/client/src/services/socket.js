import { io } from 'socket.io-client';
import { getAuthToken } from './api';

const BACKEND_URL = 'http://localhost:8080';

// Lazy singleton — created once, reused everywhere
let socket = null;

export const getSocket = () => {
    if (!socket) {
        const token = getAuthToken();
        
        socket = io(BACKEND_URL, {
            auth: {
                token: token,
            },
            withCredentials: true,
            transports: ['websocket', 'polling'],
            autoConnect: true,
        });

        socket.on('connect', () => {
            console.log('🔌 Socket.IO connected:', socket.id);
        });
        socket.on('disconnect', () => {
            console.log('🔌 Socket.IO disconnected');
        });
        socket.on('connect_error', (err) => {
            console.warn('🔌 Socket.IO connection error:', err.message);
        });
    }
    return socket;
};

/**
 * Join a hackathon discussion room
 */
export const joinHackathonRoom = (hackathonId) => {
    const sock = getSocket();
    sock.emit('join_hackathon', { hackathonId });
};

/**
 * Send a message/comment to hackathon discussion
 */
export const sendMessage = (hackathonId, message, parentId = null) => {
    const sock = getSocket();
    sock.emit('send_message', { hackathonId, message, parentId });
};

/**
 * Listen for incoming messages
 */
export const onReceiveMessage = (callback) => {
    const sock = getSocket();
    sock.on('receive_message', callback);
};

/**
 * Stop listening for messages
 */
export const offReceiveMessage = (callback) => {
    const sock = getSocket();
    sock.off('receive_message', callback);
};

export default getSocket;
