import { v4 as uuidv4 } from 'uuid';
import WatchParty from '../models/WatchParty.js';

// In-memory room state: roomId -> { videoId, isPlaying, currentTime, users: Map }
const rooms = new Map();

export const initWatchParty = (io) => {
  const partyNS = io.of('/watch-party');

  partyNS.on('connection', (socket) => {
    let currentRoom = null;

    socket.on('create-room', async ({ videoId, userId, username }, cb) => {
      try {
        const roomId = uuidv4().slice(0, 8).toUpperCase();
        await WatchParty.create({ roomId, videoId, host: userId });

        rooms.set(roomId, {
          videoId,
          isPlaying: false,
          currentTime: 0,
          users: new Map([[socket.id, { userId, username }]]),
          hostSocketId: socket.id,
        });

        socket.join(roomId);
        currentRoom = roomId;
        cb({ roomId });
      } catch (err) {
        cb({ error: err.message });
      }
    });

    socket.on('join-room', async ({ roomId, userId, username }, cb) => {
      const room = rooms.get(roomId);
      if (!room) return cb({ error: 'Room not found' });

      room.users.set(socket.id, { userId, username });
      socket.join(roomId);
      currentRoom = roomId;

      socket.to(roomId).emit('user-joined', { userId, username });
      cb({
        success: true,
        videoId: room.videoId,
        isPlaying: room.isPlaying,
        currentTime: room.currentTime,
        users: [...room.users.values()],
      });
    });

    socket.on('play', ({ roomId, currentTime }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      room.isPlaying = true;
      room.currentTime = currentTime;
      socket.to(roomId).emit('play', { currentTime });
    });

    socket.on('pause', ({ roomId, currentTime }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      room.isPlaying = false;
      room.currentTime = currentTime;
      socket.to(roomId).emit('pause', { currentTime });
    });

    socket.on('seek', ({ roomId, currentTime }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      room.currentTime = currentTime;
      socket.to(roomId).emit('seek', { currentTime });
    });

    socket.on('send-message', ({ roomId, userId, username, text }) => {
      partyNS.to(roomId).emit('new-message', {
        id: uuidv4(),
        userId,
        username,
        text,
        timestamp: Date.now(),
      });
    });

    socket.on('leave-room', ({ roomId }) => handleLeave(socket, roomId, partyNS));

    socket.on('disconnect', () => {
      if (currentRoom) handleLeave(socket, currentRoom, partyNS);
    });
  });
};

function handleLeave(socket, roomId, partyNS) {
  const room = rooms.get(roomId);
  if (!room) return;

  const user = room.users.get(socket.id);
  room.users.delete(socket.id);
  socket.leave(roomId);

  if (room.users.size === 0) {
    rooms.delete(roomId);
    WatchParty.findOneAndUpdate({ roomId }, { isActive: false }).catch(() => {});
  } else {
    partyNS.to(roomId).emit('user-left', {
      userId: user?.userId,
      username: user?.username,
    });
  }
}
