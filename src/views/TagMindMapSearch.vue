<template>
  <div class="tag-mindmap-search">
    <!-- 搜索头部 -->
    <div class="search-header">
      <h1>标签思维导图搜索</h1>
      <!-- 面包屑导航 -->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>标签搜索</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 搜索控件 -->
    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索思维导图..."
        class="search-input"
        clearable
        @keyup.enter="searchByTags"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-cascader
        v-model="selectedTagPath"
        :options="tagOptions"
        :props="{ checkStrictly: true }"
        placeholder="请选择标签路径"
        clearable
        class="tag-selector"
      />
      <el-button 
        type="primary" 
        @click="searchByTags"
        :loading="loading"
        class="search-btn"
      >
        <el-icon><Search /></el-icon> 搜索
      </el-button>
      <el-button 
        type="primary" 
        @click="createNewMindmap"
        class="create-btn"
      >
        创建新思维导图
      </el-button>
    </div>

    <!-- 搜索结果 -->
    <div class="search-results">
      <el-row :gutter="24">
        <!-- 遍历思维导图列表 -->
        <el-col
          v-for="(mindmap, index) in mindmaps"
          :key="index"
          :xs="24"
          :sm="12"
          :md="8"
        >
          <!-- 思维导图卡片 -->
          <el-card
            class="mindmap-card"
            shadow="hover"
            @click="viewMindmap(mindmap.id)"
          >
            <div class="mindmap-content">
              <!-- 思维导图图标 -->
              <div class="mindmap-icon">
                <el-icon :size="40"><BrainIcon /></el-icon>
              </div>
              <!-- 思维导图信息 -->
              <div class="mindmap-info">
                <h3>{{ mindmap.title }}</h3>
                <p>{{ mindmap.description }}</p>
                <!-- 思维导图元数据 -->
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
          </el-card>
        </el-col>
      </el-row>

      <!-- 无搜索结果状态 -->
      <div v-if="mindmaps.length === 0" class="empty-state">
        <el-empty description="暂无搜索结果" :image-size="200">
          <!-- 创建新思维导图按钮 -->
          <el-button type="primary" @click="createNewMindmap">
            创建新思维导图
          </el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { hierarchicalTags, getPrimaryCategories, getSecondaryCategories, getTertiaryTags } from '../config/tags';
import { searchMindmapsByTags } from '../api/tagBasedMindmap';
import { ElMessage } from 'element-plus';

const router = useRouter();
const searchQuery = ref('');
const selectedTagPath = ref([]);
const mindmaps = ref([]);
const loading = ref(false);

// 标签选项
const tagOptions = computed(() => {
  return getPrimaryCategories().map(primary => {
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

// 根据标签搜索思维导图
const searchByTags = async () => {
  if (selectedTagPath.value.length === 0) {
    ElMessage.warning('请选择标签路径');
    return;
  }

  loading.value = true;
  try {
    const results = await searchMindmapsByTags(selectedTagPath.value);
    mindmaps.value = results;
    
    if (results.length === 0) {
      ElMessage.info('未找到匹配的思维导图');
    }
  } catch (error) {
    console.error('搜索出错:', error);
    ElMessage.error('搜索失败');
  } finally {
    loading.value = false;
  }
};

// 查看思维导图
const viewMindmap = (id) => {
  router.push(`/mindmap/${id}`);
};

// 创建新思维导图
const createNewMindmap = () => {
  router.push('/mindmap/new');
};
</script>

<style lang="scss" scoped>
.tag-mindmap-search {
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

  .search-header {
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

    .tag-selector {
      width: 240px;
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
      margin-right: 12px;
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

    .create-btn {
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

  .search-results {
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
}
</style>
