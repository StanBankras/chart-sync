import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

/* eslint-disable no-new */
const store = new Vuex.Store({
  state: {
    tickers: ['ETH/USDT', 'NULS/USDT', 'GBP/USDT', 'BTC/USDT'],
    allTickers: [],
    binanceSocket: undefined,
    trades: {}
  },
  getters: {
    tickers: state => state.tickers,
    trades: state => state.trades,
    allTickers: state => state.allTickers
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
    },
    SET_ALL_TICKERS(state, payload) {
      state.allTickers = payload;
    },
    EDIT_TICKERS(state, payload) {
      state.tickers = payload;
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
    },
    loadTickers({ commit }) {
      fetch('https://api.binance.com/api/v3/exchangeInfo')
        .then(response => response.json())
        .then(data => commit('SET_ALL_TICKERS', data.symbols.map(ticker => `${ticker.baseAsset}/${ticker.quoteAsset}`)));
    },
    editTicker({ commit, state }, payload) {
      const index = state.tickers.indexOf(payload.old);
      const tickers = state.tickers;
      tickers[index] = payload.new;
      commit('EDIT_TICKERS', tickers);
    }
  }
});

export default store;
