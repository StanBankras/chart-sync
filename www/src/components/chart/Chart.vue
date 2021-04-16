<template>
  <div style="width: 100%; height: 100%" :ref="ticker">
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
</template>

<script>
import { TradingVue, DataCube } from 'trading-vue-js';
import { v4 as uuidv4 } from 'uuid';

export default {
  props: ['ticker', 'trade'],
  components: { TradingVue },
  data() {
    return {
      chart: new DataCube(),
      height: 200,
      width: 200,
      timeframe: '1m',
      container: undefined,
      prevOnchart: undefined,
      clientId: undefined
    };
  },
  sockets: {
    add_item(payload) {
      if(!this.isNewEvent(payload, true)) return;
      this.chart.data.onchart.push(payload.data);
    },
    move_item(payload) {
      if(!this.isNewEvent(payload, false)) return;
      this.chart.set(payload.data.id, payload.data);
    },
    del_item(payload) {
      if(!this.isNewEvent(payload, false)) return;
      this.chart.del(payload.data.id);
    }
  },
  mounted() {
    fetch(`${process.env.VUE_APP_API_HOSTNAME}/klines/${this.ticker.replace('/', '')}/${this.timeframe}`)
      .then(response => response.json())
      .then(candles => this.chart.set('chart.data', candles.map(candle => candle.slice(0, 5).map(c => Number(c)))));

    this.clientId = uuidv4();
    this.container = this.$refs[this.ticker].getBoundingClientRect();
    this.height = this.container.height;
    this.width = this.container.width;

    window.addEventListener('resize', this.onResize);
  },
  methods: {
    onResize() {
      this.height = this.container.height;
      this.width = this.container.width;
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
    }
  },
  watch: {
    trade(val) {
      this.chart.update({
        price: val.rate,
        volume: val.volume
      });  
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
  overflow: hidden;
  height: 100%;
  max-height: 100%;;
}
</style>