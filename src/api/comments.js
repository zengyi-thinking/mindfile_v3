// 评论系统相关API
import axios from 'axios'

// 模拟本地存储
const localCommentsStorage = {
  comments: [],
  nextId: 1 // 评论ID从1开始
}

// 获取资料的所有评论
export const getMaterialComments = (materialId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 过滤出指定资料的评论，并按时间倒序排列
      const comments = localCommentsStorage.comments
        .filter(comment => comment.materialId === materialId && !comment.parentId) // 只获取顶级评论
        .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      
      // 为每个评论添加回复
      const commentsWithReplies = comments.map(comment => {
        const replies = localCommentsStorage.comments
          .filter(reply => reply.parentId === comment.id)
          .sort((a, b) => new Date(a.createTime) - new Date(b.createTime))
        
        return {
          ...comment,
          replies
        }
      })
      
      resolve(commentsWithReplies)
    }, 300)
  })
}

// 添加评论
export const addComment = (commentData) => {
  return new Promise((resolve) => {
    const newComment = {
      id: localCommentsStorage.nextId++,
      materialId: commentData.materialId,
      content: commentData.content,
      author: commentData.author,
      avatar: commentData.avatar || commentData.author.charAt(0).toUpperCase(),
      createTime: new Date().toISOString(),
      likes: 0,
      parentId: commentData.parentId || null // 如果有parentId则为回复，否则为顶级评论
    }
    
    localCommentsStorage.comments.push(newComment)
    
    setTimeout(() => {
      resolve(newComment)
    }, 300)
  })
}

// 点赞评论
export const likeComment = (commentId) => {
  return new Promise((resolve, reject) => {
    const comment = localCommentsStorage.comments.find(c => c.id === commentId)
    
    if (!comment) {
      reject(new Error('评论不存在'))
      return
    }
    
    comment.likes += 1
    
    setTimeout(() => {
      resolve(comment)
    }, 300)
  })
}

// 删除评论
export const deleteComment = (commentId) => {
  return new Promise((resolve) => {
    // 找到评论的索引
    const index = localCommentsStorage.comments.findIndex(c => c.id === commentId)
    
    if (index !== -1) {
      // 删除评论
      localCommentsStorage.comments.splice(index, 1)
      
      // 同时删除该评论的所有回复
      const replyIndices = []
      localCommentsStorage.comments.forEach((comment, idx) => {
        if (comment.parentId === commentId) {
          replyIndices.push(idx)
        }
      })
      
      // 从后往前删除，避免索引变化
      for (let i = replyIndices.length - 1; i >= 0; i--) {
        localCommentsStorage.comments.splice(replyIndices[i], 1)
      }
    }
    
    setTimeout(() => {
      resolve({ success: true })
    }, 300)
  })
}