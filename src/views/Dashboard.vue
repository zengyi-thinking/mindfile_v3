<template>
  <div class="dashboard-container">
    <div class="page-header">
      <h1>仪表板</h1>
      <div class="user-info">
        <span>{{ currentUser.username }}</span>
        <el-avatar :size="40" class="avatar">{{ currentUser.avatar }}</el-avatar>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="dashboard-card mindmap-card" @click="navigateTo('/mindmap')">
        <div class="card-header">
          <div class="card-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <h2>思维导图</h2>
        </div>
        <div class="card-content">
          <p>已创建的思维导图: {{ stats.mindmapCount }}</p>
          <p>最近更新: {{ stats.lastUpdate }}</p>
        </div>
      </div>

      <div class="dashboard-card tag-mindmap-card" @click="navigateTo('/tag-mindmap')">
        <div class="card-header">
          <div class="card-icon">
            <el-icon><Connection /></el-icon>
          </div>
          <h2>标签思维导图</h2>
        </div>
        <div class="card-content">
          <p>通过标签查找资料</p>
          <p>可视化展示知识结构</p>
        </div>
      </div>

      <div class="dashboard-card materials-card" @click="navigateTo('/materials')">
        <div class="card-header">
          <div class="card-icon">
            <el-icon><Document /></el-icon>
          </div>
          <h2>学习资料</h2>
        </div>
        <div class="card-content">
          <p>上传的资料: {{ stats.materialsCount }}</p>
          <p>总浏览量: {{ stats.viewCount }}</p>
        </div>
      </div>

      <div class="dashboard-card forum-card" @click="navigateTo('/forum')">
        <div class="card-header">
          <div class="card-icon">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <h2>讨论交流</h2>
        </div>
        <div class="card-content">
          <p>发表的帖子: {{ stats.postCount }}</p>
          <p>收到的回复: {{ stats.replyCount }}</p>
        </div>
      </div>
    </div>

    <div class="recent-activities">
      <h2>最近活动</h2>
      <el-button class="view-details" type="primary" @click="viewAllActivities">查看详情</el-button>
      <div class="activity-list" v-if="userActivities.length > 0">
        <div v-for="(activity, index) in userActivities" :key="index" class="activity-item">
          <div class="activity-icon">
            <el-icon v-if="activity.type === ACTIVITY_TYPES.DOWNLOAD"><Download /></el-icon>
            <el-icon v-else-if="activity.type === ACTIVITY_TYPES.LIKE"><Star /></el-icon>
            <el-icon v-else-if="activity.type === ACTIVITY_TYPES.COMMENT"><ChatDotRound /></el-icon>
            <el-icon v-else-if="activity.type === ACTIVITY_TYPES.POST"><Document /></el-icon>
            <el-icon v-else-if="activity.type === ACTIVITY_TYPES.REPLY"><ChatLineRound /></el-icon>
            <el-icon v-else-if="activity.type === ACTIVITY_TYPES.CREATE_MINDMAP"><TrendCharts /></el-icon>
            <el-icon v-else-if="activity.type === ACTIVITY_TYPES.UPDATE_MINDMAP"><Edit /></el-icon>
            <el-icon v-else><InfoFilled /></el-icon>
          </div>
          <div class="activity-content">
            <p>{{ formatActivityDescription(activity) }}</p>
          </div>
        </div>
      </div>
      <div class="empty-activities" v-else>
        <el-empty description="暂无活动记录" :image-size="100">
          <p>开始使用系统功能，这里将显示您的活动记录</p>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Document, ChatDotRound, TrendCharts, Download, Star, ChatLineRound, Edit, InfoFilled } from '@element-plus/icons-vue'
import { ACTIVITY_TYPES, getUserActivities, formatActivityDescription } from '../utils/activityTracker'

const router = useRouter()

// 从localStorage获取当前用户信息
const getCurrentUser = () => {
  const userJson = localStorage.getItem('currentUser')
  if (userJson) {
    try {
      return JSON.parse(userJson)
    } catch (e) {
      console.error('解析用户数据失败', e)
      return {
        username: '游客',
        avatar: 'G',
        role: '游客'
      }
    }
  } else {
    return {
      username: '游客',
      avatar: 'G',
      role: '游客'
    }
  }
}

const currentUser = ref(getCurrentUser())

