<template>
  <div class="mindmap-container">
    <div class="page-header">
      <h1>FileMap</h1>
      <div class="user-info">
        <span>{{ currentUser.role }}</span>
        <el-avatar :size="40" class="avatar">{{ 
          currentUser.avatar 
        }}</el-avatar>
      </div>
    </div>

    <div class="file-map-description">
      <p>本园已收集{{ totalMaterials }}个资料，收录{{ totalTags }}个不同标签</p>
    </div>

    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索思维导图..."
        class="search-input"
        clearable
      />
      <el-button type="primary" @click="searchMindmaps">搜索</el-button>
      <el-button type="primary" class="create-btn" @click="createNewMindmap"
        >创建新思维导图</el-button
      >
    </div>

    <div class="tag-filter-section">
      <div class="tag-category">
        <h3>按分类筛选</h3>
        <div class="tag-list">
          <el-tag 
            v-for="category in primaryCategories" 
            :key="category"
            :class="{ 'active-tag': selectedCategory === category }"
            @click="selectCategory(category)"
            effect="plain"
            class="filter-tag"
          >
            {{ category }}
          </el-tag>
        </div>
      </div>
      
      <div class="tag-subcategory" v-if="selectedCategory">
        <h3>{{ selectedCategory }}子分类</h3>
        <div class="tag-list">
          <el-tag 
            v-for="subcategory in secondaryCategories" 
            :key="subcategory"
            :class="{ 'active-tag': selectedSubcategory === subcategory }"
            @click="selectSubcategory(subcategory)"
            effect="plain"
            class="filter-tag"
            type="success"
          >
            {{ subcategory }}
          </el-tag>
        </div>
      </div>
      
      <div class="tag-tertiary" v-if="selectedSubcategory">
        <h3>{{ selectedSubcategory }}标签</h3>
        <div class="tag-list">
          <el-tag 
            v-for="tag in tertiaryTags" 
            :key="tag"
            :class="{ 'active-tag': selectedTags.includes(tag) }"
            @click="toggleTag(tag)"
            effect="plain"
            class="filter-tag"
            type="info"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>

    <div class="mindmap-grid">
      <el-row :gutter="24">
        <el-col
          :xs="24"
          :sm="12"
          :md="8"
          v-for="(mindmap, index) in mindmaps"
          :key="index"
        >
          <el-card
            class="mindmap-card"
            shadow="hover"
            @click="viewMindmap(mindmap.id)"
          >
            <div class="mindmap-content">
              <div class="mindmap-icon">
                <el-icon :size="40"><BrainIcon /></el-icon>
              </div>
              <div class="mindmap-info">
                <h3>{{ mindmap.title }}</h3>
                <p>{{ mindmap.description }}</p>
                <div class="mindmap-meta">
                  <el-tag size="small" type="info" effect="plain">
                    <el-icon><Calendar /></el-icon>
                    <span>{{ mindmap.createdAt }}</span>
                  </el-tag>
                  <el-tag size="small" type="success" effect="plain">
                    <el-icon><Connection /></el-icon>
                    <span>{{ mindmap.nodeCount }} 节点</span>
                  </el-tag>
                </div>
              </div>
            </div>
            <div class="mindmap-actions">
              <el-button
                type="primary"
                size="small"
                @click.stop="editMindmap(mindmap.id)"
              >
                <el-icon><Edit /></el-icon> 编辑
              </el-button>
              <el-button
                type="info"
                size="small"
                @click.stop="viewMindmap(mindmap.id)"
              >
                <el-icon><View /></el-icon> 查看
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click.stop="deleteMindmap(mindmap.id)"
              >
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 空状态提示 -->
    <div v-if="mindmaps.length === 0" class="empty-state">
      <el-empty description="暂无思维导图" :image-size="200">
        <el-button type="primary" @click="createNewMindmap"
          >创建第一个思维导图</el-button
        >
      </el-empty>
    </div>

    <!-- 创建思维导图对话框 -->
    <el-dialog v-model="createDialogVisible" title="创建基于标签的思维导图" width="500px" class="create-dialog" destroy-on-close>
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="选择标签" required>
          <el-cascader
            v-model="createForm.tagPath"
            :options="tagOptions"
            :props="{ checkStrictly: true }"
            clearable
            placeholder="请选择标签路径"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="思维导图名称">
          <el-input v-model="createForm.title" placeholder="留空将根据标签自动生成" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="createForm.description" type="textarea" placeholder="思维导图描述" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCreateMindmap" :loading="loading">创建</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, h, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { getAllMindmaps, searchMindmaps as searchMindmapsApi, createMindmap } from "../api/mindmap";
import { hierarchicalTags, getPrimaryCategories, getSecondaryCategories, getTertiaryTags } from "../config/tags";
import { ElMessage } from "element-plus";

