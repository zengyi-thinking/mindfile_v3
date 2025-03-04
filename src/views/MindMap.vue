<template>
  <div class="mindmap-container">
    <div class="page-header">
      <h1>我的思维导图</h1>
      <div class="user-info">
        <span>{{ currentUser.role }}</span>
        <el-avatar :size="40" class="avatar">{{
          currentUser.avatar
        }}</el-avatar>
      </div>
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
  </div>
</template>

<script setup>
import { ref, h } from "vue";
import { useRouter } from "vue-router";

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

// 模拟思维导图数据
const mindmaps = ref([
  {
    id: 1,
    title: "Python基础知识",
    description: "Python语言核心概念和基础语法的思维导图",
    createdAt: "2023-06-10",
    nodeCount: 35,
  },
  {
    id: 2,
    title: "数据结构与算法",
    description: "常见数据结构和算法的整理与分析",
    createdAt: "2023-05-22",
    nodeCount: 42,
  },
  {
    id: 3,
    title: "Web开发技术栈",
    description: "前后端开发技术栈的全面梳理",
    createdAt: "2023-06-01",
    nodeCount: 50,
  },
]);

// 搜索思维导图
const searchMindmaps = () => {
  // 实际应用中这里会调用API进行搜索
  console.log("搜索关键词:", searchQuery.value);
};

// 创建新思维导图
const createNewMindmap = () => {
  // 实际应用中这里会跳转到创建页面或打开创建对话框
  console.log("创建新思维导图");
};

// 查看思维导图
const viewMindmap = (id) => {
  console.log("查看思维导图:", id);
  // router.push(`/mindmap/${id}`)
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
