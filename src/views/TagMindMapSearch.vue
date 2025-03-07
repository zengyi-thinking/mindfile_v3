<template>
  <div class="tag-mindmap-search-container">
    <div class="page-header">
      <h1>标签思维导图</h1>
      <div class="user-info">
        <span>{{ currentUser.role }}</span>
        <el-avatar :size="40" class="avatar">{{ currentUser.avatar }}</el-avatar>
      </div>
    </div>

    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索标签或资料..."
        class="search-input"
        clearable
        @keyup.enter="searchTags"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="searchTags">
        <el-icon><Search /></el-icon> 搜索
      </el-button>
    </div>

    <div class="mindmap-container">
      <!-- 思维导图容器 -->
      <div id="mindmap" ref="mindmapRef" class="mindmap"></div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-overlay">
        <el-loading size="large"></el-loading>
        <p>加载中...</p>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && !hasData" class="empty-state">
        <el-empty description="暂无标签数据">
          <p>请尝试搜索或选择一个标签</p>
        </el-empty>
      </div>
    </div>

    <div class="tag-selection">
      <h3>选择标签分类</h3>
      <div class="tag-categories">
        <div class="primary-categories">
          <el-tag 
            v-for="category in primaryCategories" 
            :key="category"
            :class="{ 'active-tag': selectedCategory === category }"
            @click="selectCategory(category)"
            effect="plain"
            class="category-tag"
          >
            {{ category }}
          </el-tag>
        </div>

        <div class="secondary-categories" v-if="selectedCategory">
          <el-tag 
            v-for="subcategory in secondaryCategories" 
            :key="subcategory"
            :class="{ 'active-tag': selectedSubcategory === subcategory }"
            @click="selectSubcategory(subcategory)"
            effect="plain"
            class="subcategory-tag"
            type="success"
          >
            {{ subcategory }}
          </el-tag>
        </div>

        <div class="tertiary-tags" v-if="selectedSubcategory">
          <el-tag 
            v-for="tag in tertiaryTags" 
            :key="tag"
            :class="{ 'active-tag': selectedTertiaryTag === tag }"
            @click="selectTertiaryTag(tag)"
            effect="plain"
            class="tertiary-tag"
            type="info"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 资料预览抽屉 -->
    <el-drawer
      v-model="materialDrawer.visible"
      title="资料详情"
      size="30%"
      destroy-on-close
    >
      <div v-if="materialDrawer.material" class="material-preview">
        <h2>{{ materialDrawer.material.name }}</h2>
        <p>{{ materialDrawer.material.description }}</p>
        <div class="material-meta">
          <el-tag size="small" type="info" effect="plain">
            <el-icon><Document /></el-icon>
            <span>{{ materialDrawer.material.type }}</span>
          </el-tag>
        </div>
        <div class="material-actions">
          <el-button type="primary" @click="viewMaterial(materialDrawer.material.id)">
            查看完整资料
          </el-button>
        </div>
      </div>
      <div v-else class="material-loading">
        <el-loading></el-loading>
        <p>加载资料信息...</p>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Search, Document } from '@element-plus/icons-vue';
import MindMap from 'simple-mind-map';
import { getPrimaryCategories, getSecondaryCategories, getTertiaryTags } from '../config/tags';
import { getMaterialsByTagPath } from '../api/tagBasedMindmap';
import { getMaterialById } from '../api/materials';

const router = useRouter();
const searchQuery = ref('');
const currentUser = ref({
  role: "管理员",
  avatar: "A",
});

// 思维导图相关
const mindmapRef = ref(null);
let mindmapInstance = null;
const loading = ref(false);
const hasData = ref(false);

// 标签分类
const primaryCategories = ref([]);
const secondaryCategories = ref([]);
const tertiaryTags = ref([]);
const selectedCategory = ref('');
const selectedSubcategory = ref('');
const selectedTertiaryTag = ref('');

// 资料预览抽屉
const materialDrawer = ref({
  visible: false,
  material: null
});

// 初始化标签分类
const initTagCategories = () => {
  primaryCategories.value = getPrimaryCategories();
};

// 选择一级分类
const selectCategory = async (category) => {
  if (selectedCategory.value === category) {
    // 取消选择
    selectedCategory.value = '';
    selectedSubcategory.value = '';
    selectedTertiaryTag.value = '';
    secondaryCategories.value = [];
    tertiaryTags.value = [];
    clearMindmap();
  } else {
    selectedCategory.value = category;
    selectedSubcategory.value = '';
    selectedTertiaryTag.value = '';
    secondaryCategories.value = getSecondaryCategories(category);
    tertiaryTags.value = [];
    
    // 生成一级分类思维导图
    await generateMindmapForCategory(category);
  }
};

