"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express.default.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'www', 'dist', 'index.html'));
});
router.get('/klines/:pair/:timeframe', (req, res) => {
  (0, _nodeFetch.default)("https://api.binance.com/api/v3/klines?symbol=".concat(req.params.pair, "&interval=").concat(req.params.timeframe)).then(response => response.json()).then(data => res.send(data));
});
var _default = router;
exports.default = _default;
//# sourceMappingURL=index.js.map