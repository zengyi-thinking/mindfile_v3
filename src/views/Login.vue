<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>思维导图系统</h1>
        <p v-if="isLoginMode">登录您的账户以继续</p>
        <p v-else>创建新账户</p>
      </div>
      
      <!-- 登录表单 -->
      <div class="login-form" v-if="isLoginMode">
        <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-position="top">
          <el-form-item label="用户名" prop="username">
            <el-input 
              v-model="loginForm.username" 
              placeholder="请输入用户名"
              prefix-icon="el-icon-user"
            />
          </el-form-item>
          
          <el-form-item label="密码" prop="password">
            <el-input 
              v-model="loginForm.password" 
              type="password" 
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              show-password
            />
          </el-form-item>
          
          <div class="login-options">
            <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
            <el-button type="text" @click="forgotPassword">忘记密码？</el-button>
          </div>
          
          <el-form-item>
            <el-button type="primary" class="login-button" @click="handleLogin" :loading="loading">登录</el-button>
          </el-form-item>
        </el-form>
        <div class="form-footer">
          <p>还没有账户？ <el-button type="text" @click="toggleMode">立即注册</el-button></p>
        </div>
      </div>
      
      <!-- 注册表单 -->
      <div class="register-form" v-else>
        <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" label-position="top">
          <el-form-item label="用户名" prop="username">
            <el-input 
              v-model="registerForm.username" 
              placeholder="请输入用户名"
              prefix-icon="el-icon-user"
            />
          </el-form-item>
          
          <el-form-item label="邮箱" prop="email">
            <el-input 
              v-model="registerForm.email" 
              placeholder="请输入邮箱"
              prefix-icon="el-icon-message"
            />
          </el-form-item>
          
          <el-form-item label="密码" prop="password">
            <el-input 
              v-model="registerForm.password" 
              type="password" 
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              show-password
            />
          </el-form-item>
          
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input 
              v-model="registerForm.confirmPassword" 
              type="password" 
              placeholder="请再次输入密码"
              prefix-icon="el-icon-lock"
              show-password
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" class="login-button" @click="handleRegister" :loading="loading">注册</el-button>
          </el-form-item>
        </el-form>
        <div class="form-footer">
          <p>已有账户？ <el-button type="text" @click="toggleMode">返回登录</el-button></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loginFormRef = ref(null)
const registerFormRef = ref(null)
const loading = ref(false)
const isLoginMode = ref(true)

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3到20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6到20个字符之间', trigger: 'blur' }
  ]
}

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3到20个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6到20个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ]
}

// 从localStorage获取用户列表，如果不存在则使用默认用户
const getUsersFromStorage = () => {
  const storedUsers = localStorage.getItem('users')
  if (storedUsers) {
    try {
      return JSON.parse(storedUsers)
    } catch (e) {
      console.error('解析用户数据失败', e)
      return defaultUsers
    }
  } else {
    // 初始化用户数据到localStorage
    localStorage.setItem('users', JSON.stringify(defaultUsers))
    return defaultUsers
  }
}

// 默认用户数据
const defaultUsers = [
  {
    username: 'admin',
    password: '123456',
    role: '管理员',
    avatar: 'A',
    email: 'admin@example.com',
    registerDate: '2023-01-01',
    bio: '系统管理员账户，负责管理系统各项功能和用户。'
  },
  {
    username: 'user',
    password: '123456',
    role: '普通用户',
    avatar: 'U',
    email: 'user@example.com',
    registerDate: '2023-02-15',
    bio: '普通用户账户'
  }
]

// 获取用户列表
const users = ref(getUsersFromStorage())

const handleLogin = () => {
  if (!loginFormRef.value) return
  
  loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      
      // 模拟登录请求
      setTimeout(() => {
        const user = users.value.find(
          user => user.username === loginForm.username && user.password === loginForm.password
        )
        
        if (user) {
          // 登录成功，保存用户信息到localStorage
          localStorage.setItem('currentUser', JSON.stringify(user))
          localStorage.setItem('isLoggedIn', 'true')
          
          // 如果选择了记住我，保存登录状态
          if (loginForm.remember) {
            localStorage.setItem('rememberUser', JSON.stringify({
              username: loginForm.username,
              remember: true
            }))
          } else {
            localStorage.removeItem('rememberUser')
          }
          
          ElMessage({
            message: '登录成功',
            type: 'success'
          })
          
          // 跳转到首页
          router.push('/dashboard')
        } else {
          ElMessage.error('用户名或密码错误')
        }
        
        loading.value = false
      }, 1000)
    }
  })
}

const handleRegister = () => {
  if (!registerFormRef.value) return
  
  registerFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      
      // 检查用户名是否已存在
      const userExists = users.value.some(user => user.username === registerForm.username)
      const emailExists = users.value.some(user => user.email === registerForm.email)
      
      if (userExists) {
        ElMessage.error('用户名已存在')
        loading.value = false
        return
      }
      
      if (emailExists) {
        ElMessage.error('邮箱已被注册')
        loading.value = false
        return
      }
      
      // 模拟注册请求
      setTimeout(() => {
        // 创建新用户
        const newUser = {
          username: registerForm.username,
          password: registerForm.password,
          email: registerForm.email,
          role: '普通用户',
          avatar: registerForm.username.charAt(0).toUpperCase(),
          registerDate: new Date().toISOString().split('T')[0],
          bio: ''
        }
        
        // 添加到用户列表
        users.value.push(newUser)
        
        // 保存到localStorage
        localStorage.setItem('users', JSON.stringify(users.value))
        
        ElMessage({
          message: '注册成功，请登录',
          type: 'success'
        })
        
        // 切换到登录模式
        isLoginMode.value = true
        loading.value = false
      }, 1000)
    }
  })
}

const forgotPassword = () => {
  ElMessage({
    message: '请联系系统管理员重置密码',
    type: 'info'
  })
}

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
}

// 检查是否有记住的用户
const checkRememberedUser = () => {
  const rememberedUser = localStorage.getItem('rememberUser')
  if (rememberedUser) {
    try {
      const userData = JSON.parse(rememberedUser)
      loginForm.username = userData.username
      loginForm.remember = userData.remember
    } catch (e) {
      console.error('解析记住的用户数据失败', e)
    }
  }
}

// 页面加载时检查
checkRememberedUser()
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
  
  .login-box {
    width: 400px;
    padding: 40px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
    transform: translateY(0);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 30px;
      
      h1 {
        font-size: 24px;
        color: #333;
        margin-bottom: 10px;
      }
      
      p {
        color: #666;
        font-size: 14px;
      }
    }
    
    .login-form, .register-form {
      .login-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .login-button {
        width: 100%;
        padding: 12px 0;
        font-size: 16px;
      }
    }
    
    .form-footer {
      text-align: center;
      margin-top: 20px;
      color: #606266;
      font-size: 14px;
      
      p {
        margin: 0;
      }
    }
  }
}
</style>