<template>
  <section class="chart-wrapper" :class="{ multiple: tickers.length > 1 }">
    <chart v-for="ticker in tickers" :key="ticker"/>
  </section>
</template>

<script>
import Chart from '@/components/chart/Chart';

export default {
  props: ['tickers'],
  components: { Chart }
}
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