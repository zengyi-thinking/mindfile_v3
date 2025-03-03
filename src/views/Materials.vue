<template>
  <div class="materials-container">
    <div class="page-header">
      <h1>资料管理</h1>
      <div class="user-info">
        <span>{{ currentUser.role }}</span>
        <el-avatar :size="40" class="avatar">{{ currentUser.avatar }}</el-avatar>
      </div>
    </div>

    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索资料..."
        class="search-input"
        clearable
        @keyup.enter="handleSearch"
      />
      <el-select v-model="fileType" placeholder="所有类型" class="file-type-select">
        <el-option label="所有类型" value="all" />
        <el-option label="文档" value="document" />
        <el-option label="图片" value="image" />
        <el-option label="视频" value="video" />
        <el-option label="其他" value="other" />
      </el-select>
      <el-select v-model="sortBy" placeholder="最新上传" class="sort-select" @change="handleSortChange">
        <el-option label="最新上传" value="newest" />
        <el-option label="最多下载" value="downloads" />
        <el-option label="名称排序" value="name" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button type="primary" class="upload-btn" @click="showUploadDialog">上传资料</el-button>
    </div>

    <div class="materials-list">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="(material, index) in materials" :key="index">
          <el-card class="material-item" shadow="hover">
            <div class="material-icon">
              <div class="icon-wrapper" :class="`${material.type}-bg`">
                <el-icon :size="30" v-if="material.type === 'document'"><Document /></el-icon>
                <el-icon :size="30" v-else-if="material.type === 'image'"><Picture /></el-icon>
                <el-icon :size="30" v-else-if="material.type === 'video'"><VideoCamera /></el-icon>
                <el-icon :size="30" v-else><Files /></el-icon>
              </div>
            </div>
            <div class="material-info">
              <h3 class="material-title">{{ material.name }}</h3>
              <p class="material-desc">{{ material.description }}</p>
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
              </div>
              <div class="material-actions">
                <el-button type="primary" size="small" text @click="handleDownload(material)">
                  <el-icon><Download /></el-icon> 下载
                </el-button>
                <el-button type="info" size="small" text @click="handleShare(material)">
                  <el-icon><Share /></el-icon> 分享
                </el-button>
                <el-button type="danger" size="small" text @click="handleDelete(material)">
                  <el-icon><Delete /></el-icon> 删除
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 上传对话框 -->
    <el-dialog v-model="uploadDialogVisible" title="上传资料" width="500px">
      <el-form :model="uploadForm" label-width="80px">
        <el-form-item label="资料名称">
          <el-input v-model="uploadForm.name" placeholder="请输入资料名称" />
        </el-form-item>
        <el-form-item label="资料描述">
          <el-input v-model="uploadForm.description" type="textarea" placeholder="请输入资料描述" />
        </el-form-item>
        <el-form-item label="资料类型">
          <el-select v-model="uploadForm.type" placeholder="请选择资料类型">
            <el-option label="文档" value="document" />
            <el-option label="图片" value="image" />
            <el-option label="视频" value="video" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="上传文件">
          <el-upload
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            :file-list="uploadFiles"
            class="upload-demo"
          >
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">请上传资料文件，大小不超过50MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUpload" :loading="loading">上传</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Document, Picture, VideoCamera, Files } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getAllMaterials, uploadMaterial, downloadMaterial, shareMaterial, deleteMaterial, searchMaterials } from '../api/materials'
import { addMaterialToSearchIndex } from '../api/mindmap'

const searchQuery = ref('')
const fileType = ref('all')
const sortBy = ref('newest')
const uploadDialogVisible = ref(false)
const loading = ref(false)

const currentUser = ref({
  role: '管理员',
  avatar: 'A'
})

// 资料数据
const materials = ref([])

// 上传表单数据
const uploadForm = ref({
  name: '',
  description: '',
  type: 'document',
  file: null
})

// 上传文件列表
const uploadFiles = ref([])

// 显示上传对话框
const showUploadDialog = () => {
  uploadDialogVisible.value = true
  uploadForm.value = {
    name: '',
    description: '',
    type: 'document',
    file: null
  }
  uploadFiles.value = []
}

