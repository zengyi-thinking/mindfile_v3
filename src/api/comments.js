// 评论相关API

/**
 * 获取资料的评论列表
 * @param {number} materialId 资料ID
 * @param {number} page 页码
 * @param {number} pageSize 每页数量
 * @returns {Promise<Array>} 评论列表
 */
export const getMaterialComments = async (materialId, page = 1, pageSize = 10) => {
  // 模拟API调用
  return new Promise((resolve) => {
    setTimeout(() => {
      // 从localStorage获取或初始化评论数据
      const allComments = JSON.parse(localStorage.getItem(`comments_${materialId}`) || '[]');
      
      // 计算分页
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedComments = allComments.slice(startIndex, endIndex);
      
      resolve(paginatedComments);
    }, 500);
  });
};

/**
 * 获取评论总数
 * @param {number} materialId 资料ID
 * @returns {Promise<Object>} 包含评论总数的对象
 */
export const getCommentsCount = async (materialId) => {
  // 模拟API调用
  return new Promise((resolve) => {
    setTimeout(() => {
      const allComments = JSON.parse(localStorage.getItem(`comments_${materialId}`) || '[]');
      resolve({ count: allComments.length });
    }, 300);
  });
};

/**
 * 添加评论
 * @param {number} materialId 资料ID
 * @param {string} content 评论内容
 * @param {Object} user 用户信息
 * @returns {Promise<Object>} 新添加的评论
 */
export const addComment = async (materialId, content, user) => {
  // 模拟API调用
  return new Promise((resolve) => {
    setTimeout(() => {
      const allComments = JSON.parse(localStorage.getItem(`comments_${materialId}`) || '[]');
      
      // 创建新评论
      const newComment = {
        id: Date.now(),
        materialId,
        content,
        author: user.role,
        avatar: user.avatar,
        createTime: new Date().toLocaleString(),
        likes: 0,
        replies: []
      };
      
      // 添加到评论列表
      allComments.unshift(newComment);
      localStorage.setItem(`comments_${materialId}`, JSON.stringify(allComments));
      
      resolve(newComment);
    }, 500);
  });
};

/**
 * 添加回复
 * @param {number} materialId 资料ID
 * @param {number} commentId 评论ID
 * @param {string} content 回复内容
 * @param {Object} user 用户信息
 * @returns {Promise<Object>} 新添加的回复
 */
export const addReply = async (materialId, commentId, content, user) => {
  // 模拟API调用
  return new Promise((resolve) => {
    setTimeout(() => {
      const allComments = JSON.parse(localStorage.getItem(`comments_${materialId}`) || '[]');
      
      // 查找要回复的评论
      const commentIndex = allComments.findIndex(c => c.id === commentId);
      
      if (commentIndex !== -1) {
        // 创建新回复
        const newReply = {
          id: Date.now(),
          commentId,
          content,
          author: user.role,
          avatar: user.avatar,
          createTime: new Date().toLocaleString(),
          likes: 0
        };
        
        // 添加到回复列表
        if (!allComments[commentIndex].replies) {
          allComments[commentIndex].replies = [];
        }
        allComments[commentIndex].replies.push(newReply);
        localStorage.setItem(`comments_${materialId}`, JSON.stringify(allComments));
        
        resolve(newReply);
      } else {
        throw new Error('评论不存在');
      }
    }, 500);
  });
};

/**
 * 点赞评论或回复
 * @param {number} id 评论或回复ID
 * @param {boolean} isReply 是否为回复
 * @returns {Promise<Object>} 操作结果
 */
export const likeComment = async (id, isReply = false) => {
  // 模拟API调用
  return new Promise((resolve) => {
    setTimeout(() => {
      // 获取所有资料的评论
      const allMaterialIds = JSON.parse(localStorage.getItem('materials') || '[]')
        .map(m => m.id);
      
      let found = false;
      
      // 遍历所有资料的评论
      for (const materialId of allMaterialIds) {
        const allComments = JSON.parse(localStorage.getItem(`comments_${materialId}`) || '[]');
        
        if (!isReply) {
          // 点赞评论
          const commentIndex = allComments.findIndex(c => c.id === id);
          if (commentIndex !== -1) {
            allComments[commentIndex].likes += 1;
            localStorage.setItem(`comments_${materialId}`, JSON.stringify(allComments));
            found = true;
            break;
          }
        } else {
          // 点赞回复
          for (let i = 0; i < allComments.length; i++) {
            if (allComments[i].replies) {
              const replyIndex = allComments[i].replies.findIndex(r => r.id === id);
              if (replyIndex !== -1) {
                allComments[i].replies[replyIndex].likes += 1;
                localStorage.setItem(`comments_${materialId}`, JSON.stringify(allComments));
                found = true;
                break;
              }
            }
          }
        }
        
        if (found) break;
      }
      
      resolve({ success: found });
    }, 500);
  });
};