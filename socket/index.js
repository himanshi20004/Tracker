const { Server } = require('socket.io');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
const onlineUsers={}
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  socket.on('join',(receiverId)=>{
    onlineUsers[receiverId]=socket.id
    console.log("receiver",receiverId)
  })
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});


const PORT = 8000; // or any port of your choice
server.listen(PORT, () => {
  console.log(`Socket.io server running on http://localhost:${PORT}`);
});
