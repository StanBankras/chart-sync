<template>
  <div class="wrapper">
    <collaborator-list/>
    <chart-layout :tickers="['ETH/USDT', 'BNB/USDT']"/>
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
</style>