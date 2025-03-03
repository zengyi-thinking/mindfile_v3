<template>
  <div class="forum-container">
    <div class="page-header">
      <h1>讨论交流</h1>
      <div class="user-info">
        <span>{{ currentUser.role }}</span>
        <el-avatar :size="40" class="avatar">{{ currentUser.avatar }}</el-avatar>
      </div>
    </div>

    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索讨论..."
        class="search-input"
        clearable
      />
      <el-button type="primary" @click="searchTopics">搜索</el-button>
      <el-button type="primary" class="create-btn" @click="createNewTopic">发起讨论</el-button>
    </div>

    <div class="topic-list">
      <div v-for="(topic, index) in topics" :key="index" class="topic-item">
        <div class="topic-content">
          <h3 class="topic-title">{{ topic.title }}</h3>
          <div class="topic-meta">
            <span>作者: {{ topic.author }}</span>
            <span>发布于: {{ topic.publishDate }}</span>
            <span>分类: {{ topic.category }}</span>
          </div>
        </div>
        <div class="topic-stats">
          <div class="stat-item">
            <span class="stat-value">{{ topic.views }}</span>
            <span class="stat-label">浏览</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ topic.replies }}</span>
            <span class="stat-label">回复</span>
          </div>
        </div>
        <div class="topic-last-reply">
          <div class="last-reply-info">
            <span>最后回复: {{ topic.lastReplier }}</span>
            <span>{{ topic.lastReplyTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 发起讨论对话框 -->
    <el-dialog v-model="topicDialogVisible" title="发起讨论" width="600px">
      <el-form :model="topicForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="topicForm.title" placeholder="请输入讨论标题" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="topicForm.category" placeholder="请选择分类">
            <el-option label="思维导图方法" value="mindmap" />
            <el-option label="Python学习" value="python" />
            <el-option label="算法学习" value="algorithm" />
            <el-option label="项目管理" value="project" />
            <el-option label="工具推荐" value="tools" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="topicForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入讨论内容"
          />
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="topicForm.tags"
            multiple
            placeholder="请选择标签"
            style="width: 100%"
          >
            <el-option label="入门" value="beginner" />
            <el-option label="进阶" value="advanced" />
            <el-option label="技巧分享" value="tips" />
            <el-option label="问题求助" value="help" />
            <el-option label="资源分享" value="resources" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="topicDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitTopic">发布</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const searchQuery = ref('')
const topicDialogVisible = ref(false)

const currentUser = ref({
  role: '管理员',
  avatar: 'A'
})

// 模拟讨论主题数据
const topics = ref([
  {
    id: 1,
    title: '思维导图在学习Python编程中的应用',
    author: '管理员',
    publishDate: '2023-06-10',
    category: 'Python学习',
    views: 24,
    replies: 5,
    lastReplier: '李明',
    lastReplyTime: '2023-06-12 14:30'
  },
  {
    id: 2,
    title: '关于如何构建高效的思维导图的讨论',
    author: '张三',
    publishDate: '2023-06-08',
    category: '思维导图方法',
    views: 32,
    replies: 7,
    lastReplier: '王五',
    lastReplyTime: '2023-06-11 09:15'
  },
  {
    id: 3,
    title: '使用思维导图整理数据结构与算法',
    author: '李四',
    publishDate: '2023-06-05',
    category: '算法学习',
    views: 45,
    replies: 12,
    lastReplier: '管理员',
    lastReplyTime: '2023-06-13 16:45'
  },
  {
    id: 4,
    title: '思维导图在项目管理中的应用经验分享',
    author: '赵六',
    publishDate: '2023-06-02',
    category: '项目管理',
    views: 38,
    replies: 9,
    lastReplier: '张三',
    lastReplyTime: '2023-06-10 11:20'
  },
  {
    id: 5,
    title: '推荐几款好用的思维导图软件',
    author: '王五',
    publishDate: '2023-05-30',
    category: '工具推荐',
    views: 56,
    replies: 15,
    lastReplier: '李四',
    lastReplyTime: '2023-06-09 08:40'
  }
])

// 发起讨论表单数据
const topicForm = ref({
  title: '',
  category: '',
  content: '',
  tags: []
})

// 搜索讨论
const searchTopics = () => {
  // 实际应用中这里会调用API进行搜索
  console.log('搜索关键词:', searchQuery.value)
}

// 创建新讨论
const createNewTopic = () => {
  topicDialogVisible.value = true
  topicForm.value = {
    title: '',
    category: '',
    content: '',
    tags: []
  }
}

// 提交讨论
const submitTopic = () => {
  // 实际应用中这里会调用API提交讨论
  console.log('提交讨论:', topicForm.value)
  topicDialogVisible.value = false
  
  // 模拟添加新讨论
  topics.value.unshift({
    id: topics.value.length + 1,
    title: topicForm.value.title,
    author: currentUser.value.role,
    publishDate: new Date().toISOString().split('T')[0],
    category: topicForm.value.category,
    views: 0,
    replies: 0,
    lastReplier: currentUser.value.role,
    lastReplyTime: new Date().toLocaleString()
  })
}
</script>

<style lang="scss" scoped>
.forum-container {
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

  .topic-list {
    .topic-item {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      display: flex;
      margin-bottom: 15px;
      transition: transform 0.3s, box-shadow 0.3s;
      cursor: pointer;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.1);
      }

      .topic-content {
        flex: 1;

        .topic-title {
          margin: 0 0 10px 0;
          font-size: 16px;
          font-weight: 500;
        }

        .topic-meta {
          display: flex;
          gap: 15px;
          color: #909399;
          font-size: 12px;
        }
      }

      .topic-stats {
        display: flex;
        gap: 15px;
        margin: 0 20px;

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 60px;

          .stat-value {
            font-size: 18px;
            font-weight: 500;
          }

          .stat-label {
            font-size: 12px;
            color: #909399;
          }
        }
      }

      .topic-last-reply {
        min-width: 150px;

        .last-reply-info {
          display: flex;
          flex-direction: column;
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .search-section {
    flex-direction: column;

    .create-btn {
      margin-left: 0;
      margin-top: 10px;
    }
  }

  .topic-item {
    flex-direction: column;

    .topic-stats {
      margin: 15px 0;
      justify-content: center;
    }

    .topic-last-reply {
      text-align: center;
    }
  }
}
</style>