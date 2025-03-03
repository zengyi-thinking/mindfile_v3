// 评论系统相关API
import axios from 'axios'

// 模拟本地存储
const localCommentsStorage = {
  comments: [],
  nextId: 1
}

// 初始化示例评论数据
if (localCommentsStorage.comments.length === 0) {
  localCommentsStorage.comments = [
    {
      id: 1,
      materialId: 1,
      content: 'Python编程指南非常全面，特别是对于初学者来说很友好。',
      author: '张三',
      avatar: 'Z',
      createTime: '2023-06-16 14:30',
      likes: 12,
      replies: [
        {
          id: 2,
          parentId: 1,
          content: '同意，我也觉得这个教程很适合入门。',
          author: '李四',
          avatar: 'L',
          createTime: '2023-06-16 15:45',
          likes: 5
        }
      ]
    },
    {
      id: 3,
      materialId: 1,
      content: '这份资料对Python的高级特性讲解得很到位，推荐给想深入学习的同学。',
      author: '王五',
      avatar: 'W',
      createTime: '2023-06-17 09:20',
      likes: 8,
      replies: []
    },
    {
      id: 4,
      materialId: 2,
      content: '这个思维导图对理解数据结构很有帮助，可视化做得很棒！',
      author: '赵六',
      avatar: 'Z',
      createTime: '2023-06-15 10:15',
      likes: 15,
      replies: [
        {
          id: 5,
          parentId: 4,
          content: '确实，我用这个思维导图复习，效率提高了不少。',
          author: '张三',
          avatar: 'Z',
          createTime: '2023-06-15 11:30',
          likes: 7
        }
      ]
    }
  ]
  
  // 更新nextId
  localCommentsStorage.nextId = 6
}

// 获取资料的所有评论
export const getMaterialComments = (materialId) => {
  return new Promise((resolve) => {
    // 过滤出指定资料的顶级评论
    const comments = localCommentsStorage.comments.filter(c => c.materialId === materialId)
    
    setTimeout(() => {
      resolve(comments)
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
      createTime: new Date().toLocaleString(),
      likes: 0,
      replies: []
    }
    
    localCommentsStorage.comments.push(newComment)
    
    setTimeout(() => {
      resolve(newComment)
    }, 300)
  })
}

// 添加回复
export const addReply = (replyData) => {
  return new Promise((resolve, reject) => {
    const parentComment = localCommentsStorage.comments.find(c => c.id === replyData.parentId)
    
    if (!parentComment) {
      reject(new Error('评论不存在'))
      return
    }
    
    const newReply = {
      id: localCommentsStorage.nextId++,
      parentId: replyData.parentId,
      content: replyData.content,
      author: replyData.author,
      avatar: replyData.avatar || replyData.author.charAt(0).toUpperCase(),
      createTime: new Date().toLocaleString(),
      likes: 0
    }
    
    if (!parentComment.replies) {
      parentComment.replies = []
    }
    
    parentComment.replies.push(newReply)
    
    setTimeout(() => {
      resolve(newReply)
    }, 300)
  })
}

// 点赞评论
export const likeComment = (commentId, isReply = false) => {
  return new Promise((resolve, reject) => {
    if (isReply) {
      // 查找并点赞回复
      let foundReply = null
      
      for (const comment of localCommentsStorage.comments) {
        if (comment.replies) {
          const reply = comment.replies.find(r => r.id === commentId)
          if (reply) {
            reply.likes += 1
            foundReply = reply
            break
          }
        }
      }
      
      if (!foundReply) {
        reject(new Error('回复不存在'))
        return
      }
      
      setTimeout(() => {
        resolve(foundReply)
      }, 300)
    } else {
      // 查找并点赞评论
      const comment = localCommentsStorage.comments.find(c => c.id === commentId)
      
      if (!comment) {
        reject(new Error('评论不存在'))
        return
      }
      
      comment.likes += 1
      
      setTimeout(() => {
        resolve(comment)
      }, 300)
    }
  })
}

// 删除评论
export const deleteComment = (commentId, isReply = false) => {
  return new Promise((resolve, reject) => {
    if (isReply) {
      // 删除回复
      let success = false
      
      for (const comment of localCommentsStorage.comments) {
        if (comment.replies) {
          const replyIndex = comment.replies.findIndex(r => r.id === commentId)
          if (replyIndex !== -1) {
            comment.replies.splice(replyIndex, 1)
            success = true
            break
          }
        }
      }
      
      if (!success) {
        reject(new Error('回复不存在'))
        return
      }
    } else {
      // 删除评论
      const commentIndex = localCommentsStorage.comments.findIndex(c => c.id === commentId)
      
      if (commentIndex === -1) {
        reject(new Error('评论不存在'))
        return
      }
      
      localCommentsStorage.comments.splice(commentIndex, 1)
    }
    
    setTimeout(() => {
      resolve({ success: true })
    }, 300)
  })
}

// 获取评论总数
export const getCommentsCount = (materialId) => {
  return new Promise((resolve) => {
    const comments = localCommentsStorage.comments.filter(c => c.materialId === materialId)
    
    let totalCount = comments.length
    
    // 计算回复数量
    comments.forEach(comment => {
      if (comment.replies) {
        totalCount += comment.replies.length
      }
    })
    
    setTimeout(() => {
      resolve({ count: totalCount })
    }, 200)
  })
}