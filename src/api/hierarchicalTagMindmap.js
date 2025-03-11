// 多级标签思维导图生成API
import { createMindmap, updateMindmap, getAllMindmaps } from './mindmap';
import { hierarchicalTags, getPrimaryCategories, getSecondaryCategories, getTertiaryTags } from '../config/tags';
import { getAllMaterialsFromDB } from './storage';
import { parseTagString, validateTagPath } from './hierarchicalTagParser';

/**
 * 根据分级标签路径生成思维导图
 * 支持格式："比赛-数学建模-比赛规则-其他标签"
 * @param {string} tagPathString 标签路径字符串，格式为用"-"分隔的多级标签
 * @returns {Promise<Object>} 生成的思维导图数据
 */
export const generateMindmapFromTagString = async (tagPathString) => {
  try {
    if (!tagPathString) {
      throw new Error('标签路径不能为空');
    }

    // 解析标签路径字符串
    const tagPath = tagPathString.split('-').map(tag => tag.trim());
    
    // 确保至少有一个标签
    if (tagPath.length === 0) {
      throw new Error('标签路径格式不正确');
    }

    // 获取与标签相关的资料
    const materials = await getMaterialsByHierarchicalTagPath(tagPath);
    
    // 生成思维导图
    return await generateMindmapFromTags(tagPath, materials);
  } catch (error) {
    console.error('根据标签字符串生成思维导图失败:', error);
    throw error;
  }
};

/**
 * 根据分级标签路径获取相关资料
 * @param {Array<string>} tagPath 标签路径数组
 * @returns {Promise<Array>} 匹配的资料列表
 */
export const getMaterialsByHierarchicalTagPath = async (tagPath) => {
  try {
    // 获取所有资料
    const allMaterials = await getAllMaterialsFromDB();
    console.log(`获取到总共${allMaterials.length}个资料`);
    
    // 检查资料是否有效
    const validMaterials = allMaterials.filter(material => material && typeof material === 'object');
    if (validMaterials.length < allMaterials.length) {
      console.warn(`发现${allMaterials.length - validMaterials.length}个无效资料对象`);
    }
    
    // 检查资料是否有分级标签
    const materialsWithTags = validMaterials.filter(material => {
      if (!material.hierarchicalTags || !Array.isArray(material.hierarchicalTags)) {
        console.debug(`资料 ${material.id || 'unknown'} 没有有效的分级标签`);
        return false;
      }
      return true;
    });
    
    console.log(`有${materialsWithTags.length}/${validMaterials.length}个资料包含有效的分级标签`);
    
    // 过滤出匹配标签路径的资料
    const filteredMaterials = materialsWithTags.filter(material => {
      // 检查标签路径匹配
      // 对于每个层级，检查资料的标签是否匹配
      for (let i = 0; i < tagPath.length; i++) {
        // 如果资料的标签层级不够深，或者当前层级不匹配
        if (i >= material.hierarchicalTags.length || 
            material.hierarchicalTags[i] !== tagPath[i]) {
          return false;
        }
      }
      
      return true;
    });
    
    console.log(`找到${filteredMaterials.length}个匹配标签路径 ${tagPath.join('-')} 的资料`);
    
    return filteredMaterials;
  } catch (error) {
    console.error('根据分级标签路径获取资料失败:', error);
    return [];
  }
};

/**
 * 根据标签路径生成思维导图
 * @param {Array<string>} tagPath 标签路径数组
 * @param {Array<Object>} materials 相关资料列表
 * @returns {Promise<Object>} 生成的思维导图数据
 */
