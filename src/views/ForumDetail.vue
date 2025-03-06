<template>
  <div class="forum-detail-container">
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" type="text" class="back-button">
          <el-icon><ArrowLeft /></el-icon> 返回列表
        </el-button>
        <h1>讨论详情</h1>
      </div>
      <div class="user-info">
        <span>{{ currentUser.role }}</span>
        <el-avatar :size="40" class="avatar">{{ currentUser.avatar }}</el-avatar>
      </div>
    </div>

    <div class="topic-detail" v-if="topic">
      <div class="topic-header">
        <h2 class="topic-title">{{ topic.title }}</h2>
        <div class="topic-meta">
          <div class="meta-left">
            <el-avatar :size="36" class="author-avatar">{{ topic.author.charAt(0) }}</el-avatar>
            <div class="author-info">
              <span class="author-name">{{ topic.author }}</span>
              <span class="publish-time">{{ topic.publishDate }}</span>
            </div>
          </div>
          <div class="meta-right">
            <el-tag type="info" effect="plain" class="category-tag">{{ topic.category }}</el-tag>
            <span class="views-count"><el-icon><View /></el-icon> {{ topic.views }}</span>
          </div>
        </div>
      </div>

      <div class="topic-content">
        <p>{{ topic.content }}</p>
      </div>

      <div class="topic-tags" v-if="topic.tags && topic.tags.length > 0">
        <el-tag v-for="(tag, index) in topic.tags" :key="index" size="small" class="tag-item" effect="light">
          {{ tag }}
        </el-tag>
      </div>

      <div class="topic-actions">
        <el-button type="primary" plain size="small" @click="likeTopic" :class="{ 'is-liked': isTopicLiked }">
          <el-icon><Star /></el-icon> {{ isTopicLiked ? '已赞' : '点赞' }} ({{ topicLikes }})
        </el-button>
        <el-button type="info" plain size="small" @click="shareTopic">
          <el-icon><Share /></el-icon> 分享
        </el-button>
        <el-button type="success" plain size="small" @click="scrollToCommentForm">
          <el-icon><ChatDotRound /></el-icon> 评论
        </el-button>
      </div>
    </div>

    <div class="comments-section" id="comments-section">
      <div class="comments-header">
        <h3>评论 ({{ comments.length }})</h3>
        <el-select v-model="commentSortOrder" placeholder="排序方式" size="small">
          <el-option label="最新" value="newest"></el-option>
          <el-option label="最早" value="oldest"></el-option>
        </el-select>
      </div>
      
      <div class="comment-list" v-if="comments.length > 0">
        <div v-for="(comment, index) in sortedComments" :key="index" class="comment-item">
          <div class="comment-header">
            <div class="comment-user">
              <el-avatar :size="40" class="comment-avatar">{{ comment.userAvatar }}</el-avatar>
              <div class="comment-user-info">
                <span class="comment-author">{{ comment.author }}</span>
                <span class="comment-time">{{ comment.time }}</span>
              </div>
            </div>
            <div class="comment-actions">
              <el-button type="text" @click="replyToComment(comment)">
                <el-icon><ChatLineRound /></el-icon> 回复
              </el-button>
              <el-button type="text" @click="likeComment(comment)">
                <el-icon><Star /></el-icon> {{ comment.likes || 0 }}
              </el-button>
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
                <div class="reply-actions">
                  <el-button type="text" size="small" @click="likeReply(comment, reply)">
                    <el-icon><Star /></el-icon> {{ reply.likes || 0 }}
                  </el-button>
                </div>
              </div>
              <div class="reply-content">
                <p><span class="reply-to">@{{ reply.replyTo }}</span> {{ reply.content }}</p>
              </div>
            </div>
          </div>
          
          <!-- 回复表单 -->
          <div class="reply-form" v-if="activeReplyId === comment.id">
            <div class="emoji-picker-container" v-if="showEmojiPicker === comment.id">
              <div class="emoji-list">
                <span v-for="emoji in emojiList" :key="emoji" @click="addEmoji(emoji, 'reply')">{{ emoji }}</span>
              </div>
            </div>
            <div class="reply-input-container">
              <el-input
                v-model="replyForm.content"
                type="textarea"
                :rows="2"
                placeholder="回复评论..."
                resize="none"
              />
              <div class="input-actions">
                <el-button type="text" @click="toggleEmojiPicker(comment.id)">
                  <el-icon><Sunny /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="reply-form-actions">
              <el-button size="small" @click="cancelReply">取消</el-button>
              <el-button size="small" type="primary" @click="submitReply(comment)">提交回复</el-button>
            </div>
          </div>
        </div>
      </div>
      
      <el-empty v-else description="暂无评论，快来发表第一条评论吧！" />
      
      <!-- 评论表单 -->
      <div class="comment-form" id="comment-form">
        <h4>发表评论</h4>
        <div class="emoji-picker-container" v-if="showEmojiPicker === 'comment'">
          <div class="emoji-list">
            <span v-for="emoji in emojiList" :key="emoji" @click="addEmoji(emoji, 'comment')">{{ emoji }}</span>
          </div>
        </div>
        <div class="comment-input-container">
          <el-input
            v-model="commentForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入您的评论..."
            resize="none"
          />
          <div class="input-actions">
            <el-button type="text" @click="toggleEmojiPicker('comment')">
              <el-icon><Sunny /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="comment-form-actions">
          <el-button type="primary" @click="submitComment">提交评论</el-button>
        </div>
      </div>
    </div>

    <!-- 分享对话框 -->
    <el-dialog v-model="shareDialogVisible" title="分享话题" width="400px">
      <div class="share-dialog-content">
        <p class="share-title">{{ topic?.title }}</p>
        <div class="share-options">
          <div class="share-option" @click="copyShareLink">
            <el-icon><Link /></el-icon>
            <span>复制链接</span>
          </div>
          <div class="share-option">
            <el-icon><ChatDotSquare /></el-icon>
            <span>微信</span>
          </div>
          <div class="share-option">
            <el-icon><Message /></el-icon>
            <span>微博</span>
          </div>
          <div class="share-option">
            <el-icon><Document /></el-icon>
            <span>QQ</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ACTIVITY_TYPES, recordActivity } from '../utils/activityTracker'
