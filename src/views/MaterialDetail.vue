<template>
  <div class="material-detail-container">
    <div class="page-header">
      <h1>资料详情</h1>
      <div class="user-info">
        <span>{{ currentUser.role }}</span>
        <el-avatar :size="40" class="avatar">{{ currentUser.avatar }}</el-avatar>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else-if="material" class="material-content">
      <!-- 资料详情卡片 -->
      <el-card class="detail-card">
        <div class="material-header">
          <div class="material-icon">
            <div class="icon-wrapper" :class="`${material.type}-bg`">
              <el-icon :size="40" v-if="material.type === 'document'"><Document /></el-icon>
              <el-icon :size="40" v-else-if="material.type === 'image'"><Picture /></el-icon>
              <el-icon :size="40" v-else-if="material.type === 'video'"><VideoCamera /></el-icon>
              <el-icon :size="40" v-else><Files /></el-icon>
            </div>
          </div>
          <div class="material-title-section">
            <h2>{{ material.name }}</h2>
            <div class="material-meta">
              <el-tag size="small" type="info" effect="plain">
                <el-icon><Calendar /></el-icon>
                <span>{{ material.uploadDate }}</span>
              </el-tag>
              <el-tag size="small" type="success" effect="plain">
                <el-icon><Download /></el-icon>
                <span>{{ material.downloads }}次下载</span>
              </el-tag>
              <el-tag size="small" type="warning" effect="plain">
                <el-icon><Files /></el-icon>
                <span>{{ material.size }}</span>
              </el-tag>
              <el-tag size="small" type="primary" effect="plain">
                <el-icon><User /></el-icon>
                <span>上传者: {{ material.uploader }}</span>
              </el-tag>
            </div>
          </div>
        </div>

        <div class="material-description">
          <h3>资料描述</h3>
          <p>{{ material.description }}</p>
        </div>

        <!-- 标签展示区域 -->
        <div class="material-tags" v-if="material.hierarchicalTags || material.customTags">
          <h3>资料标签</h3>
          <div class="tags-container">
            <!-- 分级标签 -->
            <div v-if="material.hierarchicalTags && material.hierarchicalTags.length > 0" class="hierarchical-tags">
              <h4>分类标签</h4>
              <div class="tag-list">
                <el-tag 
                  v-for="(tag, index) in material.hierarchicalTags" 
                  :key="'h-'+index"
                  type="success"
                  effect="light"
                  class="tag-item"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
            
            <!-- 自定义标签 -->
            <div v-if="material.customTags && material.customTags.length > 0" class="custom-tags">
              <h4>自定义标签</h4>
              <div class="tag-list">
                <el-tag 
                  v-for="(tag, index) in material.customTags" 
                  :key="'c-'+index"
                  type="info"
                  effect="light"
                  class="tag-item"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <div class="material-actions">
          <el-button type="primary" @click="handleDownload">
            <el-icon><Download /></el-icon> 下载资料
          </el-button>
          <el-button type="info" @click="handleShare">
            <el-icon><Share /></el-icon> 分享资料
          </el-button>
          <el-button @click="goBack">
            <el-icon><Back /></el-icon> 返回列表
          </el-button>
        </div>
      </el-card>

      <!-- 评论区 -->
      <el-card class="comments-card">
        <template #header>
          <div class="comments-header">
            <h3>评论区</h3>
            <span class="comment-count">{{ comments.length }}条评论</span>
          </div>
        </template>

        <!-- 发表评论 -->
        <div class="comment-form">
          <el-avatar :size="40" class="avatar">{{ currentUser.avatar }}</el-avatar>
          <div class="comment-input-container">
            <el-input
              v-model="commentContent"
              type="textarea"
              :rows="2"
              placeholder="发表你的评论..."
              resize="none"
            />
            <el-button type="primary" @click="submitComment" :disabled="!commentContent.trim()" :loading="commentSubmitting">
              发表评论
            </el-button>
          </div>
        </div>

        <!-- 评论列表 -->
        <div class="comments-list" v-if="comments.length > 0">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <!-- 主评论 -->
            <div class="comment-main">
              <el-avatar :size="40" class="avatar">{{ comment.avatar }}</el-avatar>
              <div class="comment-content">
                <div class="comment-info">
                  <span class="comment-author">{{ comment.author }}</span>
                  <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
                </div>
                <p class="comment-text">{{ comment.content }}</p>
                <div class="comment-actions">
                  <el-button text type="primary" @click="showReplyForm(comment.id)">
                    <el-icon><ChatDotRound /></el-icon> 回复
                  </el-button>
                  <el-button text type="info" @click="likeCommentAction(comment.id)">
                    <el-icon><Star /></el-icon> 点赞({{ comment.likes }})
                  </el-button>
                  <el-button v-if="currentUser.role === comment.author" text type="danger" @click="deleteCommentAction(comment.id)">
                    <el-icon><Delete /></el-icon> 删除
                  </el-button>
                </div>

                <!-- 回复表单 -->
                <div v-if="replyToId === comment.id" class="reply-form">
                  <el-input
                    v-model="replyContent"
                    type="textarea"
                    :rows="1"
                    placeholder="回复评论..."
                    resize="none"
                  />
                  <div class="reply-actions">
                    <el-button size="small" @click="cancelReply">取消</el-button>
                    <el-button size="small" type="primary" @click="submitReply(comment.id)" :disabled="!replyContent.trim()" :loading="replySubmitting">
                      回复
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 回复列表 -->
            <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
              <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                <el-avatar :size="30" class="avatar">{{ reply.avatar }}</el-avatar>
                <div class="reply-content">
                  <div class="reply-info">
                    <span class="reply-author">{{ reply.author }}</span>
                    <span class="reply-time">{{ formatTime(reply.createTime) }}</span>
                  </div>
                  <p class="reply-text">{{ reply.content }}</p>
                  <div class="reply-actions">
                    <el-button text type="primary" @click="showReplyForm(comment.id, reply.author)">
                      <el-icon><ChatDotRound /></el-icon> 回复
                    </el-button>
                    <el-button text type="info" @click="likeCommentAction(reply.id)">
                      <el-icon><Star /></el-icon> 点赞({{ reply.likes }})
                    </el-button>
                    <el-button v-if="currentUser.role === reply.author" text type="danger" @click="deleteCommentAction(reply.id)">
                      <el-icon><Delete /></el-icon> 删除
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 无评论提示 -->
        <el-empty v-else description="暂无评论，快来发表第一条评论吧！" />
      </el-card>
    </div>

    <div v-else class="not-found">
      <el-result
        icon="error"
        title="资料不存在"
        sub-title="您查找的资料不存在或已被删除"
      >
        <template #extra>
          <el-button type="primary" @click="goBack">返回资料列表</el-button>
        </template>
      </el-result>
    </div>

    <!-- 分享对话框 -->
    <el-dialog v-model="shareDialogVisible" title="分享资料" width="400px">
      <div class="share-content">
        <p>分享链接已生成：</p>
        <el-input v-model="shareLink" readonly>
          <template #append>
            <el-button @click="copyShareLink">复制</el-button>
          </template>
        </el-input>
        <div class="qrcode-container" v-if="shareLink">
          <p>扫描二维码分享：</p>
          <div class="qrcode-placeholder">二维码占位</div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="shareDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Document, Picture, VideoCamera, Files, Calendar, Download, Share, Delete, ChatDotRound, Star, User, Back } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getAllMaterials, downloadMaterial, shareMaterial } from '../api/materials'