// 选择二级分类
const selectSubcategory = async (subcategory) => {
  if (selectedSubcategory.value === subcategory) {
    // 取消选择
    selectedSubcategory.value = '';
    selectedTertiaryTag.value = '';
    tertiaryTags.value = [];
    
    // 回到一级分类思维导图
    await generateMindmapForCategory(selectedCategory.value);
  } else {
    selectedSubcategory.value = subcategory;
    selectedTertiaryTag.value = '';
    tertiaryTags.value = getTertiaryTags(selectedCategory.value, subcategory);
    
    // 生成二级分类思维导图
    await generateMindmapForSubcategory(selectedCategory.value, subcategory);
  }
};

// 选择三级标签
const selectTertiaryTag = async (tag) => {
  if (selectedTertiaryTag.value === tag) {
    // 取消选择
    selectedTertiaryTag.value = '';
    
    // 回到二级分类思维导图
    await generateMindmapForSubcategory(selectedCategory.value, selectedSubcategory.value);
  } else {
    selectedTertiaryTag.value = tag;
    
    // 生成三级标签思维导图
    await generateMindmapForTag(selectedCategory.value, selectedSubcategory.value, tag);
  }
};

// 搜索标签
const searchTags = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }
  
  loading.value = true;
  try {
    // 搜索标签和资料
    await generateMindmapForSearch(searchQuery.value);
  } catch (error) {
    console.error('搜索标签出错:', error);
    ElMessage.error('搜索标签出错');
    hasData.value = false;
  } finally {
    loading.value = false;
  }
};

// 生成一级分类思维导图
const generateMindmapForCategory = async (category) => {
  loading.value = true;
  try {
    // 获取该分类下的所有二级分类
    const subcategories = getSecondaryCategories(category);
    
    // 创建思维导图数据
    const rootNode = {
      id: 'root',
      text: category,
      children: []
    };
    
    // 添加二级分类节点
    subcategories.forEach(subcategory => {
      rootNode.children.push({
        id: `subcategory-${subcategory}`,
        text: subcategory,
        data: { type: 'subcategory', value: subcategory }
      });
    });
    
    // 渲染思维导图
    renderMindmap(rootNode);
    hasData.value = true;
  } catch (error) {
    console.error('生成思维导图出错:', error);
    ElMessage.error('生成思维导图出错');
    hasData.value = false;
  } finally {
    loading.value = false;
  }
};

// 生成二级分类思维导图
const generateMindmapForSubcategory = async (category, subcategory) => {
  loading.value = true;
  try {
    // 获取该二级分类下的所有三级标签
    const tags = getTertiaryTags(category, subcategory);
    
    // 创建思维导图数据
    const rootNode = {
      id: 'root',
      text: category,
      children: [
        {
          id: `subcategory-${subcategory}`,
          text: subcategory,
          children: []
        }
      ]
    };
    
    // 添加三级标签节点
    const subcategoryNode = rootNode.children[0];
    tags.forEach(tag => {
      subcategoryNode.children.push({
        id: `tag-${tag}`,
        text: tag,
        data: { type: 'tag', value: tag }
      });
    });
    
    // 渲染思维导图
    renderMindmap(rootNode);
    hasData.value = true;
  } catch (error) {
    console.error('生成思维导图出错:', error);
    ElMessage.error('生成思维导图出错');
    hasData.value = false;
  } finally {
    loading.value = false;
  }
};

// 生成三级标签思维导图
const generateMindmapForTag = async (category, subcategory, tag) => {
  loading.value = true;
  try {
    // 获取与该标签相关的资料
    const tagPath = [category, subcategory, tag];
    const materials = await getMaterialsByTagPath(tagPath);
    
    // 创建思维导图数据
    const rootNode = {
      id: 'root',
      text: category,
      children: [
        {
          id: `subcategory-${subcategory}`,
          text: subcategory,
          children: [
            {
              id: `tag-${tag}`,
              text: tag,
              children: []
            }
          ]
        }
      ]
    };
    
    // 添加资料节点
    const tagNode = rootNode.children[0].children[0];
    
    // 按自定义标签分组添加资料
    materials.forEach(material => {
      // 检查资料是否有自定义标签
      if (material.customTags && material.customTags.length > 0) {
        // 为每个自定义标签创建节点
        material.customTags.forEach(customTag => {
          // 检查是否已存在该自定义标签节点
          let customTagNode = tagNode.children.find(node => 
            node.data && node.data.type === 'customTag' && node.text === customTag
          );
          
          // 如果不存在，创建新的自定义标签节点
          if (!customTagNode) {
            customTagNode = {
              id: `customTag-${customTag.replace(/\s+/g, '-')}`,
              text: customTag,
              data: { type: 'customTag', value: customTag },
              children: []
            };
            tagNode.children.push(customTagNode);
          }
          
          // 将资料添加到自定义标签节点下
          customTagNode.children.push({
            id: `material-${material.id}`,
            text: material.name,
            data: { type: 'material', materialId: material.id }
          });
        });
      } else {
        // 如果没有自定义标签，直接添加到三级标签节点下
        tagNode.children.push({
          id: `material-${material.id}`,
          text: material.name,
          data: { type: 'material', materialId: material.id }
        });
      }
    });
    
    // 渲染思维导图
    renderMindmap(rootNode);
    hasData.value = true;
  } catch (error) {
    console.error('生成思维导图出错:', error);
    ElMessage.error('生成思维导图出错');
    hasData.value = false;
  } finally {
    loading.value = false;
  }
};

