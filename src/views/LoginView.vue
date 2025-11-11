<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>{{ isLogin ? '登录' : '注册' }}</h1>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">邮箱</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            placeholder="请输入有效邮箱，如：example@email.com"
          />
          <small class="hint">请使用真实有效的邮箱地址</small>
        </div>

        <div v-if="!isLogin" class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            placeholder="请输入用户名"
          />
        </div>

        <div v-if="!isLogin" class="form-group">
          <label for="fullName">姓名（可选）</label>
          <input
            id="fullName"
            v-model="form.fullName"
            type="text"
            placeholder="请输入姓名"
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            minlength="6"
            placeholder="请输入密码（至少6个字符）"
          />
          <small class="hint">密码长度至少6个字符</small>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" :disabled="authStore.loading" class="submit-btn">
          {{ authStore.loading ? '处理中...' : (isLogin ? '登录' : '注册') }}
        </button>
      </form>

      <div class="toggle-mode">
        <p>
          {{ isLogin ? '还没有账号？' : '已有账号？' }}
          <a @click.prevent="toggleMode" href="#">
            {{ isLogin ? '立即注册' : '立即登录' }}
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLogin = ref(true)
const error = ref('')

const form = reactive({
  email: '',
  username: '',
  fullName: '',
  password: ''
})

function toggleMode() {
  isLogin.value = !isLogin.value
  error.value = ''
}

async function handleSubmit() {
  error.value = ''

  // 前端验证
  if (!form.email.includes('@') || !form.email.includes('.')) {
    error.value = '请输入有效的邮箱地址'
    return
  }

  if (form.password.length < 6) {
    error.value = '密码至少需要6个字符'
    return
  }

  try {
    let result

    if (isLogin.value) {
      result = await authStore.signIn(form.email, form.password)
    } else {
      if (!form.username || form.username.trim().length === 0) {
        error.value = '请输入用户名'
        return
      }
      result = await authStore.signUp(
        form.email,
        form.password,
        form.username.trim(),
        form.fullName.trim()
      )
    }

    if (result.success) {
      router.push('/')
    } else {
      error.value = result.error || '操作失败'
    }
  } catch (err: any) {
    error.value = err.message || '操作失败'
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  min-width: 100vw;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
}

.auth-container::before {
  content: '';
  position: absolute;
  top: -20%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.auth-container::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 400px;
  height: 400px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 50%;
}

.auth-card {
  background: white;
  padding: 50px 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 440px;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group .hint {
  display: block;
  margin-top: 5px;
  color: #999;
  font-size: 12px;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  font-size: 14px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-mode {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.toggle-mode a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
}

.toggle-mode a:hover {
  text-decoration: underline;
}
</style>
