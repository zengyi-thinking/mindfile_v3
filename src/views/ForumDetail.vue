<template>
  <div class="forum-detail-container">
    <div class="page-header">
      <h1>讨论详情</h1>
      <div class="user-info">
        <span>{{ currentUser.role }}</span>
        <el-avatar :size="40" class="avatar">{{ currentUser.avatar }}</el-avatar>
      </div>
    </div>

    <div class="topic-detail" v-if="topic">
      <div class="topic-header">
        <h2 class="topic-title">{{ topic.title }}</h2>
        <div class="topic-meta">
          <span>作者: {{ topic.author }}</span>
          <span>发布于: {{ topic.publishDate }}</span>
          <span>分类: {{ topic.category }}</span>
          <span>浏览: {{ topic.views }}</span>
        </div>
      </div>

      <div class="topic-content">
        <p>{{ topic.content }}</p>
      </div>

      <div class="topic-tags" v-if="topic.tags && topic.tags.length > 0">
        <el-tag v-for="(tag, index) in topic.tags" :key="index" size="small" class="tag-item">
          {{ tag }}
        </el-tag>
      </div>
    </div>

    <div class="comments-section">
      <h3>评论 ({{ comments.length }})</h3>
      
      <div class="comment-list">
        <div v-for="(comment, index) in comments" :key="index" class="comment-item">
          <div class="comment-header">
            <div class="comment-user">
              <el-avatar :size="40" class="comment-avatar">{{ comment.userAvatar }}</el-avatar>
              <div class="comment-user-info">
                <span class="comment-author">{{ comment.author }}</span>
                <span class="comment-time">{{ comment.time }}</span>
              </div>
            </div>
            <div class="comment-actions">
              <el-button type="text" @click="replyToComment(comment)">回复</el-button>
            </div>
          </div>
          
          <div class="comment-content">
            <p>{{ comment.content }}</p>
          </div>
          
          <!-- 回复列表 -->
          <div class="replies-list" v-if="comment.replies && comment.replies.length > 0">
            <div v-for="(reply, replyIndex) in comment.replies" :key="replyIndex" class="reply-item">
              <div class="reply-header">
                <div class="reply-user">
                  <el-avatar :size="30" class="reply-avatar">{{ reply.userAvatar }}</el-avatar>
                  <div class="reply-user-info">
                    <span class="reply-author">{{ reply.author }}</span>
                    <span class="reply-time">{{ reply.time }}</span>
                  </div>
                </div>
              </div>
              <div class="reply-content">
                <p><span class="reply-to">@{{ reply.replyTo }}</span> {{ reply.content }}</p>
              </div>
            </div>
          </div>
          
          <!-- 回复表单 -->
          <div class="reply-form" v-if="activeReplyId === comment.id">
            <el-input
              v-model="replyForm.content"
              type="textarea"
              :rows="2"
              placeholder="回复评论..."
            />
            <div class="reply-form-actions">
              <el-button size="small" @click="cancelReply">取消</el-button>
              <el-button size="small" type="primary" @click="submitReply(comment)">提交回复</el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 评论表单 -->
      <div class="comment-form">
        <h4>发表评论</h4>
        <el-input
          v-model="commentForm.content"
          type="textarea"
          :rows="4"
          placeholder="请输入您的评论..."
        />
        <div class="comment-form-actions">
          <el-button type="primary" @click="submitComment">提交评论</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ACTIVITY_TYPES, recordActivity } from '../utils/activityTracker'

const route = useRoute()
const router = useRouter()

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
const topic = ref(null)
const comments = ref([])
const activeReplyId = ref(null)

// 评论表单
const commentForm = reactive({
  content: ''
})

// 回复表单
const replyForm = reactive({
  content: '',
  replyTo: ''
})

// 更新话题回复数
const updateTopicReplies = (topicId) => {
  // 从localStorage获取话题列表
  const topicsJson = localStorage.getItem('topics')
  if (topicsJson) {
    try {
      const topics = JSON.parse(topicsJson)
      const topicIndex = topics.findIndex(t => String(t.id) === String(topicId))
      if (topicIndex !== -1) {
        // 更新回复数为评论数量
        topics[topicIndex].replies = comments.value.length
        // 保存回到localStorage
        localStorage.setItem('topics', JSON.stringify(topics))
      }
    } catch (e) {
      console.error('更新话题回复数失败', e)
    }
  }
}

