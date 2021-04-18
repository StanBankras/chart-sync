<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  mounted() {
    this.$store.dispatch('initialWSSubscribe');
    this.$store.dispatch('loadTickers');
  }
}
</script>