import { ArrowLeft, View, Star, Share, ChatDotRound, ChatLineRound, Link, ChatDotSquare, Message, Document, Sunny } from '@element-plus/icons-vue'

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
const topicLikes = ref(0)
const isTopicLiked = ref(false)
const shareDialogVisible = ref(false)
const commentSortOrder = ref('newest')
const showEmojiPicker = ref(null)

// 表情列表
const emojiList = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '👍', '👎', '❤️', '🔥', '🎉', '👏', '🤔', '🤯', '😱', '🤩'
]

// 评论表单
const commentForm = reactive({
  content: ''
})

// 回复表单
const replyForm = reactive({
  content: '',
  replyTo: ''
})

// 排序后的评论
const sortedComments = computed(() => {
  if (commentSortOrder.value === 'newest') {
    return [...comments.value].sort((a, b) => new Date(b.time) - new Date(a.time))
  } else {
    return [...comments.value].sort((a, b) => new Date(a.time) - new Date(b.time))
  }
})

// 返回上一页
const goBack = () => {
  router.push('/forum')
}

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
        
        // 获取点赞数
        const likesKey = `topic_likes_${topicId}`
        const likesData = localStorage.getItem(likesKey)
        if (likesData) {
          const likesInfo = JSON.parse(likesData)
          topicLikes.value = likesInfo.count || 0
          
          // 检查当前用户是否已点赞
          const userLiked = likesInfo.users?.includes(currentUser.value.username)
          isTopicLiked.value = !!userLiked
        } else {
          topicLikes.value = 0
          isTopicLiked.value = false
        }
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
    replies: [],
    likes: 0
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
  showEmojiPicker.value = null
  
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
  showEmojiPicker.value = null
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
    replyTo: comment.author,
    likes: 0
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

// 点赞话题
const likeTopic = () => {
  const topicId = route.params.id
  const likesKey = `topic_likes_${topicId}`
  
  let likesInfo = { count: 0, users: [] }
  const likesData = localStorage.getItem(likesKey)
  
  if (likesData) {
    try {
      likesInfo = JSON.parse(likesData)
    } catch (e) {
      console.error('解析点赞数据失败', e)
    }
  }
  
  // 检查用户是否已点赞
  const username = currentUser.value.username
  const userIndex = likesInfo.users?.indexOf(username)
  
  if (userIndex === -1 || userIndex === undefined) {
    // 用户未点赞，添加点赞
    likesInfo.count = (likesInfo.count || 0) + 1
    if (!likesInfo.users) likesInfo.users = []
    likesInfo.users.push(username)
    isTopicLiked.value = true
    ElMessage.success('点赞成功')
  } else {
    // 用户已点赞，取消点赞
    likesInfo.count = Math.max(0, (likesInfo.count || 1) - 1)
    likesInfo.users.splice(userIndex, 1)
    isTopicLiked.value = false
    ElMessage.info('已取消点赞')
  }
  
  // 更新点赞数
  topicLikes.value = likesInfo.count
  localStorage.setItem(likesKey, JSON.stringify(likesInfo))
  
  // 记录点赞活动
  recordActivity({
    type: ACTIVITY_TYPES.LIKE_TOPIC,
    topicId,
    topicTitle: topic.value?.title,
    action: isTopicLiked.value ? '点赞' : '取消点赞'
  })
}

// 点赞评论
const likeComment = (comment) => {
  if (!comment.likes) comment.likes = 0
  comment.likes++
  
  const topicId = route.params.id
  localStorage.setItem(`comments_${topicId}`, JSON.stringify(comments.value))
  
  ElMessage.success('点赞成功')
}

// 点赞回复
const likeReply = (comment, reply) => {
  if (!reply.likes) reply.likes = 0
  reply.likes++
  
  const topicId = route.params.id
  localStorage.setItem(`comments_${topicId}`, JSON.stringify(comments.value))
  
  ElMessage.success('点赞成功')
}

// 分享话题
const shareTopic = () => {
  shareDialogVisible.value = true
}

