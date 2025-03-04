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
      <div class="dashboard-card mindmap-card">
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

      <div class="dashboard-card materials-card">
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

      <div class="dashboard-card forum-card">
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
      <el-button class="view-details" type="primary">查看详情</el-button>
      <div class="activity-chart">
        <div class="placeholder">[最近一周的活动图表将显示在这里]</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Document, ChatDotRound, TrendCharts } from '@element-plus/icons-vue'

// 模拟数据
const currentUser = ref({
  username: 'zengyi_thinking',
  avatar: 'Z'
})

const stats = ref({
  mindmapCount: 5,
  lastUpdate: '2023-06-15',
  materialsCount: 12,
  viewCount: 230,
  postCount: 8,
  replyCount: 27
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;

    h1 {
      font-size: 24px;
      font-weight: 500;
      margin: 0;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;

      .avatar {
        background-color: #409EFF;
      }
    }
  }

  .dashboard-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 30px;

    .dashboard-card {
      background-color: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 15px 0 rgba(0, 0, 0, 0.08);
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
      position: relative;
      overflow: hidden;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
      }

      .card-header {
        display: flex;
        align-items: center;
        margin-bottom: 15px;

        .card-icon {
          width: 45px;
          height: 45px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          font-size: 22px;
          transition: all 0.3s ease;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
        }
      }

      h2 {
        font-size: 18px;
        margin: 0;
        font-weight: 600;
        background: linear-gradient(90deg, #333, #666);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .card-content {
        p {
          margin: 10px 0;
          font-size: 14px;
          color: #606266;
          display: flex;
          align-items: center;
          
          &:before {
            content: '';
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #dcdfe6;
            margin-right: 8px;
            transition: all 0.3s ease;
          }
        }
        
        &:hover p:before {
          background-color: #409EFF;
          transform: scale(1.2);
        }
      }
    }

    .mindmap-card .card-icon {
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(100, 181, 246, 0.2));
      color: #409EFF;
      
      &:hover {
        transform: rotate(15deg);
      }
    }

    .materials-card .card-icon {
      background: linear-gradient(135deg, rgba(103, 194, 58, 0.1), rgba(158, 208, 72, 0.2));
      color: #67C23A;
      
      &:hover {
        transform: rotate(-15deg);
      }
    }

    .forum-card .card-icon {
      background: linear-gradient(135deg, rgba(230, 162, 60, 0.1), rgba(245, 199, 106, 0.2));
      color: #E6A23C;
      
      &:hover {
        transform: rotate(15deg);
      }
    }
  }

  .recent-activities {
    background-color: white;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.08);
    position: relative;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    border: 1px solid rgba(0, 0, 0, 0.02);
    
    &:hover {
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }

    h2 {
      font-size: 20px;
      margin: 0 0 20px 0;
      font-weight: 600;
      position: relative;
      display: inline-block;
      
      &:after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 0;
        width: 40px;
        height: 3px;
        background: linear-gradient(90deg, #409EFF, #64b5f6);
        border-radius: 3px;
      }
    }

    .view-details {
      position: absolute;
      right: 25px;
      top: 25px;
      transition: all 0.3s ease;
      border-radius: 20px;
      padding: 8px 16px;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
      }
    }

    .activity-chart {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f7fa, #ffffff);
      border-radius: 8px;
      box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.03);
      transition: all 0.3s ease;
      margin-top: 10px;
      
      &:hover {
        box-shadow: inset 0 2px 15px rgba(0, 0, 0, 0.05);
      }

      .placeholder {
        color: #909399;
        font-size: 15px;
        font-style: italic;
        opacity: 0.8;
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
  
  .dashboard-card {
    margin-bottom: 15px;
  }
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}
</style>