import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/archive/:year?',
      name: 'archive',
      component: () => import('@/views/ArchiveView.vue'),
      props: true,
    },
    {
      path: '/type/:type',
      name: 'type',
      component: () => import('@/views/TypeView.vue'),
      props: true,
    },
    {
      path: '/entry/:id',
      name: 'record',
      component: () => import('@/views/RecordDetailView.vue'),
      props: true,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

export default router