// 复制分享链接
const copyShareLink = () => {
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success('链接已复制到剪贴板')
    shareDialogVisible.value = false
  }).catch(err => {
    console.error('复制失败:', err)
    ElMessage.error('复制失败')
  })
}

// 滚动到评论表单
const scrollToCommentForm = () => {
  document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' })
}

// 切换表情选择器
const toggleEmojiPicker = (id) => {
  showEmojiPicker.value = showEmojiPicker.value === id ? null : id
}

// 添加表情
const addEmoji = (emoji, type) => {
  if (type === 'comment') {
    commentForm.content += emoji
  } else if (type === 'reply') {
    replyForm.content += emoji
  }
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
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #409eff;
  transition: all 0.3s;
}

.back-button:hover {
  transform: translateX(-3px);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.avatar:hover {
  transform: scale(1.05);
}

.topic-detail {
  background-color: #fff;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.topic-detail:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.topic-header {
  margin-bottom: 20px;
}

.topic-title {
  margin-bottom: 15px;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.topic-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  border: 2px solid #f0f2f5;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #303133;
  font-size: 15px;
}

.publish-time {
  font-size: 13px;
  color: #909399;
}

.meta-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.category-tag {
  font-size: 13px;
}

.views-count {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #909399;
  font-size: 14px;
}

.topic-content {
  margin: 20px 0;
  line-height: 1.8;
  color: #303133;
  font-size: 16px;
  white-space: pre-wrap;
}

.topic-tags {
  margin: 20px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  transition: all 0.3s;
}

.tag-item:hover {
  transform: translateY(-2px);
}

.topic-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #f0f2f5;
}

.is-liked {
  color: #e74c3c !important;
  border-color: #e74c3c !important;
}

.comments-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f2f5;
}

.comment-list {
  margin-bottom: 30px;
}

.comment-item {
  padding: 20px 0;
  border-bottom: 1px solid #f0f2f5;
  transition: all 0.3s;
}

.comment-item:hover {
  background-color: #f9fafc;
  border-radius: 8px;
  padding-left: 15px;
  padding-right: 15px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comment-avatar {
  border: 2px solid #f0f2f5;
  transition: all 0.3s;
}

.comment-avatar:hover {
  transform: scale(1.05);
}

.comment-user-info {
  display: flex;
  flex-direction: column;
}

.comment-author {
  font-weight: 600;
  color: #303133;
  font-size: 15px;
}

.comment-time {
  font-size: 13px;
  color: #909399;
}

.comment-actions {
  display: flex;
  gap: 10px;
}

.comment-content {
  margin: 10px 0;
  color: #303133;
  line-height: 1.7;
  font-size: 15px;
}

.replies-list {
  margin-left: 50px;
  margin-top: 15px;
  background-color: #f9fafc;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s;
}

.reply-item {
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.reply-item:last-child {
  border-bottom: none;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reply-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reply-avatar {
  border: 1px solid #f0f2f5;
}

.reply-user-info {
  display: flex;
  flex-direction: column;
}

.reply-author {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}

.reply-time {
  font-size: 12px;
  color: #909399;
}

.reply-actions {
  display: flex;
  gap: 8px;
}

.reply-content {
  margin-left: 40px;
  color: #303133;
  line-height: 1.6;
  font-size: 14px;
}

.reply-to {
  color: #409eff;
  font-weight: 600;
  margin-right: 5px;
}

.reply-form {
  margin-top: 15px;
  margin-left: 50px;
  background-color: #f9fafc;
  border-radius: 8px;
  padding: 15px;
}

.reply-input-container {
  position: relative;
  margin-bottom: 10px;
}

.input-actions {
  position: absolute;
  right: 10px;
  bottom: 10px;
}

.reply-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.comment-form {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f2f5;
}

.comment-form h4 {
  margin-bottom: 15px;
  font-weight: 600;
  color: #303133;
}

.comment-input-container {
  position: relative;
  margin-bottom: 15px;
}

.comment-form-actions {
  display: flex;
  justify-content: flex-end;
}

.emoji-picker-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #ebeef5;
}

.emoji-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.emoji-list span {
  cursor: pointer;
  font-size: 20px;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s;
}

.emoji-list span:hover {
  background-color: #f0f2f5;
  transform: scale(1.2);
}

.share-dialog-content {
  padding: 10px;
}

.share-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
  text-align: center;
}

.share-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.share-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.share-option:hover {
  background-color: #f0f2f5;
  transform: translateY(-3px);
}

.share-option .el-icon {
  font-size: 24px;
  color: #409eff;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .topic-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .meta-right {
    margin-top: 5px;
  }
  
  .replies-list {
    margin-left: 20px;
  }
  
  .reply-form {
    margin-left: 20px;
  }
  
  .reply-content {
    margin-left: 20px;
  }
  
  .share-options {
    grid-template-columns: 1fr;
  }
}

/* 添加过渡动画 */
.comment-item, .reply-item, .topic-detail {
  transition: transform 0.3s, box-shadow 0.3s, background-color 0.3s;
}

.el-button {
  transition: all 0.3s;
}

.el-button:hover {
  transform: translateY(-2px);
}
</style>