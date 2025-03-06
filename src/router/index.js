import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: '仪表板' }
  },
  {
    path: '/mindmap',
    name: 'MindMap',
    component: () => import('../views/MindMap.vue'),
    meta: { title: '思维导图' }
  },
  {
    path: '/materials',
    name: 'Materials',
    component: () => import('../views/Materials.vue'),
    meta: { title: '资料管理' }
  },
  {
    path: '/admin/materials',
    name: 'AdminMaterials',
    component: () => import('../views/AdminMaterials.vue'),
    meta: { 
      title: '管理员资料管理',
      requiresAdmin: true
    }
  },
  {
    path: '/forum',
    name: 'Forum',
    component: () => import('../views/Forum.vue'),
    meta: { title: '讨论交流' }
  },
  {
    path: '/forum/detail/:id',
    name: 'ForumDetail',
    component: () => import('../views/ForumDetail.vue'),
    meta: { title: '讨论详情' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { title: '个人中心' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 思维导图系统` : '思维导图系统'
  
  // 检查用户是否已登录
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  
  // 如果用户未登录且访问的不是登录页，则重定向到登录页
  if (!isLoggedIn && to.path !== '/login') {
    next('/login')
  } else if (isLoggedIn && to.path === '/login') {
    // 如果用户已登录且访问登录页，则重定向到首页
    next('/dashboard')
  } else if (to.meta.requiresAdmin) {
    // 检查用户是否为管理员
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
    if (currentUser.role === '管理员') {
      next()
    } else {
      // 如果不是管理员，重定向到首页
      next('/dashboard')
    }
  } else {
    next()
  }
})

export default router