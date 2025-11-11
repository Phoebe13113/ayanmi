<template>
  <div class="profile-container">
    <div class="back-button">
      <button @click="router.push('/')">&larr; 返回首页</button>
    </div>

    <div class="profile-content">
      <div class="profile-header">
        <h1>用户中心</h1>
        <div class="user-info">
          <p><strong>用户名：</strong>{{ authStore.userProfile?.username }}</p>
          <p v-if="authStore.userProfile?.full_name">
            <strong>姓名：</strong>{{ authStore.userProfile.full_name }}
          </p>
          <p v-if="authStore.userProfile?.email">
            <strong>邮箱：</strong>{{ authStore.user?.email }}
          </p>
        </div>
      </div>

      <div class="profile-section">
        <h2>我的领养申请</h2>

        <div v-if="applicationsStore.loading" class="loading">加载中...</div>

        <div v-else-if="applicationsStore.applications.length === 0" class="empty-state">
          <p>您还没有提交过领养申请</p>
          <button @click="router.push('/')" class="btn-browse">浏览宠物</button>
        </div>

        <div v-else class="applications-list">
          <div
            v-for="app in applicationsStore.applications"
            :key="app.id"
            class="application-card"
          >
            <div class="app-pet-info">
              <img
                :src="app.pet?.image_url || 'https://via.placeholder.com/150x100?text=No+Image'"
                :alt="app.pet?.name"
              />
              <div class="app-pet-details">
                <h3>{{ app.pet?.name }}</h3>
                <p class="pet-meta">
                  <span v-if="app.pet?.category">{{ app.pet.category.name }}</span>
                  <span v-if="app.pet?.breed">{{ app.pet.breed }}</span>
                  <span v-if="app.pet?.age">{{ app.pet.age }}岁</span>
                </p>
              </div>
            </div>

            <div class="app-content">
              <div class="app-status" :class="app.status">
                {{ statusText(app.status) }}
              </div>

              <div class="app-details">
                <p><strong>申请理由：</strong></p>
                <p class="reason">{{ app.reason }}</p>

                <p v-if="app.living_situation">
                  <strong>居住环境：</strong>
                  {{ app.living_situation }}
                </p>

                <p v-if="app.experience">
                  <strong>养宠经验：</strong>
                  {{ app.experience }}
                </p>

                <p v-if="app.admin_notes" class="admin-notes">
                  <strong>管理员备注：</strong>
                  {{ app.admin_notes }}
                </p>

                <p class="app-date">
                  <strong>申请时间：</strong>
                  {{ formatDate(app.created_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="profile-section">
        <h2>个人资料设置</h2>

        <form @submit.prevent="handleUpdateProfile" class="profile-form">
          <div class="form-group">
            <label>姓名</label>
            <input v-model="profileForm.full_name" type="text" placeholder="请输入姓名" />
          </div>

          <div class="form-group">
            <label>电话</label>
            <input v-model="profileForm.phone" type="tel" placeholder="请输入电话" />
          </div>

          <div class="form-group">
            <label>地址</label>
            <textarea v-model="profileForm.address" placeholder="请输入地址"></textarea>
          </div>

          <div v-if="updateMessage" :class="['message', updateSuccess ? 'success' : 'error']">
            {{ updateMessage }}
          </div>

          <button type="submit" :disabled="authStore.loading" class="btn-submit">
            {{ authStore.loading ? '更新中...' : '更新资料' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useApplicationsStore } from '@/stores/applications'

const router = useRouter()
const authStore = useAuthStore()
const applicationsStore = useApplicationsStore()

const updateMessage = ref('')
const updateSuccess = ref(false)

const profileForm = reactive({
  full_name: '',
  phone: '',
  address: '',
})

onMounted(async () => {
  if (authStore.user) {
    await applicationsStore.fetchUserApplications(authStore.user.id)

    // 初始化表单
    if (authStore.userProfile) {
      profileForm.full_name = authStore.userProfile.full_name || ''
      profileForm.phone = authStore.userProfile.phone || ''
      profileForm.address = authStore.userProfile.address || ''
    }
  }
})

async function handleUpdateProfile() {
  updateMessage.value = ''

  const result = await authStore.updateProfile({
    full_name: profileForm.full_name,
    phone: profileForm.phone,
    address: profileForm.address,
  })

  if (result.success) {
    updateMessage.value = '资料更新成功'
    updateSuccess.value = true
  } else {
    updateMessage.value = result.error || '更新失败'
    updateSuccess.value = false
  }

  setTimeout(() => {
    updateMessage.value = ''
  }, 3000)
}

function statusText(status: string) {
  const map: Record<string, string> = {
    pending: '待审核',
    approved: '已批准',
    rejected: '已拒绝',
  }
  return map[status] || status
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  min-width: 100vw;
  width: 100%;
  background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
  background-attachment: fixed;
  padding: 20px;
  position: relative;
}

.back-button {
  max-width: 1000px;
  margin: 0 auto 20px;
}

.back-button button {
  padding: 10px 20px;
  border: none;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background 0.3s;
}

.back-button button:hover {
  background: #f5f5f5;
}

.profile-content {
  max-width: 1000px;
  margin: 0 auto;
}

.profile-header {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.profile-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 20px;
}

.user-info p {
  color: #666;
  margin-bottom: 10px;
  font-size: 16px;
}

.profile-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.profile-section h2 {
  font-size: 22px;
  color: #333;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.loading,
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-state p {
  margin-bottom: 20px;
  font-size: 16px;
}

.btn-browse {
  padding: 12px 30px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}

.btn-browse:hover {
  opacity: 0.9;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.application-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.application-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.app-pet-info {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
}

.app-pet-info img {
  width: 150px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.app-pet-details h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 10px;
}

.pet-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pet-meta span {
  padding: 4px 12px;
  background: white;
  border-radius: 12px;
  font-size: 13px;
  color: #666;
}

.app-content {
  padding: 20px;
}

.app-status {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin-bottom: 15px;
}

.app-status.pending {
  background: #faad14;
}

.app-status.approved {
  background: #52c41a;
}

.app-status.rejected {
  background: #f5222d;
}

.app-details p {
  color: #666;
  margin-bottom: 12px;
  font-size: 15px;
}

.app-details .reason {
  color: #333;
  line-height: 1.6;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  margin-bottom: 15px;
}

.admin-notes {
  background: #fff7e6;
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid #faad14;
}

.app-date {
  color: #999;
  font-size: 14px;
}

.profile-form {
  max-width: 600px;
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

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.message {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 14px;
}

.message.success {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.message.error {
  background: #fff1f0;
  color: #f5222d;
  border: 1px solid #ffa39e;
}

.btn-submit {
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
