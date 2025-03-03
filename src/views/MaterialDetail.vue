<template>
  <div class="material-detail-container">
    <div class="page-header">
      <h1>资料详情</h1>
      <div class="user-info">
        <span>{{ currentUser.role }}</span>
        <el-avatar :size="40" class="avatar">{{ currentUser.avatar }}</el-avatar>
      </div>
    </div>

    <el-card v-if="material" class="material-info-card">
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
          <p class="material-description">{{ material.description }}</p>
          <div class="material-meta">
            <el-tag size="small" type="info" effect="plain">
              <el-icon><Calendar /></el-icon>
              <span>上传于 {{ material.uploadDate }}</span>
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
      <div class="material-actions">
        <el-button type="primary" @click="handleDownload">
          <el-icon><Download /></el-icon> 下载资料
        </el-button>
        <el-button type="info" @click="handleShare">
          <el-icon><Share /></el-icon> 分享资料
        </el-button>
      </div>
    </el-card>

    <div class="comments-section">
      <h2 class="section-title">
        <el-icon><ChatDotRound /></el-icon> 评论区 ({{ commentCount }})
      </h2>
      
      <!-- 评论输入框 -->
      <el-card class="comment-input-card">
        <div class="comment-input-header">
          <el-avatar :size="40">{{ currentUser.avatar }}</el-avatar>
          <span class="username">{{ currentUser.role }}</span>
        </div>
        <el-input
          v-model="commentContent"
          type="textarea"
          :rows="3"
          placeholder="发表你的评论..."
          class="comment-textarea"
        />
        <div class="comment-input-footer">
          <el-button type="primary" @click="submitComment" :disabled="!commentContent.trim()">
            发表评论
          </el-button>
        </div>
      </el-card>

      <!-- 评论列表 -->
      <div class="comments-list" v-loading="commentsLoading">
        <el-empty v-if="comments.length === 0 && !commentsLoading" description="暂无评论" />
        
        <el-card v-for="comment in comments" :key="comment.id" class="comment-card">
          <div class="comment-header">
            <div class="comment-user">
              <el-avatar :size="40">{{ comment.avatar }}</el-avatar>
              <div class="comment-info">
                <span class="comment-author">{{ comment.author }}</span>
                <span class="comment-time">{{ comment.createTime }}</span>
              </div>
            </div>
            <div class="comment-actions">
              <el-button type="primary" text @click="likeCommentAction(comment.id)">
                <el-icon><ThumbUp /></el-icon> {{ comment.likes }}
              </el-button>
              <el-button type="info" text @click="showReplyInput(comment.id)">
                <el-icon><ChatLineRound /></el-icon> 回复
              </el-button>
            </div>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
          
          <!-- 回复列表 -->
          <div class="replies-list" v-if="comment.replies && comment.replies.length > 0">
            <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
              <div class="reply-header">
                <div class="reply-user">
                  <el-avatar :size="30">{{ reply.avatar }}</el-avatar>
                  <div class="reply-info">
                    <span class="reply-author">{{ reply.author }}</span>
                    <span class="reply-time">{{ reply.createTime }}</span>
                  </div>
                </div>
                <div class="reply-actions">
                  <el-button type="primary" text @click="likeReplyAction(reply.id, comment.id)">
                    <el-icon><ThumbUp /></el-icon> {{ reply.likes }}
                  </el-button>
                </div>
              </div>
              <div class="reply-content">{{ reply.content }}</div>
            </div>
          </div>
          
          <!-- 回复输入框 -->
          <div class="reply-input" v-if="activeReplyId === comment.id">
            <div class="reply-input-header">
              <el-avatar :size="30">{{ currentUser.avatar }}</el-avatar>
              <span class="username">{{ currentUser.role }}</span>
            </div>
            <el-input
              v-model="replyContent"
              type="textarea"
              :rows="2"
              placeholder="回复评论..."
              class="reply-textarea"
            />
            <div class="reply-input-footer">
              <el-button @click="cancelReply">取消</el-button>
              <el-button type="primary" @click="submitReply(comment.id)" :disabled="!replyContent.trim()">
                回复
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Picture, VideoCamera, Files, Calendar, Download, Share, User, ChatDotRound, ThumbUp, ChatLineRound } from '@element-plus/icons-vue'
import { downloadMaterial, shareMaterial } from '../api/materials'
import { getMaterialComments, addComment, addReply, likeComment, getCommentsCount } from '../api/comments'

