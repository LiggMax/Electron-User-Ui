import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    redirect: '/project'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/project-details',
    name: 'ProjectDetails',
    component: () => import('../views/project/ProjectDetails.vue')
  },
  {
    path: '/sse',
    name: 'SSE',
    component:() => import('../views/SSE.vue')
  },
  {
    path: '/announcement-detail',
    name: 'AnnouncementDetail',
    component: () => import('../views/announcement/AnnouncementDetail.vue')
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'project',
        name: 'Project',
        component: () => import('../views/project/ProjectList.vue'),
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
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('../views/UserView.vue'),
        meta: {
          title: '个人中心',
          activeMenu: 'user'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 确保组件正确加载
  if (to.matched.length === 0) {
    // 如果没有匹配到路由，重定向到项目列表
    next('/project');
  } else {
    next();
  }
});

export default router
