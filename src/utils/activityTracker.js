/**
 * 用户活动跟踪工具
 * 用于记录和管理用户的各种活动，如下载资料、点赞和评论等
 */

// 活动类型常量
const ACTIVITY_TYPES = {
  DOWNLOAD: 'download',  // 下载资料
  LIKE: 'like',          // 点赞资料
  COMMENT: 'comment',    // 评论资料
  POST: 'post',          // 发表帖子
  REPLY: 'reply',        // 回复帖子
  CREATE_MINDMAP: 'create_mindmap', // 创建思维导图
  UPDATE_MINDMAP: 'update_mindmap'  // 更新思维导图
};

// 本地存储键名
const ACTIVITY_STORAGE_KEY = 'user_activities';

/**
 * 初始化活动存储
 */
const initActivityStorage = () => {
  if (!localStorage.getItem(ACTIVITY_STORAGE_KEY)) {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify({}));
  }
};

/**
 * 记录用户活动
 * @param {string} username - 用户名
 * @param {string} activityType - 活动类型，使用ACTIVITY_TYPES中的值
 * @param {Object} details - 活动详情
 * @returns {boolean} - 是否成功记录
 */
const recordActivity = (username, activityType, details) => {
  try {
    initActivityStorage();
    const activities = JSON.parse(localStorage.getItem(ACTIVITY_STORAGE_KEY));
    
    // 如果用户没有活动记录，创建一个新的数组
    if (!activities[username]) {
      activities[username] = [];
    }
    
    // 添加新活动，包含时间戳
    const newActivity = {
      type: activityType,
      details: details,
      timestamp: new Date().toISOString()
    };
    
    // 将新活动添加到用户活动列表的开头
    activities[username].unshift(newActivity);
    
    // 限制每个用户存储的活动数量，防止数据过大
    if (activities[username].length > 100) {
      activities[username] = activities[username].slice(0, 100);
    }
    
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities));
    return true;
  } catch (error) {
    console.error('记录用户活动失败:', error);
    return false;
  }
};

/**
 * 获取用户活动列表
 * @param {string} username - 用户名
 * @param {number} limit - 限制返回的活动数量，默认为20
 * @returns {Array} - 用户活动列表
 */
const getUserActivities = (username, limit = 20) => {
  try {
    initActivityStorage();
    const activities = JSON.parse(localStorage.getItem(ACTIVITY_STORAGE_KEY));
    return (activities[username] || []).slice(0, limit);
  } catch (error) {
    console.error('获取用户活动失败:', error);
    return [];
  }
};

/**
 * 格式化活动描述
 * @param {Object} activity - 活动对象
 * @returns {string} - 格式化后的活动描述
 */
const formatActivityDescription = (activity) => {
  const { type, details, timestamp } = activity;
  const date = new Date(timestamp);
  const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  
  switch (type) {
    case ACTIVITY_TYPES.DOWNLOAD:
      return `下载了资料 "${details.materialName}" (${formattedDate})`;
    case ACTIVITY_TYPES.LIKE:
      return `点赞了资料 "${details.materialName}" (${formattedDate})`;
    case ACTIVITY_TYPES.COMMENT:
      return `评论了资料 "${details.materialName}" (${formattedDate})`;
    case ACTIVITY_TYPES.POST:
      return `发表了帖子 "${details.topicTitle}" (${formattedDate})`;
    case ACTIVITY_TYPES.REPLY:
      return `回复了帖子 "${details.topicTitle}" (${formattedDate})`;
    case ACTIVITY_TYPES.CREATE_MINDMAP:
      return `创建了思维导图 "${details.mindmapTitle}" (${formattedDate})`;
    case ACTIVITY_TYPES.UPDATE_MINDMAP:
      return `更新了思维导图 "${details.mindmapTitle}" (${formattedDate})`;
    default:
      return `进行了未知活动 (${formattedDate})`;
  }
};

/**
 * 清除用户活动记录
 * @param {string} username - 用户名
 * @returns {boolean} - 是否成功清除
 */
const clearUserActivities = (username) => {
  try {
    initActivityStorage();
    const activities = JSON.parse(localStorage.getItem(ACTIVITY_STORAGE_KEY));
    
    if (activities[username]) {
      activities[username] = [];
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities));
    }
    
    return true;
  } catch (error) {
    console.error('清除用户活动失败:', error);
    return false;
  }
};

export {
  ACTIVITY_TYPES,
  recordActivity,
  getUserActivities,
  formatActivityDescription,
  clearUserActivities
};