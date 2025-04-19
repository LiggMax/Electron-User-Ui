import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../views/Login.vue'
import ProjectList from '../views/ProjectList.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/project',
    name: 'Project',
    component: ProjectList
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
