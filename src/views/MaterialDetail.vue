<template>
  <div class="material-detail">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <div class="material-info">
        <h1>{{ material.title }}</h1>
        <div class="meta">
          <span>作者：{{ material.author }}</span>
          <span>发布时间：{{ formatDate(material.createdAt) }}</span>
        </div>
        <div class="content" v-html="material.content"></div>
      </div>

      <div class="comments-section">
        <h2>评论（{{ comments.length }}）</h2>
        <div class="comment-form">
          <textarea v-model="newComment" placeholder="请输入评论内容"></textarea>
          <button @click="submitComment" :disabled="!newComment.trim()">提交评论</button>
        </div>
        <div class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <span class="username">{{ comment.user.name }}</span>
              <span class="time">{{ formatDate(comment.createdAt) }}</span>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getMaterialDetail, getMaterialComments, addComment } from '../api/materials.js'
import { formatDate } from '../utils/date.js'

export default {
  setup() {
    const route = useRoute()
    const materialId = route.params.id
    const material = ref({})
    const comments = ref([])
    const newComment = ref('')
    const loading = ref(true)

    const fetchData = async () => {
      try {
        const [detailRes, commentsRes] = await Promise.all([
          getMaterialDetail(materialId),
          getMaterialComments(materialId)
        ])
        material.value = detailRes.data
        comments.value = commentsRes.data
      } catch (error) {
        console.error('获取数据失败:', error)
      } finally {
        loading.value = false
      }
    }

    const submitComment = async () => {
      if (!newComment.value.trim()) return
      
      try {
        const res = await addComment(materialId, {
          content: newComment.value
        })
        comments.value.unshift(res.data)
        newComment.value = ''
      } catch (error) {
        console.error('提交评论失败:', error)
      }
    }

    onMounted(() => {
      fetchData()
    })

    return {
      material,
      comments,
      newComment,
      loading,
      formatDate,
      submitComment
    }
  }
}
</script>

<style scoped>
.material-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 50px;
  font-size: 18px;
}

.material-info {
  margin-bottom: 40px;
}

.material-info h1 {
  margin-bottom: 10px;
}

.meta {
  color: #666;
  margin-bottom: 20px;
}

.meta span {
  margin-right: 15px;
}

.comments-section {
  margin-top: 40px;
}

.comment-form {
  margin: 20px 0;
}

.comment-form textarea {
  width: 100%;
  height: 100px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.comment-form button {
  padding: 8px 20px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.comment-form button:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.comments-list {
  margin-top: 20px;
}

.comment-item {
  border-bottom: 1px solid #eee;
  padding: 15px 0;
}

.comment-header {
  margin-bottom: 10px;
  color: #666;
}

.comment-header .username {
  font-weight: bold;
  margin-right: 10px;
}

.comment-content {
  line-height: 1.6;
}
</style>