// 提交上传
const submitUpload = async () => {
  if (!uploadFiles.value || uploadFiles.value.length === 0) {
    ElMessage.warning('请选择要上传的文件')
    return
  }
  
  const file = uploadFiles.value[0].raw
  
  if (!uploadForm.value.name) {
    uploadForm.value.name = file.name
  }
  
  loading.value = true
  try {
    // 调用API上传文件
    const materialData = {
      name: uploadForm.value.name,
      description: uploadForm.value.description,
      type: uploadForm.value.type,
      uploader: currentUser.value.role
    }
    
    const newMaterial = await uploadMaterial(materialData, file)
    
    // 将资料添加到思维导图搜索引擎
    await addMaterialToSearchIndex(newMaterial)
    
    ElMessage.success('资料上传成功')
    uploadDialogVisible.value = false
    
    // 刷新资料列表
    loadMaterials()
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('资料上传失败')
  } finally {
    loading.value = false
  }
}

// 下载资料
const handleDownload = async (material) => {
  try {
    await downloadMaterial(material.id)
    ElMessage.success('下载开始')
    // 刷新资料列表以更新下载次数
    loadMaterials()
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败')
  }
}

// 分享资料
const handleShare = async (material) => {
  try {
    const result = await shareMaterial(material.id)
    ElMessage.success(`分享链接已生成: ${result.shareLink}`)
  } catch (error) {
    console.error('分享失败:', error)
    ElMessage.error('分享失败')
  }
}

// 删除资料
const handleDelete = async (material) => {
  try {
    await deleteMaterial(material.id)
    ElMessage.success('资料已删除')
    // 刷新资料列表
    loadMaterials()
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  }
}

// 搜索资料
const handleSearch = async () => {
  try {
    const results = await searchMaterials(searchQuery.value, fileType.value)
    materials.value = results
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败')
  }
}

// 加载资料列表
const loadMaterials = async () => {
  try {
    materials.value = await getAllMaterials()
    
    // 根据排序方式排序
    if (sortBy.value === 'newest') {
      materials.value.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
    } else if (sortBy.value === 'downloads') {
      materials.value.sort((a, b) => b.downloads - a.downloads)
    } else if (sortBy.value === 'name') {
      materials.value.sort((a, b) => a.name.localeCompare(b.name))
    }
  } catch (error) {
    console.error('加载资料失败:', error)
    ElMessage.error('加载资料失败')
  }
}

// 监听排序方式变化
const handleSortChange = () => {
  loadMaterials()
}

// 文件上传变化处理
const handleFileChange = (file, fileList) => {
  uploadFiles.value = fileList
  if (file && file.raw) {
    // 如果用户没有输入名称，使用文件名
    if (!uploadForm.value.name) {
      uploadForm.value.name = file.name
    }
  }
}

// 组件挂载时加载资料
onMounted(() => {
  loadMaterials()
})
</script>

<style lang="scss" scoped>
.materials-container {
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
      background: linear-gradient(45deg, #409EFF, #36D1DC);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
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

    .file-type-select,
    .sort-select {
      width: 140px;
    }

    .upload-btn {
      margin-left: auto;
    }
  }

  .materials-list {
    .material-item {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      display: flex;
      margin-bottom: 15px;
      transition: transform 0.3s, box-shadow 0.3s;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.1);
      }

      .material-icon {
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
      }

      .material-info {
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

        .material-meta {
          display: flex;
          gap: 15px;
          color: #909399;
          font-size: 12px;
        }
      }

      .material-actions {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 5px;
      }
    }
  }
}

@media (max-width: 768px) {
  .search-section {
    flex-wrap: wrap;

    .search-input {
      width: 100%;
      margin-bottom: 10px;
    }

    .file-type-select,
    .sort-select {
      flex: 1;
    }

    .upload-btn {
      width: 100%;
      margin-top: 10px;
      margin-left: 0;
    }
  }

  .material-item {
    flex-direction: column;

    .material-icon {
      margin-bottom: 10px;
    }

    .material-actions {
      flex-direction: row;
      margin-top: 15px;
    }
  }
}
</style>