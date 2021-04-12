<template>
  <div>
    <grid-layout
      :layout.sync="gridItems"
      :col-num="2"
      :row-num="2"
      :row-height="height"
      :maxRows="2"
      :is-draggable="false"
      :is-resizable="true"
      :is-mirrored="false"
      :vertical-compact="true"
      :responsive="true"
      :use-css-transforms="true"
      :margin="[0, 0]"
    >
      <grid-item
        v-for="item in gridItems" :key="item.ticker"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
        @resized="resize"
      >
        <chart :resized="resized" :ticker="item.ticker || ''"/>
      </grid-item>
    </grid-layout>
  </div>
</template>

<script>
import VueGridLayout from "vue-grid-layout";

import Chart from "@/components/chart/Chart";

export default {
  props: ["tickers"],
  components: {
    Chart,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
  },
  data() {
    return {
      height: 300,
      gridItems: [],
      resized: 0,
      tradeStreams: undefined
    }
  },
  mounted() {
    const streams = this.tickers.reduce((acc, curr) => acc + '/' + curr.toLowerCase().replace('/', '') + '@aggTrade', '');
    this.tradeStreams = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams.substring(1)}`);
    this.tradeStreams.onmessage = trade => console.log(JSON.parse(trade.data).data);

    this.setTickerGrid();

    setTimeout(() => {
      const height = document.querySelector('body').getBoundingClientRect().height;
      this.height = height / 2;
    }, 50);
  },
  methods: {
    resize() {
      this.resized += 1
    },
    setTickerGrid() {
      this.gridItems = this.tickers.map((t, i) => {
        return {
          ticker: t,
          x: i % 2 === 0 ? 0 : 6,
          y: i === 0 ? 0 : i === 1 ? 0 : 1,
          w: 6,
          h: 1,
          i          
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.chart-wrapper {
  display: grid;
  grid-template-columns: 1fr;
}

.multiple {
  grid-template-columns: 1fr 1fr;
}
</style>