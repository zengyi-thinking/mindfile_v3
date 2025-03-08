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
      // 现代化主题配置
      backgroundColor: '#f8f9fa',
      lineColor: '#6366f1',
      lineWidth: 3,
      lineStyle: 'curve', // 曲线连接线
      rootNodeBorderColor: '#6366f1',
      rootNodeBackgroundColor: '#818cf8',
      rootNodeBackgroundImage: 'linear-gradient(45deg, #6366f1, #818cf8)',
      rootNodeColor: '#ffffff',
      rootNodeFontSize: '18px',
      rootNodeBorderWidth: 3,
      rootNodeBorderRadius: 8,
      rootNodePadding: 15,
      secondNodeBorderColor: '#10b981',
      secondNodeBackgroundColor: '#34d399',
      secondNodeBackgroundImage: 'linear-gradient(45deg, #10b981, #34d399)',
      secondNodeColor: '#ffffff',
      secondNodeFontSize: '16px',
      secondNodeBorderWidth: 2,
      secondNodeBorderRadius: 6,
      secondNodePadding: 12,
      thirdNodeBorderColor: '#f59e0b',
      thirdNodeBackgroundColor: '#fbbf24',
      thirdNodeBackgroundImage: 'linear-gradient(45deg, #f59e0b, #fbbf24)',
      thirdNodeColor: '#ffffff',
      thirdNodeFontSize: '14px',
      thirdNodeBorderWidth: 2,
      thirdNodeBorderRadius: 6,
      thirdNodePadding: 10,
      fourthNodeBorderColor: '#ef4444',
      fourthNodeBackgroundColor: '#f87171',
      fourthNodeBackgroundImage: 'linear-gradient(45deg, #ef4444, #f87171)',
      fourthNodeColor: '#ffffff',
      fourthNodeFontSize: '14px',
      fourthNodeBorderWidth: 2,
      fourthNodeBorderRadius: 6,
      fourthNodePadding: 10,
      // 节点激活状态
      nodeActiveBorderColor: '#8b5cf6',
      nodeActiveBorderWidth: 3,
      nodeActiveBoxShadow: '0 0 12px rgba(139, 92, 246, 0.6)'
    },
    mode: isEditing.value ? 'edit' : 'readonly',
    enableFreeDrag: true,
    watermark: {
      text: 'MindFile',
      opacity: 0.08,
      color: '#6366f1'
    },
    // 添加动画配置
    enableNodeTransitionMove: true, // 启用节点过渡动画
    nodeTransitionMoveDuration: 400, // 节点过渡动画持续时间
    enableExpandOrCollapseNodeAnimation: true, // 启用展开/折叠节点动画
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
  
  // 添加节点点击动画效果
  if (node.nodeData.el) {
    // 添加点击波纹效果
    const el = node.nodeData.el;
    el.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
    el.style.transform = 'scale(1.05)';
    el.style.boxShadow = '0 0 15px rgba(99, 102, 241, 0.5)';
    
    // 恢复原始状态
    setTimeout(() => {
      el.style.transform = 'scale(1)';
      el.style.boxShadow = '';
    }, 300);
  }
  
  // 检查是否是资料节点
  if (node.data && node.data.data && node.data.data.type === 'material') {
    const materialId = node.data.data.materialId;
    if (materialId) {
      try {
        // 显示加载状态
        materialDrawer.value.material = null;
        materialDrawer.value.visible = true;
        
        // 添加加载动画
        ElMessage.info({
          message: '正在加载资料信息...',
          duration: 1000
        });
        
        // 加载资料详情
        const material = await getMaterialById(materialId);
        materialDrawer.value.material = material;
        
        // 成功加载提示
        ElMessage.success({
          message: '资料加载成功',
          duration: 1500
        });
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
  padding: 28px;
  background-color: #f9fafc;
  background-image: linear-gradient(to bottom right, #f9fafc, #f0f4ff);
  min-height: calc(100vh - 60px);
  transition: all 0.3s ease;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(99, 102, 241, 0.1);
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 18px;
      
      h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 600;
        color: #303133;
        background: linear-gradient(45deg, #6366f1, #8b5cf6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 2px 10px rgba(99, 102, 241, 0.1);
        transition: all 0.3s ease;
      }
    }
    
    .header-actions {
      display: flex;
      gap: 14px;
      
      .el-button {
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }
        
        &:active {
          transform: translateY(0);
        }
      }
    }
  }
  
  .mindmap-description {
    margin-bottom: 24px;
    color: #606266;
    font-size: 16px;
    line-height: 1.6;
    background-color: #fff;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(99, 102, 241, 0.1);
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 6px 24px rgba(99, 102, 241, 0.1);
      transform: translateY(-2px);
    }
  }
  
  .mindmap-container {
    position: relative;
    height: calc(100vh - 220px);
    min-height: 500px;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    transition: all 0.3s ease;
    border: 1px solid rgba(99, 102, 241, 0.1);
    
    &:hover {
      box-shadow: 0 8px 30px rgba(99, 102, 241, 0.12);
    }
    
    .mindmap {
      width: 100%;
      height: 100%;
      transition: all 0.3s ease;
      
      /* 自定义思维导图节点样式 */
      :deep(.smm-node) {
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        
        &:hover {
          transform: scale(1.02);
          filter: brightness(1.05);
          z-index: 10;
        }
      }
      
      /* 自定义连接线动画 */
      :deep(.smm-line) {
        transition: all 0.4s ease;
        stroke-dasharray: 0;
        animation: flowLine 1.5s ease-in-out infinite alternate;
      }
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
      background-color: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      z-index: 10;
      transition: all 0.3s ease;
      
      p {
        margin-top: 18px;
        color: #6366f1;
        font-size: 16px;
        font-weight: 500;
      }
    }
    
    .empty-state {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.3s ease;
    }
  }
  
  .material-preview {
    padding: 24px;
    
    h2 {
      margin-top: 0;
      margin-bottom: 18px;
      font-size: 22px;
      color: #303133;
      background: linear-gradient(45deg, #6366f1, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      transition: all 0.3s ease;
    }
    
    p {
      margin-bottom: 28px;
      color: #606266;
      line-height: 1.7;
      font-size: 15px;
      padding: 16px;
      background-color: #f9fafc;
      border-radius: 8px;
      border-left: 3px solid #6366f1;
      transition: all 0.3s ease;
      
      &:hover {
        background-color: #f0f4ff;
        transform: translateX(4px);
      }
    }
    
    .material-actions {
      margin-top: 28px;
      
      .el-button {
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }
        
        &:active {
          transform: translateY(0);
        }
      }
    }
  }
  
  .material-loading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 240px;
    
    p {
      margin-top: 18px;
      color: #6366f1;
      font-size: 16px;
      font-weight: 500;
    }
  }
  
  /* 添加关键帧动画 */
  @keyframes flowLine {
    0% {
      stroke-dashoffset: 100;
      stroke-dasharray: 20;
    }
    100% {
      stroke-dashoffset: 0;
      stroke-dasharray: 10;
    }
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.8;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
}
</style>