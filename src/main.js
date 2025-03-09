import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// 按需导入Element Plus组件和样式
import {
  ElButton,
  ElInput,
  ElSelect,
  ElOption,
  ElCard,
  ElRow,
  ElCol,
  ElTag,
  ElAvatar,
  ElProgress,
  ElIcon,
  ElMessage,
  ElPagination
} from 'element-plus'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/input/style/css'
import 'element-plus/es/components/select/style/css'
import 'element-plus/es/components/option/style/css'
import 'element-plus/es/components/card/style/css'
import 'element-plus/es/components/row/style/css'
import 'element-plus/es/components/col/style/css'
import 'element-plus/es/components/tag/style/css'
import 'element-plus/es/components/avatar/style/css'
import 'element-plus/es/components/progress/style/css'
import 'element-plus/es/components/icon/style/css'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/pagination/style/css'

// 导入图标
import {
  HomeFilled,
  Document,
  ChatDotRound,
  User,
  Setting,
  Share,
  Connection,
  Search,
  Upload,
  Download,
  Delete,
  Picture,
  VideoCamera,
  Files,
  Calendar
} from '@element-plus/icons-vue'

import './assets/styles/main.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)

// 注册Element Plus组件
app.component('ElButton', ElButton)
app.component('ElInput', ElInput)
app.component('ElSelect', ElSelect)
app.component('ElOption', ElOption)
app.component('ElCard', ElCard)
app.component('ElRow', ElRow)
app.component('ElCol', ElCol)
app.component('ElTag', ElTag)
app.component('ElAvatar', ElAvatar)
app.component('ElProgress', ElProgress)
app.component('ElIcon', ElIcon)
app.component('ElPagination', ElPagination)

// 注册图标组件
app.component('HomeFilled', HomeFilled)
app.component('Document', Document)
app.component('ChatDotRound', ChatDotRound)
app.component('User', User)
app.component('Setting', Setting)
app.component('Share', Share)
app.component('Connection', Connection)
app.component('Search', Search)
app.component('Upload', Upload)
app.component('Download', Download)
app.component('Delete', Delete)
app.component('Picture', Picture)
app.component('VideoCamera', VideoCamera)
app.component('Files', Files)
app.component('Calendar', Calendar)

// 全局挂载ElMessage
app.config.globalProperties.$message = ElMessage

// 预加载可能即将访问的组件
const preloadComponents = () => {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      // 预加载常用组件
      import('./views/Dashboard.vue')
      import('./views/MindMap.vue')
    })
  }
}

// 在应用挂载后预加载组件
app.mount('#app')
preloadComponents()