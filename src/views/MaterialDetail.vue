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

      <!-- 新增思维导图展示区域 -->
      <div class="mindmaps-section">
        <h2>相关思维导图（{{ relatedMindmaps.length }}）</h2>
        <div v-if="relatedMindmaps.length > 0" class="mindmaps-list">
          <div v-for="mindmap in relatedMindmaps" :key="mindmap.id" class="mindmap-item">
            <h3>{{ mindmap.title }}</h3>
            <p>{{ mindmap.description }}</p>
            <div class="mindmap-meta">
              <span>节点数：{{ mindmap.nodeCount }}</span>
              <span>创建时间：{{ formatDate(mindmap.createdAt) }}</span>
            </div>
            <button @click="viewMindmap(mindmap.id)">查看</button>
          </div>
        </div>
        <div v-else class="no-mindmaps">
          暂无相关思维导图
        </div>
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
import { searchMindmapsByTags } from '../api/tagBasedMindmap.js'
import { formatDate } from '../utils/date.js'

export default {
  setup() {
    const route = useRoute()
    const materialId = route.params.id
    const material = ref({})
    const comments = ref([])
    const newComment = ref('')
    const loading = ref(true)
    const relatedMindmaps = ref([])

    const fetchData = async () => {
      try {
        const [detailRes, commentsRes] = await Promise.all([
          getMaterialDetail(materialId),
          getMaterialComments(materialId)
        ])
        material.value = detailRes.data
        comments.value = commentsRes.data
        
        // 获取相关思维导图
        if (material.value.hierarchicalTags) {
          const mindmaps = await searchMindmapsByTags(material.value.hierarchicalTags)
          relatedMindmaps.value = mindmaps
        }
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

    const viewMindmap = (id) => {
      window.open(`/mindmap/${id}`, '_blank')
    }

    onMounted(() => {
      fetchData()
    })

    return {
      material,
      comments,
      newComment,
      loading,
      relatedMindmaps,
      formatDate,
      submitComment,
      viewMindmap
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

.mindmaps-section {
  margin: 40px 0;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.mindmaps-list {
  margin-top: 20px;
}

.mindmap-item {
  background: white;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.mindmap-item h3 {
  margin: 0 0 10px 0;
  color: #409eff;
}

.mindmap-meta {
  color: #666;
  margin: 10px 0;
}

.mindmap-meta span {
  margin-right: 15px;
}

.no-mindmaps {
  text-align: center;
  color: #999;
  padding: 20px;
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
