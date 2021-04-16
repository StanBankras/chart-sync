import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

/* eslint-disable no-new */
const store = new Vuex.Store({
  state: {
    tickers: ['ETH/USDT', 'BTC/USDT']
  },
  getters: {
    tickers: state => state.tickers
  },
  mutations: {
  },
  actions: {
    'SOCKET_test'() {
      console.log('test');
    }
  }
});

export default store;