// 生成搜索结果思维导图
const generateMindmapForSearch = async (keyword) => {
  loading.value = true;
  try {
    // 搜索匹配的标签
    const matchedTags = searchMatchingTags(keyword);
    
    if (matchedTags.length === 0) {
      ElMessage.warning('未找到匹配的标签');
      hasData.value = false;
      loading.value = false;
      return;
    }
    
    // 创建思维导图数据
    const rootNode = {
      id: 'root',
      text: `搜索: ${keyword}`,
      children: []
    };
    
    // 添加匹配的标签节点
    for (const tag of matchedTags) {
      const { primary, secondary, tertiary } = tag;
      
      // 查找或创建一级分类节点
      let primaryNode = rootNode.children.find(node => node.text === primary);
      if (!primaryNode) {
        primaryNode = {
          id: `primary-${primary}`,
          text: primary,
          children: []
        };
        rootNode.children.push(primaryNode);
      }
      
      // 查找或创建二级分类节点
      if (secondary) {
        let secondaryNode = primaryNode.children.find(node => node.text === secondary);
        if (!secondaryNode) {
          secondaryNode = {
            id: `secondary-${secondary}`,
            text: secondary,
            children: []
          };
          primaryNode.children.push(secondaryNode);
        }
        
        // 查找或创建三级标签节点
        if (tertiary) {
          let tertiaryNode = secondaryNode.children.find(node => node.text === tertiary);
          if (!tertiaryNode) {
            tertiaryNode = {
              id: `tertiary-${tertiary}`,
              text: tertiary,
              children: []
            };
            secondaryNode.children.push(tertiaryNode);
          }
          
          // 获取与该标签相关的资料
          const tagPath = [primary, secondary, tertiary];
          const materials = await getMaterialsByTagPath(tagPath);
          
          // 添加资料节点，按自定义标签分组
          materials.forEach(material => {
            // 检查资料是否有自定义标签
            if (material.customTags && material.customTags.length > 0) {
              // 为每个自定义标签创建节点
              material.customTags.forEach(customTag => {
                // 检查是否已存在该自定义标签节点
                let customTagNode = tertiaryNode.children.find(node => 
                  node.data && node.data.type === 'customTag' && node.text === customTag
                );
                
                // 如果不存在，创建新的自定义标签节点
                if (!customTagNode) {
                  customTagNode = {
                    id: `customTag-${customTag.replace(/\s+/g, '-')}`,
                    text: customTag,
                    data: { type: 'customTag', value: customTag },
                    children: []
                  };
                  tertiaryNode.children.push(customTagNode);
                }
                
                // 将资料添加到自定义标签节点下
                customTagNode.children.push({
                  id: `material-${material.id}`,
                  text: material.name,
                  data: { type: 'material', materialId: material.id }
                });
              });
            } else {
              // 如果没有自定义标签，直接添加到三级标签节点下
              tertiaryNode.children.push({
                id: `material-${material.id}`,
                text: material.name,
                data: { type: 'material', materialId: material.id }
              });
            }
          });
        }
      }
    }
    
    // 渲染思维导图
    renderMindmap(rootNode);
    hasData.value = true;
  } catch (error) {
    console.error('搜索标签出错:', error);
    ElMessage.error('搜索标签出错');
    hasData.value = false;
  } finally {
    loading.value = false;
  }
};

// 搜索匹配的标签
const searchMatchingTags = (keyword) => {
  const result = [];
  const lowerKeyword = keyword.toLowerCase();
  
  // 搜索所有标签
  const primaryCategories = getPrimaryCategories();
  
  primaryCategories.forEach(primary => {
    const secondaryCategories = getSecondaryCategories(primary);
    
    secondaryCategories.forEach(secondary => {
      const tertiaryTags = getTertiaryTags(primary, secondary);
      
      tertiaryTags.forEach(tertiary => {
        // 检查标签是否匹配关键词
        if (primary.toLowerCase().includes(lowerKeyword) ||
            secondary.toLowerCase().includes(lowerKeyword) ||
            tertiary.toLowerCase().includes(lowerKeyword)) {
          result.push({
            primary,
            secondary,
            tertiary
          });
        }
      });
    });
  });
  
  return result;
};

