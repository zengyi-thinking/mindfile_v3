<template>
  <div class="app-container">
    <!-- 只在非登录页面显示侧边栏 -->
    <div class="sidebar" v-if="!isLoginPage">
      <div class="logo">
        <el-icon class="logo-icon"><Connection /></el-icon>
        <span>思维导图系统</span>
      </div>
      <nav class="nav-menu">
        <router-link to="/dashboard" class="nav-item">
          <el-icon><HomeFilled /></el-icon>
          <span>仪表板</span>
        </router-link>
        <router-link to="/mindmap" class="nav-item">
          <el-icon><Share /></el-icon>
          <span>思维导图</span>
        </router-link>
        <router-link to="/materials" class="nav-item">
          <el-icon><Document /></el-icon>
          <span>资料管理</span>
        </router-link>
        <router-link to="/forum" class="nav-item">
          <el-icon><ChatDotRound /></el-icon>
          <span>讨论交流</span>
        </router-link>
        <router-link to="/profile" class="nav-item">
          <el-icon><User /></el-icon>
          <span>个人中心</span>
        </router-link>
        <!-- 管理员菜单 -->
        <div class="menu-divider" v-if="isAdmin"></div>
        <div class="menu-category" v-if="isAdmin">管理员功能</div>
        <router-link to="/admin/materials" class="nav-item" v-if="isAdmin">
          <el-icon><Setting /></el-icon>
          <span>资料管理</span>
        </router-link>
      </nav>
    </div>
    <div class="main-content" :class="{ 'full-width': isLoginPage }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled, Document, ChatDotRound, User, Setting, Share, Connection } from '@element-plus/icons-vue'

const route = useRoute()

// 判断当前是否为登录页面
const isLoginPage = computed(() => {
  return route.path === '/login'
})

// 判断当前用户是否为管理员
const isAdmin = computed(() => {
  // 从localStorage获取当前用户信息
  const currentUserStr = localStorage.getItem('currentUser')
  if (currentUserStr) {
    try {
      const currentUser = JSON.parse(currentUserStr)
      return currentUser.role === '管理员'
    } catch (e) {
      console.error('解析用户数据失败', e)
      return false
    }
  }
  return false
})
</script>

<style lang="scss">
.app-container {
  display: flex;
  height: 100vh;
  width: 100%;
  
  .sidebar {
    width: 240px;
    background: linear-gradient(135deg, #1a2a3a, #2c3e50);
    color: white;
    display: flex;
    flex-direction: column;
    box-shadow: 3px 0 20px rgba(0, 0, 0, 0.15);
    position: relative;
    z-index: 10;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    
    .logo {
      padding: 20px;
      font-size: 20px;
      font-weight: bold;
      height: 60px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.1);
      
      .logo-icon {
        font-size: 24px;
        margin-right: 10px;
        color: #409EFF;
        animation: pulse 2s infinite alternate;
      }
    }
    
    .nav-menu {
      display: flex;
      flex-direction: column;
      padding-top: 15px;
      
      .nav-item {
        padding: 14px 20px;
        color: #e0e0e0;
        text-decoration: none;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        display: flex;
        align-items: center;
        border-left: 3px solid transparent;
        margin-bottom: 8px;
        position: relative;
        overflow: hidden;
        
        &:before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 0;
          background: rgba(64, 158, 255, 0.15);
          transition: width 0.3s ease;
          z-index: -1;
        }
        
        .el-icon {
          margin-right: 12px;
          font-size: 18px;
          transition: transform 0.3s ease;
        }
        
        &:hover {
          color: white;
          transform: translateX(5px);
          
          &:before {
            width: 100%;
          }
          
          .el-icon {
            transform: scale(1.2);
          }
        }
        
        &.router-link-active {
          background-color: rgba(64, 158, 255, 0.15);
          color: #409EFF;
          border-left-color: #409EFF;
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
        }
      }
      
      .menu-divider {
        height: 1px;
        background-color: rgba(255, 255, 255, 0.1);
        margin: 15px 0;
      }
      
      .menu-category {
        padding: 10px 20px;
        font-size: 12px;
        color: #909399;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    }
  }
  
  .main-content {
    flex: 1;
    background-color: #f5f7fa;
    background-image: linear-gradient(135deg, rgba(245, 247, 250, 0.9) 0%, rgba(255, 255, 255, 0.9) 100%);
    overflow-y: auto;
    padding: 0;
    position: relative;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    
    &.full-width {
      width: 100%;
    }
  }
}

// 添加过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes pulse {
  0% {
    opacity: 0.8;
    transform: scale(1);
  }
  100% {
    opacity: 1;
    transform: scale(1.05);
  }
}

// 全局样式优化
body {
  margin: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>

