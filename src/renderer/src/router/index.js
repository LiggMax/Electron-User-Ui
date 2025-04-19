import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/project',
    name: 'Project',
    component: () => import('../views/ProjectList.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