// 模拟大脑图标组件
const BrainIcon = {
  render() {
    return h(
      "svg",
      {
        viewBox: "0 0 24 24",
        width: "1em",
        height: "1em",
      },
      [
        h("path", {
          fill: "currentColor",
          d: "M13,3V10H18V9H15V3H13M6,3H8V11H10V3H12V11H10V13H8V11H6V3M8,13H10V15H8V13M10,15H12V17H10V15M12,15H14V17H12V15M14,15H16V17H14V15M16,15H18V17H16V15M18,15H20V17H18V15M20,15V13H24V15H22M22,13H20V11H22V13M20,11H18V9H20V11M18,9H16V7H18V9M16,7H14V5H16V7M14,5H12V3H14V5Z",
        }),
      ]
    );
  },
};

const router = useRouter();
const searchQuery = ref("");
const currentUser = ref({
  role: "管理员",
  avatar: "A",
});

// 思维导图数据
const mindmaps = ref([]);
const totalMaterials = ref(0);
const totalTags = ref(0);

// 标签筛选相关
const primaryCategories = ref([]);
const secondaryCategories = ref([]);
const tertiaryTags = ref([]);
const selectedCategory = ref("");
const selectedSubcategory = ref("");
const selectedTags = ref([]);

// 初始化标签分类
const initTagCategories = () => {
  primaryCategories.value = getPrimaryCategories();
  totalTags.value = calculateTotalTags();
};

// 计算总标签数
const calculateTotalTags = () => {
  let count = 0;
  const primary = getPrimaryCategories();
  
  primary.forEach(category => {
    const secondary = getSecondaryCategories(category);
    secondary.forEach(subcategory => {
      count += getTertiaryTags(category, subcategory).length;
    });
  });
  
  return count;
};

// 选择一级分类
const selectCategory = (category) => {
  if (selectedCategory.value === category) {
    // 取消选择
    selectedCategory.value = "";
    selectedSubcategory.value = "";
    secondaryCategories.value = [];
    tertiaryTags.value = [];
  } else {
    selectedCategory.value = category;
    selectedSubcategory.value = "";
    secondaryCategories.value = getSecondaryCategories(category);
    tertiaryTags.value = [];
  }
  filterMindmapsByTags();
};

// 选择二级分类
const selectSubcategory = (subcategory) => {
  if (selectedSubcategory.value === subcategory) {
    // 取消选择
    selectedSubcategory.value = "";
    tertiaryTags.value = [];
  } else {
    selectedSubcategory.value = subcategory;
    tertiaryTags.value = getTertiaryTags(selectedCategory.value, subcategory);
  }
  filterMindmapsByTags();
};

// 切换标签选择
const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag);
  if (index > -1) {
    selectedTags.value.splice(index, 1);
  } else {
    selectedTags.value.push(tag);
  }
  filterMindmapsByTags();
};

// 根据标签筛选思维导图
const filterMindmapsByTags = async () => {
  try {
    // 获取所有思维导图
    const allMindmaps = await getAllMindmaps();
    
    // 如果没有选择任何标签，显示所有思维导图
    if (!selectedCategory.value) {
      mindmaps.value = allMindmaps;
      return;
    }
    
    // 根据选择的标签筛选思维导图
    mindmaps.value = allMindmaps.filter(mindmap => {
      // 检查思维导图标题或描述是否包含选定的分类
      const titleAndDesc = (mindmap.title + " " + mindmap.description).toLowerCase();
      
      // 一级分类筛选
      if (selectedCategory.value && !titleAndDesc.includes(selectedCategory.value.toLowerCase())) {
        return false;
      }
      
      // 二级分类筛选
      if (selectedSubcategory.value && !titleAndDesc.includes(selectedSubcategory.value.toLowerCase())) {
        return false;
      }
      
      // 三级标签筛选
      if (selectedTags.value.length > 0) {
        return selectedTags.value.some(tag => titleAndDesc.includes(tag.toLowerCase()));
      }
      
      return true;
    });
  } catch (error) {
    console.error("筛选思维导图出错:", error);
    ElMessage.error("筛选思维导图时出错");
  }
};

// 搜索思维导图
const searchMindmaps = async () => {
  try {
    if (!searchQuery.value.trim()) {
      // 如果搜索框为空，恢复标签筛选结果
      await filterMindmapsByTags();
      return;
    }
    
    // 获取所有思维导图
    const allMindmaps = await getAllMindmaps();
    
    // 根据搜索词和标签进行筛选
    const searchResults = allMindmaps.filter(mindmap => {
      // 检查标题和描述
      const titleMatch = mindmap.title.toLowerCase().includes(searchQuery.value.toLowerCase());
      const descMatch = mindmap.description.toLowerCase().includes(searchQuery.value.toLowerCase());
      
      // 检查标签匹配
      const tagMatch = checkTagMatch(mindmap.tags);
      
      return titleMatch || descMatch || tagMatch;
    });
    
    // 如果搜索结果为空，显示提示
    if (searchResults.length === 0) {
      ElMessage.info('未找到匹配的思维导图');
    }
    
    mindmaps.value = searchResults;
  } catch (error) {
    console.error("搜索思维导图出错:", error);
    ElMessage.error("搜索思维导图时出错");
  }
};

