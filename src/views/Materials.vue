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
      <el-select v-model="sortBy" placeholder="最新上传" class="sort-select" @change="handleSortChange">
        <el-option label="最新上传" value="newest" />
        <el-option label="最多下载" value="downloads" />
        <el-option label="名称排序" value="name" />
      </el-select>
      <el-button type="primary" @click="handleSearch" class="search-btn">
        <el-icon><Search /></el-icon> 搜索
      </el-button>
      <el-button type="primary" class="upload-btn" @click="showUploadDialog">
        <el-icon><Upload /></el-icon> 上传资料
      </el-button>
    </div>

    <div class="materials-list">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="(material, index) in materials" :key="index">
          <transition name="fade-scale" :delay="index * 50">
            <el-card class="material-item" shadow="hover" @click="viewMaterialDetail(material)">
              <div class="material-icon" @click.stop>
                <div class="icon-wrapper" :class="material?.type ? `${material.type}-bg` : 'other-bg'">
                  <el-icon :size="30" v-if="material?.type === 'document'"><Document /></el-icon>
                  <el-icon :size="30" v-else-if="material?.type === 'image'"><Picture /></el-icon>
                  <el-icon :size="30" v-else-if="material?.type === 'video'"><VideoCamera /></el-icon>
                  <el-icon :size="30" v-else><Files /></el-icon>
                </div>
              </div>
              <div class="material-info">
                <h3 class="material-title">{{ material.name }}</h3>
                <p class="material-desc">{{ material.description }}</p>
                <div class="material-tags">
                  <!-- 分级标签 -->
                  <div class="hierarchical-tags" v-if="material.hierarchicalTags && material.hierarchicalTags.length > 0">
                    <el-tag v-for="(tag, tagIndex) in material.hierarchicalTags" :key="'h-'+tagIndex" size="small" effect="plain" class="tag-item" type="success">
                      {{ getTagLabel(tag) }}
                    </el-tag>
                  </div>
                  <!-- 自定义标签 -->
                  <div class="custom-tags" v-if="material.customTags && material.customTags.length > 0">
                    <el-tag v-for="(tag, tagIndex) in material.customTags" :key="'c-'+tagIndex" size="small" effect="plain" class="tag-item" type="info">
                      {{ tag }}
                    </el-tag>
                  </div>
                </div>
                <div class="material-meta">
                  <el-tag size="small" type="info" effect="plain" class="meta-tag">
                    <el-icon><Calendar /></el-icon>
                    <span>{{ material.uploadDate }}</span>
                  </el-tag>
                  <el-tag size="small" type="success" effect="plain" class="meta-tag">
                    <el-icon><Download /></el-icon>
                    <span>{{ material.downloads }}次下载</span>
                  </el-tag>
                  <el-tag size="small" type="warning" effect="plain" class="meta-tag">
                    <el-icon><Files /></el-icon>
                    <span>{{ material.size }}</span>
                  </el-tag>
                  <el-tag size="small" type="primary" effect="plain" class="meta-tag">
                    <el-icon><ChatDotRound /></el-icon>
                    <span>评论</span>
                  </el-tag>
                </div>
                <div class="material-actions" @click.stop>
                  <el-button type="primary" size="small" text class="action-btn" @click="handleDownload(material)">
                    <el-icon><Download /></el-icon> 下载
                  </el-button>
                  <el-button type="info" size="small" text class="action-btn" @click="handleShare(material)">
                    <el-icon><Share /></el-icon> 分享
                  </el-button>
                  <el-button type="danger" size="small" text class="action-btn" @click="handleDelete(material)">
                    <el-icon><Delete /></el-icon> 删除
                  </el-button>
                  <el-button type="success" size="small" text class="action-btn" @click="viewMaterialDetail(material)">
                    <el-icon><ChatDotRound /></el-icon> 查看评论
                  </el-button>
                </div>
              </div>
            </el-card>
          </transition>
        </el-col>
      </el-row>
    </div>

    <!-- 上传对话框 -->
    <el-dialog v-model="uploadDialogVisible" title="上传资料" width="500px" class="upload-dialog" destroy-on-close>
      <el-form :model="uploadForm" label-width="80px">
        <el-form-item label="资料名称" required>
          <el-input v-model="uploadForm.name" placeholder="请输入资料名称" />
        </el-form-item>
        <el-form-item label="资料描述">
          <el-input v-model="uploadForm.description" type="textarea" placeholder="请输入资料描述" rows="3" />
        </el-form-item>
        <el-form-item label="分级标签" required>
          <el-cascader
            v-model="uploadForm.hierarchicalTags"
            :options="tagOptions"
            :props="{ checkStrictly: true }"
            clearable
            placeholder="请选择分级标签"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="自定义标签">
          <div class="custom-tag-input">
            <el-input 
              v-model="newCustomTag" 
              placeholder="输入自定义标签" 
              class="tag-input"
              @keyup.enter="addCustomTag"
            >
              <template #append>
                <el-button @click="addCustomTag">添加</el-button>
              </template>
            </el-input>
          </div>
          <div v-if="uploadForm.customTags && uploadForm.customTags.length > 0" class="custom-tags-container">
            <el-tag
              v-for="(tag, index) in uploadForm.customTags"
              :key="index"
              closable
              @close="removeCustomTag(index)"
              class="custom-tag-item"
              type="info"
              effect="plain"
            >
              {{ tag }}
            </el-tag>
          </div>
          <div class="recommended-tags">
            <div class="recommended-tags-title">推荐标签：</div>
            <div class="recommended-tags-list">
              <el-tag
                v-for="(tag, index) in customTags"
                :key="'rec-'+index"
                @click="addRecommendedTag(tag)"
                class="recommended-tag-item"
                type="success"
                effect="plain"
                size="small"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="资料类型" required>
          <el-select v-model="uploadForm.type" placeholder="请选择资料类型" style="width: 100%">
            <el-option label="文档" value="document" />
            <el-option label="图片" value="image" />
            <el-option label="视频" value="video" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="上传文件" required>
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            :file-list="uploadFiles"
            :on-exceed="handleExceed"
            :http-request="customUpload"
          >
            <div class="upload-area">
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">拖拽文件到此处或 <em>点击上传</em></div>
            </div>
            <template #tip>
              <div class="el-upload__tip">请上传资料文件，大小不超过50MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUpload" :loading="loading" class="submit-btn">上传</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 上传成功对话框 -->
    <el-dialog v-model="uploadSuccessDialogVisible" title="上传成功" width="500px" class="success-dialog">
      <div class="upload-success-content">
        <el-result icon="success" title="资料上传成功" sub-title="您的资料已成功上传并添加到思维导图搜索引擎">
          <template #extra>
            <div class="mindmap-integration-info">
              <h4>思维导图集成信息</h4>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="资料名称">{{ lastUploadedMaterial.name }}</el-descriptions-item>
                <el-descriptions-item label="提取关键词">
                  <el-tag v-for="(keyword, index) in lastUploadedKeywords" :key="index" size="small" class="keyword-tag">
                    {{ keyword }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="资料分类">{{ lastUploadedCategory }}</el-descriptions-item>
                <el-descriptions-item label="关联思维导图">
                  <div v-if="relatedMindmaps.length > 0">
                    <div v-for="(mindmap, index) in relatedMindmaps" :key="index" class="related-mindmap-item">
                      {{ mindmap.title }}
                    </div>
                  </div>
                  <div v-else>暂无关联思维导图</div>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
          <template #actions>
            <el-button type="primary" @click="uploadSuccessDialogVisible = false">确定</el-button>
            <el-button @click="viewMindmaps">查看思维导图</el-button>
          </template>
        </el-result>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Picture, VideoCamera, Files, Calendar, Download, Share, Delete, ChatDotRound, UploadFilled, Search, Upload } from '@element-plus/icons-vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createApp } from 'vue'

