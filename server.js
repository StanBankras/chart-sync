const express = require('express')
const app = express()
const http = require('http').createServer(app)
const path = require('path')
const io = require('socket.io')(http)
const port = process.env.PORT || 3000
let userCount = 0;
let nicknames = [];

app.use(express.static(path.resolve('public')))

io.on('connection', (socket) => {
  io.to(socket.id).emit('nicknames', nicknames);

  socket.on('message', (message) => {
    io.emit('message', message)
  })

  socket.on('nickname', (nickname) => {
    nicknames.push({ nickname, id: socket.id });
    io.emit('nicknames', nicknames.map(n => n.nickname));
  })

  socket.on('typing', (nickname) => {
    io.emit('isTyping', nickname)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
    nicknames = nicknames.filter(n => n.id !== socket.id);
    io.emit('nicknames', nicknames.map(n => n.nickname));
  })
})

http.listen(port, () => console.log(`listening on ${port}`))