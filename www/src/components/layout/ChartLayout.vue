<template>
  <div class="chart-wrapper" :class="{ multiple: tickers.length > 1 }">
    <chart
      v-for="ticker in tickers"
      :key="ticker"
      :ticker="ticker"/>
  </div>
</template>

<script>
import Chart from "@/components/chart/Chart";

export default {
  components: {
    Chart
  },
  computed: {
    tickers() {
      return this.$store.getters.tickers;
    }
  },
  data() {
    return {
      tradeStreams: undefined
    }
  },
  mounted() {
    this.$store.dispatch('initialWSSubscribe');
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