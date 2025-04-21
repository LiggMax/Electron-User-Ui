import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'project',
        name: 'Project',
        component: () => import('../views/ProjectList.vue'),
        meta: {
          title: '项目列表',
          activeMenu: 'project'
        }
      },
      {
        path: 'sms',
        name: 'SMS',
        component: () => import('../views/SmsView.vue'),
        meta: {
          title: '获取短信',
          activeMenu: 'sms'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
