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
          d: "M13,3V10H18V9H15V3H13M6,3H8V11H10V3H12V11H10V13H8V11H6V3M8,13H10V15H8V13M10,15H12V17H10V15M12,15H14V17H12V15M14,15H16V17H14V15M16,15H18V17H16V15M18,15H20V17H18V15M20,15H22V17H20V15M22,15V13H24V15H22M22,13H20V11H22V13M20,11H18V9H20V11M18,9H16V7H18V9M16,7H14V5H16V7M14,5H12V3H14V5Z",
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
    
    const results = await searchMindmapsApi(searchQuery.value);
    mindmaps.value = results;
  } catch (error) {
    console.error("搜索思维导图出错:", error);
    ElMessage.error("搜索思维导图时出错");
  }
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
  background-color: #f9fafc;
  min-height: calc(100vh - 60px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;

    h1 {
      font-size: 28px;
      font-weight: 600;
      margin: 0;
      color: #303133;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;

      span {
        font-size: 14px;
        color: #606266;
      }

      .avatar {
        background-color: #409eff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
  }

  .file-map-description {
    margin-bottom: 20px;
    color: #606266;
    font-size: 16px;
    text-align: center;
  }

  .search-section {
    display: flex;
    margin-bottom: 28px;
    gap: 12px;
    align-items: center;

    .search-input {
      flex: 1;
      max-width: 500px;
    }

    .create-btn {
      margin-left: auto;
    }
  }
  
  .tag-filter-section {
    margin-bottom: 30px;
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    
    .tag-category,
    .tag-subcategory,
    .tag-tertiary {
      margin-bottom: 20px;
      
      h3 {
        font-size: 16px;
        margin-bottom: 12px;
        color: #303133;
        font-weight: 600;
      }
      
      .tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        
        .filter-tag {
          cursor: pointer;
          transition: all 0.3s;
          
          &:hover {
            transform: translateY(-2px);
          }
          
          &.active-tag {
            font-weight: bold;
            transform: translateY(-2px);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          }
        }
      }
    }
  }

  .mindmap-grid {
    margin-bottom: 32px;
  }

  .mindmap-card {
    height: 100%;
    margin-bottom: 24px;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    border: none;
    display: flex;
    flex-direction: column;

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }

    .mindmap-content {
      display: flex;
      padding: 20px;
    }

    .mindmap-icon {
      width: 64px;
      height: 64px;
      background-color: rgba(64, 158, 255, 0.1);
      color: #409eff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      flex-shrink: 0;
    }

    .mindmap-info {
      flex: 1;
      overflow: hidden;

      h3 {
        margin: 0 0 10px 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      p {
        margin: 0 0 12px 0;
        color: #606266;
        font-size: 14px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.5;
      }

      .mindmap-meta {
        display: flex;
        gap: 12px;
        color: #909399;
        font-size: 12px;

        .el-tag {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }

    .mindmap-actions {
      padding: 12px 20px;
      background-color: #f5f7fa;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: auto;
    }
  }

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 60px 0;
  }

  @media (max-width: 1200px) {
    padding: 20px;

    .page-header {
      margin-bottom: 24px;

      h1 {
        font-size: 24px;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 16px;

    .search-section {
      flex-direction: column;
      align-items: stretch;

      .search-input {
        max-width: none;
      }

      .create-btn {
        margin-left: 0;
        margin-top: 12px;
      }
    }

    .mindmap-card {
      .mindmap-content {
        flex-direction: column;
      }

      .mindmap-icon {
        margin-right: 0;
        margin-bottom: 16px;
        align-self: center;
      }
    }
  }
}
</style>
