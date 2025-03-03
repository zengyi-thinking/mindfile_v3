// 资料管理相关API
import axios from 'axios'

// 模拟本地存储
const localMaterialsStorage = {
  materials: [],
  nextId: 5 // 初始ID从5开始，因为已有4个示例资料
}

// 初始化示例数据
if (localMaterialsStorage.materials.length === 0) {
  localMaterialsStorage.materials = [
    {
      id: 1,
      name: 'Python编程指南.pdf',
      description: '全面的Python编程语言指南，包含从基础到高级的全部内容',
      type: 'document',
      uploadDate: '2023-06-15',
      size: '5.2MB',
      downloads: 28,
      uploader: '管理员',
      file: null // 实际应用中这里会是文件的URL或ID
    },
    {
      id: 2,
      name: '数据结构思维导图.png',
      description: '包含常见数据结构的思维导图，直观展示各种数据结构的特点和应用',
      type: 'image',
      uploadDate: '2023-06-10',
      size: '1.8MB',
      downloads: 15,
      uploader: '张三',
      file: null
    },
    {
      id: 3,
      name: '机器学习算法总结.docx',
      description: '常用机器学习算法的原理和应用场景总结',
      type: 'document',
      uploadDate: '2023-05-22',
      size: '3.5MB',
      downloads: 42,
      uploader: '李四',
      file: null
    },
    {
      id: 4,
      name: 'Web开发入门教程.mp4',
      description: 'Web开发入门视频教程，包含HTML、CSS和JavaScript基础知识',
      type: 'video',
      uploadDate: '2023-05-15',
      size: '120MB',
      downloads: 36,
      uploader: '王五',
      file: null
    }
  ]
}

// 获取所有资料
export const getAllMaterials = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(localMaterialsStorage.materials)
    }, 300)
  })
}

// 上传资料
export const uploadMaterial = (materialData, file) => {
  return new Promise((resolve) => {
    // 模拟文件上传处理
    const fileSize = file ? formatFileSize(file.size) : '0MB'
    
    const newMaterial = {
      id: localMaterialsStorage.nextId++,
      name: materialData.name || file.name,
      description: materialData.description,
      type: materialData.type,
      uploadDate: new Date().toISOString().split('T')[0],
      size: fileSize,
      downloads: 0,
      uploader: materialData.uploader || '当前用户',
      file: file ? URL.createObjectURL(file) : null // 在实际应用中，这里会是服务器返回的文件URL
    }
    
    // 添加到本地存储
    localMaterialsStorage.materials.unshift(newMaterial)
    
    // 模拟与思维导图搜索引擎的集成
    integrateWithMindMap(newMaterial)
    
    setTimeout(() => {
      resolve(newMaterial)
    }, 500)
  })
}

// 下载资料
export const downloadMaterial = (materialId) => {
  return new Promise((resolve, reject) => {
    const material = localMaterialsStorage.materials.find(m => m.id === materialId)
    
    if (!material) {
      reject(new Error('资料不存在'))
      return
    }
    
    // 增加下载次数
    material.downloads += 1
    
    // 模拟下载过程
    setTimeout(() => {
      if (material.file) {
        // 如果有文件URL，可以触发下载
        const a = document.createElement('a')
        a.href = material.file
        a.download = material.name
        a.click()
      }
      
      resolve(material)
    }, 300)
  })
}

// 删除资料
export const deleteMaterial = (materialId) => {
  return new Promise((resolve) => {
    const index = localMaterialsStorage.materials.findIndex(m => m.id === materialId)
    
    if (index !== -1) {
      localMaterialsStorage.materials.splice(index, 1)
    }
    
    setTimeout(() => {
      resolve({ success: true })
    }, 300)
  })
}

// 分享资料（生成分享链接）
export const shareMaterial = (materialId) => {
  return new Promise((resolve) => {
    const material = localMaterialsStorage.materials.find(m => m.id === materialId)
    
    if (!material) {
      resolve({ success: false, message: '资料不存在' })
      return
    }
    
    // 生成分享链接（实际应用中会生成真实的分享链接）
    const shareLink = `https://mindfile.example.com/share/${materialId}`
    
    setTimeout(() => {
      resolve({
        success: true,
        shareLink,
        material
      })
    }, 300)
  })
}

// 搜索资料
export const searchMaterials = (query, type = 'all') => {
  return new Promise((resolve) => {
    let results = [...localMaterialsStorage.materials]
    
    // 按关键词筛选
    if (query) {
      const lowerQuery = query.toLowerCase()
      results = results.filter(material => 
        material.name.toLowerCase().includes(lowerQuery) ||
        material.description.toLowerCase().includes(lowerQuery)
      )
    }
    
    // 按类型筛选
    if (type !== 'all') {
      results = results.filter(material => material.type === type)
    }
    
    setTimeout(() => {
      resolve(results)
    }, 300)
  })
}

// 与思维导图搜索引擎集成
const integrateWithMindMap = (material) => {
  console.log('将资料集成到思维导图搜索引擎:', material.name)
  // 实际应用中，这里会调用思维导图搜索引擎的API，将资料添加到索引中
  // 例如：extractKeywords, categorize, indexForSearch等操作
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}