const app = createApp({})
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
import { ElMessage } from 'element-plus'
import { getAllMaterials, uploadMaterial, downloadMaterial, shareMaterial, deleteMaterial, searchMaterials, formatFileSize } from '../api/materials'
import { addMaterialToSearchIndex, getAllMindmaps } from '../api/mindmap'
import { ACTIVITY_TYPES, recordActivity } from '../utils/activityTracker'

const router = useRouter()
const searchQuery = ref('')
const fileType = ref('all')
const sortBy = ref('newest')
const uploadDialogVisible = ref(false)
const uploadSuccessDialogVisible = ref(false)
const loading = ref(false)
const lastUploadedMaterial = ref({})
const lastUploadedKeywords = ref([])
const lastUploadedCategory = ref('')
const relatedMindmaps = ref([])

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
  file: null,
  hierarchicalTags: [],
  customTags: []
})

// 标签选项数据
import { hierarchicalTags, recommendedCustomTags, getPrimaryCategories, getSecondaryCategories, getTertiaryTags } from '../config/tags'

// 转换分级标签为级联选择器格式
const tagOptions = ref([])

// 自定义标签
const customTags = ref([])
const newCustomTag = ref('')

// 初始化标签选项
const initTagOptions = () => {
  const primaryCategories = getPrimaryCategories()
  tagOptions.value = primaryCategories.map(primary => {
    const secondaryCategories = getSecondaryCategories(primary)
    return {
      value: primary,
      label: primary,
      children: secondaryCategories.map(secondary => {
        const tertiaryTags = getTertiaryTags(primary, secondary)
        return {
          value: secondary,
          label: secondary,
          children: tertiaryTags.map(tertiary => ({
            value: tertiary,
            label: tertiary
          }))
        }
      })
    }
  })
  
  // 初始化推荐自定义标签
  customTags.value = recommendedCustomTags
}