// 检查标签匹配
const checkTagMatch = (tags) => {
  if (!tags) return false;
  
  // 检查一级标签
  if (selectedCategory.value && tags.primary !== selectedCategory.value) {
    return false;
  }
  
  // 检查二级标签
  if (selectedSubcategory.value && tags.secondary !== selectedSubcategory.value) {
    return false;
  }
  
  // 检查三级标签
  if (selectedTags.value.length > 0 && !selectedTags.value.includes(tags.tertiary)) {
    return false;
  }
  
  return true;
};

// 创建思维导图相关数据
const createDialogVisible = ref(false);
const loading = ref(false);
const createForm = ref({
  tagPath: [],
  title: '',
  description: ''
});

// 标签选项
const tagOptions = computed(() => {
  return primaryCategories.value.map(primary => {
    return {
      value: primary,
      label: primary,
      children: getSecondaryCategories(primary).map(secondary => {
        return {
          value: secondary,
          label: secondary,
          children: getTertiaryTags(primary, secondary).map(tertiary => ({
            value: tertiary,
            label: tertiary
          }))
        };
      })
    };
  });
});

// 打开创建思维导图对话框
const createNewMindmap = () => {
  createDialogVisible.value = true;
  createForm.value = {
    tagPath: [],
    title: '',
    description: ''
  };
};

// 提交创建思维导图
const submitCreateMindmap = async () => {
  if (!createForm.value.tagPath || createForm.value.tagPath.length === 0) {
    ElMessage.warning('请选择标签路径');
    return;
  }
  
  loading.value = true;
  try {
    // 导入标签思维导图生成API
    const { generateMindmapFromTags, getMaterialsByTagPath } = await import('../api/tagBasedMindmap');
    
    // 获取与标签相关的资料
    const materials = await getMaterialsByTagPath(createForm.value.tagPath);
    
    // 生成思维导图
    const result = await generateMindmapFromTags(createForm.value.tagPath, materials);
    
    // 添加到思维导图列表
    if (result.isNew) {
      mindmaps.value.unshift(result.mindmap);
      ElMessage.success('思维导图创建成功');
    } else {
      // 如果已存在，更新列表中的思维导图
      const index = mindmaps.value.findIndex(m => m.id === result.mindmap.id);
      if (index !== -1) {
        mindmaps.value[index] = result.mindmap;
      } else {
        mindmaps.value.unshift(result.mindmap);
      }
      ElMessage.success('思维导图已更新');
    }
    
    // 关闭对话框
    createDialogVisible.value = false;
  } catch (error) {
    console.error('创建思维导图出错:', error);
    ElMessage.error('创建思维导图失败');
  } finally {
    loading.value = false;
  }
};

// 查看思维导图
const viewMindmap = (id) => {
  console.log("查看思维导图:", id);
  router.push(`/mindmap/${id}`);
};

// 编辑思维导图
const editMindmap = (id) => {
  console.log("编辑思维导图:", id);
  // router.push(`/mindmap/${id}/edit`)
};

// 删除思维导图
const deleteMindmap = (id) => {
  console.log("删除思维导图:", id);
  // 实际应用中这里会弹出确认对话框
};

// 页面加载时初始化数据
onMounted(async () => {
  try {
    initTagCategories();
    const allMindmaps = await getAllMindmaps();
    mindmaps.value = allMindmaps;
    
    // 计算总资料数（这里用关联的资料数量来估算）
    const materialIds = new Set();
    allMindmaps.forEach(mindmap => {
      if (mindmap.relatedMaterials && mindmap.relatedMaterials.length > 0) {
        mindmap.relatedMaterials.forEach(id => materialIds.add(id));
      }
    });
    totalMaterials.value = materialIds.size;
  } catch (error) {
    console.error("加载思维导图数据出错:", error);
    ElMessage.error("加载思维导图数据时出错");
  }
});
</script>