import { getMaterialComments, addComment, likeComment, deleteComment } from '../api/comments'

// 在组件挂载时加载资料详情和评论
onMounted(() => {
  loadMaterialDetail()
})

const route = useRoute()
const router = useRouter()
const materialId = computed(() => parseInt(route.params.id))

const loading = ref(true)
const material = ref(null)
const comments = ref([])
const shareDialogVisible = ref(false)
const shareLink = ref('')

// 评论相关
const commentContent = ref('')
const replyContent = ref('')
const replyToId = ref(null)
const replyToUser = ref('')
const commentSubmitting = ref(false)
const replySubmitting = ref(false)

// 当前用户信息
const currentUser = ref({
  role: '管理员',
  avatar: 'A'
})

// 加载资料详情
const loadMaterialDetail = async () => {
  loading.value = true
  try {
    const materials = await getAllMaterials()
    material.value = materials.find(m => m.id === materialId.value)
    
    if (material.value) {
      // 加载评论
      await loadComments()
    }
  } catch (error) {
    console.error('加载资料详情失败:', error)
    ElMessage.error('加载资料详情失败')
  } finally {
    loading.value = false
  }
}

// 加载评论
const loadComments = async () => {
  try {
    comments.value = await getMaterialComments(materialId.value)
  } catch (error) {
    console.error('加载评论失败:', error)
    ElMessage.error('加载评论失败')
  }
}

