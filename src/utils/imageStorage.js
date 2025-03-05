/**
 * 图片存储服务
 * 用于处理用户头像图片的上传、存储和获取
 */

// 使用localStorage存储Base64格式的图片
const IMAGE_STORAGE_KEY = 'user_avatars';

/**
 * 初始化图片存储
 */
const initImageStorage = () => {
  if (!localStorage.getItem(IMAGE_STORAGE_KEY)) {
    localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify({}));
  }
};

/**
 * 保存用户头像图片
 * @param {string} username - 用户名
 * @param {string} imageData - Base64格式的图片数据
 */
const saveUserAvatar = (username, imageData) => {
  try {
    initImageStorage();
    const avatars = JSON.parse(localStorage.getItem(IMAGE_STORAGE_KEY));
    avatars[username] = imageData;
    localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(avatars));
    return true;
  } catch (error) {
    console.error('保存用户头像失败:', error);
    return false;
  }
};

/**
 * 获取用户头像图片
 * @param {string} username - 用户名
 * @returns {string|null} - Base64格式的图片数据或null
 */
const getUserAvatar = (username) => {
  try {
    initImageStorage();
    const avatars = JSON.parse(localStorage.getItem(IMAGE_STORAGE_KEY));
    return avatars[username] || null;
  } catch (error) {
    console.error('获取用户头像失败:', error);
    return null;
  }
};

/**
 * 删除用户头像图片
 * @param {string} username - 用户名
 */
const deleteUserAvatar = (username) => {
  try {
    initImageStorage();
    const avatars = JSON.parse(localStorage.getItem(IMAGE_STORAGE_KEY));
    if (avatars[username]) {
      delete avatars[username];
      localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(avatars));
    }
    return true;
  } catch (error) {
    console.error('删除用户头像失败:', error);
    return false;
  }
};

/**
 * 将文件转换为Base64格式
 * @param {File} file - 文件对象
 * @returns {Promise<string>} - Base64格式的数据
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export {
  saveUserAvatar,
  getUserAvatar,
  deleteUserAvatar,
  fileToBase64
};