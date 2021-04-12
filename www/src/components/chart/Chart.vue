<template>
  <div :class="ticker.toLowerCase().replace('/', '')">
    <trading-vue
      :data="this.$data"
      :height="height"
      :width="width"
    />
  </div>
</template>

<script>
import TradingVue from "trading-vue-js";

export default {
  props: ['ticker', 'resized'],
  components: { TradingVue },
  data() {
    return {
      ohlcv: [
        [1551128400000, 33, 37.1, 14, 14, 196],
        [1551132000000, 13.7, 30, 6.6, 30, 206],
        [1551135600000, 29.9, 33, 21.3, 21.8, 74],
        [1551139200000, 21.7, 25.9, 18, 24, 140],
        [1551142800000, 24.1, 24.1, 24, 24.1, 29],
      ],
      height: 200,
      width: 200
    };
  },
  mounted() {
    const container = document.querySelector(`.${this.ticker.toLowerCase().replace('/', '')}`);
    setTimeout(() => this.onResize(container), 100);
    window.addEventListener('resize', this.onResize(container));
  },
  methods: {
    onResize() {
      this.$nextTick(() => {
        const container = document.querySelector(`.${this.ticker.toLowerCase().replace('/', '')}`);
        const box = container.getBoundingClientRect();
        this.height = box.height;
        this.width = box.width;
      });
    }
  },
  watch: {
    resized() {
      this.onResize();
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