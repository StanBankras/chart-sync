import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'www', 'dist', 'index.html'));
});

router.get('/klines/:pair/:timeframe', (req, res) => {
  fetch(`https://api.binance.com/api/v3/klines?symbol=${req.params.pair}&interval=${req.params.timeframe}`)
    .then(response => response.json())
    .then(data => res.send(data));
});

export default router;