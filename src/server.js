import express from 'express';
import path from 'path';
import { createServer } from 'http';
import cors from 'cors';
import socketio from 'socket.io';
import rootRoutes from './routes/index';
import roomRoutes from './routes/room';
import { changeTicker, deleteTool, movedItem, addItem } from './modules/chartevents';
import { joinRoom, leaveRoom, disconnectClient } from './modules/roomevents';

const app = express();
const server = createServer(app);
const io = socketio(server, {
  cors: {
    origin: `http://localhost:${process.env.PORT || '8080'}`,
    methods: ["GET", "POST"]
  }
});

export let rooms = {};
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join('..', 'www', 'dist')));
app.use('/', rootRoutes);
app.use('/', roomRoutes);

io.on('connection', socket => {
  socket.on('change_ticker', data => changeTicker(io, data));
  socket.on('del_item', data => deleteTool(io, data));
  socket.on('move_item', data => io.to(data.roomId).emit('move_item', data));
  socket.on('moved_item', data => movedItem(io, data));
  socket.on('add_item', data => addItem(io, data));
  socket.on('join', ({ roomId, username }) => joinRoom(io, socket, roomId, username));
  socket.on('leave', roomId => leaveRoom(io, socket, roomId));
  socket.on('disconnect', () => disconnectClient(io, socket));
});

server.listen(port, () => console.log(`listening on ${port}`));