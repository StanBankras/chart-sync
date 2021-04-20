import Vue from 'vue'
import App from './App.vue'
import router from './router'
import SocketIO from 'socket.io-client';
import VueSocketIO from 'vue-socket.io';

import './assets/css/extra.scss';
import store from './store'

Vue.config.productionTip = false

Vue.use(new VueSocketIO({
    debug: false,
    connection: SocketIO(process.env.VUE_APP_API_HOSTNAME),
    vuex: {
        store,
        actionPrefix: 'SOCKET_'
    },
  })
);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
