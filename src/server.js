const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const firebase = require('firebase');
const io = require('socket.io')(http, {
  cors: {
    origin: `http://localhost:${process.env.PORT || '8080'}`,
    methods: ["GET", "POST"]
  }
});
const fetch = require('node-fetch');
const cors = require('cors');
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join('..', 'www', 'dist')));

firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID
});

const db = firebase.firestore();
let rooms = {};

// Get rooms from firestore database with all data
// Store them in memory
(async function() {
  const data = await db.collection('rooms').get();
  data.docs.forEach(doc => rooms[doc.id] = doc.data());
})();

async function saveRoom(documentId, object) {
  const copy = JSON.parse(JSON.stringify(object));
  delete copy.users;
  await db.collection("rooms").doc(documentId).update(copy);
}

io.on('connection', socket => {
  socket.on('change_ticker', async data => {
    io.to(data.roomId).emit('change_ticker', data);

    const room = rooms[data.roomId];
    if(!room) return;

    const oldIndex = room.activeTickers.indexOf(data.old);
    room.activeTickers[oldIndex] = data.new;

    if(!room.tickers[data.new]) room.tickers[data.new] = [];
    
    await saveRoom(data.roomId, room);
  });

  socket.on('del_item', async data => {
    io.to(data.roomId).emit('del_item', data);

    const room = rooms[data.roomId];
    if(!room) return;

    const ticker = data.ticker;
    const tool = data.data;

    room.tickers[ticker] = room.tickers[ticker].filter(t => t.id !== tool.id || !t.settings.p1 || !t.settings.p2);
    
    await saveRoom(data.roomId, room);
  });

  
  socket.on('move_item', async data => {
    io.to(data.roomId).emit('move_item', data);
  });

  socket.on('moved_item', async data => {
    const room = rooms[data.roomId];
    if(!room) return;

    const ticker = data.ticker;
    const tool = data.data;

    const index = room.tickers[data.ticker].findIndex(t => t.id === tool.id);
    if(index === '-1' || index === -1) return;

    room.tickers[data.ticker][index] = tool;
    
    await saveRoom(data.roomId, room);
  });

  socket.on('add_item', async data => {
    io.to(data.roomId).emit('add_item', data);

    const room = rooms[data.roomId];
    if(!room) return;

    const ticker = data.ticker;
    const tool = data.data;
    tool.date = Date.now();

    if(room.tickers[ticker].find(t => t.id === tool.id)) return;
    room.tickers[ticker] = [...room.tickers[ticker], tool];

    await saveRoom(data.roomId, room);
  });

  // Users joining a room: check if id exists
  socket.on('join', ({ roomId, username }) => {
    if(!roomId) return io.to(socket.id).emit('joined', { roomId: 'NO_ID' });
    const room = rooms[roomId];
    if(!room) return io.to(socket.id).emit('joined', { roomId: 'NO_ROOM_WITH_ID' });

    socket.join(roomId);
    if(room.users) {
      room.users = room.users.filter(u => u.username !== username);
      room.users.push({ id: socket.id, username });
      io.to(roomId).emit('new_user', { roomId, user: { id: socket.id, username } });
    } else {
      room.users = [{ id: socket.id, username }];
      io.to(roomId).emit('new_user', { roomId, user: { id: socket.id, username } });
    }
    io.to(socket.id).emit('joined', room);
  });

  socket.on('leave', roomId => {
    socket.leave(roomId);

    const room = rooms[roomId];
    if(room && room.users) {
      room.users = room.users.filter(u => u.id !== socket.id);
      io.to(roomId).emit('remove_user', { roomId, id: socket.id });
    }
  });

  socket.on('disconnect', () => {
    const roomId = Object.keys(rooms).find(key => rooms[key].users ? rooms[key].users.find(u => u.id === socket.id) : false);
    if(roomId) {
      io.to(roomId).emit('remove_user', { roomId, id: socket.id });
    }
  });
});

app.get('/klines/:pair/:timeframe', (req, res) => {
  fetch(`https://api.binance.com/api/v3/klines?symbol=${req.params.pair}&interval=${req.params.timeframe}`)
    .then(response => response.json())
    .then(data => res.send(data));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'www', 'dist', 'index.html'));
});

app.get('/users/:roomId', (req, res) => {
  const room = rooms[req.params.roomId];
  res.json({ users: room.users });
});

app.post('/room/new', async (req, res) => {
  const { room, chartCount } = req.body;
  if(!room || !chartCount) return res.sendStatus(400);
  if(rooms[room.id]) return res.sendStatus(409);

  const newRoom = {
    roomId: room.id,
    name: room.name,
    chartCount,
    tickers: {},
    activeTickers: []
  };

  const standardTickers = ['ETH/USDT', 'BTC/USDT', 'LTC/USDT', 'LINK/USDT'];
  for(let i = 0; i < chartCount; i++) {
    const ticker = standardTickers[i];
    newRoom.tickers[ticker] = [];
    newRoom.activeTickers.push(ticker);
  }

  await db.collection("rooms").doc(room.id).set(newRoom);
  newRoom.users = [];
  rooms[room.id] = newRoom;
  res.sendStatus(200);
});

http.listen(port, () => console.log(`listening on ${port}`));