// 上传文件列表
const uploadFiles = ref([])

// 添加自定义标签
const addCustomTag = () => {
  if (newCustomTag.value && newCustomTag.value.trim()) {
    if (!uploadForm.value.customTags.includes(newCustomTag.value.trim())) {
      uploadForm.value.customTags.push(newCustomTag.value.trim())
      newCustomTag.value = ''
    } else {
      ElMessage.warning('该标签已存在')
    }
  }
}

// 删除自定义标签
const removeCustomTag = (index) => {
  uploadForm.value.customTags.splice(index, 1)
}

// 添加推荐标签
const addRecommendedTag = (tag) => {
  if (!uploadForm.value.customTags.includes(tag)) {
    uploadForm.value.customTags.push(tag)
  } else {
    ElMessage.warning('该标签已存在')
  }
}

// 显示上传对话框
const showUploadDialog = () => {
  uploadDialogVisible.value = true
  uploadForm.value = {
    name: '',
    description: '',
    type: 'document',
    file: null,
    hierarchicalTags: [],
    customTags: []
  }
  uploadFiles.value = []
  newCustomTag.value = ''
}

// 提交上传
const submitUpload = async () => {
  if (!uploadForm.value.name) {
    ElMessage.warning('请输入资料名称')
    return
  }
  
  if (!uploadForm.value.type) {
    ElMessage.warning('请选择资料类型')
    return
  }
  
  if (!uploadFiles.value || uploadFiles.value.length === 0) {
    ElMessage.warning('请选择要上传的文件')
    return
  }
  
  if (!uploadForm.value.hierarchicalTags || uploadForm.value.hierarchicalTags.length === 0) {
    ElMessage.warning('请选择分级标签')
    return
  }
  
  const file = uploadFiles.value[0].raw
  if (!file) {
    ElMessage.error('文件数据无效，请重新选择文件')
    return
  }
  
  loading.value = true
  try {
    // 调用API上传文件
    // 确保hierarchicalTags是可序列化的数据
    const hierarchicalTags = uploadForm.value.hierarchicalTags.map(tag => {
      if (typeof tag === 'string') return tag;
      return JSON.stringify(tag);
    });
    
    const materialData = {
      name: uploadForm.value.name,
      description: uploadForm.value.description,
      type: uploadForm.value.type,
      uploader: currentUser.value.role,
      hierarchicalTags: hierarchicalTags,
      customTags: uploadForm.value.customTags
    }
    
    console.log('开始上传文件:', file.name, '类型:', file.type, '大小:', formatFileSize(file.size))
    const newMaterial = await uploadMaterial(materialData, file)
    
    if (!newMaterial) {
      throw new Error('上传资料失败：服务器未返回资料信息')
    }
    
    // 将资料添加到思维导图搜索引擎
    const result = await addMaterialToSearchIndex(newMaterial)
    
    // 保存上传结果信息
    lastUploadedMaterial.value = newMaterial
    lastUploadedKeywords.value = result.keywords
    lastUploadedCategory.value = result.category
    
    // 自动根据标签生成思维导图
    try {
      // 导入标签思维导图生成API
      const { generateMindmapFromTags } = await import('../api/tagBasedMindmap')
      
      // 使用分级标签路径生成思维导图
      if (newMaterial.hierarchicalTags && newMaterial.hierarchicalTags.length > 0) {
        const tagPath = newMaterial.hierarchicalTags
        const result = await generateMindmapFromTags(tagPath, [newMaterial])
        
        if (result.isNew) {
          ElMessage.success(`已根据标签「${tagPath.join(' > ')}」自动创建思维导图`)
        } else {
          ElMessage.success(`已将资料添加到「${result.mindmap.title}」思维导图中`)
        }
        
        // 添加到相关思维导图列表
        if (result.mindmap && !relatedMindmaps.value.some(m => m.id === result.mindmap.id)) {
          relatedMindmaps.value.push(result.mindmap)
        }
      }
    } catch (tagError) {
      console.error('生成标签思维导图出错:', tagError)
      // 不阻止上传流程，只记录错误
    }
    
    // 获取关联的思维导图
    const allMindmaps = await getAllMindmaps()
    relatedMindmaps.value = allMindmaps.filter(mindmap => 
      mindmap.relatedMaterials.includes(newMaterial.id)
    )
    
    ElMessage.success('资料上传成功')
    uploadDialogVisible.value = false
    uploadSuccessDialogVisible.value = true
    
    // 刷新资料列表
    loadMaterials()
  } catch (error) {
    console.error('上传失败:', error)
    let errorMsg = '资料上传失败'
    if (error.message) {
      errorMsg += ': ' + error.message
    }
    ElMessage.error(errorMsg)
    // 重置上传状态
    uploadFiles.value = []
  } finally {
    loading.value = false
  }
}

