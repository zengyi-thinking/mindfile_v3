import { createRouter, createWebHistory } from 'vue-router'

// 使用动态导入实现路由懒加载
// 这样可以将每个路由组件打包成单独的chunk，减少首次加载时间
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "login" */ '../views/Login.vue'),
    meta: { title: '登录', keepAlive: false }
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ '../views/Dashboard.vue'),
    meta: { title: '仪表板', keepAlive: true }
  },
  {
    path: '/mindmap',
    name: 'MindMap',
    component: () => import(/* webpackChunkName: "mindmap" */ '../views/MindMap.vue'),
    meta: { title: '思维导图', keepAlive: true }
  },
  {
    path: '/tag-mindmap',
    name: 'TagMindMapSearch',
    component: () => import(/* webpackChunkName: "tag-mindmap" */ '../views/TagMindMapSearch.vue'),
    meta: { title: '思维导图搜索', keepAlive: true }
  },
  {
    path: '/mindmap/:id',
    name: 'MindMapView',
    component: () => import(/* webpackChunkName: "mindmap-view" */ '../views/MindMapView.vue'),
    meta: { title: '思维导图查看', keepAlive: true }
  },
  {
    path: '/materials',
    name: 'Materials',
    component: () => import(/* webpackChunkName: "materials" */ '../views/Materials.vue'),
    meta: { title: '资料管理', keepAlive: true }
  },
  {
    path: '/materials/:id',
    name: 'MaterialDetail',
    component: () => import(/* webpackChunkName: "material-detail" */ '../views/MaterialDetail.vue'),
    meta: { title: '资料详情', keepAlive: true }
  },
  {
    path: '/admin/materials',
    name: 'AdminMaterials',
    component: () => import(/* webpackChunkName: "admin-materials" */ '../views/AdminMaterials.vue'),
    meta: { 
      title: '管理员资料管理',
      requiresAdmin: true,
      keepAlive: true
    }
  },
  {
    path: '/forum',
    name: 'Forum',
    component: () => import(/* webpackChunkName: "forum" */ '../views/Forum.vue'),
    meta: { title: '讨论交流', keepAlive: true }
  },
  {
    path: '/forum/detail/:id',
    name: 'ForumDetail',
    component: () => import(/* webpackChunkName: "forum-detail" */ '../views/ForumDetail.vue'),
    meta: { title: '讨论详情', keepAlive: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import(/* webpackChunkName: "profile" */ '../views/Profile.vue'),
    meta: { title: '个人中心', keepAlive: true }
  }
]

const router = createRouter({
  history: createWebHistory('/mindfile_v3/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 预加载组件缓存
const componentCache = {}

// 预加载下一个可能的路由 - 优化预加载策略
const preloadRouteComponents = (to) => {
  // 根据当前路由预测可能访问的下一个路由
  const preloadMap = {
    '/login': ['/dashboard'],
    '/dashboard': ['/mindmap', '/materials', '/forum', '/profile'],
    '/mindmap': ['/tag-mindmap', '/dashboard', '/mindmap/:id'],
    '/tag-mindmap': ['/mindmap', '/dashboard'],
    '/materials': ['/dashboard', '/forum', '/materials/:id'],
    '/forum': ['/dashboard', '/materials', '/forum/detail/:id'],
    '/profile': ['/dashboard'],
    '/admin/materials': ['/dashboard', '/materials']
  }
  
  const routesToPreload = preloadMap[to.path] || []
  
  // 立即预加载当前路由组件
  const currentRoute = routes.find(r => r.path === to.path)
  if (currentRoute && currentRoute.component && !componentCache[to.path]) {
    componentCache[to.path] = currentRoute.component()
  }
  
  // 使用requestIdleCallback预加载可能的下一个路由
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      routesToPreload.forEach(path => {
        // 处理动态路由
        let routePath = path
        if (path.includes(':id')) {
          const basePath = path.split('/:')[0]
          const matchingRoute = routes.find(r => r.path.startsWith(basePath) && r.path.includes(':id'))
          if (matchingRoute) {
            routePath = matchingRoute.path
          }
        }
        
        const route = routes.find(r => r.path === routePath)
        if (route && route.component && !componentCache[routePath]) {
          componentCache[routePath] = route.component()
        }
      })
    }, { timeout: 300 }) // 减少超时时间，确保更快地预加载
  }
}

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
      // 路由解析完成后预加载可能的下一个路由
      preloadRouteComponents(to)
    } else {
      // 如果不是管理员，重定向到首页
      next('/dashboard')
    }
  } else {
    next()
    // 路由解析完成后预加载可能的下一个路由
    preloadRouteComponents(to)
  }
})

export default router
