<template>
  <div class="wrapper">
    <collaborator-list/>
    <chart-layout/>
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
  grid-template-columns: 1fr;
}
</style>