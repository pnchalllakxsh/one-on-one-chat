const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { db, testConnection } = require('./db');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const connectedUsers = new Map();

testConnection();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join', async (userData) => {
    const { name } = userData;
    
    await db.addUser(name);
    
    connectedUsers.set(socket.id, { name, socketId: socket.id });
    
    console.log(`${name} joined the chat`);
    
    const users = await db.getUsers();
    io.emit('userList', users);
    
    socket.emit('joinSuccess', { name });
  });

  socket.on('privateMessage', async (data) => {
    const { receiverName, message } = data;
    const sender = connectedUsers.get(socket.id);
    
    if (!sender) {
      socket.emit('error', 'You must join first');
      return;
    }

    // Save message to database
    await db.saveMessage(sender.name, receiverName, message);

    // Find receiver's socket
    const receiverSocket = Array.from(connectedUsers.entries())
      .find(([, user]) => user.name === receiverName);

    const messageData = {
      senderName: sender.name,
      receiverName,
      message,
      timestamp: new Date()
    };

    // Send message to receiver if online
    if (receiverSocket) {
      io.to(receiverSocket[0]).emit('newMessage', messageData);
    }

    // Send confirmation back to sender
    socket.emit('messageSent', messageData);
  });

  socket.on('getChatHistory', async (data) => {
    const { otherUser } = data;
    const currentUser = connectedUsers.get(socket.id);
    
    if (!currentUser) {
      socket.emit('error', 'You must join first');
      return;
    }

    const chatHistory = await db.getChatHistory(currentUser.name, otherUser);
    socket.emit('chatHistory', { otherUser, messages: chatHistory });
  });

  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log(`${user.name} disconnected`);
      connectedUsers.delete(socket.id);
      
      // Broadcast updated user list
      db.getUsers().then(users => {
        io.emit('userList', users);
      });
    }
  });
});

app.get('/api/users', async (req, res) => {
  const users = await db.getUsers();
  res.json(users);
});

app.get('/api/chat/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  const chatHistory = await db.getChatHistory(user1, user2);
  res.json(chatHistory);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for connections`);
});