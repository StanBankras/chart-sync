<template>
  <div class="wrapper">
    <div class="room-info">
      <p>{{ roomName }} - {{ roomId }}</p>
      <button @click="exitRoom" class="btn">
        Exit room
      </button>
    </div>
    <div class="chart-wrapper" :class="{ multiple: tickers.length > 1 }">
      <chart
        v-for="ticker in tickers"
        :key="ticker"
        :initialticker="ticker"/>
    </div>
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
    },
    rooms() {
      return this.$store.getters.rooms;
    },
    roomId() {
      return this.$store.getters.roomId;
    },
    roomName() {
      return this.rooms[this.roomId].name;
    }
  },
  methods: {
    exitRoom() {
      this.$store.commit('SET_ROOM_ID', undefined);
      this.$socket.emit('leave', this.roomId);
    }
  }
};
</script>

<style lang="scss" scoped>
.chart-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  height: calc(100vh - 47px);
  max-width: 100vw;
  overflow-x: hidden;
}

.room-info {
  padding: 0.5rem;
  background-color: #354364;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.multiple {
  grid-template-columns: 1fr 1fr;
}
</style>