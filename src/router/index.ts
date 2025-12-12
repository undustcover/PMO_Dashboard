import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import FootageStatsView from '../views/FootageStatsView.vue';
import DayRateStatsView from '../views/DayRateStatsView.vue';
import KeyProjectsView from '../views/KeyProjectsView.vue';
import ContractStatsView from '../views/ContractStatsView.vue';
import ProjectStatsView from '../views/ProjectStatsView.vue';
import MarketSigningStatsView from '../views/MarketSigningStatsView.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/footage',
    name: 'FootageStats',
    component: FootageStatsView
  },
  {
    path: '/day-rate',
    name: 'DayRateStats',
    component: DayRateStatsView
  },
  {
    path: '/key-projects',
    name: 'KeyProjects',
    component: KeyProjectsView
  },
  {
    path: '/contracts',
    name: 'ContractStats',
    component: ContractStatsView
  },
  {
    path: '/project-stats',
    name: 'ProjectStats',
    component: ProjectStatsView
  },
  {
    path: '/market-signing',
    name: 'MarketSigningStats',
    component: MarketSigningStatsView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
