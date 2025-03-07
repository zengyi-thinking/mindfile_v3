<template>
  <div class="mindmap-view-container">
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" icon="ArrowLeft">返回</el-button>
        <h1>{{ mindmapTitle }}</h1>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="saveMindmap" v-if="isEditing">
          <el-icon><Check /></el-icon> 保存
        </el-button>
        <el-button @click="toggleEditMode">
          <el-icon><Edit /></el-icon> {{ isEditing ? '退出编辑' : '编辑' }}
        </el-button>
      </div>
    </div>

    <div class="mindmap-description" v-if="mindmapData">
      <p>{{ mindmapData.description }}</p>
    </div>

    <div class="mindmap-container">
      <!-- 思维导图容器 -->
      <div id="mindmap" ref="mindmapRef" class="mindmap"></div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-overlay">
        <el-spinner size="large"></el-spinner>
        <p>加载中...</p>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && !mindmapData" class="empty-state">
        <el-empty description="未找到思维导图数据">
          <el-button type="primary" @click="goBack">返回列表</el-button>
        </el-empty>
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
        <div class="material-actions">
          <el-button type="primary" @click="viewMaterial(materialDrawer.material.id)">
            查看完整资料
          </el-button>
        </div>
      </div>
      <div v-else class="material-loading">
        <el-spinner></el-spinner>
        <p>加载资料信息...</p>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Check, Edit, ArrowLeft } from '@element-plus/icons-vue';
import MindMap from 'simple-mind-map';
import { getMindmapById, updateMindmap } from '../api/mindmap';
import { getMaterialById } from '../api/materials';

// 路由和导航
const route = useRoute();
const router = useRouter();
const mindmapId = computed(() => route.params.id);

// 思维导图数据和状态
const mindmapData = ref(null);
const mindmapTitle = computed(() => mindmapData.value?.title || '思维导图');
const loading = ref(true);
const isEditing = ref(false);

// 思维导图实例
const mindmapRef = ref(null);
let mindmapInstance = null;

// 资料预览抽屉
const materialDrawer = ref({
  visible: false,
  material: null
});

// 返回列表页
const goBack = () => {
  router.push('/mindmap');
};

// 切换编辑模式
const toggleEditMode = () => {
  isEditing.value = !isEditing.value;
  if (mindmapInstance) {
    mindmapInstance.setMode(isEditing.value ? 'edit' : 'readonly');
  }
};

// 保存思维导图
const saveMindmap = async () => {
  try {
    if (!mindmapInstance) return;
    
    // 获取思维导图数据
    const data = mindmapInstance.getData();
    
    // 更新思维导图
    await updateMindmap(mindmapId.value, {
      nodes: data.root ? [data.root] : [],
      nodeCount: countNodes(data.root)
    });
    
    ElMessage.success('思维导图保存成功');
    isEditing.value = false;
    mindmapInstance.setMode('readonly');
  } catch (error) {
    console.error('保存思维导图失败:', error);
    ElMessage.error('保存失败，请重试');
  }
};

// 计算节点数量
const countNodes = (node) => {
  if (!node) return 0;
  let count = 1; // 当前节点
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      count += countNodes(child);
    });
  }
  return count;
};

// 加载思维导图数据
const loadMindmapData = async () => {
  if (!mindmapId.value) {
    loading.value = false;
    return;
  }
  
  try {
    loading.value = true;
    const data = await getMindmapById(mindmapId.value);
    mindmapData.value = data;
    initMindmap();
  } catch (error) {
    console.error('加载思维导图失败:', error);
    ElMessage.error('加载思维导图失败');
  } finally {
    loading.value = false;
  }
};

// 初始化思维导图
const initMindmap = () => {
  if (!mindmapRef.value || !mindmapData.value || !mindmapData.value.nodes) return;
  
  // 销毁已有实例
  if (mindmapInstance) {
    mindmapInstance.destroy();
  }
  
  // 创建思维导图实例
  mindmapInstance = new MindMap({
    el: mindmapRef.value,
    data: {
      // 使用第一个节点作为根节点
      root: mindmapData.value.nodes[0] || {
        id: 'root',
        text: mindmapData.value.title,
        children: []
      }
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
    mode: isEditing.value ? 'edit' : 'readonly',
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

// 处理节点点击
const handleNodeClick = async (node) => {
  // 如果是编辑模式，不处理点击事件
  if (isEditing.value) return;
  
  // 检查是否是资料节点
  if (node.data && node.data.data && node.data.data.type === 'material') {
    const materialId = node.data.data.materialId;
    if (materialId) {
      try {
        materialDrawer.value.material = null;
        materialDrawer.value.visible = true;
        
        // 加载资料详情
        const material = await getMaterialById(materialId);
        materialDrawer.value.material = material;
      } catch (error) {
        console.error('加载资料详情失败:', error);
        ElMessage.error('加载资料详情失败');
        materialDrawer.value.visible = false;
      }
    }
  }
};

// 查看完整资料
const viewMaterial = (materialId) => {
  materialDrawer.value.visible = false;
  router.push(`/materials/${materialId}`);
};

// 生命周期钩子
onMounted(() => {
  loadMindmapData();
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
.mindmap-view-container {
  padding: 24px;
  background-color: #f9fafc;
  min-height: calc(100vh - 60px);
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
      
      h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
      }
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
  
  .mindmap-description {
    margin-bottom: 20px;
    color: #606266;
    font-size: 16px;
    background-color: #fff;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
  
  .mindmap-container {
    position: relative;
    height: calc(100vh - 200px);
    min-height: 500px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
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
      justify-content: center;
      align-items: center;
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
      margin-bottom: 24px;
      color: #606266;
      line-height: 1.6;
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