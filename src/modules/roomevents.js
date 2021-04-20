import { rooms } from '../server';

export function joinRoom(io, socket, roomId, username) {
  if(!roomId) return io.to(socket.id).emit('joined', { roomId: 'NO_ID' });
  const room = rooms[roomId];
  if(!room) return io.to(socket.id).emit('joined', { roomId: 'NO_ROOM_WITH_ID' });

  socket.join(roomId);
  if(room.users) {
    room.users = room.users.filter(u => u.username !== username);
    room.users.push({ id: socket.id, username });
    io.to(roomId).emit('new_user', { roomId, user: { id: socket.id, username } });
  } else {
    room.users = [{ id: socket.id, username }];
    io.to(roomId).emit('new_user', { roomId, user: { id: socket.id, username } });
  }
  io.to(socket.id).emit('joined', room);
}

export function leaveRoom(io, socket, roomId) {
  socket.leave(roomId);

  const room = rooms[roomId];
  if(room && room.users) {
    room.users = room.users.filter(u => u.id !== socket.id);
    io.to(roomId).emit('remove_user', { roomId, id: socket.id });
  }
}

export function disconnectClient(io, socket) {
  const roomId = Object.keys(rooms).find(key => rooms[key].users ? rooms[key].users.find(u => u.id === socket.id) : false);
  if(roomId) {
    io.to(roomId).emit('remove_user', { roomId, id: socket.id });
  }
}