// 思维导图相关API
import axios from 'axios'

// 模拟本地存储
const localMindmapStorage = {
  mindmaps: [],
  nextId: 4 // 初始ID从4开始，因为已有3个示例思维导图
}

// 初始化示例数据
if (localMindmapStorage.mindmaps.length === 0) {
  localMindmapStorage.mindmaps = [
    {
      id: 1,
      title: 'Python基础知识',
      description: 'Python语言核心概念和基础语法的思维导图',
      createdAt: '2023-06-10',
      nodeCount: 35,
      creator: '管理员',
      relatedMaterials: [1] // 关联的资料ID
    },
    {
      id: 2,
      title: '数据结构与算法',
      description: '常见数据结构和算法的整理与分析',
      createdAt: '2023-05-22',
      nodeCount: 42,
      creator: '张三',
      relatedMaterials: [2] // 关联的资料ID
    },
    {
      id: 3,
      title: 'Web开发技术栈',
      description: '前后端开发技术栈的全面梳理',
      createdAt: '2023-06-01',
      nodeCount: 50,
      creator: '李四',
      relatedMaterials: [4] // 关联的资料ID
    }
  ]
}

// 获取所有思维导图
export const getAllMindmaps = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(localMindmapStorage.mindmaps)
    }, 300)
  })
}

// 获取单个思维导图
export const getMindmap = (id) => {
  return new Promise((resolve, reject) => {
    const mindmap = localMindmapStorage.mindmaps.find(m => m.id === id)
    
    if (!mindmap) {
      reject(new Error('思维导图不存在'))
      return
    }
    
    setTimeout(() => {
      resolve(mindmap)
    }, 300)
  })
}

// 创建新思维导图
export const createMindmap = (mindmapData) => {
  return new Promise((resolve) => {
    const newMindmap = {
      id: localMindmapStorage.nextId++,
      title: mindmapData.title,
      description: mindmapData.description,
      createdAt: new Date().toISOString().split('T')[0],
      nodeCount: 1, // 初始只有一个根节点
      creator: mindmapData.creator || '当前用户',
      relatedMaterials: mindmapData.relatedMaterials || []
    }
    
    localMindmapStorage.mindmaps.unshift(newMindmap)
    
    setTimeout(() => {
      resolve(newMindmap)
    }, 500)
  })
}

// 更新思维导图
export const updateMindmap = (id, updateData) => {
  return new Promise((resolve, reject) => {
    const index = localMindmapStorage.mindmaps.findIndex(m => m.id === id)
    
    if (index === -1) {
      reject(new Error('思维导图不存在'))
      return
    }
    
    const updatedMindmap = {
      ...localMindmapStorage.mindmaps[index],
      ...updateData
    }
    
    localMindmapStorage.mindmaps[index] = updatedMindmap
    
    setTimeout(() => {
      resolve(updatedMindmap)
    }, 300)
  })
}

// 删除思维导图
export const deleteMindmap = (id) => {
  return new Promise((resolve) => {
    const index = localMindmapStorage.mindmaps.findIndex(m => m.id === id)
    
    if (index !== -1) {
      localMindmapStorage.mindmaps.splice(index, 1)
    }
    
    setTimeout(() => {
      resolve({ success: true })
    }, 300)
  })
}

// 搜索思维导图
export const searchMindmaps = (query) => {
  return new Promise((resolve) => {
    let results = [...localMindmapStorage.mindmaps]
    
    if (query) {
      const lowerQuery = query.toLowerCase()
      results = results.filter(mindmap => 
        mindmap.title.toLowerCase().includes(lowerQuery) ||
        mindmap.description.toLowerCase().includes(lowerQuery)
      )
    }
    
    setTimeout(() => {
      resolve(results)
    }, 300)
  })
}

// 将资料与思维导图关联
export const linkMaterialToMindmap = (mindmapId, materialId) => {
  return new Promise((resolve, reject) => {
    const mindmap = localMindmapStorage.mindmaps.find(m => m.id === mindmapId)
    
    if (!mindmap) {
      reject(new Error('思维导图不存在'))
      return
    }
    
    // 避免重复添加
    if (!mindmap.relatedMaterials.includes(materialId)) {
      mindmap.relatedMaterials.push(materialId)
    }
    
    setTimeout(() => {
      resolve({
        success: true,
        mindmap
      })
    }, 300)
  })
}

