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
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

      .card-header {
        display: flex;
        align-items: center;
        margin-bottom: 15px;

        .card-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;
          font-size: 20px;
        }
      }

      h2 {
        font-size: 18px;
        margin: 0;
      }

      .card-content {
        p {
          margin: 8px 0;
          font-size: 14px;
          color: #606266;
        }
      }
    }

    .mindmap-card .card-icon {
      background-color: rgba(64, 158, 255, 0.1);
      color: #409EFF;
    }

    .materials-card .card-icon {
      background-color: rgba(103, 194, 58, 0.1);
      color: #67C23A;
    }

    .forum-card .card-icon {
      background-color: rgba(230, 162, 60, 0.1);
      color: #E6A23C;
    }
  }

  .recent-activities {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    position: relative;

    h2 {
      font-size: 18px;
      margin: 0 0 20px 0;
    }

    .view-details {
      position: absolute;
      right: 20px;
      top: 20px;
    }

    .activity-chart {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f7fa;
      border-radius: 4px;

      .placeholder {
        color: #909399;
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}
</style>