const route = useRoute()
const router = useRouter()
const materialId = computed(() => Number(route.params.id))

const material = ref(null)
const comments = ref([])
const commentCount = ref(0)
const commentsLoading = ref(true)
const commentContent = ref('')
const replyContent = ref('')
const activeReplyId = ref(null)

const currentUser = ref({
  role: '管理员',
  avatar: 'A'
})

// 获取资料详情
const fetchMaterialDetail = async () => {
  try {
    // 在实际应用中，这里会调用API获取资料详情
    // 这里模拟从本地存储中获取
    const materials = JSON.parse(localStorage.getItem('materials') || '[]')
    material.value = materials.find(m => m.id === materialId.value)
    
    if (!material.value) {
      ElMessage.error('资料不存在')
      router.push('/materials')
    }
  } catch (error) {
    console.error('获取资料详情失败:', error)
    ElMessage.error('获取资料详情失败')
  }
}

// 获取评论
const fetchComments = async () => {
  commentsLoading.value = true
  try {
    const result = await getMaterialComments(materialId.value)
    comments.value = result
    
    // 获取评论总数
    const countResult = await getCommentsCount(materialId.value)
    commentCount.value = countResult.count
  } catch (error) {
    console.error('获取评论失败:', error)
    ElMessage.error('获取评论失败')
  } finally {
    commentsLoading.value = false
  }
}

// 下载资料
const handleDownload = async () => {
  try {
    await downloadMaterial(materialId.value)
    ElMessage.success('资料下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('资料下载失败')
  }
}

// 分享资料
const handleShare = async () => {
  try {
    const result = await shareMaterial(materialId.value)
    
    if (result.success) {
      ElMessageBox.alert(
        `分享链接: ${result.shareLink}`,
        '分享资料',
        {
          confirmButtonText: '复制链接',
          callback: () => {
            // 复制链接到剪贴板
            navigator.clipboard.writeText(result.shareLink)
              .then(() => ElMessage.success('链接已复制到剪贴板'))
              .catch(() => ElMessage.error('复制失败'))
          }
        }
      )
    } else {
      ElMessage.error(result.message || '分享失败')
    }
  } catch (error) {
    console.error('分享失败:', error)
    ElMessage.error('资料分享失败')
  }
}

// 提交评论
const submitComment = async () => {
  if (!commentContent.value.trim()) return
  
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
    
    // 重新获取评论列表
    fetchComments()
  } catch (error) {
    console.error('评论发表失败:', error)
    ElMessage.error('评论发表失败')
  }
}

// 显示回复输入框
const showReplyInput = (commentId) => {
  activeReplyId.value = commentId
  replyContent.value = ''
}

// 取消回复
const cancelReply = () => {
  activeReplyId.value = null
  replyContent.value = ''
}

// 提交回复
const submitReply = async (commentId) => {
  if (!replyContent.value.trim()) return
  
  try {
    const replyData = {
      parentId: commentId,
      content: replyContent.value,
      author: currentUser.value.role,
      avatar: currentUser.value.avatar
    }
    
    await addReply(replyData)
    ElMessage.success('回复发表成功')
    replyContent.value = ''
    activeReplyId.value = null
    
    // 重新获取评论列表
    fetchComments()
  } catch (error) {
    console.error('回复发表失败:', error)
    ElMessage.error('回复发表失败')
  }
}

// 点赞评论
const likeCommentAction = async (commentId) => {
  try {
    await likeComment(commentId, false)
    // 重新获取评论列表
    fetchComments()
    ElMessage.success('点赞成功')
  } catch (error) {
    console.error('点赞失败:', error)
    ElMessage.error('点赞失败')
  }
}

