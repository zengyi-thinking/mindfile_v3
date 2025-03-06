<template>
  <div class="forum-container">
    <div class="page-header">
      <h1>讨论交流</h1>
      <div class="user-info">
        <span>{{ currentUser.role }}</span>
        <el-avatar :size="40" class="avatar">{{ currentUser.avatar }}</el-avatar>
      </div>
    </div>

    <div class="forum-content">
      <div class="forum-sidebar">
        <div class="sidebar-card">
          <h3>热门话题</h3>
          <div class="hot-topics">
            <div v-for="(topic, index) in hotTopics" :key="index" class="hot-topic-item" @click="viewTopicDetail(topic.id)">
              <span class="hot-rank">{{ index + 1 }}</span>
              <span class="hot-title">{{ topic.title }}</span>
            </div>
          </div>
        </div>
        
        <div class="sidebar-card">
          <h3>分类筛选</h3>
          <div class="category-filters">
            <el-tag 
              v-for="category in categories" 
              :key="category.value"
              :class="{ 'active-filter': selectedCategory === category.value }"
              @click="filterByCategory(category.value)"
              effect="plain"
              class="category-tag"
            >
              {{ category.label }}
            </el-tag>
          </div>
        </div>
      </div>

      <div class="forum-main">
        <div class="search-section">
          <el-input
            v-model="searchQuery"
            placeholder="搜索讨论..."
            class="search-input"
            clearable
            prefix-icon="Search"
          />
          <el-button type="primary" @click="searchTopics">搜索</el-button>
          <el-button type="primary" class="create-btn" @click="createNewTopic">
            <el-icon><Plus /></el-icon> 发起讨论
          </el-button>
        </div>

        <div class="topic-filter">
          <el-radio-group v-model="topicSortOrder" size="small">
            <el-radio-button label="newest">最新</el-radio-button>
            <el-radio-button label="hottest">最热</el-radio-button>
            <el-radio-button label="mostReplies">最多回复</el-radio-button>
          </el-radio-group>
        </div>

        <div class="topic-list">
          <div v-for="(topic, index) in filteredAndSortedTopics" :key="index" class="topic-item" @click="viewTopicDetail(topic.id)">
            <div class="topic-content">
              <div class="topic-header">
                <el-avatar :size="36" class="topic-avatar">{{ topic.author.charAt(0) }}</el-avatar>
                <h3 class="topic-title">{{ topic.title }}</h3>
                <el-tag size="small" effect="plain" class="topic-category">{{ topic.category }}</el-tag>
              </div>
              <div class="topic-meta">
                <span class="meta-item"><el-icon><User /></el-icon> {{ topic.author }}</span>
                <span class="meta-item"><el-icon><Calendar /></el-icon> {{ topic.publishDate }}</span>
              </div>
            </div>
            <div class="topic-stats">
              <div class="stat-item">
                <el-icon><View /></el-icon>
                <span class="stat-value">{{ topic.views || 0 }}</span>
                <span class="stat-label">浏览</span>
              </div>
              <div class="stat-item">
                <el-icon><ChatDotRound /></el-icon>
                <span class="stat-value">{{ topic.replies || 0 }}</span>
                <span class="stat-label">回复</span>
              </div>
            </div>
            <div class="topic-last-reply" v-if="topic.lastReplier">
              <div class="last-reply-info">
                <span>最后回复: {{ topic.lastReplier }}</span>
                <span>{{ topic.lastReplyTime }}</span>
              </div>
            </div>
          </div>
          
          <el-empty v-if="filteredAndSortedTopics.length === 0" description="暂无相关讨论" />
        </div>
        
        <div class="pagination-container" v-if="filteredAndSortedTopics.length > 0">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="filteredAndSortedTopics.length"
            :page-size="10"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- 发起讨论对话框 -->
    <el-dialog v-model="topicDialogVisible" title="发起讨论" width="600px" class="topic-dialog">
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ACTIVITY_TYPES, recordActivity } from '../utils/activityTracker'
import { Plus, User, Calendar, View, ChatDotRound, Search } from '@element-plus/icons-vue'

const router = useRouter()

const searchQuery = ref('')
const topicDialogVisible = ref(false)
const selectedCategory = ref('')
const topicSortOrder = ref('newest')
const currentPage = ref(1)

