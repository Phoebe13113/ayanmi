<template>
  <div class="pet-detail-container">
    <div class="back-button">
      <button @click="router.back()">&larr; 返回</button>
    </div>

    <div v-if="petsStore.loading" class="loading">加载中...</div>

    <div v-else-if="pet" class="pet-detail">
      <div class="pet-gallery">
        <img
          :src="pet.image_url || 'https://via.placeholder.com/600x400?text=No+Image'"
          :alt="pet.name"
        />
      </div>

      <div class="pet-content">
        <div class="pet-header">
          <h1>{{ pet.name }}</h1>
          <span class="pet-status" :class="pet.status">
            {{ statusText(pet.status) }}
          </span>
        </div>

        <div class="pet-basic-info">
          <div class="info-item">
            <span class="label">分类</span>
            <span class="value">{{ pet.category?.name || '未分类' }}</span>
          </div>
          <div class="info-item">
            <span class="label">品种</span>
            <span class="value">{{ pet.breed || '未知' }}</span>
          </div>
          <div class="info-item">
            <span class="label">年龄</span>
            <span class="value">{{ pet.age ? `${pet.age}岁` : '未知' }}</span>
          </div>
          <div class="info-item">
            <span class="label">性别</span>
            <span class="value">{{ genderText(pet.gender) }}</span>
          </div>
        </div>

        <div class="pet-section">
          <h2>详细描述</h2>
          <p>{{ pet.description || '暂无描述' }}</p>
        </div>

        <div class="pet-section">
          <h2>健康状况</h2>
          <p>{{ pet.health_status || '健康状况良好' }}</p>
        </div>

        <div v-if="authStore.isAuthenticated && pet.status === 'available'" class="adoption-section">
          <button
            v-if="!showApplicationForm"
            @click="handleAdoptClick"
            class="btn-adopt"
            :disabled="applicationsStore.loading"
          >
            {{ applicationsStore.loading ? '检查中...' : '申请领养' }}
          </button>

          <div v-if="showApplicationForm" class="application-form">
            <h3>填写领养申请</h3>

            <div class="form-group">
              <label>申请理由 *</label>
              <textarea
                v-model="applicationForm.reason"
                placeholder="请说明您想要领养这只宠物的理由..."
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label>居住环境</label>
              <textarea
                v-model="applicationForm.living_situation"
                placeholder="请描述您的居住环境（如：独立住宅、公寓等）..."
              ></textarea>
            </div>

            <div class="form-group">
              <label>养宠经验</label>
              <textarea
                v-model="applicationForm.experience"
                placeholder="请描述您的养宠经验..."
              ></textarea>
            </div>

            <div v-if="error" class="error-message">{{ error }}</div>

            <div class="form-actions">
              <button @click="submitApplication" :disabled="applicationsStore.loading" class="btn-submit">
                {{ applicationsStore.loading ? '提交中...' : '提交申请' }}
              </button>
              <button @click="showApplicationForm = false" class="btn-cancel">
                取消
              </button>
            </div>
          </div>
        </div>

        <div v-else-if="!authStore.isAuthenticated" class="login-prompt">
          <p>请先登录才能申请领养</p>
          <button @click="router.push('/login')" class="btn-login">前往登录</button>
        </div>

        <div v-else-if="pet.status !== 'available'" class="unavailable-message">
          <p>该宠物暂时不可领养</p>
        </div>
      </div>
    </div>

    <div v-else class="error-state">宠物不存在</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePetsStore } from '@/stores/pets'
import { useApplicationsStore } from '@/stores/applications'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const petsStore = usePetsStore()
const applicationsStore = useApplicationsStore()

const showApplicationForm = ref(false)
const error = ref('')

const applicationForm = reactive({
  reason: '',
  living_situation: '',
  experience: '',
})

const pet = computed(() => petsStore.currentPet)

onMounted(async () => {
  const petId = route.params.id as string
  await petsStore.fetchPetById(petId)
})

async function handleAdoptClick() {
  if (!authStore.user || !pet.value) return

  // 检查是否已经申请过
  const { exists } = await applicationsStore.checkExistingApplication(
    pet.value.id,
    authStore.user.id
  )

  if (exists) {
    error.value = '您已经提交过申请，请等待审核'
    return
  }

  showApplicationForm.value = true
}

async function submitApplication() {
  if (!authStore.user || !pet.value) return

  error.value = ''

  if (!applicationForm.reason.trim()) {
    error.value = '请填写申请理由'
    return
  }

  const result = await applicationsStore.createApplication({
    pet_id: pet.value.id,
    user_id: authStore.user.id,
    reason: applicationForm.reason,
    living_situation: applicationForm.living_situation,
    experience: applicationForm.experience,
  })

  if (result.success) {
    alert('申请提交成功！请等待审核')
    showApplicationForm.value = false
    router.push('/profile')
  } else {
    error.value = result.error || '申请提交失败'
  }
}

function statusText(status: string) {
  const map: Record<string, string> = {
    available: '可领养',
    pending: '待审核',
    adopted: '已领养',
  }
  return map[status] || status
}

function genderText(gender: string) {
  const map: Record<string, string> = {
    male: '雄性',
    female: '雌性',
    unknown: '未知',
  }
  return map[gender] || gender
}
</script>

<style scoped>
.pet-detail-container {
  min-height: 100vh;
  min-width: 100vw;
  width: 100%;
  background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
  background-attachment: fixed;
  padding: 20px;
  position: relative;
}

.back-button {
  max-width: 1200px;
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

.loading,
.error-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 18px;
}

.pet-detail {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.pet-gallery {
  background: #f0f0f0;
}

.pet-gallery img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  min-height: 500px;
}

.pet-content {
  padding: 40px;
}

.pet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.pet-header h1 {
  font-size: 32px;
  color: #333;
}

.pet-status {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.pet-status.available {
  background: #52c41a;
}

.pet-status.pending {
  background: #faad14;
}

.pet-status.adopted {
  background: #999;
}

.pet-basic-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item .label {
  font-size: 14px;
  color: #999;
  font-weight: 500;
}

.info-item .value {
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.pet-section {
  margin-bottom: 30px;
}

.pet-section h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 15px;
}

.pet-section p {
  color: #666;
  line-height: 1.8;
  font-size: 16px;
}

.adoption-section {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #f0f0f0;
}

.btn-adopt {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}

.btn-adopt:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-adopt:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.application-form {
  margin-top: 30px;
}

.application-form h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
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

.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  box-sizing: border-box;
}

.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 15px;
}

.btn-submit,
.btn-cancel {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: #f0f0f0;
  color: #666;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.login-prompt,
.unavailable-message {
  margin-top: 40px;
  padding: 30px;
  background: #f9f9f9;
  border-radius: 8px;
  text-align: center;
}

.login-prompt p,
.unavailable-message p {
  color: #666;
  margin-bottom: 15px;
  font-size: 16px;
}

.btn-login {
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

.btn-login:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .pet-detail {
    grid-template-columns: 1fr;
  }

  .pet-gallery img {
    min-height: 300px;
  }

  .pet-content {
    padding: 20px;
  }

  .pet-basic-info {
    grid-template-columns: 1fr;
  }
}
</style>