// 下载资料
const handleDownload = async (material) => {
  try {
    await downloadMaterial(material.id)
    ElMessage.success('下载开始')
    
    // 记录下载活动
    const username = currentUser.value.username || currentUser.value.role
    recordActivity(username, ACTIVITY_TYPES.DOWNLOAD, {
      materialName: material.name,
      materialId: material.id
    })
    
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
    // 保存文件到表单数据中
    uploadForm.value.file = file.raw
  }
}

// 自定义上传处理函数
const customUpload = async (options) => {
  try {
    const { file, onSuccess, onError } = options
    // 检查文件大小
    if (file.size > 50 * 1024 * 1024) { // 50MB
      ElMessage.error('文件大小超过50MB限制')
      onError('文件大小超过限制')
      return
    }
    
    // 检查文件类型
    const validTypes = {
      'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
      'image': ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
      'video': ['video/mp4', 'video/webm', 'video/ogg'],
      'other': []
    }
    
    // 如果已选择了文件类型，检查文件MIME类型是否匹配
    if (uploadForm.value.type !== 'other' && 
        validTypes[uploadForm.value.type] && 
        validTypes[uploadForm.value.type].length > 0 && 
        !validTypes[uploadForm.value.type].includes(file.type)) {
      ElMessage.warning(`文件类型与所选资料类型不匹配，请选择正确的资料类型或更换文件`)
    }
    
    // 这里不需要实际上传，因为submitUpload函数会处理上传逻辑
    // 只需要确保文件被正确添加到uploadFiles中
    console.log('文件准备上传:', file.name, '类型:', file.type, '大小:', formatFileSize(file.size))
    
    // 调用成功回调，确保el-upload组件知道文件已被处理
    onSuccess(file)
    return file
  } catch (error) {
    console.error('文件处理失败:', error)
    ElMessage.error('文件处理失败: ' + (error.message || '未知错误'))
    if (options.onError) {
      options.onError(error)
    }
  }
}

// 处理超出文件数量限制
const handleExceed = () => {
  ElMessage.warning('最多只能上传1个文件')
}

// 查看资料详情
const viewMaterialDetail = (material) => {
  router.push({ name: 'MaterialDetail', params: { id: material.id } })
}

// 获取标签显示名称
const getTagLabel = (tag) => {
  // 遍历标签选项，查找匹配的标签值
  for (const category of tagOptions.value) {
    // 检查是否是父级标签
    if (category.value === tag) {
      return category.label
    }
    // 检查子级标签
    if (category.children) {
      for (const child of category.children) {
        if (child.value === tag) {
          return child.label
        }
      }
    }
  }
  return tag // 如果没找到匹配的标签，返回原始值
}

// 组件挂载时加载资料和初始化标签选项
onMounted(() => {
  loadMaterials()
  initTagOptions()
})
</script>

