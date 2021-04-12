<template>
  <div style="width: 100%; height: 100%" :ref="ticker">
    <trading-vue
      ref="chart"
      :timezone="new Date().getTimezoneOffset() / 60 * -1"
      :title-txt="ticker"
      :data="chart"
      :height="height"
      :width="width"
      :timeframe="timeframe"
      :toolbar="true"
    />
  </div>
</template>

<script>
import { TradingVue, DataCube } from 'trading-vue-js';

export default {
  props: ['ticker', 'trade'],
  components: { TradingVue },
  data() {
    return {
      chart: new DataCube(),
      height: 200,
      width: 200,
      timeframe: '1m',
      container: undefined
    };
  },
  mounted() {
    fetch(`http://localhost:3000/klines/${this.ticker.replace('/', '')}/${this.timeframe}`)
      .then(response => response.json())
      .then(candles => this.chart.set('chart.data', candles.map(candle => candle.slice(0, 5).map(c => Number(c)))));

    this.container = this.$refs[this.ticker];
    const box = this.container.getBoundingClientRect();
    this.height = box.height;
    this.width = box.width;
    window.addEventListener('resize', this.onResize);
  },
  methods: {
    onResize() {
      const box = this.container.getBoundingClientRect();
      this.height = box.height;
      this.width = box.width;
    }
  },
  watch: {
    trade(val) {
      this.chart.update({
        price: val.rate,
        volume: val.volume
      });  
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