<template>
  <div class="wrapper">
    <collaborator-list/>
    <chart-layout :tickers="['ETH/USDT', 'BNB/USDT', 'tt']"/>
  </div>
</template>

<script>
import CollaboratorList from '@/components/layout/CollaboratorList';
import ChartLayout from '@/components/layout/ChartLayout';

export default {
  components: { CollaboratorList, ChartLayout }
}
</script>

<style lang="scss" scoped>
.wrapper {
  display: grid;
  grid-template-columns: 300px 1fr;
}
</style>