// 下载资料
const handleDownload = async () => {
  try {
    await downloadMaterial(materialId.value)
    ElMessage.success('下载开始')
    // 刷新资料信息以更新下载次数
    loadMaterialDetail()
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败')
  }
}

// 分享资料
const handleShare = async () => {
  try {
    const result = await shareMaterial(materialId.value)
    shareLink.value = result.shareLink
    shareDialogVisible.value = true
  } catch (error) {
    console.error('分享失败:', error)
    ElMessage.error('分享失败')
  }
}

// 复制分享链接
const copyShareLink = () => {
  navigator.clipboard.writeText(shareLink.value)
    .then(() => {
      ElMessage.success('链接已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
}

// 返回资料列表
const goBack = () => {
  router.push('/materials')
}

// 提交评论
const submitComment = async () => {
  if (!commentContent.value.trim()) return
  
  commentSubmitting.value = true
  try {
    const commentData = {
      materialId: materialId.value,
      content: commentContent.value,
      author: currentUser.value.role,
      avatar: currentUser.value.avatar
    }
    
    await addComment(commentData)
    ElMessage.success('评论发表成功')
    commentContent.value = ''
    await loadComments()
  } catch (error) {
    console.error('发表评论失败:', error)
    ElMessage.error('发表评论失败')
  } finally {
    commentSubmitting.value = false
  }
}

// 显示回复表单
const showReplyForm = (commentId, replyToUsername = '') => {
  replyToId.value = commentId
  replyToUser.value = replyToUsername
  replyContent.value = replyToUsername ? `@${replyToUsername} ` : ''
}

// 取消回复
const cancelReply = () => {
  replyToId.value = null
  replyToUser.value = ''
  replyContent.value = ''
}

// 提交回复
const submitReply = async (commentId) => {
  if (!replyContent.value.trim()) return
  
  replySubmitting.value = true
  try {
    const replyData = {
      materialId: materialId.value,
      content: replyContent.value,
      author: currentUser.value.role,
      avatar: currentUser.value.avatar,
      parentId: commentId
    }
    
    await addComment(replyData)
    ElMessage.success('回复发表成功')
    cancelReply()
    await loadComments()
  } catch (error) {
    console.error('发表回复失败:', error)
    ElMessage.error('发表回复失败')
  } finally {
    replySubmitting.value = false
  }
}

// 点赞评论
const likeCommentAction = async (commentId) => {
  try {
    await likeComment(commentId)
    await loadComments()
  } catch (error) {
    console.error('点赞失败:', error)
    ElMessage.error('点赞失败')
  }
}

// 删除评论
const deleteCommentAction = async (commentId) => {
  try {
    await deleteComment(commentId)
    ElMessage.success('评论已删除')
    await loadComments()
  } catch (error) {
    console.error('删除评论失败:', error)
    ElMessage.error('删除评论失败')
  }
}

// 格式化时间
const formatTime = (timeString) => {
  const date = new Date(timeString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}