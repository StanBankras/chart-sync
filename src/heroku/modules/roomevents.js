"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.joinRoom = joinRoom;
exports.leaveRoom = leaveRoom;
exports.disconnectClient = disconnectClient;

var _server = require("../server");

function joinRoom(io, socket, roomId, username) {
  if (!roomId) return io.to(socket.id).emit('joined', {
    roomId: 'NO_ID'
  });
  var room = _server.rooms[roomId];
  if (!room) return io.to(socket.id).emit('joined', {
    roomId: 'NO_ROOM_WITH_ID'
  });
  socket.join(roomId);

  if (room.users) {
    room.users = room.users.filter(u => u.username !== username);
    room.users.push({
      id: socket.id,
      username
    });
    io.to(roomId).emit('new_user', {
      roomId,
      user: {
        id: socket.id,
        username
      }
    });
  } else {
    room.users = [{
      id: socket.id,
      username
    }];
    io.to(roomId).emit('new_user', {
      roomId,
      user: {
        id: socket.id,
        username
      }
    });
  }

  io.to(socket.id).emit('joined', room);
}

function leaveRoom(io, socket, roomId) {
  socket.leave(roomId);
  var room = _server.rooms[roomId];

  if (room && room.users) {
    room.users = room.users.filter(u => u.id !== socket.id);
    io.to(roomId).emit('remove_user', {
      roomId,
      id: socket.id
    });
  }
}

function disconnectClient(io, socket) {
  var roomId = Object.keys(_server.rooms).find(key => _server.rooms[key].users ? _server.rooms[key].users.find(u => u.id === socket.id) : false);

  if (roomId) {
    io.to(roomId).emit('remove_user', {
      roomId,
      id: socket.id
    });
  }
}
//# sourceMappingURL=roomevents.js.map