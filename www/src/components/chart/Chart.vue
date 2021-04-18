<template>
  <div class="wrapper">
    <div @click.self="selectTf = false" class="topbar">
      <input type="text" :placeholder="ticker" id="ticker" v-model="tickerInput">
      <div class="timeframe">
        <div @click="selectTf = !selectTf" class="selected">{{ timeframe }}</div>
        <div :class="{ show: selectTf }" class="timeframes">
          <div
            v-for="tf in timeframes"
            :key="tf"
            @click="selectTimeframe(tf)">{{ tf }}</div>
        </div>
      </div>
    </div>
    <div @click="selectTf = false" style="width: 100%; height: calc(100% - 50px)" :ref="chartId">
      <trading-vue
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

export default {
  props: ['ticker'],
  components: { TradingVue },
  computed: {
    trades() {
      return this.$store.getters.trades;
    }
  },
  data() {
    return {
      chart: new DataCube(),
      height: 200,
      width: 200,
      timeframe: '1m',
      container: undefined,
      prevOnchart: undefined,
      clientId: undefined,
      chartId: uuidv4(),
      timeframes: [
        '1m', '3m', '5m', '15m', '30m',
        '1h', '2h', '4h', '6h', '12h',
        '1d', '3d', '1w', '1M'
      ],
      selectTf: false,
      tickerInput: undefined
    };
  },
  sockets: {
    add_item(payload) {
      if(!this.isNewEvent(payload, true)) return;
      this.chart.data.onchart.push(payload.data);
      this.reinitPins();
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
  },
  methods: {
    setCandles(ticker, timeframe) {
      fetch(`${process.env.VUE_APP_API_HOSTNAME}/klines/${ticker.replace('/', '')}/${timeframe}`)
        .then(response => response.json())
        .then(candles => {
          this.chart.set('chart.data', candles.map(candle => candle.slice(0, 5).map(c => Number(c))));
          this.chart.tv.resetChart();
        });
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

      if(!prev || prev.length === 0) {
        const data = onchart[0];
        data.settings.p1 = e.p1;
        data.settings.p2 = e.p1;
        data.settings.$state = 'finished';
        data.settings.$selected = false;
        this.emitDrawChange({
          type: 'add_item',
          data,
          ticker: this.ticker
        });
      } else if(prev.length < onchart.length) {
        const data = onchart[onchart.length - 1];
        data.settings.$state = 'finished';
        data.settings.$selected = false;
        this.emitDrawChange({
          type: 'add_item',
          data,
          ticker: this.ticker
        });
      } else if(JSON.stringify(prev) !== JSON.stringify(onchart)) {
        const changed = prev.find((item, i) => JSON.stringify(onchart[i]) !== JSON.stringify(item));
        changed.settings.$state = 'finished';
        changed.settings.$selected = false;
        this.emitDrawChange({
          type: 'move_item',
          data: changed,
          ticker: this.ticker
        });
      }
      this.prevOnchart = onchart;
    },
    emitDrawChange(change) {
      this.$socket.emit(change.type, { ticker: change.ticker, data: change.data, clientId: this.clientId });
    },
    isNewEvent(payload, bool) {
      if(payload.clientId === this.clientId) return false;
      if(payload.ticker !== this.ticker) return false;
      const item = this.chart.get_one(payload.data.id);
      if(bool ? item : !item) return false;
      return true;
    },
    selectTimeframe(tf) {
      this.timeframe = tf;
      this.setCandles(this.ticker, tf);
      this.selectTf = false;
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

.topbar {
  color: white;
  padding-left: 56px;
  border-bottom: 1px solid #2a2e39;
  display: flex;
  > * {
    border-right: 1px solid #2a2e39;
    &:first-child {
      border-left: 1px solid #2a2e39;
    }
  }
  .timeframe {
    position: relative;
    width: 50px;
    height: 50px;
    .selected {
      height: 100%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 1rem;
      color: #787b86;
      cursor: pointer;
      transition: .3s;
      &:hover {
        background-color: #191e2c;
      }
    }
    .timeframes {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      transform: translateY(100%);
      z-index: 1000;
      max-height: 0;
      overflow: hidden;
      &.show {
        overflow: unset;
        max-height: unset;
      }
      div {
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem 1rem;
        color: #787b86;
        background-color: #131721;
        cursor: pointer;
        transition: .3s;
        &:hover {
          background-color: #191e2c;
        }
      }
    }
  }
  #ticker {
    height: 50px;
    padding: 0.5rem 1rem;
    background-color: #131721;
    border: none;
    color: #787b86;
    border-right: 1px solid #2a2e39;
    border-left: 1px solid #2a2e39;
    font-weight: bold;
    &::placeholder {
      color: #787b86;
      font-weight: bold;
    }
    &:focus {
      outline: 1px solid #2a2e39;
    }
  }
}
</style>