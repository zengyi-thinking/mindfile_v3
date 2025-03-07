// 资料管理相关API
import axios from 'axios'
import { saveMaterial, saveFile, getAllMaterialsFromDB, getFileByMaterialId, deleteMaterialAndFile, searchMaterialsInDB, initializeDatabase } from './storage'

// 模拟本地存储 (仅用于初始化示例数据)
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
export const getAllMaterials = async () => {
  try {
    // 首先尝试从IndexedDB获取数据
    const dbMaterials = await getAllMaterialsFromDB()
    
    // 如果数据库中没有数据，则初始化示例数据
    if (dbMaterials.length === 0) {
      await initializeDatabase(localMaterialsStorage.materials)
      return await getAllMaterialsFromDB()
    }
    
    return dbMaterials
  } catch (error) {
    console.error('获取资料失败:', error)
    return []
  }
}

// 上传资料
export const uploadMaterial = async (materialData, file) => {
  try {
    // 获取所有资料以确定下一个ID
    const allMaterials = await getAllMaterialsFromDB()
    const nextId = allMaterials.length > 0 ? Math.max(...allMaterials.map(m => m.id)) + 1 : 1
    
    // 处理文件上传
    const fileSize = file ? formatFileSize(file.size) : '0MB'
    
    // 确保标签数据是简单的字符串数组，可以被序列化
    let hierarchicalTags = [];
    if (materialData.hierarchicalTags && Array.isArray(materialData.hierarchicalTags)) {
      // 将层级标签转换为字符串数组
      hierarchicalTags = materialData.hierarchicalTags.map(tag => {
        if (typeof tag === 'string') return tag;
        return JSON.stringify(tag);
      });
    }
    
    const newMaterial = {
      id: nextId,
      name: materialData.name || file.name,
      description: materialData.description,
      type: materialData.type,
      uploadDate: new Date().toISOString().split('T')[0],
      size: fileSize,
      downloads: 0,
      uploader: materialData.uploader || '当前用户',
      hierarchicalTags: hierarchicalTags, // 确保是可序列化的数组
      customTags: Array.isArray(materialData.customTags) ? [...materialData.customTags] : [] // 确保是可序列化的数组
    }
    
    // 保存资料信息到IndexedDB
    await saveMaterial(newMaterial)
    
    // 如果有文件，保存文件数据到IndexedDB
    if (file) {
      // 将文件转换为ArrayBuffer以便存储
      const fileReader = new FileReader()
      fileReader.readAsArrayBuffer(file)
      
      await new Promise((resolve, reject) => {
        fileReader.onload = async () => {
          try {
            const fileData = {
              id: `file_${newMaterial.id}`,
              materialId: newMaterial.id,
              name: file.name,
              type: file.type,
              size: file.size,
              data: fileReader.result,
              url: URL.createObjectURL(file) // 创建临时URL用于显示
            }
            
            // 保存文件数据到IndexedDB
            await saveFile(fileData)
            resolve()
          } catch (error) {
            reject(error)
          }
        }
        
        fileReader.onerror = () => reject(fileReader.error)
      })
    }
    
    // 模拟与思维导图搜索引擎的集成
    integrateWithMindMap(newMaterial)
    
    return newMaterial
  } catch (error) {
    console.error('上传资料失败:', error)
    throw error
  }
}

// 下载资料
export const downloadMaterial = async (materialId) => {
  try {
    // 从IndexedDB获取资料信息
    const allMaterials = await getAllMaterialsFromDB()
    const material = allMaterials.find(m => m.id === materialId)
    
    if (!material) {
      throw new Error('资料不存在')
    }
    
    // 从IndexedDB获取文件数据
    const fileData = await getFileByMaterialId(materialId)
    
    if (!fileData) {
      throw new Error('文件数据不存在')
    }
    
    // 增加下载次数
    material.downloads += 1
    await saveMaterial(material)
    
    // 触发下载
    if (fileData.url) {
      const a = document.createElement('a')
      a.href = fileData.url
      a.download = material.name
      a.click()
    } else if (fileData.data) {
      // 如果没有URL但有二进制数据，创建Blob并下载
      const blob = new Blob([fileData.data], { type: fileData.type })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = material.name
      a.click()
      
      // 清理URL对象
      setTimeout(() => URL.revokeObjectURL(url), 100)
    }
    
    return material
  } catch (error) {
    console.error('下载资料失败:', error)
    throw error
  }
}

// 删除资料
export const deleteMaterial = async (materialId) => {
  try {
    // 从IndexedDB删除资料及其关联的文件
    const result = await deleteMaterialAndFile(materialId)
    return result
  } catch (error) {
    console.error('删除资料失败:', error)
    throw error
  }
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
export const searchMaterials = async (query, type = 'all') => {
  try {
    // 使用IndexedDB搜索资料
    const results = await searchMaterialsInDB(query, type)
    return results
  } catch (error) {
    console.error('搜索资料失败:', error)
    return []
  }
}

// 获取资料详情
export const getMaterialDetail = async (materialId) => {
  try {
    const allMaterials = await getAllMaterialsFromDB()
    const material = allMaterials.find(m => m.id === materialId)
    
    if (!material) {
      throw new Error('资料不存在')
    }
    
    return {
      data: {
        title: material.name,
        author: material.uploader,
        content: material.description,
        createdAt: material.uploadDate
      }
    }
  } catch (error) {
    console.error('获取资料详情失败:', error)
    throw error
  }
}

// 获取资料评论
export const getMaterialComments = async (materialId) => {
  try {
    // 模拟从服务器获取评论数据
    const comments = [
      {
        id: 1,
        user: { name: '用户1' },
        content: '这个资料很有帮助',
        createdAt: '2023-06-20'
      },
      {
        id: 2,
        user: { name: '用户2' },
        content: '内容很全面，感谢分享',
        createdAt: '2023-06-21'
      }
    ]
    
    return {
      data: comments
    }
  } catch (error) {
    console.error('获取评论失败:', error)
    throw error
  }
}

// 添加评论
export const addComment = async (materialId, commentData) => {
  try {
    // 模拟添加评论
    const newComment = {
      id: Date.now(),
      user: { name: '当前用户' },
      content: commentData.content,
      createdAt: new Date().toISOString()
    }
    
    return {
      data: newComment
    }
  } catch (error) {
    console.error('添加评论失败:', error)
    throw error
  }
}

// 与思维导图搜索引擎集成
const integrateWithMindMap = (material) => {
  console.log('将资料集成到思维导图搜索引擎:', material.name)
  // 实际应用中，这里会调用思维导图搜索引擎的API，将资料添加到索引中
  // 例如：extractKeywords, categorize, indexForSearch等操作
}

// 格式化文件大小
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
