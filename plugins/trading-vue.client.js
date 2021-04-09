import Vue from 'vue'
import TradingVue from 'trading-vue-js'
import { DataCube } from 'trading-vue-js'


Vue.use(TradingVue)

export default ({ app }, inject) => {
    inject('DataCube', DataCube)
}