<style lang="scss" scoped>
.mindmap-container {
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
    }

    @keyframes colorShift {
      0% { filter: hue-rotate(0deg); }
      50% { filter: hue-rotate(15deg); }
      100% { filter: hue-rotate(0deg); }
    }
  }

  .file-map-description {
    margin-bottom: 24px;
    padding: 16px 24px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 16px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(10px);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    z-index: 1;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1);
    }
    
    p {
      margin: 0;
      font-size: 16px;
      color: #606266;
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
      flex: 1;
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

    .el-button {
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 12px;
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
        
        &::after {
          opacity: 1;
          transform: scale(1);
        }
      }

      &:active {
        transform: translateY(-1px);
      }
    }

    .create-btn {
      background: linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%);
      border: none;
      box-shadow: 0 4px 12px rgba(91, 134, 229, 0.3);

      &:hover {
        box-shadow: 0 8px 20px rgba(91, 134, 229, 0.4);
      }

      &:active {
        box-shadow: 0 4px 12px rgba(91, 134, 229, 0.3);
      }
    }
  }

  .tag-filter-section {
    margin-bottom: 24px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 16px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(10px);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    z-index: 1;

    &:hover {
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
      transform: translateY(-4px);
    }

    h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 16px;
      color: #303133;
    }

    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 20px;

      .filter-tag {
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 8px;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        &.active-tag {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          font-weight: bold;
        }
      }
    }
  }

  .mindmap-grid {
    padding: 8px;
    position: relative;
    z-index: 1;
    
    .el-row {
      margin-left: -12px;
      margin-right: -12px;
    }
    
    .el-col {
      padding-left: 12px;
      padding-right: 12px;
    }
  }

  .mindmap-card {
    margin-bottom: 28px;
    transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
    border-radius: 16px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    position: relative;
    z-index: 1;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(58, 123, 213, 0.1) 0%, rgba(0, 210, 255, 0.1) 100%);
      opacity: 0;
      transition: opacity 0.5s ease;
      z-index: -1;
    }

    &:hover {
      transform: translateY(-8px) scale(1.03);
      box-shadow: 0 16px 32px rgba(58, 123, 213, 0.15);
      
      &::after {
        opacity: 1;
      }

      .mindmap-icon {
        background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
        color: white;
        transform: scale(1.1) rotate(5deg);
      }

      h3 {
        background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        color: transparent;
      }
    }
    
    .mindmap-content {
      display: flex;
      padding: 20px;
      gap: 20px;
      
      .mindmap-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 70px;
        height: 70px;
        background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
        border-radius: 14px;
        color: #1890ff;
        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 4px 12px rgba(24, 144, 255, 0.1);
        
        .el-icon {
          transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      }
      
      .mindmap-info {
        flex: 1;
        min-width: 0;
        
        h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px;
          color: #303133;
          transition: all 0.3s ease;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        p {
          font-size: 14px;
          color: #606266;
          margin: 0 0 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          line-height: 1.5;
          height: 42px;
          transition: color 0.3s ease;
        }
        
        .mindmap-meta {
          display: flex;
          gap: 12px;
          
          .el-tag {
            display: flex;
            align-items: center;
            gap: 4px;
            border-radius: 8px;
            padding: 4px 10px;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            
            &:hover {
              transform: translateY(-3px) scale(1.05);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            
            .el-icon {
              margin-right: 2px;
              transition: transform 0.3s ease;
            }

            &:hover .el-icon {
              transform: scale(1.2);
            }
          }
        }
      }
    }
    
    .mindmap-actions {
      display: flex;
      justify-content: space-around;
      padding: 12px 20px;
      background: rgba(250, 250, 250, 0.8);
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      
      .el-button {
        border-radius: 8px;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        
        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .el-icon {
          margin-right: 4px;
          transition: transform 0.3s ease;
        }
        
        &:hover .el-icon {
          transform: scale(1.2);
        }
      }
    }
  }

  .empty-state {
    margin-top: 60px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(10px);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(58, 123, 213, 0.05) 0%, rgba(0, 210, 255, 0.05) 100%);
      opacity: 0;
      transition: opacity 0.5s ease;
      z-index: -1;
    }
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(58, 123, 213, 0.12);
      
      &::before {
        opacity: 1;
      }
    }
    
    .el-button {
      margin-top: 20px;
      padding: 12px 28px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 12px;
      background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
      border: none;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 4px 12px rgba(58, 123, 213, 0.3);
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
    }
  }

  .create-dialog {
    :deep(.el-dialog__header) {
      padding: 20px 24px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
    
    :deep(.el-dialog__body) {
      padding: 24px;
    }
    
    :deep(.el-dialog__footer) {
      padding: 16px 24px;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
    }
    
    :deep(.el-dialog__title) {
      font-weight: 600;
      font-size: 18px;
      color: #303133;
    }
    
    :deep(.el-dialog__headerbtn) {
      top: 20px;
      right: 20px;
    }
    
    :deep(.el-form-item__label) {
      font-weight: 500;
    }
    
    .el-button {
      padding: 10px 20px;
      border-radius: 8px;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      
      &:active {
        transform: translateY(0);
      }
    }
  }
}
</style>
