// 基于标签自动生成思维导图的API
import { createMindmap, updateMindmap, getAllMindmaps } from './mindmap';
import { hierarchicalTags, getPrimaryCategories, getSecondaryCategories, getTertiaryTags } from '../config/tags';
import { getAllMaterialsFromDB } from './storage';

// 根据标签路径搜索思维导图
export const searchMindmapsByTags = async (tagPath) => {
  try {
    const [primary, secondary, tertiary] = tagPath;
    
    // 获取所有思维导图
    const allMindmaps = await getAllMindmaps();
    
    // 过滤匹配的思维导图
    const results = allMindmaps.filter(mindmap => {
      // 检查一级标签
      if (mindmap.tags?.primary !== primary) return false;
      
      // 检查二级标签
      if (secondary && mindmap.tags?.secondary !== secondary) return false;
      
      // 检查三级标签
      if (tertiary && mindmap.tags?.tertiary !== tertiary) return false;
      
      return true;
    });
    
    return results;
  } catch (error) {
    console.error('根据标签搜索思维导图失败:', error);
    return [];
  }
};

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
      
      // 为每个资料创建自定义标签节点
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
              data: { materialId: material.id, type: 'material' }
            });
          });
        } else {
          // 如果没有自定义标签，直接添加到三级标签节点下
          tertiaryNode.children.push({
            id: `material-${material.id}`,
            text: material.name,
            data: { materialId: material.id, type: 'material' }
          });
        }
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
  
  // 添加新资料，按自定义标签分组
  newMaterials.forEach(material => {
    // 检查资料是否已存在
    const existingMaterialNode = targetNode.children.find(node => 
      node.data && 
      node.data.type === 'material' && 
      node.data.materialId === material.id
    );
    
    // 如果资料已存在，跳过
    if (existingMaterialNode) return;
    
    // 检查资料是否有自定义标签
    if (material.customTags && material.customTags.length > 0) {
      // 为每个自定义标签创建或更新节点
      material.customTags.forEach(customTag => {
        // 检查是否已存在该自定义标签节点
        let customTagNode = targetNode.children.find(node => 
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
          targetNode.children.push(customTagNode);
        }
        
        // 将资料添加到自定义标签节点下
        customTagNode.children.push({
          id: `material-${material.id}`,
          text: material.name,
          data: { materialId: material.id, type: 'material' }
        });
      });
    } else {
      // 如果没有自定义标签，直接添加到目标节点下
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
  try {
    // 获取所有资料
    const allMaterials = await getAllMaterialsFromDB();
    
    // 过滤出匹配标签路径的资料
    const [primary, secondary, tertiary] = tagPath;
    const filteredMaterials = allMaterials.filter(material => {
      const materialTags = material.hierarchicalTags || [];
      
      // 检查一级标签
      if (materialTags[0] !== primary) return false;
      
      // 检查二级标签
      if (secondary && materialTags[1] !== secondary) return false;
      
      // 检查三级标签
      if (tertiary && materialTags[2] !== tertiary) return false;
      
      return true;
    });
    
    return filteredMaterials;
  } catch (error) {
    console.error('根据标签路径获取资料失败:', error);
    return [];
  }
};
