import express from 'express';
import { rooms } from '../server';
import { db } from '../modules/db';

const router = express.Router();

router.post('/room/new', async (req, res) => {
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

export default router;