<template>
  <div class="chart-wrapper" :class="{ multiple: tickers.length > 1 }">
    <chart
      v-for="ticker in tickers"
      :key="ticker"
      :ticker="ticker"
      :trade="lastRates[ticker.replace('/', '')]"/>
  </div>
</template>

<script>
import Chart from "@/components/chart/Chart";

export default {
  props: ["tickers"],
  components: {
    Chart
  },
  data() {
    return {
      tradeStreams: undefined,
      lastRates: {}
    }
  },
  mounted() {
    const streams = this.tickers.reduce((acc, curr) => acc + '/' + curr.toLowerCase().replace('/', '') + '@aggTrade', '');
    this.tradeStreams = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams.substring(1)}`);
    this.tradeStreams.onmessage = trade => {
      const data = JSON.parse(trade.data).data;
      const updateTrade = {
        rate: Number(data.p),
        volume: Number(data.q) 
      }

      const inObj = !!this.lastRates[data.s];
      this.lastRates[data.s] = updateTrade;

      if(!inObj) this.lastRates = JSON.parse(JSON.stringify(this.lastRates));
    }
  },
  methods: {
    resize() {
      this.resized += 1
    }
  }
};
</script>

<style lang="scss" scoped>
.chart-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  height: 100vh;
  max-width: 100vw;
  overflow-x: hidden;
}

.multiple {
  grid-template-columns: 1fr 1fr;
}
</style>