const stats = ref({
  mindmapCount: 5,
  lastUpdate: '2023-06-15',
  materialsCount: 12,
  viewCount: 230,
  postCount: 8,
  replyCount: 27
})

// 用户活动列表
const userActivities = ref([])

// 导航到指定页面
const navigateTo = (path) => {
  router.push(path)
}

// 查看所有活动
const viewAllActivities = () => {
  // 这里可以跳转到活动详情页或显示更多活动
  // 暂时只是获取更多活动记录
  loadUserActivities(50)
}

// 加载用户活动
const loadUserActivities = (limit = 10) => {
  const username = currentUser.value.username
  userActivities.value = getUserActivities(username, limit)
}

// 页面加载时获取用户活动
onMounted(() => {
  loadUserActivities()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 50%, #d8e6ff 100%);
  background-size: 200% 200%;
  min-height: calc(100vh - 60px);
  animation: gradientShift 15s ease infinite;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
    opacity: 0.6;
    animation: ripple 15s linear infinite;
    pointer-events: none;
    z-index: 0;
  }

  @keyframes ripple {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 16px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(10px);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border-left: 4px solid #409eff;
    position: relative;
    z-index: 1;
    
    &:hover {
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
      transform: translateY(-4px);
    }

    h1 {
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 12px;
      background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
      text-shadow: 0 2px 10px rgba(58, 123, 213, 0.2);
      animation: colorShift 8s ease infinite;
    }
    
    @keyframes colorShift {
      0% { filter: hue-rotate(0deg); }
      50% { filter: hue-rotate(15deg); }
      100% { filter: hue-rotate(0deg); }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;

      span {
        font-weight: 500;
        color: #303133;
        transition: all 0.3s ease;
      }
      
      .avatar {
        background: linear-gradient(135deg, #409EFF, #64b5f6);
        box-shadow: 0 4px 10px rgba(64, 158, 255, 0.3);
        transition: all 0.3s ease;
        
        &:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 6px 12px rgba(64, 158, 255, 0.4);
        }
      }
    }
  }

  .dashboard-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 36px;
    position: relative;
    z-index: 1;

    .dashboard-card {
      background: rgba(255, 255, 255, 0.9);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
      transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);
      border: none;
      cursor: pointer;
      z-index: 1;
      
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(58, 123, 213, 0.1) 0%, rgba(0, 210, 255, 0.1) 100%);
        opacity: 0;
        transition: opacity 0.5s ease;
        z-index: -1;
      }
      
      &:hover {
        transform: translateY(-8px) scale(1.03);
        box-shadow: 0 16px 32px rgba(58, 123, 213, 0.15);
        
        &::after {
          opacity: 1;
        }
        
        .card-icon {
          transform: scale(1.1) rotate(5deg);
        }
        
        h2 {
          background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
      }

      .card-header {
        display: flex;
        align-items: center;
        margin-bottom: 18px;

        .card-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          font-size: 24px;
          transition: all 0.4s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          animation: pulse 2s infinite;
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        }
      }

      h2 {
        font-size: 20px;
        margin: 0;
        font-weight: 600;
        background: linear-gradient(90deg, #303133, #606266);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: 0.5px;
        transition: all 0.3s ease;
      }

      .card-content {
        p {
          margin: 12px 0;
          font-size: 15px;
          color: #606266;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          
          &:before {
            content: '';
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #dcdfe6;
            margin-right: 10px;
            transition: all 0.3s ease;
            box-shadow: 0 0 0 2px rgba(220, 223, 230, 0.3);
          }
          
          &:hover {
            color: #303133;
            transform: translateX(4px);
          }
        }
        
        &:hover p:before {
          background-color: #409EFF;
          transform: scale(1.3);
          box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
        }
      }
    }

    .mindmap-card .card-icon {
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.2), rgba(100, 181, 246, 0.3));
      color: #409EFF;
      
      &:hover {
        transform: rotate(15deg) scale(1.1);
        background: linear-gradient(135deg, rgba(64, 158, 255, 0.3), rgba(100, 181, 246, 0.4));
        box-shadow: 0 6px 15px rgba(64, 158, 255, 0.3);
      }
    }

    .materials-card .card-icon {
      background: linear-gradient(135deg, rgba(103, 194, 58, 0.2), rgba(158, 208, 72, 0.3));
      color: #67C23A;
      
      &:hover {
        transform: rotate(-15deg) scale(1.1);
        background: linear-gradient(135deg, rgba(103, 194, 58, 0.3), rgba(158, 208, 72, 0.4));
        box-shadow: 0 6px 15px rgba(103, 194, 58, 0.3);
      }
    }

    .forum-card .card-icon {
      background: linear-gradient(135deg, rgba(230, 162, 60, 0.2), rgba(245, 199, 106, 0.3));
      color: #E6A23C;
      
      &:hover {
        transform: rotate(15deg) scale(1.1);
        background: linear-gradient(135deg, rgba(230, 162, 60, 0.3), rgba(245, 199, 106, 0.4));
        box-shadow: 0 6px 15px rgba(230, 162, 60, 0.3);
      }
    }
  }

  .recent-activities {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 16px;
    padding: 28px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    position: relative;
    transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
    border: none;
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
    z-index: 1;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(58, 123, 213, 0.05) 0%, rgba(0, 210, 255, 0.05) 100%);
      opacity: 0;
      transition: opacity 0.5s ease;
      z-index: -1;
    }
    
    &:hover {
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
      transform: translateY(-4px);
      
      &::before {
        opacity: 1;
      }
    }

    h2 {
      font-size: 22px;
      margin: 0 0 24px 0;
      font-weight: 600;
      position: relative;
      display: inline-block;
      background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
      text-shadow: 0 2px 10px rgba(58, 123, 213, 0.2);
      
      &:after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 0;
        width: 50px;
        height: 3px;
        background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
        border-radius: 3px;
        transition: all 0.3s ease;
      }
    }

    .view-details {
      position: absolute;
      right: 28px;
      top: 28px;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border-radius: 12px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
      border: none;
      box-shadow: 0 4px 12px rgba(58, 123, 213, 0.3);
      position: relative;
      overflow: hidden;
      
      &::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%);
        opacity: 0;
        transition: opacity 0.3s ease;
        transform: scale(0.5);
      }
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(58, 123, 213, 0.4);
        
        &::after {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      &:active {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(58, 123, 213, 0.3);
      }
    }

    .activity-list {
      margin-top: 24px;
      max-height: 400px;
      overflow-y: auto;
      border-radius: 12px;
      background: linear-gradient(135deg, #f5f7fa, #ffffff);
      box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.03);
      padding: 16px;
      transition: all 0.3s ease;
      
      &:hover {
        box-shadow: inset 0 3px 12px rgba(0, 0, 0, 0.05);
      }
      
      .activity-item {
        display: flex;
        align-items: flex-start;
        padding: 14px 16px;
        border-bottom: 1px solid #f0f0f0;
        transition: all 0.3s ease;
        border-radius: 8px;
        margin-bottom: 4px;
        
        &:hover {
          background-color: rgba(64, 158, 255, 0.08);
          transform: translateX(4px);
        }
        
        &:last-child {
          border-bottom: none;
        }
        
        .activity-icon {
          margin-right: 16px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(100, 181, 246, 0.2));
          display: flex;
          align-items: center;
          justify-content: center;
          color: #409EFF;
          flex-shrink: 0;
          transition: all 0.3s ease;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
          
          &:hover {
            transform: rotate(15deg) scale(1.1);
            background: linear-gradient(135deg, rgba(64, 158, 255, 0.2), rgba(100, 181, 246, 0.3));
            box-shadow: 0 4px 10px rgba(64, 158, 255, 0.2);
          }
        }
        
        .activity-content {
          flex: 1;
          
          p {
            margin: 0;
            font-size: 15px;
            color: #606266;
            line-height: 1.6;
            transition: all 0.3s ease;
            
            &:hover {
              color: #303133;
            }
          }
        }
      }
    }
    
    .empty-activities {
      margin-top: 24px;
      padding: 36px;
      text-align: center;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 12px;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.9);
        transform: translateY(-3px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
      }
      
      p {
        color: #909399;
        margin-top: 12px;
        font-size: 15px;
        line-height: 1.6;
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
    
    .user-info {
      align-self: flex-end;
    }
  }
  
  .dashboard-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .dashboard-card {
    margin-bottom: 0;
  }
  
  .recent-activities {
    padding: 20px;
    
    .view-details {
      position: static;
      margin-top: 16px;
      display: block;
      width: 100%;
    }
    
    h2 {
      display: block;
      width: 100%;
      text-align: center;
    }
  }
}
</style>