require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const connectDB = require('./config/db');
const Message = require('./models/message.js');
const app = require('./app');



// ===== CONNECT DB =====
connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ===== 🧠 MEMORY =====
const rooms = {};

// ===== 🎨 COLOR =====
const getRandomColor = () => {
  const colors = [
    '#FF5733', '#33FF57', '#3357FF',
    '#FF33A8', '#A833FF', '#33FFF3'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// ===== 🔌 SOCKET =====
io.on('connection', (socket) => {

  console.log('✅ User connected:', socket.id);

  // ===== JOIN ROOM =====
  socket.on('join_room', async ({ room, username }) => {

    socket.join(room);

    // ✅ VERY IMPORTANT
    socket.data.room = room;
    socket.data.username = username;

    if (!rooms[room]) {
      rooms[room] = { users: [] };
    }

    let user = rooms[room].users.find(u => u.name === username);

    if (user) {
      // 🔁 RECONNECT
      user.id = socket.id;
      user.online = true;

      console.log(`🔁 ${username} reconnected`);

      io.to(room).emit('system_message', {
        message: `${username} reconnected`
      });

    } else {
      // 🆕 NEW USER
      user = {
        id: socket.id,
        name: username,
        color: getRandomColor(),
        online: true
      };

      rooms[room].users.push(user);

      console.log(`👤 ${username} joined ${room}`);

      io.to(room).emit('system_message', {
        message: `${username} joined the room`
      });
    }

    // 👥 USERS UPDATE
    io.to(room).emit('room_users', rooms[room].users);

    // 📜 LOAD HISTORY FROM DB
    try {
      const history = await Message.find({ room })
        .sort({ timestamp: -1 })
        .limit(50);

      socket.emit('message_history', history.reverse());
    } catch (err) {
      console.error('❌ Error loading history:', err);
    }

  });

  // ===== SEND MESSAGE =====
  socket.on('send_message', async (data) => {

    try {
      const roomData = rooms[data.room];
      if (!roomData) return;

      const user = roomData.users.find(u => u.name === data.author);

      const msg = {
        id: data.id,
        room: data.room,
        author: data.author,
        message: data.message,
        color: user?.color || '#60A5FA',
        timestamp: new Date(),
        status: 'sent'
      };

      // 💾 SAVE TO DB
      await Message.create(msg);

      // 📢 BROADCAST
      io.to(data.room).emit('receive_message', msg);

    } catch (err) {
      console.error('❌ Error sending message:', err);
    }

  });

  // ===== MESSAGE SEEN =====
  socket.on('message_seen', async ({ room, messageId }) => {

    try {
      await Message.findOneAndUpdate(
        { id: messageId },
        { status: 'seen' }
      );

      socket.to(room).emit('message_seen', { messageId });

    } catch (err) {
      console.error('❌ Error updating seen:', err);
    }

  });

  // ===== TYPING =====
  socket.on('typing', ({ room, username }) => {
    socket.to(room).emit('user_typing', username);
  });

  // ===== DISCONNECT =====
  socket.on('disconnect', () => {

    const room = socket.data.room;
    const username = socket.data.username;

    if (!room || !rooms[room]) return;

    const roomData = rooms[room];

    const user = roomData.users.find(u => u.id === socket.id);

    if (user) {
      // ❌ remove user
      roomData.users = roomData.users.filter(
        u => u.id !== socket.id
      );

      console.log(`👋 ${username} left ${room}`);

      // SYSTEM MESSAGE
      socket.to(room).emit('system_message', {
        message: `${username} left the room`
      });

      // 👥 UPDATE USERS
      io.to(room).emit('room_users', roomData.users);
    }

  });

});



// ===== START SERVER =====
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});