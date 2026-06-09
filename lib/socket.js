import { Server } from 'socket.io';

/**
 * Notification type constants used throughout the application.
 */
export const NOTIFICATION_TYPES = {
  LIKE: 'like',
  COMMENT: 'comment',
  TAG: 'tag',
  ROLE_CHANGE: 'role_change',
  EVENT_INVITE: 'event_invite',
  UPLOAD: 'upload',
  SYSTEM: 'system',
};

let io = null;

/**
 * Initialize the Socket.io server and attach it to the Next.js HTTP server.
 * Caches the instance to prevent multiple initializations.
 *
 * @param {import('http').Server} httpServer - The underlying HTTP server.
 * @returns {Server} The Socket.io server instance.
 */
export function initializeSocket(httpServer) {
  if (io) {
    return io;
  }

  io = new Server(httpServer, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join a user-specific room for targeted notifications
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`👤 User ${userId} joined their room`);
      }
    });

    // Join an event room for live updates
    socket.on('join-event', (eventId) => {
      if (eventId) {
        socket.join(`event:${eventId}`);
        console.log(`📅 Socket ${socket.id} joined event:${eventId}`);
      }
    });

    // Leave an event room
    socket.on('leave-event', (eventId) => {
      if (eventId) {
        socket.leave(`event:${eventId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.io server initialized');
  return io;
}

/**
 * Get the current Socket.io server instance.
 * @returns {Server|null} The Socket.io instance, or null if not initialized.
 */
export function getIO() {
  return io;
}

/**
 * Emit a notification to a specific user via their private room.
 *
 * @param {string} recipientId - The target user's ID.
 * @param {Object} notification - The notification payload.
 * @param {string} notification.type - One of NOTIFICATION_TYPES values.
 * @param {string} notification.message - The notification message.
 * @param {string} [notification.senderId] - The sender's user ID.
 * @param {string} [notification.mediaId] - Related media ID.
 * @param {string} [notification.eventId] - Related event ID.
 */
export function emitNotification(recipientId, notification) {
  if (!io) {
    console.warn('Socket.io not initialized. Notification not sent in real-time.');
    return;
  }

  io.to(`user:${recipientId}`).emit('notification', {
    ...notification,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Emit an event to all users in an event room.
 *
 * @param {string} eventId - The event ID.
 * @param {string} eventName - The socket event name to emit.
 * @param {Object} data - The data payload.
 */
export function emitToEvent(eventId, eventName, data) {
  if (!io) {
    console.warn('Socket.io not initialized. Event emission skipped.');
    return;
  }

  io.to(`event:${eventId}`).emit(eventName, {
    ...data,
    timestamp: new Date().toISOString(),
  });
}
