<template>
  <div class="profile-container">
    <div class="page-header">
      <h1>个人中心</h1>
      <div class="user-info">
        <span>{{ currentUser.role }}</span>
        <el-avatar v-if="userAvatar" :size="40" class="avatar" :src="userAvatar"></el-avatar>
        <el-avatar v-else :size="40" class="avatar">{{ currentUser.avatar }}</el-avatar>
      </div>
    </div>

    <div class="profile-content">
      <div class="user-card">
        <div class="user-avatar">
          <el-avatar v-if="userAvatar" :size="100" class="large-avatar" :src="userAvatar"></el-avatar>
          <el-avatar v-else :size="100" class="large-avatar">{{ currentUser.avatar }}</el-avatar>
        </div>
        <div class="user-details">
          <h2>{{ currentUser.username || currentUser.role }}</h2>
          <div class="user-meta">
            <p>邮箱: {{ currentUser.email }}</p>
            <p>注册时间: {{ currentUser.registerDate }}</p>
            <p v-if="currentUser.location">所在地: {{ currentUser.location }}</p>
          </div>
        </div>
      </div>

      <div class="personal-info">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本资料" name="basic">
            <h2>个人资料</h2>
            <el-form :model="userForm" label-width="80px">
              <el-form-item label="用户名">
                <el-input v-model="userForm.username" placeholder="请输入用户名" />
              </el-form-item>
              <el-form-item label="个人简介">
                <el-input 
                  v-model="userForm.bio" 
                  type="textarea" 
                  :rows="4" 
                  placeholder="请输入个人简介"
                />
              </el-form-item>
              <el-form-item label="兴趣爱好">
                <el-input 
                  v-model="userForm.interests" 
                  type="textarea" 
                  :rows="2" 
                  placeholder="请输入您的兴趣爱好，多个兴趣用逗号分隔"
                />
              </el-form-item>
              <el-form-item label="专业领域">
                <el-input 
                  v-model="userForm.expertise" 
                  placeholder="请输入您的专业领域或技能"
                />
              </el-form-item>
              <el-form-item label="教育背景">
                <el-input 
                  v-model="userForm.education" 
                  placeholder="请输入您的教育背景"
                />
              </el-form-item>
              <el-form-item label="所在地区">
                <el-input 
                  v-model="userForm.location" 
                  placeholder="请输入您的所在地区"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveUserInfo">保存修改</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          
          <el-tab-pane label="修改密码" name="password">
            <h2>修改密码</h2>
            <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
              <el-form-item label="当前密码" prop="currentPassword">
                <el-input 
                  v-model="passwordForm.currentPassword" 
                  type="password" 
                  show-password
                  placeholder="请输入当前密码" 
                />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input 
                  v-model="passwordForm.newPassword" 
                  type="password" 
                  show-password
                  placeholder="请输入新密码" 
                />
              </el-form-item>
              <el-form-item label="确认新密码" prop="confirmPassword">
                <el-input 
                  v-model="passwordForm.confirmPassword" 
                  type="password" 
                  show-password
                  placeholder="请再次输入新密码" 
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="changePassword">修改密码</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          
          <el-tab-pane label="账户设置" name="settings">
            <h2>账户设置</h2>
            <el-form :model="settingsForm" label-width="80px">
              <el-form-item label="邮箱">
                <el-input v-model="settingsForm.email" placeholder="请输入邮箱" />
              </el-form-item>
              <el-form-item label="头像">
                <div class="avatar-upload-container">
                  <div class="current-avatar" v-if="avatarPreview">
                    <img :src="avatarPreview" class="avatar-preview" />
                  </div>
                  <div class="current-avatar" v-else-if="settingsForm.avatar">
                    <el-avatar :size="100" class="avatar-preview">{{ settingsForm.avatar }}</el-avatar>
                  </div>
                  <el-upload
                    class="avatar-uploader"
                    action="#"
                    :auto-upload="false"
                    :show-file-list="false"
                    :on-change="handleAvatarChange">
                    <el-button type="primary">选择图片</el-button>
                    <template #tip>
                      <div class="el-upload__tip">只能上传 jpg/png 文件，且不超过 2MB</div>
                    </template>
                  </el-upload>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveSettings">保存设置</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <div class="user-stats">
      <div class="stats-card">
        <h3>思维导图</h3>
        <div class="stat-value">{{ stats.mindmapCount }}</div>
        <div class="stat-label">已创建</div>
      </div>
      <div class="stats-card">
        <h3>学习资料</h3>
        <div class="stat-value">{{ stats.materialsCount }}</div>
        <div class="stat-label">已上传</div>
      </div>
      <div class="stats-card">
        <h3>讨论帖子</h3>
        <div class="stat-value">{{ stats.postCount }}</div>
        <div class="stat-label">已发布</div>
      </div>
      <div class="stats-card">
        <h3>回复</h3>
        <div class="stat-value">{{ stats.replyCount }}</div>
        <div class="stat-label">已参与</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { saveUserAvatar, getUserAvatar, fileToBase64 } from '../utils/imageStorage'