// 点赞回复
const likeReplyAction = async (replyId) => {
  try {
    await likeComment(replyId, true)
    // 重新获取评论列表
    fetchComments()
    ElMessage.success('点赞成功')
  } catch (error) {
    console.error('点赞失败:', error)
    ElMessage.error('点赞失败')
  }
}

onMounted(() => {
  fetchMaterialDetail()
  fetchComments()
})
</script>

<style lang="scss" scoped>
.material-detail-container {
  padding: 20px;
  background-color: #f9fafc;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
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
  
  .material-info-card {
    margin-bottom: 30px;
    
    .material-header {
      display: flex;
      margin-bottom: 20px;
      
      .material-icon {
        margin-right: 20px;
        
        .icon-wrapper {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          
          &.document-bg {
            background-color: rgba(64, 158, 255, 0.1);
            color: #409EFF;
          }
          
          &.image-bg {
            background-color: rgba(103, 194, 58, 0.1);
            color: #67C23A;
          }
          
          &.video-bg {
            background-color: rgba(230, 162, 60, 0.1);
            color: #E6A23C;
          }
        }
      }
      
      .material-title-section {
        flex: 1;
        
        h2 {
          margin: 0 0 10px 0;
          font-size: 20px;
        }
        
        .material-description {
          margin: 0 0 15px 0;
          color: #606266;
          font-size: 14px;
        }
        
        .material-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
      }
    }
    
    .material-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
  }
  
  .comments-section {
    margin-top: 30px;
    
    .section-title {
      display: flex;
      align-items: center;
      font-size: 18px;
      margin-bottom: 20px;
      
      .el-icon {
        margin-right: 8px;
      }
    }
    
    .comment-input-card {
      margin-bottom: 20px;
      
      .comment-input-header {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        
        .username {
          margin-left: 10px;
          font-weight: 500;
        }
      }
      
      .comment-textarea {
        margin-bottom: 15px;
      }
      
      .comment-input-footer {
        display: flex;
        justify-content: flex-end;
      }
    }
    
    .comments-list {
      .comment-card {
        margin-bottom: 15px;
        
        .comment-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          
          .comment-user {
            display: flex;
            align-items: center;
            
            .comment-info {
              margin-left: 10px;
              
              .comment-author {
                display: block;
                font-weight: 500;
                font-size: 14px;
              }
              
              .comment-time {
                display: block;
                font-size: 12px;
                color: #909399;
              }
            }
          }
          
          .comment-actions {
            display: flex;
            align-items: center;
            gap: 10px;
          }
        }
        
        .comment-content {
          margin-bottom: 15px;
          line-height: 1.6;
          font-size: 14px;
        }
        
        .replies-list {
          background-color: #f5f7fa;
          border-radius: 4px;
          padding: 10px;
          margin-bottom: 15px;
          
          .reply-item {
            padding: 10px 0;
            border-bottom: 1px solid #ebeef5;
            
            &:last-child {
              border-bottom: none;
            }
            
            .reply-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              
              .reply-user {
                display: flex;
                align-items: center;
                
                .reply-info {
                  margin-left: 10px;
                  
                  .reply-author {
                    display: block;
                    font-weight: 500;
                    font-size: 13px;
                  }
                  
                  .reply-time {
                    display: block;
                    font-size: 12px;
                    color: #909399;
                  }
                }
              }
            }
            
            .reply-content {
              font-size: 13px;
              line-height: 1.5;
            }
          }
        }
        
        .reply-input {
          background-color: #f5f7fa;
          border-radius: 4px;
          padding: 15px;
          
          .reply-input-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            
            .username {
              margin-left: 10px;
              font-size: 13px;
            }
          }
          
          .reply-textarea {
            margin-bottom: 10px;
          }
          
          .reply-input-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .material-detail-container {
    .material-info-card {
      .material-header {
        flex-direction: column;
        
        .material-icon {
          margin-right: 0;
          margin-bottom: 15px;
          display: flex;
          justify-content: center;
        }
      }
      
      .material-actions {
        flex-direction: column;
      }
    }
  }
}