<template>
  <div @click.self="$emit('select-new-tf', false)" class="topbar">
    <div class="input">
      <input type="text" :placeholder="ticker" class="ticker" v-model="tickerInput">
      <div class="suggestions" v-if="tickerInput && tickerInput !== ''">
        <div
          v-for="suggestion in suggestions"
          :key="suggestion"
          @click="$emit('select-ticker', suggestion), tickerInput = ''">{{ suggestion }}</div>
      </div>
    </div>
    <div class="timeframe">
      <div @click="$emit('select-new-tf')" class="selected">{{ timeframe }}</div>
      <div :class="{ show: selectTf }" class="timeframes">
        <div
          v-for="tf in timeframes"
          :key="tf"
          @click="$emit('select-tf', tf)">{{ tf }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['ticker', 'timeframe', 'selectTf'],
  computed: {
    allTickers() {
      return this.$store.getters.allTickers;
    },
    tickers() {
      return this.$store.getters.tickers;
    },
    suggestions() {
      return this.allTickers
        .filter(ticker => {
          return (
            ticker.toLowerCase().includes(this.tickerInput.toLowerCase()) ||
            ticker.toLowerCase().replace('/', '').includes(this.tickerInput.toLowerCase())
          );
        })
        .filter(ticker => !this.tickers.includes(ticker))
        .slice(0, 5);
    }
  },
  data() {
    return {
      timeframes: [
        '1m', '3m', '5m', '15m', '30m',
        '1h', '2h', '4h', '6h', '12h',
        '1d', '3d', '1w', '1M'
      ],
      tickerInput: undefined
    }
  }
}
</script>

<style lang="scss" scoped>
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
  .ticker {
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
  .input {
    position: relative;
    .suggestions {
      position: absolute;
      bottom: 0;
      transform: translateY(100%);
      width: 100%;
      z-index: 10000;
      max-height: 400px;
      overflow-y: auto;
      div {
        padding: 0.8rem;
        background-color: #131721;
        border-bottom: 1px solid #2a2e39;
        cursor: pointer;
        transition: .3s;
        &:hover {
          background-color: #191e2c;
        }
      }
    }
  }
}
</style>