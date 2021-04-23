"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _server = require("../server");

var _db = require("../modules/db");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = _express.default.Router();

router.post('/room/new', /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (req, res) {
    var {
      room,
      chartCount
    } = req.body;
    if (!room || !chartCount) return res.sendStatus(400);
    if (_server.rooms[room.id]) return res.sendStatus(409);
    var newRoom = {
      roomId: room.id,
      name: room.name,
      chartCount,
      tickers: {},
      activeTickers: []
    };
    var standardTickers = ['ETH/USDT', 'BTC/USDT', 'LTC/USDT', 'LINK/USDT'];

    for (var i = 0; i < chartCount; i++) {
      var ticker = standardTickers[i];
      newRoom.tickers[ticker] = [];
      newRoom.activeTickers.push(ticker);
    }

    yield _db.db.collection("rooms").doc(room.id).set(newRoom);
    newRoom.users = [];
    _server.rooms[room.id] = newRoom;
    res.sendStatus(200);
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
var _default = router;
exports.default = _default;
//# sourceMappingURL=room.js.map