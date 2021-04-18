import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

/* eslint-disable no-new */
const store = new Vuex.Store({
  state: {
    tickers: ['ETH/USDT', 'NULS/USDT', 'GBP/USDT', 'BTC/USDT'],
    binanceSocket: undefined,
    trades: {}
  },
  getters: {
    tickers: state => state.tickers,
    trades: state => state.trades
  },
  mutations: {
    SET_WEBSOCKET(state, payload) {
      state.binanceSocket = payload;
    },
    SET_TRADE(state, payload) {
      const exists = !!state.trades[payload.ticker];
      state.trades[payload.ticker] = payload.trade;
      if(!exists) {
        state.trades = JSON.parse(JSON.stringify(state.trades));
      }
    }
  },
  actions: {
    initialWSSubscribe({ commit, state }) {
      const streams = state.tickers.reduce((acc, curr) => acc + '/' + curr.toLowerCase().replace('/', '') + '@aggTrade', '');
      commit('SET_WEBSOCKET', new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams.substring(1)}`));
      state.binanceSocket.onmessage = trade => {
        const data = JSON.parse(trade.data).data;
        commit('SET_TRADE', { ticker: data.s, trade: {
          rate: Number(data.p),
          volume: Number(data.q),
          date: Date.now()
        }});
      }
    }
  }
});

export default store;
