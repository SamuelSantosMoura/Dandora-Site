import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// In-memory store for rooms
const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        tokens: [],
        lines: [],
        fog: [],
        dm: socket.id
      });
    }
    
    // Send current room state to the newly joined user
    socket.emit('room_state', rooms.get(roomId));
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on('update_tokens', ({ roomId, tokens }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.tokens = tokens;
      socket.to(roomId).emit('tokens_updated', tokens);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
