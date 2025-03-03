<template>
  <div class="profile-container">
    <div class="page-header">
      <h1>个人中心</h1>
      <div class="user-info">
        <span>{{ currentUser.role }}</span>
        <el-avatar :size="40" class="avatar">{{ currentUser.avatar }}</el-avatar>
      </div>
    </div>

    <div class="profile-content">
      <div class="user-card">
        <div class="user-avatar">
          <el-avatar :size="100" class="large-avatar">{{ currentUser.avatar }}</el-avatar>
        </div>
        <div class="user-details">
          <h2>{{ currentUser.role }}</h2>
          <div class="user-meta">
            <p>邮箱: {{ currentUser.email }}</p>
            <p>注册时间: {{ currentUser.registerDate }}</p>
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
                <el-select v-model="settingsForm.avatar" placeholder="选择头像">
                  <el-option 
                    v-for="letter in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')" 
                    :key="letter" 
                    :label="letter" 
                    :value="letter" 
                  />
                </el-select>
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

const activeTab = ref('basic')
const passwordFormRef = ref(null)

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

const stats = ref({
  mindmapCount: 5,
  materialsCount: 12,
  postCount: 8,
  replyCount: 27
})

const userForm = ref({
  username: currentUser.value.username || '',
  bio: currentUser.value.bio || ''
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
    
    // 更新用户信息
    users[userIndex].username = userForm.value.username
    users[userIndex].bio = userForm.value.bio
    
    // 更新当前用户信息
    currentUser.value.username = userForm.value.username
    currentUser.value.bio = userForm.value.bio
    
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

// 保存账户设置
const saveSettings = () => {
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
    
    // 更新用户信息
    users[userIndex].email = settingsForm.value.email
    users[userIndex].avatar = settingsForm.value.avatar
    
    // 更新当前用户信息
    currentUser.value.email = settingsForm.value.email
    currentUser.value.avatar = settingsForm.value.avatar
    
    // 保存到localStorage
    localStorage.setItem('users', JSON.stringify(users))
    localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    
    ElMessage({
      message: '账户设置已更新',
      type: 'success'
    })
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
  settingsForm.value.email = user.email || ''
  settingsForm.value.avatar = user.avatar || ''
})
</script>

<style lang="scss" scoped>
.profile-container {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;

    h1 {
      font-size: 24px;
      font-weight: 500;
      margin: 0;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;

      .avatar {
        background-color: #409EFF;
      }
    }
  }

  .profile-content {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
    margin-bottom: 30px;

    .user-card {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;

      .user-avatar {
        margin-bottom: 20px;

        .large-avatar {
          background-color: #409EFF;
          font-size: 40px;
        }
      }

      .user-details {
        h2 {
          margin: 0 0 10px 0;
          font-size: 20px;
        }

        .user-meta {
          color: #606266;
          font-size: 14px;

          p {
            margin: 5px 0;
          }
        }
      }
    }

    .personal-info {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

      h2 {
        margin: 0 0 20px 0;
        font-size: 18px;
      }
    }
  }

  .user-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;

    .stats-card {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      text-align: center;

      h3 {
        margin: 0 0 15px 0;
        font-size: 16px;
        color: #606266;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 500;
        color: #409EFF;
        margin-bottom: 5px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

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