const activeTab = ref('basic')
const passwordFormRef = ref(null)
const avatarPreview = ref(null)

// 从localStorage获取当前用户信息
const getCurrentUser = () => {
  const userJson = localStorage.getItem('currentUser')
  if (userJson) {
    try {
      return JSON.parse(userJson)
    } catch (e) {
      console.error('解析用户数据失败', e)
      return {
        role: '游客',
        avatar: 'G',
        email: '',
        registerDate: ''
      }
    }
  } else {
    return {
      role: '游客',
      avatar: 'G',
      email: '',
      registerDate: ''
    }
  }
}

const currentUser = ref(getCurrentUser())

// 用户头像URL
const userAvatar = ref(null)

// 加载用户头像
const loadUserAvatar = () => {
  if (currentUser.value && currentUser.value.avatar === 'CUSTOM') {
    const username = currentUser.value.username || currentUser.value.role
    userAvatar.value = getUserAvatar(username)
  } else {
    userAvatar.value = null
  }
}

const stats = ref({
  mindmapCount: 5,
  materialsCount: 12,
  postCount: 8,
  replyCount: 27
})

const userForm = ref({
  username: currentUser.value.username || '',
  bio: currentUser.value.bio || '',
  interests: currentUser.value.interests || '',
  expertise: currentUser.value.expertise || '',
  education: currentUser.value.education || '',
  location: currentUser.value.location || ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const settingsForm = ref({
  email: currentUser.value.email || '',
  avatar: currentUser.value.avatar || ''
})

// 密码验证规则
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== passwordForm.value.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6到20个字符之间', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6到20个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ]
}

// 保存用户基本信息
const saveUserInfo = () => {
  // 获取用户列表
  const usersJson = localStorage.getItem('users')
  if (!usersJson) {
    // 如果找不到用户列表，创建一个新的用户列表
    const newUsers = [currentUser.value]
    localStorage.setItem('users', JSON.stringify(newUsers))
    
    // 更新当前用户信息
    currentUser.value.username = userForm.value.username
    currentUser.value.bio = userForm.value.bio
    currentUser.value.interests = userForm.value.interests
    currentUser.value.expertise = userForm.value.expertise
    currentUser.value.education = userForm.value.education
    currentUser.value.location = userForm.value.location
    
    // 保存到localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    
    ElMessage({
      message: '个人资料已更新',
      type: 'success'
    })
    return
  }
  
  try {
    const users = JSON.parse(usersJson)
    const userIndex = users.findIndex(user => user.username === currentUser.value.username)
    
    if (userIndex === -1) {
      // 如果在用户列表中找不到当前用户，将当前用户添加到列表中
      users.push({
        ...currentUser.value,
        username: userForm.value.username,
        bio: userForm.value.bio,
        interests: userForm.value.interests,
        expertise: userForm.value.expertise,
        education: userForm.value.education,
        location: userForm.value.location
      })
    } else {
      // 更新用户信息
      users[userIndex].username = userForm.value.username
      users[userIndex].bio = userForm.value.bio
      users[userIndex].interests = userForm.value.interests
      users[userIndex].expertise = userForm.value.expertise
      users[userIndex].education = userForm.value.education
      users[userIndex].location = userForm.value.location
    }
    
    // 更新当前用户信息
    currentUser.value.username = userForm.value.username
    currentUser.value.bio = userForm.value.bio
    currentUser.value.interests = userForm.value.interests
    currentUser.value.expertise = userForm.value.expertise
    currentUser.value.education = userForm.value.education
    currentUser.value.location = userForm.value.location
    
    // 保存到localStorage
    localStorage.setItem('users', JSON.stringify(users))
    localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    
    ElMessage({
      message: '个人资料已更新',
      type: 'success'
    })
  } catch (e) {
    console.error('保存用户信息失败', e)
    ElMessage.error('保存失败，请重试')
  }
}

// 修改密码
const changePassword = () => {
  if (!passwordFormRef.value) return
  
  passwordFormRef.value.validate((valid) => {
    if (valid) {
      // 获取用户列表
      const usersJson = localStorage.getItem('users')
      if (!usersJson) {
        ElMessage.error('用户数据获取失败')
        return
      }
      
      try {
        const users = JSON.parse(usersJson)
        const userIndex = users.findIndex(user => 
          user.username === currentUser.value.username && 
          user.password === passwordForm.value.currentPassword
        )
        
        if (userIndex === -1) {
          ElMessage.error('当前密码错误')
          return
        }
        
        // 更新密码
        users[userIndex].password = passwordForm.value.newPassword
        
        // 保存到localStorage
        localStorage.setItem('users', JSON.stringify(users))
        
        // 清空表单
        passwordForm.value.currentPassword = ''
        passwordForm.value.newPassword = ''
        passwordForm.value.confirmPassword = ''
        
        ElMessage({
          message: '密码修改成功',
          type: 'success'
        })
      } catch (e) {
        console.error('修改密码失败', e)
        ElMessage.error('修改失败，请重试')
      }
    }
  })
}

// 处理头像上传
const handleAvatarChange = async (file) => {
  // 验证文件类型
  const isJPG = file.raw.type === 'image/jpeg'
  const isPNG = file.raw.type === 'image/png'
  if (!isJPG && !isPNG) {
    ElMessage.error('头像图片只能是 JPG 或 PNG 格式!')
    return
  }
  
  // 验证文件大小
  const isLt2M = file.raw.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB!')
    return
  }
  
  try {
    // 将文件转换为Base64格式
    const base64Data = await fileToBase64(file.raw)
    avatarPreview.value = base64Data
  } catch (error) {
    console.error('头像预览失败:', error)
    ElMessage.error('头像预览失败，请重试')
  }
}

