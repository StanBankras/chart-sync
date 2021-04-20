import { rooms } from "../server";
import { saveRoom } from "./db";


export async function changeTicker(io, data) {
  io.to(data.roomId).emit('change_ticker', data);

  const room = rooms[data.roomId];
  if(!room) return;

  const oldIndex = room.activeTickers.indexOf(data.old);
  room.activeTickers[oldIndex] = data.new;

  if(!room.tickers[data.new]) room.tickers[data.new] = [];
  
  await saveRoom(data.roomId, room);
}

export async function deleteTool(io, data) {
  io.to(data.roomId).emit('del_item', data);

  const room = rooms[data.roomId];
  if(!room) return;

  const ticker = data.ticker;
  const tool = data.data;

  room.tickers[ticker] = room.tickers[ticker].filter(t => t.id !== tool.id || !t.settings.p1 || !t.settings.p2);
  
  await saveRoom(data.roomId, room);
}

export async function movedItem(io, data) {
  const room = rooms[data.roomId];
  if(!room) return;

  const ticker = data.ticker;
  const tool = data.data;

  const index = room.tickers[data.ticker].findIndex(t => t.id === tool.id);
  if(index === '-1' || index === -1) return;

  room.tickers[data.ticker][index] = tool;
  
  await saveRoom(data.roomId, room);
}


export async function addItem(io, data) {
  io.to(data.roomId).emit('add_item', data);

  const room = rooms[data.roomId];
  if(!room) return;

  const ticker = data.ticker;
  const tool = data.data;
  tool.date = Date.now();

  if(room.tickers[ticker].find(t => t.id === tool.id)) return;
  room.tickers[ticker] = [...room.tickers[ticker], tool];

  await saveRoom(data.roomId, room);
}