// 获取话题详情
const fetchTopicDetail = () => {
  const topicId = route.params.id
  if (!topicId) {
    ElMessage.error('话题ID不存在')
    router.push('/forum')
    return
  }

  // 从localStorage获取话题列表
  const topicsJson = localStorage.getItem('topics')
  if (topicsJson) {
    try {
      const topics = JSON.parse(topicsJson)
      // 使用==而不是===进行比较，因为id可能是数字或字符串
      const foundTopic = topics.find(t => String(t.id) === String(topicId))
      if (foundTopic) {
        topic.value = foundTopic
        // 记录查看活动
        recordActivity({
          type: ACTIVITY_TYPES.VIEW_TOPIC,
          topicId: foundTopic.id,
          topicTitle: foundTopic.title
        })
        // 更新浏览量
        foundTopic.views = (foundTopic.views || 0) + 1
        localStorage.setItem('topics', JSON.stringify(topics))
      } else {
        ElMessage.error('话题不存在')
        router.push('/forum')
      }
    } catch (e) {
      console.error('获取话题详情失败', e)
      ElMessage.error('获取话题详情失败')
    }
  } else {
    ElMessage.error('没有话题数据')
    router.push('/forum')
  }
}

// 获取评论列表
const fetchComments = () => {
  const topicId = route.params.id
  const commentsJson = localStorage.getItem(`comments_${topicId}`)
  if (commentsJson) {
    try {
      comments.value = JSON.parse(commentsJson)
    } catch (e) {
      console.error('获取评论失败', e)
      comments.value = []
    }
  } else {
    comments.value = []
  }
}

// 提交评论
const submitComment = () => {
  if (!commentForm.content.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }

  const topicId = route.params.id
  const newComment = {
    id: Date.now().toString(),
    author: currentUser.value.username,
    userAvatar: currentUser.value.avatar,
    content: commentForm.content,
    time: new Date().toLocaleString(),
    replies: []
  }

  comments.value.push(newComment)
  localStorage.setItem(`comments_${topicId}`, JSON.stringify(comments.value))
  
  // 更新话题回复数
  updateTopicReplies(topicId)
  
  // 记录评论活动
  recordActivity({
    type: ACTIVITY_TYPES.COMMENT,
    topicId,
    topicTitle: topic.value?.title,
    commentContent: commentForm.content
  })

  // 清空表单
  commentForm.content = ''
  
  ElMessage.success('评论发表成功')
}

// 回复评论
const replyToComment = (comment) => {
  activeReplyId.value = comment.id
  replyForm.replyTo = comment.author
  replyForm.content = ''
}

// 取消回复
const cancelReply = () => {
  activeReplyId.value = null
  replyForm.content = ''
  replyForm.replyTo = ''
}

// 提交回复
const submitReply = (comment) => {
  if (!replyForm.content.trim()) {
    ElMessage.warning('回复内容不能为空')
    return
  }

  const topicId = route.params.id
  const newReply = {
    id: Date.now().toString(),
    author: currentUser.value.username,
    userAvatar: currentUser.value.avatar,
    content: replyForm.content,
    time: new Date().toLocaleString(),
    replyTo: comment.author
  }

  // 确保comment.replies是数组
  if (!comment.replies) {
    comment.replies = []
  }

  comment.replies.push(newReply)
  localStorage.setItem(`comments_${topicId}`, JSON.stringify(comments.value))
  
  // 记录回复活动
  recordActivity({
    type: ACTIVITY_TYPES.REPLY,
    topicId,
    topicTitle: topic.value?.title,
    commentId: comment.id,
    replyContent: replyForm.content
  })

  // 清空表单并关闭回复框
  cancelReply()
  
  ElMessage.success('回复发表成功')
}

onMounted(() => {
  fetchTopicDetail()
  fetchComments()
})
</script>

<style scoped>
.forum-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.topic-detail {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.topic-header {
  margin-bottom: 15px;
}

.topic-title {
  margin-bottom: 10px;
  color: #303133;
}

.topic-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 14px;
  color: #909399;
}

.topic-content {
  margin: 20px 0;
  line-height: 1.6;
  color: #606266;
}

.topic-tags {
  margin-top: 15px;
}

.tag-item {
  margin-right: 8px;
}

.comments-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.comment-list {
  margin-bottom: 30px;
}

.comment-item {
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.comment-user-info {
  display: flex;
  flex-direction: column;
}

.comment-author {
  font-weight: bold;
  color: #303133;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-content {
  margin: 10px 0;
  color: #606266;
  line-height: 1.6;
}

.replies-list {
  margin-left: 50px;
  margin-top: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 10px;
}

.reply-item {
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.reply-item:last-child {
  border-bottom: none;
}

.reply-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.reply-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reply-user-info {
  display: flex;
  flex-direction: column;
}

.reply-author {
  font-weight: bold;
  font-size: 14px;
  color: #303133;
}

.reply-time {
  font-size: 12px;
  color: #909399;
}

.reply-content {
  margin-left: 38px;
  color: #606266;
  line-height: 1.6;
}

.reply-to {
  color: #409eff;
  font-weight: bold;
  margin-right: 5px;
}

.reply-form {
  margin-top: 15px;
  margin-left: 50px;
}

.reply-form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  gap: 10px;
}

.comment-form {
  margin-top: 30px;
}

.comment-form h4 {
  margin-bottom: 15px;
  color: #303133;
}

.comment-form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}
</style>