<style lang="scss" scoped>
.materials-container {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 50%, #d8e6ff 100%);
  background-size: 200% 200%;
  min-height: calc(100vh - 60px);
  animation: gradientShift 15s ease infinite;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
    opacity: 0.6;
    animation: ripple 15s linear infinite;
    pointer-events: none;
    z-index: 0;
  }

  @keyframes ripple {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 16px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(10px);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border-left: 4px solid #409eff;
    position: relative;
    z-index: 1;
    
    &:hover {
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
      transform: translateY(-4px);
    }

    h1 {
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 12px;
      background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
      text-shadow: 0 2px 10px rgba(58, 123, 213, 0.2);
      animation: colorShift 8s ease infinite;
      position: relative;
    }
    
    @keyframes colorShift {
      0% { filter: hue-rotate(0deg); }
      50% { filter: hue-rotate(15deg); }
      100% { filter: hue-rotate(0deg); }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    
      .avatar {
        background: linear-gradient(45deg, #409EFF, #36D1DC);
        box-shadow: 0 4px 10px rgba(64, 158, 255, 0.3);
        transition: all 0.3s ease;
        
        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }
  
  // 自定义标签样式
  .custom-tag-input {
    margin-bottom: 10px;
    
    .tag-input {
      width: 100%;
    }
  }
  
  .custom-tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 15px;
    
    .custom-tag-item {
      cursor: default;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }
    }
  }
  
  .recommended-tags {
    margin-top: 15px;
    
    .recommended-tags-title {
      font-size: 14px;
      color: #606266;
      margin-bottom: 8px;
    }
    
    .recommended-tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .recommended-tag-item {
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }

  .search-section {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    overflow: hidden;
    z-index: 1;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(102, 177, 255, 0.1) 100%);
      z-index: -1;
      opacity: 0;
      transition: opacity 0.5s ease;
    }

    &:hover {
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      transform: translateY(-4px);

      &::before {
        opacity: 1;
      }
    }

    .search-input {
      flex: 3;
      min-width: 200px;
      :deep(.el-input__wrapper) {
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(0, 0, 0, 0.05);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        padding: 0 16px;

        &:hover {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
          background: rgba(255, 255, 255, 1);
          transform: translateY(-2px);
        }

        &:focus-within {
          box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
          background: rgba(255, 255, 255, 1);
          transform: translateY(-2px);
        }
      }

      :deep(.el-input__inner) {
        font-size: 16px;
        padding: 12px 0;
      }
    }

    .file-type-select,
    .sort-select {
      flex: 1;
      min-width: 140px;
      :deep(.el-input__wrapper) {
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(0, 0, 0, 0.05);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        padding: 0 16px;

        &:hover {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
          background: rgba(255, 255, 255, 1);
          transform: translateY(-2px);
        }

        &:focus-within {
          box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
          background: rgba(255, 255, 255, 1);
          transform: translateY(-2px);
        }
      }

      :deep(.el-input__inner) {
        font-size: 16px;
        padding: 12px 0;
      }
    }

    .search-btn {
      flex: 0.5;
      min-width: 100px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 12px;
      background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
      border: none;
      box-shadow: 0 4px 12px rgba(58, 123, 213, 0.3);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
      overflow: hidden;

      &::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%);
        opacity: 0;
        transition: opacity 0.3s ease;
        transform: scale(0.5);
      }

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(58, 123, 213, 0.4);
        
        &::after {
          opacity: 1;
          transform: scale(1);
        }
      }

      &:active {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(58, 123, 213, 0.3);
      }

      .el-icon {
        margin-right: 4px;
        transition: transform 0.3s ease;
      }

      &:hover .el-icon {
        transform: scale(1.2);
      }
    }

    .upload-btn {
      flex: 0.5;
      min-width: 120px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 12px;
      background: linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%);
      border: none;
      box-shadow: 0 4px 12px rgba(91, 134, 229, 0.3);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
      overflow: hidden;

      &::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%);
        opacity: 0;
        transition: opacity 0.3s ease;
        transform: scale(0.5);
      }

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(91, 134, 229, 0.4);
        
        &::after {
          opacity: 1;
          transform: scale(1);
        }
      }

      &:active {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(91, 134, 229, 0.3);
      }
    }
  }

  .material-item {
    flex-direction: column;

    .material-icon {
      margin-bottom: 10px;
      margin-right: 0;
      align-self: center;
    }

    .material-actions {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-around;
      margin-top: 15px;
    }
  }
  
  .upload-dialog {
    width: 95% !important;
    
    :deep(.el-dialog__body) {
      padding: 15px;
    }
  }
}
</style>
