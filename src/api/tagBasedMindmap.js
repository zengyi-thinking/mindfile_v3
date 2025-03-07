// 基于标签自动生成思维导图的API
import { createMindmap, updateMindmap, getAllMindmaps } from './mindmap';
import { hierarchicalTags, getPrimaryCategories, getSecondaryCategories, getTertiaryTags } from '../config/tags';

// 根据标签生成思维导图
export const generateMindmapFromTags = async (tagPath, materials = []) => {
  try {
    if (!tagPath || tagPath.length === 0) {
      throw new Error('标签路径不能为空');
    }

    // 解构标签路径
    const [primaryCategory, secondaryCategory, tertiaryTag] = tagPath;
    
    // 构建思维导图标题
    let title = primaryCategory;
    if (secondaryCategory) {
      title += ` - ${secondaryCategory}`;
      if (tertiaryTag) {
        title += ` - ${tertiaryTag}`;
      }
    }
    
    // 检查是否已存在相同标签的思维导图
    const existingMindmaps = await getAllMindmaps();
    const existingMindmap = existingMindmaps.find(mindmap => 
      mindmap.title === title || 
      (mindmap.tags && 
       mindmap.tags.primary === primaryCategory && 
       mindmap.tags.secondary === secondaryCategory && 
       (tertiaryTag ? mindmap.tags.tertiary === tertiaryTag : true))
    );
    
    if (existingMindmap) {
      // 如果已存在，更新思维导图
      const updatedMindmap = await updateExistingMindmap(existingMindmap, materials);
      return {
        mindmap: updatedMindmap,
        isNew: false
      };
    } else {
      // 如果不存在，创建新的思维导图
      const newMindmap = await createNewMindmap(title, tagPath, materials);
      return {
        mindmap: newMindmap,
        isNew: true
      };
    }
  } catch (error) {
    console.error('生成思维导图出错:', error);
    throw error;
  }
};

// 创建新的思维导图
const createNewMindmap = async (title, tagPath, materials) => {
  const [primaryCategory, secondaryCategory, tertiaryTag] = tagPath;
  
  // 构建思维导图描述
  let description = `基于${primaryCategory}`;
  if (secondaryCategory) {
    description += `/${secondaryCategory}`;
    if (tertiaryTag) {
      description += `/${tertiaryTag}`;
    }
  }
  description += '标签自动生成的思维导图';
  
  // 收集相关资料ID
  const relatedMaterialIds = materials.map(material => material.id);
  
  // 创建思维导图数据结构
  const mindmapData = {
    title,
    description,
    tags: {
      primary: primaryCategory,
      secondary: secondaryCategory || null,
      tertiary: tertiaryTag || null
    },
    relatedMaterials: relatedMaterialIds,
    // 初始节点结构
    nodes: generateInitialNodeStructure(tagPath, materials)
  };
  
  // 调用创建API
  return await createMindmap(mindmapData);
};

// 更新现有思维导图
const updateExistingMindmap = async (mindmap, newMaterials) => {
  // 合并资料ID，避免重复
  const existingMaterialIds = mindmap.relatedMaterials || [];
  const newMaterialIds = newMaterials.map(material => material.id);
  
  const combinedMaterialIds = [...new Set([...existingMaterialIds, ...newMaterialIds])];
  
  // 更新节点结构
  const updatedNodes = updateNodeStructure(mindmap.nodes, newMaterials);
  
  // 更新思维导图
  const updateData = {
    relatedMaterials: combinedMaterialIds,
    nodeCount: updatedNodes ? updatedNodes.length : mindmap.nodeCount,
    nodes: updatedNodes || mindmap.nodes
  };
  
  return await updateMindmap(mindmap.id, updateData);
};