// 保存账户设置
const saveSettings = async () => {
  // 获取用户列表
  const usersJson = localStorage.getItem('users')
  if (!usersJson) {
    ElMessage.error('用户数据获取失败')
    return
  }
  
  try {
    const users = JSON.parse(usersJson)
    const userIndex = users.findIndex(user => user.username === currentUser.value.username)
    
    if (userIndex === -1) {
      ElMessage.error('用户不存在')
      return
    }
    
    // 如果有新上传的头像，保存头像图片
    if (avatarPreview.value) {
      // 保存头像到图片存储
      const username = currentUser.value.username || currentUser.value.role
      const success = await saveUserAvatar(username, avatarPreview.value)
      
      if (success) {
        // 更新用户头像信息为特殊标记，表示使用自定义头像
        settingsForm.value.avatar = 'CUSTOM'
      } else {
        ElMessage.error('头像保存失败，请重试')
        return
      }
    }
    
    // 更新用户信息
    users[userIndex].email = settingsForm.value.email
    users[userIndex].avatar = settingsForm.value.avatar
    
    // 更新当前用户信息
    currentUser.value.email = settingsForm.value.email
    currentUser.value.avatar = settingsForm.value.avatar
    
    // 保存到localStorage
    localStorage.setItem('users', JSON.stringify(users))
    localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    
    // 立即更新头像显示
    loadUserAvatar()
    
    ElMessage({
      message: '账户设置已更新',
      type: 'success'
    })
    
    // 清除预览
    avatarPreview.value = null
  } catch (e) {
    console.error('保存账户设置失败', e)
    ElMessage.error('保存失败，请重试')
  }
}

// 页面加载时获取最新用户信息
onMounted(() => {
  const user = getCurrentUser()
  currentUser.value = user
  userForm.value.username = user.username || ''
  userForm.value.bio = user.bio || ''
  userForm.value.interests = user.interests || ''
  userForm.value.expertise = user.expertise || ''
  userForm.value.education = user.education || ''
  userForm.value.location = user.location || ''
  settingsForm.value.email = user.email || ''
  settingsForm.value.avatar = user.avatar || ''
  
  // 加载用户头像
  loadUserAvatar()
})
</script>