// 从思维导图中移除资料关联
export const unlinkMaterialFromMindmap = (mindmapId, materialId) => {
  return new Promise((resolve, reject) => {
    const mindmap = localMindmapStorage.mindmaps.find(m => m.id === mindmapId)
    
    if (!mindmap) {
      reject(new Error('思维导图不存在'))
      return
    }
    
    mindmap.relatedMaterials = mindmap.relatedMaterials.filter(id => id !== materialId)
    
    setTimeout(() => {
      resolve({
        success: true,
        mindmap
      })
    }, 300)
  })
}

// 思维导图搜索引擎 - 添加资料到索引
export const addMaterialToSearchIndex = (material) => {
  return new Promise((resolve) => {
    console.log('将资料添加到思维导图搜索引擎索引:', material.name)
    
    // 模拟提取关键词和分类
    const keywords = extractKeywordsFromMaterial(material)
    const category = categorizeMaterial(material)
    
    // 模拟创建或更新相关思维导图
    updateRelatedMindmaps(material, keywords, category)
    
    setTimeout(() => {
      resolve({
        success: true,
        keywords,
        category
      })
    }, 500)
  })
}

// 提取资料关键词（模拟）
const extractKeywordsFromMaterial = (material) => {
  // 实际应用中会使用NLP或其他文本分析技术提取关键词
  const keywords = []
  
  // 根据资料名称和描述简单提取关键词
  const text = `${material.name} ${material.description}`.toLowerCase()
  
  // 模拟一些常见技术关键词的提取
  const techKeywords = ['python', 'javascript', 'html', 'css', 'react', 'vue', 'angular', 
                       '数据结构', '算法', '机器学习', '深度学习', '人工智能', 'web开发', 
                       '前端', '后端', '数据库', 'sql', 'nosql', 'mongodb', 'mysql']
  
  techKeywords.forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      keywords.push(keyword)
    }
  })
  
  return keywords
}

// 对资料进行分类（模拟）
const categorizeMaterial = (material) => {
  // 实际应用中会使用更复杂的分类算法
  const text = `${material.name} ${material.description}`.toLowerCase()
  
  if (text.includes('python') || text.includes('编程') || text.includes('语言')) {
    return '编程语言'
  } else if (text.includes('数据结构') || text.includes('算法')) {
    return '数据结构与算法'
  } else if (text.includes('web') || text.includes('前端') || text.includes('html')) {
    return 'Web开发'
  } else if (text.includes('机器学习') || text.includes('深度学习') || text.includes('人工智能')) {
    return '人工智能'
  } else {
    return '其他'
  }
}

// 更新相关思维导图（模拟）
const updateRelatedMindmaps = (material, keywords, category) => {
  // 实际应用中会根据关键词和分类，更新或创建相关思维导图
  console.log(`根据资料「${material.name}」更新相关思维导图，关键词: ${keywords.join(', ')}, 分类: ${category}`)
  
  // 查找是否有匹配的现有思维导图
  const matchingMindmaps = localMindmapStorage.mindmaps.filter(mindmap => {
    return mindmap.title.toLowerCase().includes(category.toLowerCase()) ||
           keywords.some(keyword => mindmap.title.toLowerCase().includes(keyword.toLowerCase()))
  })
  
  if (matchingMindmaps.length > 0) {
    // 如果找到匹配的思维导图，将资料与之关联
    matchingMindmaps.forEach(mindmap => {
      if (!mindmap.relatedMaterials.includes(material.id)) {
        mindmap.relatedMaterials.push(material.id)
        console.log(`将资料「${material.name}」关联到思维导图「${mindmap.title}」`)
      }
    })
  } else {
    // 如果没有匹配的思维导图，可以考虑创建一个新的
    console.log(`没有找到与资料「${material.name}」匹配的思维导图，可以考虑创建一个新的`)
  }
}