// 分类列表
const categories = [
  { label: '全部', value: '' },
  { label: '思维导图', value: 'mindmap' },
  { label: 'Python', value: 'python' },
  { label: '算法', value: 'algorithm' },
  { label: '项目管理', value: 'project' },
  { label: '工具推荐', value: 'tools' }
]

// 获取当前用户信息
const getCurrentUser = () => {
  const userJson = localStorage.getItem('currentUser')
  if (userJson) {
    try {
      return JSON.parse(userJson)
    } catch (e) {
      console.error('解析用户数据失败', e)
      return {
        role: '游客',
        avatar: 'G',
        username: '游客'
      }
    }
  } else {
    return {
      role: '游客',
      avatar: 'G',
      username: '游客'
    }
  }
}

const currentUser = ref(getCurrentUser())

// 讨论主题数据
const topics = ref([])

// 热门话题计算属性
const hotTopics = computed(() => {
  return [...topics.value]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)
})

// 过滤和排序后的话题
const filteredAndSortedTopics = computed(() => {
  let result = [...topics.value]
  
  // 应用分类筛选
  if (selectedCategory.value) {
    result = result.filter(topic => topic.category === selectedCategory.value)
  }
  
  // 应用搜索筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(topic => 
      topic.title.toLowerCase().includes(query) || 
      topic.content.toLowerCase().includes(query)
    )
  }
  
  // 应用排序
  if (topicSortOrder.value === 'newest') {
    result.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
  } else if (topicSortOrder.value === 'hottest') {
    result.sort((a, b) => (b.views || 0) - (a.views || 0))
  } else if (topicSortOrder.value === 'mostReplies') {
    result.sort((a, b) => (b.replies || 0) - (a.replies || 0))
  }
  
  return result
})

// 分页后的话题
const paginatedTopics = computed(() => {
  const pageSize = 10
  const startIndex = (currentPage.value - 1) * pageSize
  return filteredAndSortedTopics.value.slice(startIndex, startIndex + pageSize)
})