<style lang="scss" scoped>
.profile-container {
  padding: 20px;
  animation: fadeIn 0.5s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 2px solid #f0f2f5;

    h1 {
      font-size: 28px;
      font-weight: 600;
      margin: 0;
      background: linear-gradient(45deg, #42b983, #2f9768);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;

      span {
        font-weight: 500;
        color: #606266;
      }

      .avatar {
        background: linear-gradient(135deg, #42b983, #2f9768);
        transition: transform 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        
        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }

  .profile-content {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
    margin-bottom: 30px;

    .user-card {
      background: linear-gradient(to bottom, #ffffff, #f9fafb);
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      transition: all 0.3s ease;
      border: 1px solid rgba(0, 0, 0, 0.03);
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }

      .user-avatar {
        margin-bottom: 20px;
        position: relative;
        
        &::after {
          content: '';
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          border-radius: 50%;
          background: linear-gradient(135deg, #42b983, #2f9768);
          opacity: 0.2;
          z-index: -1;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.05); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0.2; }
        }

        .large-avatar {
          background: linear-gradient(135deg, #42b983, #2f9768);
          font-size: 40px;
          transition: transform 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          
          &:hover {
            transform: scale(1.05);
          }
        }
      }
      
      .avatar-upload-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        
        .current-avatar {
          margin-bottom: 10px;
          
          .avatar-preview {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #eaeaea;
          }
        }
      }

      .user-details {
        h2 {
          margin: 0 0 15px 0;
          font-size: 22px;
          font-weight: 600;
          background: linear-gradient(45deg, #333333, #555555);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: 0.5px;
        }

        .user-meta {
          color: #606266;
          font-size: 14px;
          background-color: rgba(66, 185, 131, 0.05);
          padding: 12px 15px;
          border-radius: 8px;
          border-left: 3px solid #42b983;

          p {
            margin: 8px 0;
            transition: transform 0.2s ease;
            display: flex;
            align-items: center;
            
            &:before {
              content: '•';
              color: #42b983;
              margin-right: 8px;
              font-size: 18px;
            }
            
            &:hover {
              transform: translateX(3px);
              color: #42b983;
            }
          }
        }
      }
    }

    .personal-info {
      background-color: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      border: 1px solid rgba(0, 0, 0, 0.03);
      
      &:hover {
        box-shadow: 0 6px 22px rgba(0, 0, 0, 0.1);
      }

      h2 {
        margin: 0 0 20px 0;
        font-size: 20px;
        font-weight: 600;
        color: #42b983;
        position: relative;
        padding-bottom: 10px;
        
        &:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 3px;
          background: linear-gradient(90deg, #42b983, #2f9768);
          border-radius: 3px;
        }
      }
      
      .avatar-upload-container {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
        
        .current-avatar {
          margin-bottom: 10px;
          
          .avatar-preview {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #eaeaea;
          }
        }
        
        .el-upload__tip {
          font-size: 12px;
          color: #909399;
          margin-top: 5px;
        }
      }
    }
  }

  .user-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;

    .stats-card {
      background: linear-gradient(to bottom, #ffffff, #f9fafb);
      border-radius: 12px;
      padding: 25px 15px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
      text-align: center;
      transition: all 0.3s ease;
      border: 1px solid rgba(0, 0, 0, 0.03);
      position: relative;
      overflow: hidden;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        
        &::before {
          transform: translateX(0);
          opacity: 0.1;
        }
        
        .stat-value {
          transform: scale(1.05);
        }
      }
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, #42b983, #2f9768);
        transform: translateX(-100%);
        transition: transform 0.5s ease;
        opacity: 0;
      }

      h3 {
        margin: 0 0 15px 0;
        font-size: 16px;
        font-weight: 600;
        color: #555;
        position: relative;
        display: inline-block;
      }

      .stat-value {
        font-size: 32px;
        font-weight: 600;
        background: linear-gradient(45deg, #42b983, #2f9768);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 8px;
        transition: transform 0.3s ease;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
        font-weight: 500;
        position: relative;
        display: inline-block;
        padding: 3px 8px;
        background-color: rgba(66, 185, 131, 0.1);
        border-radius: 12px;
      }
    }
  }
}

/* 表单元素样式优化 */
.el-form-item {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateX(5px);
  }
}

.el-input, .el-textarea {
  transition: all 0.3s ease;
  
  &:focus, &:hover {
    box-shadow: 0 0 8px rgba(66, 185, 131, 0.2);
  }
}

.el-button {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0));
    transition: all 0.6s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
}

.el-tabs__item {
  transition: all 0.3s ease;
  position: relative;
  
  &.is-active {
    color: #42b983 !important;
    
    &::after {
      transform: scaleX(1);
    }
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #42b983;
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover::after {
    transform: scaleX(0.5);
  }
}

/* 响应式布局 */
@media (max-width: 992px) {
  .profile-content {
    grid-template-columns: 1fr !important;
  }

  .user-stats {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 576px) {
  .user-stats {
    grid-template-columns: 1fr !important;
  }
}
</style>
