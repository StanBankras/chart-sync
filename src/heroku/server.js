"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rooms = void 0;

var _express = _interopRequireDefault(require("express"));

var _path = _interopRequireDefault(require("path"));

var _http = require("http");

var _cors = _interopRequireDefault(require("cors"));

var _socket = _interopRequireDefault(require("socket.io"));

var _index = _interopRequireDefault(require("./routes/index"));

var _room = _interopRequireDefault(require("./routes/room"));

var _chartevents = require("./modules/chartevents");

var _roomevents = require("./modules/roomevents");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express.default)();
var server = (0, _http.createServer)(app);
var io = (0, _socket.default)(server, {
  cors: {
    origin: "http://localhost:".concat(process.env.PORT || '8080'),
    methods: ["GET", "POST"]
  }
});
var rooms = {};
exports.rooms = rooms;
var port = process.env.PORT || 3000;
app.use(_express.default.json());
app.use((0, _cors.default)());
app.use(_express.default.static(_path.default.join('..', 'www', 'dist')));
app.use('/', _index.default);
app.use('/', _room.default);
io.on('connection', socket => {
  socket.on('change_ticker', data => (0, _chartevents.changeTicker)(io, data));
  socket.on('del_item', data => (0, _chartevents.deleteTool)(io, data));
  socket.on('move_item', data => io.to(data.roomId).emit('move_item', data));
  socket.on('moved_item', data => (0, _chartevents.movedItem)(io, data));
  socket.on('add_item', data => (0, _chartevents.addItem)(io, data));
  socket.on('join', (_ref) => {
    var {
      roomId,
      username
    } = _ref;
    return (0, _roomevents.joinRoom)(io, socket, roomId, username);
  });
  socket.on('leave', roomId => (0, _roomevents.leaveRoom)(io, socket, roomId));
  socket.on('disconnect', () => (0, _roomevents.disconnectClient)(io, socket));
});
server.listen(port, () => console.log("listening on ".concat(port)));
//# sourceMappingURL=server.js.map