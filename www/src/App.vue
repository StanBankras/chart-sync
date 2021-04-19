<template>
  <div id="app">
    <auth v-if="!roomId || !userName"/>
    <router-view v-else/>
  </div>
</template>

<script>
import Auth from '@/components/layout/Auth';

export default {
  components: { Auth },
  computed: {
    roomId() {
      return this.$store.getters.roomId;
    },
    userName() {
      return this.$store.getters.userName;
    }
  },
  mounted() {
    this.$store.dispatch('initialWSSubscribe');
    this.$store.dispatch('loadTickers');
    this.$store.dispatch('loadUserName');
    this.$store.dispatch('loadRooms');
  }
}
</script>
