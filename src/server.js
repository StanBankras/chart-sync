const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(http);
const fetch = require('node-fetch');
const cors = require('cors');
const port = process.env.PORT || 3000;

app.use(cors());

// app.use(express.static(path.resolve('build')))

app.get('/klines/:pair/:timeframe', (req, res) => {
  fetch(`https://api.binance.com/api/v3/klines?symbol=${req.params.pair}&interval=${req.params.timeframe}`)
    .then(response => response.json())
    .then(data => res.send(data));
});

http.listen(port, () => console.log(`listening on ${port}`));