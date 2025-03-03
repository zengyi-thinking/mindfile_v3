<template>
  <div class="admin-materials-container">
    <div class="page-header">
      <h1>管理员资料管理</h1>
      <div class="user-info">
        <span>{{ currentUser.role }}</span>
        <el-avatar :size="40" class="avatar">{{ currentUser.avatar }}</el-avatar>
      </div>
    </div>

    <div class="admin-panel">
      <el-card class="stats-card">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon document-icon">
              <el-icon :size="24"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.documentCount }}</div>
              <div class="stat-label">文档</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon image-icon">
              <el-icon :size="24"><Picture /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.imageCount }}</div>
              <div class="stat-label">图片</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon video-icon">
              <el-icon :size="24"><VideoCamera /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.videoCount }}</div>
              <div class="stat-label">视频</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon other-icon">
              <el-icon :size="24"><Files /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.otherCount }}</div>
              <div class="stat-label">其他</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索资料..."
        class="search-input"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="fileType" placeholder="所有类型" class="file-type-select">
        <el-option label="所有类型" value="all" />
        <el-option label="文档" value="document" />
        <el-option label="图片" value="image" />
        <el-option label="视频" value="video" />
        <el-option label="其他" value="other" />
      </el-select>
      <el-select v-model="uploaderFilter" placeholder="所有上传者" class="uploader-select">
        <el-option label="所有上传者" value="all" />
        <el-option label="管理员" value="管理员" />
        <el-option label="普通用户" value="user" />
      </el-select>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon> 搜索
      </el-button>
      <el-button type="danger" @click="handleBatchDelete" :disabled="!selectedMaterials.length">
        <el-icon><Delete /></el-icon> 批量删除
      </el-button>
    </div>

    <el-table
      :data="materials"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      v-loading="loading"
      border
      stripe
      class="materials-table"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="ID" prop="id" width="80" />
      <el-table-column label="资料名称" min-width="200">
        <template #default="scope">
          <div class="material-name">
            <el-icon :size="20" class="material-icon" v-if="scope.row.type === 'document'"><Document /></el-icon>
            <el-icon :size="20" class="material-icon" v-else-if="scope.row.type === 'image'"><Picture /></el-icon>
            <el-icon :size="20" class="material-icon" v-else-if="scope.row.type === 'video'"><VideoCamera /></el-icon>
            <el-icon :size="20" class="material-icon" v-else><Files /></el-icon>
            <span>{{ scope.row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="描述" prop="description" min-width="300" show-overflow-tooltip />
      <el-table-column label="类型" prop="type" width="100">
        <template #default="scope">
          <el-tag
            :type="getTypeTagType(scope.row.type)"
            effect="light"
            size="small"
          >
            {{ getTypeLabel(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="上传者" prop="uploader" width="120" />
      <el-table-column label="上传日期" prop="uploadDate" width="120" />
      <el-table-column label="大小" prop="size" width="100" />
      <el-table-column label="下载次数" prop="downloads" width="100" />
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)">
            <el-icon><Edit /></el-icon> 编辑
          </el-button>
          <el-button type="success" size="small" @click="handleDownload(scope.row)">
            <el-icon><Download /></el-icon> 下载
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)">
            <el-icon><Delete /></el-icon> 删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalMaterials"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        background
      />
    </div>

    <!-- 编辑资料对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑资料信息" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="资料名称">
          <el-input v-model="editForm.name" placeholder="请输入资料名称" />
        </el-form-item>
        <el-form-item label="资料描述">
          <el-input v-model="editForm.description" type="textarea" placeholder="请输入资料描述" />
        </el-form-item>
        <el-form-item label="资料类型">
          <el-select v-model="editForm.type" placeholder="请选择资料类型">
            <el-option label="文档" value="document" />
            <el-option label="图片" value="image" />
            <el-option label="视频" value="video" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit" :loading="loading">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量删除确认对话框 -->
    <el-dialog v-model="deleteDialogVisible" title="确认删除" width="400px">
      <div class="delete-confirm">
        <el-icon class="warning-icon"><WarningFilled /></el-icon>
        <p>确定要删除选中的 {{ selectedMaterials.length }} 个资料吗？此操作不可恢复！</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmBatchDelete" :loading="loading">确认删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Document, Picture, VideoCamera, Files, Edit, Download, Delete, Search, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllMaterials, downloadMaterial, deleteMaterial, searchMaterials } from '../api/materials'

const searchQuery = ref('')
const fileType = ref('all')
const uploaderFilter = ref('all')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalMaterials = ref(0)
const selectedMaterials = ref([])
const editDialogVisible = ref(false)
const deleteDialogVisible = ref(false)

const currentUser = ref({
  role: '管理员',
  avatar: 'A'
})

// 资料数据
const allMaterials = ref([])
const materials = ref([])

// 编辑表单数据
const editForm = ref({
  id: null,
  name: '',
  description: '',
  type: 'document'
})

// 统计数据
const stats = computed(() => {
  return {
    documentCount: allMaterials.value.filter(m => m.type === 'document').length,
    imageCount: allMaterials.value.filter(m => m.type === 'image').length,
    videoCount: allMaterials.value.filter(m => m.type === 'video').length,
    otherCount: allMaterials.value.filter(m => m.type !== 'document' && m.type !== 'image' && m.type !== 'video').length
  }
})

// 加载资料列表
const loadMaterials = async () => {
  loading.value = true
  try {
    const data = await getAllMaterials()
    allMaterials.value = data
    totalMaterials.value = data.length
    applyFilters()
  } catch (error) {
    console.error('加载资料失败:', error)
    ElMessage.error('加载资料失败')
  } finally {
    loading.value = false
  }
}

// 应用筛选条件
const applyFilters = () => {
  let filteredData = [...allMaterials.value]
  
  // 按关键词筛选
  if (searchQuery.value) {
    const lowerQuery = searchQuery.value.toLowerCase()
    filteredData = filteredData.filter(material => 
      material.name.toLowerCase().includes(lowerQuery) ||
      material.description.toLowerCase().includes(lowerQuery)
    )
  }
  
  // 按类型筛选
  if (fileType.value !== 'all') {
    filteredData = filteredData.filter(material => material.type === fileType.value)
  }
  
  // 按上传者筛选
  if (uploaderFilter.value !== 'all') {
    filteredData = filteredData.filter(material => material.uploader === uploaderFilter.value)
  }
  
  totalMaterials.value = filteredData.length
  
  // 分页处理
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  materials.value = filteredData.slice(startIndex, endIndex)
}

// 搜索资料
const handleSearch = () => {
  currentPage.value = 1
  applyFilters()
}

// 处理页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page
  applyFilters()
}

// 处理每页显示数量变化
const handleSizeChange = (size) => {
  pageSize.value = size
  applyFilters()
}

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedMaterials.value = selection
}

// 获取类型标签样式
const getTypeTagType = (type) => {
  switch (type) {
    case 'document': return 'primary'
    case 'image': return 'success'
    case 'video': return 'warning'
    default: return 'info'
  }
}

// 获取类型标签文本
const getTypeLabel = (type) => {
  switch (type) {
    case 'document': return '文档'
    case 'image': return '图片'
    case 'video': return '视频'
    default: return '其他'
  }
}

// 编辑资料
const handleEdit = (material) => {
  editForm.value = {
    id: material.id,
    name: material.name,
    description: material.description,
    type: material.type
  }
  editDialogVisible.value = true
}

// 提交编辑
const submitEdit = async () => {
  loading.value = true
  try {
    // 在实际应用中，这里会调用API更新资料信息
    const index = allMaterials.value.findIndex(m => m.id === editForm.value.id)
    if (index !== -1) {
      allMaterials.value[index] = {
        ...allMaterials.value[index],
        name: editForm.value.name,
        description: editForm.value.description,
        type: editForm.value.type
      }
      
      ElMessage.success('资料信息更新成功')
      editDialogVisible.value = false
      applyFilters()
    }
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error('资料信息更新失败')
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

// 删除资料
const handleDelete = (material) => {
  ElMessageBox.confirm(
    `确定要删除资料 "${material.name}" 吗？此操作不可恢复！`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    loading.value = true
    try {
      await deleteMaterial(material.id)
      ElMessage.success('资料已删除')
      loadMaterials()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    } finally {
      loading.value = false
    }
  }).catch(() => {
    // 取消删除
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedMaterials.value.length === 0) {
    ElMessage.warning('请先选择要删除的资料')
    return
  }
  
  deleteDialogVisible.value = true
}

// 确认批量删除
const confirmBatchDelete = async () => {
  loading.value = true
  try {
    const deletePromises = selectedMaterials.value.map(material => deleteMaterial(material.id))
    await Promise.all(deletePromises)
    
    ElMessage.success(`成功删除 ${selectedMaterials.value.length} 个资料`)
    deleteDialogVisible.value = false
    loadMaterials()
  } catch (error) {
    console.error('批量删除失败:', error)
    ElMessage.error('批量删除失败')
  } finally {
    loading.value = false
  }
}

// 初始加载
onMounted(() => {
  loadMaterials()
})
</script>

<style lang="scss" scoped>
.admin-materials-container {
  padding: 20px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
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
        background: linear-gradient(45deg, #409EFF, #36D1DC);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
    }
  }
  
  .admin-panel {
    margin-bottom: 20px;
    
    .stats-card {
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        
        .stat-item {
          display: flex;
          align-items: center;
          padding: 10px;
          
          .stat-icon {
            width: 50px;
            height: 50px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            
            &.document-icon {
              background-color: rgba(64, 158, 255, 0.1);
              color: #409EFF;
            }
            
            &.image-icon {
              background-color: rgba(103, 194, 58, 0.1);
              color: #67C23A;
            }
            
            &.video-icon {
              background-color: rgba(230, 162, 60, 0.1);
              color: #E6A23C;
            }
            
            &.other-icon {
              background-color: rgba(144, 147, 153, 0.1);
              color: #909399;
            }
          }
          
          .stat-info {
            .stat-value {
              font-size: 24px;
              font-weight: 600;
              line-height: 1;
              margin-bottom: 5px;
            }
            
            .stat-label {
              font-size: 14px;
              color: #606266;
            }
          }
        }
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
    .uploader-select {
      width: 120px;
    }
  }
  
  .materials-table {
    margin-bottom: 20px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    
    .material-name {
      display: flex;
      align-items: center;
      
      .material-icon {
        margin-right: 8px;
      }
    }
  }
  
  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  
  .delete-confirm {
    display: flex;
    align-items: center;
    
    .warning-icon {
      font-size: 24px;
      color: #F56C6C;
      margin-right: 10px;
    }
  }
}
</style>