// 渲染思维导图
const renderMindmap = (rootNode) => {
  // 销毁已有实例
  if (mindmapInstance) {
    mindmapInstance.destroy();
  }
  
  // 创建思维导图实例
  mindmapInstance = new MindMap({
    el: mindmapRef.value,
    data: {
      root: rootNode
    },
    theme: {
      // 主题配置
      backgroundColor: '#f8f9fa',
      lineColor: '#4a90e2',
      lineWidth: 2,
      rootNodeBorderColor: '#4a90e2',
      rootNodeBackgroundColor: '#4a90e2',
      rootNodeColor: '#ffffff',
      secondNodeBorderColor: '#5cb85c',
      secondNodeBackgroundColor: '#5cb85c',
      secondNodeColor: '#ffffff',
      thirdNodeBorderColor: '#f0ad4e',
      thirdNodeBackgroundColor: '#f0ad4e',
      thirdNodeColor: '#ffffff',
      fourthNodeBorderColor: '#d9534f',
      fourthNodeBackgroundColor: '#d9534f',
      fourthNodeColor: '#ffffff'
    },
    mode: 'readonly',
    enableFreeDrag: true,
    watermark: {
      text: 'MindFile',
      opacity: 0.1
    }
  });
  
  // 注册节点点击事件
  mindmapInstance.on('node_click', (node) => {
    handleNodeClick(node);
  });
  
  // 自动布局
  mindmapInstance.layout();
};

// 清除思维导图
const clearMindmap = () => {
  if (mindmapInstance) {
    mindmapInstance.destroy();
    mindmapInstance = null;
  }
  hasData.value = false;
};

// 处理节点点击
const handleNodeClick = async (node) => {
  // 获取节点数据
  const nodeData = node.data.data;
  
  if (!nodeData) return;
  
  // 根据节点类型处理点击事件
  switch (nodeData.type) {
    case 'subcategory':
      // 点击二级分类节点
      selectSubcategory(nodeData.value);
      break;
    case 'tag':
      // 点击三级标签节点
      selectTertiaryTag(nodeData.value);
      break;
    case 'material':
      // 点击资料节点
      try {
        materialDrawer.value.material = null;
        materialDrawer.value.visible = true;
        
        // 加载资料详情
        const material = await getMaterialById(nodeData.materialId);
        materialDrawer.value.material = material;
      } catch (error) {
        console.error('加载资料详情失败:', error);
        ElMessage.error('加载资料详情失败');
        materialDrawer.value.visible = false;
      }
      break;
  }
};

// 查看完整资料
const viewMaterial = (materialId) => {
  materialDrawer.value.visible = false;
  router.push(`/materials/${materialId}`);
};

// 生命周期钩子
onMounted(() => {
  initTagCategories();
});

onBeforeUnmount(() => {
  // 销毁思维导图实例
  if (mindmapInstance) {
    mindmapInstance.destroy();
    mindmapInstance = null;
  }
});
</script>

<style lang="scss" scoped>
.tag-mindmap-search-container {
  padding: 24px;
  background-color: #f9fafc;
  min-height: calc(100vh - 60px);
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
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
  
  .search-section {
    display: flex;
    margin-bottom: 24px;
    gap: 12px;
    align-items: center;
    
    .search-input {
      flex: 1;
      max-width: 500px;
    }
  }
  
  .mindmap-container {
    position: relative;
    height: 500px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 24px;
    overflow: hidden;
    
    .mindmap {
      width: 100%;
      height: 100%;
    }
    
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 10;
      
      p {
        margin-top: 16px;
        color: #606266;
      }
    }
    
    .empty-state {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  }
  
  .tag-selection {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    padding: 20px;
    
    h3 {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
    
    .tag-categories {
      .primary-categories,
      .secondary-categories,
      .tertiary-tags {
        margin-bottom: 16px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        
        .category-tag,
        .subcategory-tag,
        .tertiary-tag {
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
  
  .material-preview {
    padding: 16px;
    
    h2 {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 20px;
      color: #303133;
    }
    
    p {
      margin-bottom: 16px;
      color: #606266;
      line-height: 1.6;
    }
    
    .material-meta {
      margin-bottom: 24px;
    }
    
    .material-actions {
      margin-top: 24px;
    }
  }
  
  .material-loading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 200px;
    
    p {
      margin-top: 16px;
      color: #606266;
    }
  }
}
</style>