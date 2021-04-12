import Vue from 'vue';
import VueRouter from 'vue-router';
import Charts from '../views/Charts.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/charts',
    name: 'Charts',
    component: Charts
  }
];

const router = new VueRouter({
  routes
});

export default router;
