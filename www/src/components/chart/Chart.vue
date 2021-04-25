<template>
  <div class="wrapper">
    <top-bar
      :ticker="ticker"
      :timeframe="timeframe"
      :selectTf="selectTf"
      v-on:select-new-tf="bool => bool ? selectTf = false : selectTf = !selectTf"
      v-on:select-tf="tf => selectTimeframe(tf)"
      v-on:select-ticker="ticker => selectTicker(ticker)"/>
    <div @click="selectTf = false" style="width: 100%; height: calc(100% - 50px)" :ref="chartId">
      <trading-vue
        ref="chart"
        :timezone="new Date().getTimezoneOffset() / 60 * -1"
        :title-txt="ticker"
        :data="chart"
        :height="height"
        :width="width"
        :tf="timeframe"
        :toolbar="true"
        v-on:tool-selected="change"
        v-on:register-tools="change"
        v-on:remove-tool="change"
        v-on:change-settings="change"
      />
    </div>
  </div>
</template>

<script>
import { TradingVue, DataCube } from 'trading-vue-js';
import { v4 as uuidv4 } from 'uuid';

import TopBar from './TopBar';

export default {
  props: ['initialticker'],
  components: { TradingVue, TopBar },
  computed: {
    trades() {
      return this.$store.getters.trades;
    },
    rooms() {
      return this.$store.getters.rooms;
    },
    roomId() {
      return this.$store.getters.roomId;
    },
    room() {
      return this.rooms[this.roomId];
    }
  },
  data() {
    return {
      chart: new DataCube(),
      height: 200,
      width: 200,
      timeframe: '1h',
      container: undefined,
      prevOnchart: undefined,
      clientId: undefined,
      chartId: uuidv4(),
      selectTf: false,
      tickerInput: undefined,
      ticker: JSON.parse(JSON.stringify(this.initialticker)),
      socketId: this.$socket.id,
      movingItem: undefined,
      checkMovingInterval: -1,
      ready: false
    };
  },
  sockets: {
    add_item(payload) {
      if(!this.isNewEvent(payload, true)) return;
      this.chart.data.onchart.push(payload.data);
      this.reinitPins();
    },
    change_ticker(config) {
      if(config.old !== this.ticker) return;
      this.$store.dispatch('editTicker', config);
      this.ticker = config.new;
    },
    move_item(payload) {
      if(!this.isNewEvent(payload, false)) return;
      this.chart.set(payload.data.id, payload.data);
      this.reinitPins();
    },
    del_item(payload) {
      if(!this.isNewEvent(payload, false)) return;
      this.chart.del(payload.data.id);
    }
  },
  mounted() {
    this.setCandles(this.ticker, this.timeframe);
    this.clientId = uuidv4();
    this.container = this.$refs[this.chartId].getBoundingClientRect();
    this.height = this.container.height;
    this.width = this.container.width;
    window.addEventListener('resize', this.onResize);
    this.checkMovingInterval = setInterval(() => this.checkMovingItem(), 500);
  },
  beforeDestroy() {
    clearInterval(this.checkMovingInterval);
  },
  methods: {
    setCandles(ticker, timeframe) {
      fetch(`${process.env.VUE_APP_API_HOSTNAME}/klines/${ticker.replace('/', '')}/${timeframe}`)
        .then(response => response.json())
        .then(candles => {
          this.chart.set('chart.data', candles.map(candle => candle.slice(0, 5).map(c => Number(c))));
          this.chart.update({
            price: Number(candles[candles.length - 1][4]),
            volume: 0
          });
          this.chart.tv.resetChart();
          this.addDrawings();
        });
    },
    addDrawings() {
      const drawings = this.room.tickers[this.ticker];
      if(drawings && drawings.length > 0) {
        drawings.forEach(drawing => {
          if(!this.chart.data.onchart.find(tool => tool.settings['$uuid'] === drawing.settings['$uuid'])) {
            this.chart.data.onchart.push(drawing);
          }
        });
        this.reinitPins();
        this.ready = true;
      }
    },
    checkMovingItem() {
      if(!this.movingItem) return;
      if(this.movingItem.date > Date.now()) return;
      this.$socket.emit('moved_item', this.movingItem);
      this.movingItem = undefined;
    },
    selectTicker(ticker) {
      const config =  { old: this.ticker, new: ticker, roomId: this.roomId };
      this.$store.dispatch('editTicker', config);
      this.$socket.emit('change_ticker', config);
      this.ticker = ticker;
    },
    selectTimeframe(tf) {
      this.timeframe = tf;
      this.setCandles(this.ticker, tf);
      this.selectTf = false;
    },
    onResize() {
      this.height = this.$refs[this.chartId].getBoundingClientRect().height;
      this.width = this.$refs[this.chartId].getBoundingClientRect().width;
    },
    reinitPins() {
      let ovs = this.chart.tv.$refs.chart.$refs.sec[0]
        .$refs.grid
        .$children.filter(x => x.tool)

      for (const ov of ovs) {
        ov.pins.forEach(x => x.re_init())
      }
    },
    change(e) {
      const prev = this.prevOnchart ? JSON.parse(JSON.stringify(this.prevOnchart)) : undefined;
      const onchart = JSON.parse(JSON.stringify(this.chart.data.onchart));

      if(onchart.length <= 0) return;
      this.prevOnchart = onchart;

      // Look for changes in the onchart array (hacky, but the only way to detect)
      if(!prev || prev.length === 0) {
        const data = onchart[0];
        data.settings.p1 = e.p1;
        data.settings.p2 = e.p1;
        this.addItem(data);
      } else if(prev.length < onchart.length) {
        this.addItem(onchart[onchart.length - 1]);
      } else if(JSON.stringify(prev) !== JSON.stringify(onchart)) {
        const changed = prev.find((item, i) => JSON.stringify(onchart[i]) !== JSON.stringify(item));
        this.moveItem(changed);
      }
    },
    addItem(data) {
      data.settings.$state = 'finished';
      data.settings.$selected = false;
      this.emitDrawChange({
        type: 'add_item',
        data,
        ticker: this.ticker
      });
    },
    moveItem(data) {
      data.settings.$state = 'finished';
      data.settings.$selected = false;

      this.movingItem = {
        date: Date.now() + 500,
        data,
        roomId: this.roomId,
        ticker: this.ticker
      };

      this.emitDrawChange({
        type: 'move_item',
        data,
        ticker: this.ticker
      });
    },
    emitDrawChange(change) {
      this.$socket.emit(change.type, {
        ticker: change.ticker,
        data: change.data,
        clientId: this.clientId,
        socketId: this.socketId,
        roomId: this.roomId
      });
    },
    isNewEvent(payload, bool) {
      if(payload.clientId === this.clientId) return false;
      if(payload.ticker !== this.ticker) return false;
      const item = this.chart.get_one(payload.data.id);
      if(bool ? item : !item) return false;
      return true;
    }
  },
  watch: {
    trades: {
      deep: true,
      handler(val) {
        const ticker = this.ticker.replace('/', '')
        const value = val[ticker];
        if(!value) return;

        this.chart.update({
          price: value.rate,
          volume: value.volume
        }); 
      }
    },
    'chart.data.onchart'(val) {
      if(!val || !this.prevOnchart) return;
      if(val.length < this.prevOnchart.length) {
        const onchart = JSON.parse(JSON.stringify(this.chart.data.onchart));
        const deleted = this.prevOnchart.filter(overlay => {
          return !val.find(v => v.id === overlay.id)
        });

        if(!deleted || !deleted[0]) return;

        this.emitDrawChange({
          type: 'del_item',
          data: deleted[0],
          ticker: this.ticker
        });
        this.prevOnchart = onchart;
      }
    },
    ticker(val) {
      this.setCandles(val, this.timeframe);
    }
  }
};
</script>

<style lang="scss" scoped>
div {
  width: 100%;
  max-width: 100%;
}

.wrapper {
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
}
</style>