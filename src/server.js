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

io.on('connection', socket => {
  // All chart draw events work the same
  events.forEach(event => {
    socket.on(event, data => {
      io.to(data.roomId).emit(event, data);
    });
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