// 处理分页变化
const handlePageChange = (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 按分类筛选
const filterByCategory = (category) => {
  selectedCategory.value = category
  currentPage.value = 1
}

// 搜索话题
const searchTopics = () => {
  currentPage.value = 1
}

// 获取话题列表
const fetchTopics = () => {
  const topicsJson = localStorage.getItem('topics')
  if (topicsJson) {
    try {
      topics.value = JSON.parse(topicsJson)
    } catch (e) {
      console.error('解析话题数据失败', e)
      topics.value = []
    }
  } else {
    // 初始化一些示例话题
    const initialTopics = [
      {
        id: 1,
        title: '如何高效使用思维导图进行学习规划',
        author: 'admin',
        publishDate: '2023-03-06',
        category: 'mindmap',
        content: '思维导图是一种非常有效的学习工具，可以帮助我们更好地组织和记忆知识。我想分享一些使用思维导图进行学习规划的经验和技巧...',
        views: 128,
        replies: 15,
        tags: ['beginner', 'tips'],
        lastReplier: 'user123',
        lastReplyTime: '2023-03-10 14:30'
      },
      {
        id: 2,
        title: 'Python数据分析入门指南',
        author: 'datascientist',
        publishDate: '2023-03-05',
        category: 'python',
        content: '本指南将介绍Python数据分析的基础知识，包括NumPy、Pandas和Matplotlib等库的使用方法，以及一些实用的数据处理技巧...',
        views: 95,
        replies: 8,
        tags: ['beginner', 'resources'],
        lastReplier: 'pythonfan',
        lastReplyTime: '2023-03-09 10:15'
      },
      {
        id: 3,
        title: '算法复杂度分析方法详解',
        author: 'coder',
        publishDate: '2023-03-04',
        category: 'algorithm',
        content: '理解算法复杂度对于编写高效代码至关重要。本文将详细讲解时间复杂度和空间复杂度的概念，以及如何分析不同类型算法的复杂度...',
        views: 76,
        replies: 5,
        tags: ['advanced'],
        lastReplier: 'algorithmexpert',
        lastReplyTime: '2023-03-08 16:45'
      }
    ]
    localStorage.setItem('topics', JSON.stringify(initialTopics))
    topics.value = initialTopics
  }
}

// 查看话题详情
const viewTopicDetail = (topicId) => {
  router.push(`/forum/${topicId}`)
}

// 创建新话题
const createNewTopic = () => {
  topicForm.value = {
    title: '',
    category: '',
    content: '',
    tags: []
  }
  topicDialogVisible.value = true
}

// 话题表单
const topicForm = ref({
  title: '',
  category: '',
  content: '',
  tags: []
})

// 提交讨论
const submitTopic = () => {
  if (!topicForm.value.title.trim() || !topicForm.value.category || !topicForm.value.content.trim()) {
    ElMessage.warning('请填写完整的讨论信息')
    return
  }
  
  // 创建新讨论
  const newTopic = {
    id: Date.now().toString(), // 使用时间戳作为ID，确保唯一性
    title: topicForm.value.title,
    author: currentUser.value.username || currentUser.value.role,
    publishDate: new Date().toISOString().split('T')[0],
    category: topicForm.value.category,
    content: topicForm.value.content,
    tags: topicForm.value.tags || [],
    views: 0,
    replies: 0,
    lastReplier: currentUser.value.username || currentUser.value.role,
    lastReplyTime: new Date().toLocaleString()
  }
  
  topics.value.unshift(newTopic)
  
  // 保存到localStorage
  const topicsJson = localStorage.getItem('topics')
  let allTopics = []
  
  if (topicsJson) {
    try {
      allTopics = JSON.parse(topicsJson)
      // 添加新话题到列表开头
      allTopics.unshift(newTopic)
    } catch (e) {
      console.error('解析话题数据失败', e)
      allTopics = [newTopic]
    }
  } else {
    allTopics = [newTopic]
  }
  
  localStorage.setItem('topics', JSON.stringify(allTopics))
  
  // 记录发表帖子活动
  recordActivity({
    type: ACTIVITY_TYPES.POST,
    topicId: newTopic.id,
    topicTitle: newTopic.title
  })
  
  topicDialogVisible.value = false
  ElMessage.success('发布讨论成功')
}

// 加载话题列表
const loadTopicsFromStorage = () => {
  fetchTopics()
}

// 组件挂载时加载讨论列表
onMounted(() => {
  loadTopicsFromStorage()
})
</script>

<style scoped>
.forum-container {
  padding: 20px;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

h1 {
  font-size: 24px;
  font-weight: 500;
  margin: 0;
  color: #303133;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  background-color: #409EFF;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.avatar:hover {
  transform: scale(1.05);
}

.forum-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
}

.forum-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.sidebar-card h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.hot-topics {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hot-topic-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.hot-topic-item:hover {
  background-color: #f5f7fa;
  transform: translateX(5px);
}

.hot-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f2f5;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.hot-rank:nth-child(1) {
  background-color: #f56c6c;
  color: #fff;
}

.hot-rank:nth-child(2) {
  background-color: #e6a23c;
  color: #fff;
}

.hot-rank:nth-child(3) {
  background-color: #409eff;
  color: #fff;
}

.hot-title {
  flex: 1;
  font-size: 14px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.category-tag:hover {
  transform: translateY(-2px);
}

.active-filter {
  background-color: #409eff !important;
  color: #fff !important;
  border-color: #409eff !important;
}

.forum-main {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.search-section {
  display: flex;
  margin-bottom: 20px;
  gap: 10px;
}

.search-input {
  flex: 1;
}

.create-btn {
  margin-left: auto;
}

.topic-filter {
  margin-bottom: 20px;
}

.topic-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.topic-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.topic-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.topic-content {
  flex: 1;
}

.topic-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.topic-avatar {
  border: 2px solid #f0f2f5;
}

.topic-title {
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.topic-category {
  font-size: 12px;
}

.topic-meta {
  display: flex;
  gap: 15px;
  color: #909399;
  font-size: 13px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.topic-stats {
  display: flex;
  gap: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.stat-value {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.topic-last-reply {
  min-width: 200px;
  border-left: 1px solid #ebeef5;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.last-reply-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 13px;
  color: #909399;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.topic-dialog :deep(.el-dialog__body) {
  padding: 20px 30px;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .forum-content {
    grid-template-columns: 1fr;
  }

  .forum-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .topic-item {
    flex-direction: column;
  }

  .topic-stats {
    justify-content: space-around;
    padding-top: 15px;
    border-top: 1px solid #ebeef5;
  }

  .topic-last-reply {
    border-left: none;
    padding-left: 0;
    border-top: 1px solid #ebeef5;
    padding-top: 15px;
  }
}

/* 添加过渡动画 */
.topic-item, .sidebar-card, .category-tag, .el-button {
  transition: all 0.3s ease;
}

.el-button:hover {
  transform: translateY(-2px);
}
</style>