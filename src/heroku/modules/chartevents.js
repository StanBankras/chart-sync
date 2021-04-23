"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.changeTicker = changeTicker;
exports.deleteTool = deleteTool;
exports.movedItem = movedItem;
exports.addItem = addItem;

var _server = require("../server");

var _db = require("./db");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function changeTicker(_x, _x2) {
  return _changeTicker.apply(this, arguments);
}

function _changeTicker() {
  _changeTicker = _asyncToGenerator(function* (io, data) {
    io.to(data.roomId).emit('change_ticker', data);
    var room = _server.rooms[data.roomId];
    if (!room) return;
    var oldIndex = room.activeTickers.indexOf(data.old);
    room.activeTickers[oldIndex] = data.new;
    if (!room.tickers[data.new]) room.tickers[data.new] = [];
    yield (0, _db.saveRoom)(data.roomId, room);
  });
  return _changeTicker.apply(this, arguments);
}

function deleteTool(_x3, _x4) {
  return _deleteTool.apply(this, arguments);
}

function _deleteTool() {
  _deleteTool = _asyncToGenerator(function* (io, data) {
    io.to(data.roomId).emit('del_item', data);
    var room = _server.rooms[data.roomId];
    if (!room) return;
    var ticker = data.ticker;
    var tool = data.data;
    room.tickers[ticker] = room.tickers[ticker].filter(t => t.id !== tool.id || !t.settings.p1 || !t.settings.p2);
    yield (0, _db.saveRoom)(data.roomId, room);
  });
  return _deleteTool.apply(this, arguments);
}

function movedItem(_x5, _x6) {
  return _movedItem.apply(this, arguments);
}

function _movedItem() {
  _movedItem = _asyncToGenerator(function* (io, data) {
    var room = _server.rooms[data.roomId];
    if (!room) return;
    var ticker = data.ticker;
    var tool = data.data;
    var index = room.tickers[data.ticker].findIndex(t => t.id === tool.id);
    if (index === '-1' || index === -1) return;
    room.tickers[data.ticker][index] = tool;
    yield (0, _db.saveRoom)(data.roomId, room);
  });
  return _movedItem.apply(this, arguments);
}

function addItem(_x7, _x8) {
  return _addItem.apply(this, arguments);
}

function _addItem() {
  _addItem = _asyncToGenerator(function* (io, data) {
    io.to(data.roomId).emit('add_item', data);
    var room = _server.rooms[data.roomId];
    if (!room) return;
    var ticker = data.ticker;
    var tool = data.data;
    tool.date = Date.now();
    if (room.tickers[ticker].find(t => t.id === tool.id)) return;
    room.tickers[ticker] = [...room.tickers[ticker], tool];
    yield (0, _db.saveRoom)(data.roomId, room);
  });
  return _addItem.apply(this, arguments);
}
//# sourceMappingURL=chartevents.js.map