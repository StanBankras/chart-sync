"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.saveRoom = saveRoom;
exports.db = void 0;

var _dotenv = _interopRequireDefault(require("dotenv"));

var _firebase = _interopRequireDefault(require("firebase"));

var _server = require("../server");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

_dotenv.default.config();

_firebase.default.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID
});

var db = _firebase.default.firestore(); // Get rooms from firestore database with all data
// Store them in memory


exports.db = db;

_asyncToGenerator(function* () {
  var data = yield db.collection('rooms').get();
  data.docs.forEach(doc => _server.rooms[doc.id] = doc.data());
})();

function saveRoom(_x, _x2) {
  return _saveRoom.apply(this, arguments);
}

function _saveRoom() {
  _saveRoom = _asyncToGenerator(function* (documentId, object) {
    var copy = JSON.parse(JSON.stringify(object));
    delete copy.users;
    yield db.collection("rooms").doc(documentId).update(copy);
  });
  return _saveRoom.apply(this, arguments);
}
//# sourceMappingURL=db.js.map