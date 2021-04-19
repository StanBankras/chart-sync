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

const events = ['add_item', 'move_item', 'del_item', 'change_ticker'];
let movingDrawings = [];

setInterval(() => {
  movingDrawings = movingDrawings.filter(async drawing => {
    if(drawing.date < Date.now()) {
      const room = rooms[drawing.roomId];
      if(!room) return true;
  
      const ticker = drawing.ticker;
      const tool = drawing.data;
  
      const index = room.tickers[drawing.ticker].findIndex(t => t.id === tool.id);
      room.tickers[drawing.ticker][index] = tool;
      await db.collection("rooms").doc(drawing.roomId).update(room);
    }
  });
}, 2000);

io.on('connection', socket => {
  socket.on('change_ticker', async data => {
    io.to(data.roomId).emit('change_ticker', data);

    const room = rooms[data.roomId];
    if(!room) return;

    const oldIndex = room.activeTickers.indexOf(data.old);
    room.activeTickers[oldIndex] = data.new;

    if(!room.tickers[data.new]) room.tickers[data.new] = [];
    await db.collection("rooms").doc(data.roomId).update(room);
  });

  socket.on('del_item', async data => {
    io.to(data.roomId).emit('del_item', data);

    const room = rooms[data.roomId];
    if(!room) return;

    const ticker = data.ticker;
    const tool = data.data;

    room.tickers[ticker] = room.tickers[ticker].filter(t => t.settings['$uuid'] !== tool.settings['$uuid']);
    await db.collection("rooms").doc(data.roomId).update(room);
  });

  
  socket.on('move_item', async data => {
    io.to(data.roomId).emit('move_item', data);
    
    const existing = movingDrawings.find(m => m.data.id === data.data.id);
    if(existing) {
      existing.date = Date.now() + 2000;
      existing.data = data.data;
    } else {
      movingDrawings.push({
        data: data.data,
        ticker: data.ticker,
        roomId: data.roomId,
        date: Date.now() + 2000
      });
    }
  });

  socket.on('add_item', async data => {
    io.to(data.roomId).emit('add_item', data);

    const room = rooms[data.roomId];
    if(!room) return;

    const ticker = data.ticker;
    const tool = data.data;

    room.tickers[ticker] = [...room.tickers[ticker], tool];
    await db.collection("rooms").doc(data.roomId).update(room);
  });

  // Users joining a room: check if id exists
  socket.on('join', roomId => {
    if(!roomId) return io.to(socket.id).emit('joined', { roomId: 'NO_ID' });
    const room = rooms[roomId];
    if(!room) return io.to(socket.id).emit('joined', { roomId: 'NO_ROOM_WITH_ID' });

    socket.join(roomId);
    io.to(socket.id).emit('joined', room);
  });

  socket.on('leave', roomId => socket.leave(roomId));
});

app.get('/klines/:pair/:timeframe', (req, res) => {
  fetch(`https://api.binance.com/api/v3/klines?symbol=${req.params.pair}&interval=${req.params.timeframe}`)
    .then(response => response.json())
    .then(data => res.send(data));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'www', 'dist', 'index.html'));
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