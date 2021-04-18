const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(http, {
  cors: {
    origin: `http://localhost:${process.env.PORT || '8080'}`,
    methods: ["GET", "POST"]
  }
});
const fetch = require('node-fetch');
const cors = require('cors');
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.static(path.join('..', 'www', 'dist')))

const events = ['add_item', 'move_item', 'del_item', 'change_ticker'];

io.on('connection', socket => {
  events.forEach(event => {
    socket.on(event, data => io.emit(event, data));
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

http.listen(port, () => console.log(`listening on ${port}`));