// 生成初始节点结构
const generateInitialNodeStructure = (tagPath, materials) => {
  const [primaryCategory, secondaryCategory, tertiaryTag] = tagPath;
  
  // 根节点
  const rootNode = {
    id: 'root',
    text: primaryCategory,
    children: []
  };
  
  // 如果有二级分类
  if (secondaryCategory) {
    const secondaryNode = {
      id: `secondary-${secondaryCategory}`,
      text: secondaryCategory,
      children: []
    };
    
    // 如果有三级标签
    if (tertiaryTag) {
      const tertiaryNode = {
        id: `tertiary-${tertiaryTag}`,
        text: tertiaryTag,
        children: []
      };
      
      // 添加资料节点
      materials.forEach(material => {
        tertiaryNode.children.push({
          id: `material-${material.id}`,
          text: material.name,
          data: { materialId: material.id, type: 'material' }
        });
      });
      
      secondaryNode.children.push(tertiaryNode);
    } else {
      // 直接添加资料到二级节点
      materials.forEach(material => {
        secondaryNode.children.push({
          id: `material-${material.id}`,
          text: material.name,
          data: { materialId: material.id, type: 'material' }
        });
      });
    }
    
    rootNode.children.push(secondaryNode);
  } else {
    // 直接添加资料到根节点
    materials.forEach(material => {
      rootNode.children.push({
        id: `material-${material.id}`,
        text: material.name,
        data: { materialId: material.id, type: 'material' }
      });
    });
  }
  
  return [rootNode];
};

// 更新节点结构
const updateNodeStructure = (existingNodes, newMaterials) => {
  if (!existingNodes || existingNodes.length === 0) {
    return null;
  }
  
  // 深拷贝现有节点结构
  const updatedNodes = JSON.parse(JSON.stringify(existingNodes));
  const rootNode = updatedNodes[0];
  
  // 查找最深层的节点来添加新资料
  let targetNode = rootNode;
  
  // 如果有子节点，找到最后一级节点
  if (rootNode.children && rootNode.children.length > 0) {
    const secondaryNode = rootNode.children[0];
    if (secondaryNode.children && secondaryNode.children.length > 0 && 
        secondaryNode.children[0].children) {
      // 有三级节点
      targetNode = secondaryNode.children[0];
    } else {
      // 只有二级节点
      targetNode = secondaryNode;
    }
  }
  
  // 添加新资料，避免重复
  const existingMaterialIds = new Set(
    targetNode.children
      .filter(node => node.data && node.data.type === 'material')
      .map(node => node.data.materialId)
  );
  
  newMaterials.forEach(material => {
    if (!existingMaterialIds.has(material.id)) {
      targetNode.children.push({
        id: `material-${material.id}`,
        text: material.name,
        data: { materialId: material.id, type: 'material' }
      });
    }
  });
  
  return updatedNodes;
};

// 根据资料标签自动组织思维导图
export const organizeMaterialsByTags = async (materials) => {
  try {
    // 按标签分组资料
    const materialsByTag = {};
    
    materials.forEach(material => {
      if (material.hierarchicalTags && material.hierarchicalTags.length > 0) {
        // 处理分级标签
        const tagKey = material.hierarchicalTags.join('|');
        if (!materialsByTag[tagKey]) {
          materialsByTag[tagKey] = [];
        }
        materialsByTag[tagKey].push(material);
      }
    });
    
    // 为每组标签生成思维导图
    const results = [];
    for (const tagKey in materialsByTag) {
      const tagPath = tagKey.split('|');
      const materialsForTag = materialsByTag[tagKey];
      
      const result = await generateMindmapFromTags(tagPath, materialsForTag);
      results.push(result);
    }
    
    return results;
  } catch (error) {
    console.error('组织资料思维导图出错:', error);
    throw error;
  }
};

// 根据标签路径获取相关资料
export const getMaterialsByTagPath = async (tagPath) => {
  // 实际应用中，这里会调用后端API获取相关资料
  // 这里简单模拟一下
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: '示例资料1',
          description: '这是一个示例资料',
          type: 'document'
        },
        {
          id: 2,
          name: '示例资料2',
          description: '这是另一个示例资料',
          type: 'document'
        }
      ]);
    }, 300);
  });
};