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
  },
  {
    path: '/sms',
    name: 'SMS',
    component: () => import('../views/SmsView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