export const generateMindmapFromTags = async (tagPath, materials = []) => {
  try {
    if (!tagPath || tagPath.length === 0) {
      throw new Error('标签路径不能为空');
    }

    // 解构标签路径
    const [primaryCategory, secondaryCategory, tertiaryTag, ...customTags] = tagPath;
    
    // 构建思维导图标题
    let title = primaryCategory;
    if (secondaryCategory) {
      title += ` - ${secondaryCategory}`;
      if (tertiaryTag) {
        title += ` - ${tertiaryTag}`;
        if (customTags.length > 0) {
          title += ` - ${customTags.join(' - ')}`;
        }
      }
    }
    
    // 检查是否已存在相同标签的思维导图
    const existingMindmaps = await getAllMindmaps();
    const existingMindmap = existingMindmaps.find(mindmap => 
      mindmap.title === title || 
      (mindmap.tags && 
       JSON.stringify(mindmap.tags.tagPath) === JSON.stringify(tagPath))
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

/**
 * 创建新的思维导图
 * @param {string} title 思维导图标题
 * @param {Array<string>} tagPath 标签路径
 * @param {Array<Object>} materials 相关资料
 * @returns {Promise<Object>} 创建的思维导图
 */
const createNewMindmap = async (title, tagPath, materials) => {
  // 构建思维导图描述
  const description = `基于${tagPath.join('/')}标签自动生成的思维导图，包含${materials.length}个相关资料`;
  
  // 收集相关资料ID
  const relatedMaterialIds = materials.map(material => material.id);
  
  // 创建思维导图数据结构
  const mindmapData = {
    title,
    description,
    tags: {
      tagPath: tagPath
    },
    relatedMaterials: relatedMaterialIds,
    // 初始节点结构
    nodes: generateHierarchicalNodeStructure(tagPath, materials)
  };
  
  // 调用创建API
  return await createMindmap(mindmapData);
};

/**
 * 更新现有思维导图
 * @param {Object} mindmap 现有思维导图
 * @param {Array<Object>} newMaterials 新增资料
 * @returns {Promise<Object>} 更新后的思维导图
 */
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

/**
 * 生成层级节点结构
 * @param {Array<string>} tagPath 标签路径
 * @param {Array<Object>} materials 相关资料
 * @returns {Array<Object>} 节点结构
 */
const generateHierarchicalNodeStructure = (tagPath, materials) => {
  try {
    console.log('生成层级节点结构，标签路径:', tagPath, '资料数量:', materials.length);
    
    // 解构标签路径
    const [primaryCategory, secondaryCategory, tertiaryTag, ...customTags] = tagPath;
    
    // 根节点
    const rootNode = {
      id: 'root',
      text: primaryCategory || '根节点',
      data: { type: 'primaryTag', value: primaryCategory },
      children: []
    };
    
    // 如果只有一级标签，直接添加资料到根节点
    if (tagPath.length === 1) {
      console.log('只有一级标签，将资料直接添加到根节点');
      materials.forEach(material => {
        if (!material || !material.id || !material.name) {
          console.warn('跳过无效资料:', material);
          return; // 跳过无效资料
        }
        
        rootNode.children.push({
          id: `material-${material.id}`,
          text: material.name,
          data: { materialId: material.id, type: 'material' }
        });
      });
      return [rootNode];
    }
    
    // 二级分类节点
    const secondaryNode = {
      id: `secondary-${secondaryCategory}`,
      text: secondaryCategory,
      data: { type: 'secondaryTag', value: secondaryCategory },
      children: []
    };
    rootNode.children.push(secondaryNode);
    console.log('添加二级分类节点:', secondaryCategory);
    
    // 如果只有两级标签，直接添加资料到二级节点
    if (tagPath.length === 2) {
      console.log('只有两级标签，将资料添加到二级节点');
      materials.forEach(material => {
        if (!material || !material.id || !material.name) {
          console.warn('跳过无效资料:', material);
          return; // 跳过无效资料
        }
        
        secondaryNode.children.push({
          id: `material-${material.id}`,
          text: material.name || `资料${material.id}`,
          data: { materialId: material.id, type: 'material' }
        });
      });
      return [rootNode];
    }
    
    // 三级标签节点
    if (tertiaryTag) {
      const tertiaryNode = {
        id: `tertiary-${tertiaryTag}`,
        text: tertiaryTag,
        data: { type: 'tertiaryTag', value: tertiaryTag },
        children: []
      };
      secondaryNode.children.push(tertiaryNode);
      console.log('添加三级标签节点:', tertiaryTag);
      
      // 如果只有三级标签，直接添加资料到三级节点
      if (tagPath.length === 3) {
        console.log('只有三级标签，将资料添加到三级节点');
        materials.forEach(material => {
          if (!material || !material.id || !material.name) {
            console.warn('跳过无效资料:', material);
            return; // 跳过无效资料
          }
          
          tertiaryNode.children.push({
            id: `material-${material.id}`,
            text: material.name || `资料${material.id}`,
            data: { materialId: material.id, type: 'material' }
          });
        });
        return [rootNode];
      }
      
      // 处理自定义标签（第四级及以上）
      if (customTags && customTags.length > 0) {
        console.log('处理自定义标签:', customTags);
        let currentNode = tertiaryNode;
        
        // 为每个自定义标签创建节点
        customTags.forEach((customTag, index) => {
          if (!customTag) {
            console.warn('跳过空标签');
            return; // 跳过空标签
          }
          
          const customTagNode = {
            id: `customTag-${customTag.replace(/\s+/g, '-')}-${index}`,
            text: customTag,
            data: { type: 'customTag', value: customTag },
            children: []
          };
          
          currentNode.children.push(customTagNode);
          currentNode = customTagNode;
          console.log(`添加自定义标签节点[${index}]:`, customTag);
        });
        
        // 在最后一个自定义标签节点下添加资料
        console.log('将资料添加到最后一个自定义标签节点下');
        materials.forEach(material => {
          if (!material || !material.id || !material.name) {
            console.warn('跳过无效资料:', material);
            return; // 跳过无效资料
          }
          
          currentNode.children.push({
            id: `material-${material.id}`,
            text: material.name || `资料${material.id}`,
            data: { materialId: material.id, type: 'material' }
          });
        });
      }
    }
    
    console.log('生成的思维导图节点结构:', JSON.stringify(rootNode, null, 2));
    return [rootNode];
  } catch (error) {
    console.error('生成层级节点结构时出错:', error);
    // 出错时返回一个简单的错误节点结构
    return [{
      id: 'root',
      text: '加载失败',
      data: { type: 'error' },
      children: [{
        id: 'error-message',
        text: `错误信息: ${error.message}`,
        data: { type: 'error' }
      }]
    }];
  }
};

/**
 * 更新节点结构
 * @param {Array<Object>} existingNodes 现有节点结构
 * @param {Array<Object>} newMaterials 新增资料
 * @returns {Array<Object>} 更新后的节点结构
 */
const updateNodeStructure = (existingNodes, newMaterials) => {
  try {
    console.log('更新节点结构，现有节点:', existingNodes ? existingNodes.length : 0, '新资料:', newMaterials ? newMaterials.length : 0);
    
    // 如果没有现有节点或新资料，直接返回原节点
    if (!existingNodes || !Array.isArray(existingNodes) || existingNodes.length === 0) {
      console.warn('没有现有节点结构，返回原节点');
      return existingNodes;
    }
    
    if (!newMaterials || newMaterials.length === 0) {
      console.warn('没有新资料，返回原节点');
      return existingNodes;
    }
    
    // 深拷贝现有节点结构
    const updatedNodes = JSON.parse(JSON.stringify(existingNodes));
    
    // 在节点树中查找指定ID的节点
    const findNodeById = (node, id) => {
      if (node.id === id) {
        return node;
      }
      
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          const found = findNodeById(child, id);
          if (found) {
            return found;
          }
        }
      }
      
      return null;
    };
    
    // 查找最合适的节点添加资料
    const findAppropriateNode = (node) => {
      // 如果节点是资料类型节点，返回其父节点
      if (node.data && node.data.type === 'material') {
        return null; // 资料节点不能作为父节点
      }
      
      // 如果节点没有子节点或子节点中没有资料节点，则返回该节点
      if (!node.children || node.children.length === 0) {
        return node;
      }
      
      // 检查是否有非资料类型的子节点
      const nonMaterialChild = node.children.find(child => 
        child.data && child.data.type !== 'material'
      );
      
      // 如果有非资料类型的子节点，递归查找
      if (nonMaterialChild) {
        const deeperNode = findAppropriateNode(nonMaterialChild);
        if (deeperNode) return deeperNode;
      }
      
      // 如果所有子节点都是资料节点或没找到合适的深层节点，返回当前节点
      return node;
    };
    
    // 获取根节点
    const rootNode = updatedNodes[0];
    if (!rootNode) {
      console.warn('根节点不存在，返回原节点');
      return updatedNodes;
    }
    
    // 找到最合适的节点添加资料
    let targetNode = findAppropriateNode(rootNode);
    if (!targetNode) {
      console.warn('未找到合适的目标节点，使用根节点');
      targetNode = rootNode;
    }
    
    console.log('找到目标节点:', targetNode.id, targetNode.text);
    
    // 添加新资料到目标节点
    newMaterials.forEach(material => {
      if (!material || !material.id || !material.name) {
        console.warn('跳过无效资料:', material);
        return; // 跳过无效资料
      }
      
      // 检查是否已存在该资料节点
      const materialNodeId = `material-${material.id}`;
      let existingMaterialNode = null;
      
      // 在整个树中查找是否已存在该资料节点
      if (rootNode) {
        existingMaterialNode = findNodeById(rootNode, materialNodeId);
      }
      
      if (!existingMaterialNode) {
        // 如果不存在，添加新节点
        targetNode.children = targetNode.children || [];
        const newNode = {
          id: materialNodeId,
          text: material.name || `资料${material.id}`,
          data: { materialId: material.id, type: 'material' }
        };
        
        targetNode.children.push(newNode);
        console.log('添加新资料节点:', newNode.id, newNode.text);
      } else {
        console.log('资料节点已存在，跳过:', materialNodeId);
      }
    });
    
    console.log('更新后的节点结构:', JSON.stringify(updatedNodes, null, 2));
    return updatedNodes;
  } catch (error) {
    console.error('更新节点结构时出错:', error);
    return existingNodes; // 出错时返回原节点结构
  }
};

// findNodeById函数已经在updateNodeStructure中定义，这里不需要重复定义

/**
 * 根据搜索关键词生成思维导图
 * @param {string} searchTerm 搜索关键词
 * @returns {Promise<Object>} 生成的思维导图数据
 */
export const generateMindmapFromSearch = async (searchTerm) => {
  try {
    console.log('开始根据搜索关键词生成思维导图:', searchTerm);
    
    if (!searchTerm) {
      throw new Error('搜索关键词不能为空');
    }
    
    // 获取所有资料
    const allMaterials = await getAllMaterialsFromDB();
    console.log(`获取到${allMaterials.length}个资料，开始搜索关键词: ${searchTerm}`);
    
    // 检查资料是否有效
    const validMaterials = allMaterials.filter(material => material && typeof material === 'object');
    if (validMaterials.length < allMaterials.length) {
      console.warn(`发现${allMaterials.length - validMaterials.length}个无效资料对象`);
    }
    
    // 过滤匹配搜索关键词的资料
    const filteredMaterials = validMaterials.filter(material => {
      // 检查资料名称、描述或标签是否包含搜索关键词
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = material.name && material.name.toLowerCase().includes(searchLower);
      const descMatch = material.description && material.description.toLowerCase().includes(searchLower);
      
      // 检查分级标签
      let tagMatch = false;
      if (material.hierarchicalTags && Array.isArray(material.hierarchicalTags)) {
        tagMatch = material.hierarchicalTags.some(tag => 
          tag && tag.toLowerCase().includes(searchLower)
        );
      }
      
      // 检查普通标签
      let normalTagMatch = false;
      if (material.tags && Array.isArray(material.tags)) {
        normalTagMatch = material.tags.some(tag => 
          tag && tag.toLowerCase().includes(searchLower)
        );
      }
      
      return nameMatch || descMatch || tagMatch || normalTagMatch;
    });
    
    console.log(`找到${filteredMaterials.length}个匹配关键词 "${searchTerm}" 的资料`);
    
    if (filteredMaterials.length === 0) {
      console.warn(`没有找到匹配关键词 "${searchTerm}" 的资料`);
      // 即使没有找到资料，也创建一个空的思维导图
      const emptyMindmapData = {
        title: `关于 "${searchTerm}" 的思维导图`,
        description: `基于关键词 "${searchTerm}" 搜索生成的思维导图，未找到相关资料`,
        relatedMaterials: [],
        nodes: [{
          id: 'root',
          text: `关于 "${searchTerm}" 的资料`,
          data: { type: 'search', value: searchTerm },
          children: [{
            id: 'no-result',
            text: '没有找到匹配的资料',
            data: { type: 'info' }
          }]
        }]
      };
      
      const newMindmap = await createMindmap(emptyMindmapData);
      console.log('创建了空的思维导图:', newMindmap.id);
      return {
        mindmap: newMindmap,
        isNew: true
      };
    }
    
    // 构建思维导图标题
    const title = `关于 "${searchTerm}" 的思维导图`;
    
    // 检查是否已存在相同标题的思维导图
    const existingMindmaps = await getAllMindmaps();
    console.log(`获取到${existingMindmaps.length}个现有思维导图`);
    
    const existingMindmap = existingMindmaps.find(mindmap => 
      mindmap.title === title
    );
    
    if (existingMindmap) {
      console.log(`找到现有思维导图:`, existingMindmap.id);
      // 如果已存在，更新思维导图
      const updatedMindmap = await updateExistingMindmap(existingMindmap, filteredMaterials);
      console.log('更新现有思维导图成功:', updatedMindmap.id);
      return {
        mindmap: updatedMindmap,
        isNew: false
      };
    } else {
      console.log('未找到现有思维导图，创建新的思维导图');
      // 如果不存在，创建新的思维导图
      const nodes = generateSearchResultNodeStructure(searchTerm, filteredMaterials);
      console.log('生成的节点结构:', JSON.stringify(nodes, null, 2));
      
      const mindmapData = {
        title,
        description: `基于关键词 "${searchTerm}" 搜索生成的思维导图，包含${filteredMaterials.length}个相关资料`,
        relatedMaterials: filteredMaterials.map(material => material.id),
        nodes: nodes
      };
      
      const newMindmap = await createMindmap(mindmapData);
      console.log('创建新思维导图成功:', newMindmap.id);
      return {
        mindmap: newMindmap,
        isNew: true
      };
    }
  } catch (error) {
    console.error('根据搜索关键词生成思维导图失败:', error);
    throw error;
  }
};

/**
 * 生成搜索结果的节点结构
 * @param {string} searchTerm 搜索关键词
 * @param {Array<Object>} materials 匹配的资料列表
 * @returns {Array<Object>} 节点结构
 */
const generateSearchResultNodeStructure = (searchTerm, materials) => {
  try {
    console.log(`开始生成搜索结果节点结构，关键词: ${searchTerm}，资料数量: ${materials ? materials.length : 0}`);
    
    // 根节点
    const rootNode = {
      id: 'root',
      text: `关于 "${searchTerm}" 的资料`,
      data: { type: 'search', value: searchTerm },
      children: []
    };
    
    // 如果没有匹配的资料，添加一个提示节点
    if (!materials || materials.length === 0) {
      console.log('没有匹配的资料，添加提示节点');
      rootNode.children.push({
        id: 'no-result',
        text: '没有找到匹配的资料',
        data: { type: 'info' }
      });
      return [rootNode];
    }
    
    // 按资料类型分组
    const materialsByType = {};
    
    materials.forEach(material => {
      if (!material || !material.id || !material.name) {
        console.warn('跳过无效资料:', material);
        return; // 跳过无效资料
      }
      
      const type = material.type || '其他';
      if (!materialsByType[type]) {
        materialsByType[type] = [];
      }
      materialsByType[type].push(material);
    });
    
    console.log(`资料按类型分组结果: ${Object.keys(materialsByType).join(', ')}`);
    
    // 为每种类型创建节点
    Object.keys(materialsByType).forEach(type => {
      const typeNode = {
        id: `type-${type.replace(/\s+/g, '-')}`,
        text: type,
        data: { type: 'materialType', value: type },
        children: []
      };
      
      console.log(`创建类型节点: ${type}，包含资料数量: ${materialsByType[type].length}`);
      
      // 添加该类型下的所有资料
      materialsByType[type].forEach(material => {
        const materialNode = {
          id: `material-${material.id}`,
          text: material.name || `资料${material.id}`,
          data: { materialId: material.id, type: 'material' }
        };
        
        typeNode.children.push(materialNode);
      });
      
      rootNode.children.push(typeNode);
    });
    
    // 确保根节点有子节点
    if (rootNode.children.length === 0) {
      console.warn('根节点没有子节点，添加提示节点');
      rootNode.children.push({
        id: 'no-result',
        text: '没有找到匹配的资料',
        data: { type: 'info' }
      });
    }
    
    console.log(`生成的节点结构: 根节点有${rootNode.children.length}个子节点`);
    return [rootNode];
  } catch (error) {
    console.error('生成搜索结果节点结构时出错:', error);
    // 出错时返回一个简单的错误节点结构
    return [{
      id: 'root',
      text: '搜索结果加载失败',
      data: { type: 'error' },
      children: [{
        id: 'error-message',
        text: `错误信息: ${error.message}`,
        data: { type: 'error' }
      }]
    }];
  }
};
            