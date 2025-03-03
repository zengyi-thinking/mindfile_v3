<template>
  <div class="mindmap-container">
    <div class="page-header">
      <h1>我的思维导图</h1>
      <div class="user-info">
        <span>{{ currentUser.role }}</span>
        <el-avatar :size="40" class="avatar">{{ currentUser.avatar }}</el-avatar>
      </div>
    </div>

    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索思维导图..."
        class="search-input"
        clearable
      />
      <el-button type="primary" @click="searchMindmaps">搜索</el-button>
      <el-button type="primary" class="create-btn" @click="createNewMindmap">创建新思维导图</el-button>
    </div>

    <div class="mindmap-list">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" v-for="(mindmap, index) in mindmaps" :key="index">
          <el-card class="mindmap-item" shadow="hover">
            <div class="mindmap-icon">
              <el-icon :size="40"><BrainIcon /></el-icon>
            </div>
            <div class="mindmap-info">
              <h3>{{ mindmap.title }}</h3>
              <p>{{ mindmap.description }}</p>
              <div class="mindmap-meta">
                <el-tag size="small" type="info" effect="plain">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ mindmap.createdAt }}</span>
                </el-tag>
                <el-tag size="small" type="success" effect="plain">
                  <el-icon><Connection /></el-icon>
                  <span>{{ mindmap.nodeCount }} 节点</span>
                </el-tag>
              </div>
              <div class="mindmap-actions">
                <el-button type="primary" size="small" text>
                  <el-icon><Edit /></el-icon> 编辑
                </el-button>
                <el-button type="info" size="small" text>
                  <el-icon><View /></el-icon> 查看
                </el-button>
                <el-button type="danger" size="small" text>
                  <el-icon><Delete /></el-icon> 删除
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, h } from 'vue'
import { useRouter } from 'vue-router'

// 模拟大脑图标组件
const BrainIcon = {
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      width: '1em',
      height: '1em'
    }, [
      h('path', {
        fill: 'currentColor',
        d: 'M13,3V10H18V9H15V3H13M6,3H8V11H10V3H12V11H10V13H8V11H6V3M8,13H10V15H8V13M10,15H12V17H10V15M12,15H14V17H12V15M14,15H16V17H14V15M16,15H18V17H16V15M18,15H20V17H18V15M20,15H22V17H20V15M22,15V13H24V15H22M22,13H20V11H22V13M20,11H18V9H20V11M18,9H16V7H18V9M16,7H14V5H16V7M14,5H12V3H14V5Z'
      })
    ])
  }
}

const router = useRouter()
const searchQuery = ref('')
const currentUser = ref({
  role: '管理员',
  avatar: 'A'
})

// 模拟思维导图数据
const mindmaps = ref([
  {
    id: 1,
    title: 'Python基础知识',
    description: 'Python语言核心概念和基础语法的思维导图',
    createdAt: '2023-06-10',
    nodeCount: 35
  },
  {
    id: 2,
    title: '数据结构与算法',
    description: '常见数据结构和算法的整理与分析',
    createdAt: '2023-05-22',
    nodeCount: 42
  },
  {
    id: 3,
    title: 'Web开发技术栈',
    description: '前后端开发技术栈的全面梳理',
    createdAt: '2023-06-01',
    nodeCount: 50
  }
])

// 搜索思维导图
const searchMindmaps = () => {
  // 实际应用中这里会调用API进行搜索
  console.log('搜索关键词:', searchQuery.value)
}

// 创建新思维导图
const createNewMindmap = () => {
  // 实际应用中这里会跳转到创建页面或打开创建对话框
  console.log('创建新思维导图')
}
</script>

<style lang="scss" scoped>
.mindmap-container {
  padding: 20px;
  background-color: #f9fafc;

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

  .search-section {
    display: flex;
    margin-bottom: 20px;
    gap: 10px;

    .search-input {
      flex: 1;
    }

    .create-btn {
      margin-left: auto;
    }
  }

  .mindmap-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

    .mindmap-item {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      display: flex;
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.1);
      }

      .mindmap-icon {
        width: 60px;
        height: 60px;
        background-color: rgba(64, 158, 255, 0.1);
        color: #409EFF;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
      }

      .mindmap-info {
        flex: 1;

        h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
        }

        p {
          margin: 0 0 10px 0;
          color: #606266;
          font-size: 14px;
        }

        .mindmap-meta {
          display: flex;
          justify-content: space-between;
          color: #909399;
          font-size: 12px;
        }
      }
    }
  }

@media (max-width: 1200px) {
  .mindmap-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .mindmap-list {
    grid-template-columns: 1fr;
  }

  .search-section {
    flex-direction: column;

    .create-btn {
      margin-left: 0;
    }
  }
}
}

@media (max-width: 1200px) {
  .mindmap-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .mindmap-list {
    grid-template-columns: 1fr;
  }

  .search-section {
    flex-direction: column;

    .create-btn {
      margin-left: 0;
    }
  }
}
</style>