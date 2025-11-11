<template>
  <div class="admin-container">
    <div class="back-button">
      <button @click="router.push('/')">&larr; 返回首页</button>
    </div>

    <div class="admin-content">
      <div class="admin-header">
        <h1>管理后台</h1>
      </div>

      <div class="admin-tabs">
        <button
          :class="['tab-btn', { active: activeTab === 'pets' }]"
          @click="activeTab = 'pets'"
        >
          宠物管理
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'applications' }]"
          @click="activeTab = 'applications'"
        >
          领养申请
        </button>
      </div>

      <!-- 宠物管理 -->
      <div v-if="activeTab === 'pets'" class="tab-content">
        <div class="section-header">
          <h2>宠物管理</h2>
          <button @click="showPetForm = true; editingPet = null" class="btn-primary">
            添加宠物
          </button>
        </div>

        <div v-if="petsStore.loading" class="loading">加载中...</div>

        <div v-else class="pets-table">
          <table>
            <thead>
              <tr>
                <th>图片</th>
                <th>名称</th>
                <th>分类</th>
                <th>品种</th>
                <th>年龄</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pet in petsStore.pets" :key="pet.id">
                <td>
                  <img
                    :src="pet.image_url || 'https://via.placeholder.com/60x40?text=No'"
                    class="pet-thumbnail"
                  />
                </td>
                <td>{{ pet.name }}</td>
                <td>{{ pet.category?.name || '-' }}</td>
                <td>{{ pet.breed || '-' }}</td>
                <td>{{ pet.age ? `${pet.age}岁` : '-' }}</td>
                <td>
                  <span class="status-badge" :class="pet.status">
                    {{ statusText(pet.status) }}
                  </span>
                </td>
                <td>
                  <button @click="handleEditPet(pet)" class="btn-edit">编辑</button>
                  <button @click="handleDeletePet(pet.id)" class="btn-delete">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 宠物表单 Modal -->
        <div v-if="showPetForm" class="modal" @click.self="showPetForm = false">
          <div class="modal-content">
            <div class="modal-header">
              <h3>{{ editingPet ? '编辑宠物' : '添加宠物' }}</h3>
              <button @click="showPetForm = false" class="btn-close">&times;</button>
            </div>

            <form @submit.prevent="handleSavePet" class="pet-form">
              <div class="form-row">
                <div class="form-group">
                  <label>名称 *</label>
                  <input v-model="petForm.name" type="text" required />
                </div>

                <div class="form-group">
                  <label>分类 *</label>
                  <select v-model="petForm.category_id" required>
                    <option value="">请选择</option>
                    <option v-for="cat in petsStore.categories" :key="cat.id" :value="cat.id">
                      {{ cat.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>品种</label>
                  <input v-model="petForm.breed" type="text" />
                </div>

                <div class="form-group">
                  <label>年龄</label>
                  <input v-model.number="petForm.age" type="number" min="0" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>性别 *</label>
                  <select v-model="petForm.gender" required>
                    <option value="male">雄性</option>
                    <option value="female">雌性</option>
                    <option value="unknown">未知</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>状态 *</label>
                  <select v-model="petForm.status" required>
                    <option value="available">可领养</option>
                    <option value="pending">待审核</option>
                    <option value="adopted">已领养</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>图片URL</label>
                <input v-model="petForm.image_url" type="url" />
              </div>

              <div class="form-group">
                <label>描述</label>
                <textarea v-model="petForm.description" rows="3"></textarea>
              </div>

              <div class="form-group">
                <label>健康状况</label>
                <textarea v-model="petForm.health_status" rows="2"></textarea>
              </div>

              <div v-if="formError" class="error-message">{{ formError }}</div>

              <div class="form-actions">
                <button type="submit" :disabled="petsStore.loading" class="btn-primary">
                  {{ petsStore.loading ? '保存中...' : '保存' }}
                </button>
                <button type="button" @click="showPetForm = false" class="btn-secondary">
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- 领养申请管理 -->
      <div v-if="activeTab === 'applications'" class="tab-content">
        <div class="section-header">
          <h2>领养申请管理</h2>
        </div>

        <div v-if="applicationsStore.loading" class="loading">加载中...</div>

        <div v-else-if="applicationsStore.applications.length === 0" class="empty-state">
          暂无领养申请
        </div>

        <div v-else class="applications-list">
          <div
            v-for="app in applicationsStore.applications"
            :key="app.id"
            class="application-card"
          >
            <div class="app-header">
              <div class="app-info">
                <h3>{{ app.pet?.name }}</h3>
                <p class="applicant-info">
                  申请人: {{ app.user?.username }} ({{ app.user?.full_name || '未填写' }})
                </p>
                <p class="app-date">{{ formatDate(app.created_at) }}</p>
              </div>
              <div class="app-status" :class="app.status">
                {{ appStatusText(app.status) }}
              </div>
            </div>

            <div class="app-body">
              <div class="app-field">
                <strong>申请理由：</strong>
                <p>{{ app.reason }}</p>
              </div>

              <div v-if="app.living_situation" class="app-field">
                <strong>居住环境：</strong>
                <p>{{ app.living_situation }}</p>
              </div>

              <div v-if="app.experience" class="app-field">
                <strong>养宠经验：</strong>
                <p>{{ app.experience }}</p>
              </div>

              <div v-if="app.status === 'pending'" class="app-actions">
                <button @click="handleApproveApplication(app.id)" class="btn-approve">
                  批准
                </button>
                <button @click="handleRejectApplication(app.id)" class="btn-reject">
                  拒绝
                </button>
              </div>

              <div v-else-if="app.admin_notes" class="admin-notes">
                <strong>管理员备注：</strong>
                <p>{{ app.admin_notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePetsStore } from '@/stores/pets'
import { useApplicationsStore } from '@/stores/applications'

const router = useRouter()
const authStore = useAuthStore()
const petsStore = usePetsStore()
const applicationsStore = useApplicationsStore()

const activeTab = ref('pets')
const showPetForm = ref(false)
const editingPet = ref<any>(null)
const formError = ref('')

const petForm = reactive({
  name: '',
  category_id: '',
  breed: '',
  age: null as number | null,
  gender: 'unknown' as 'male' | 'female' | 'unknown',
  status: 'available' as 'available' | 'pending' | 'adopted',
  image_url: '',
  description: '',
  health_status: '',
})

onMounted(async () => {
  await petsStore.fetchCategories()
  await petsStore.fetchPets()
  await applicationsStore.fetchAllApplications()
})

function handleEditPet(pet: any) {
  editingPet.value = pet
  petForm.name = pet.name
  petForm.category_id = pet.category_id || ''
  petForm.breed = pet.breed || ''
  petForm.age = pet.age
  petForm.gender = pet.gender
  petForm.status = pet.status
  petForm.image_url = pet.image_url || ''
  petForm.description = pet.description || ''
  petForm.health_status = pet.health_status || ''
  showPetForm.value = true
}

async function handleSavePet() {
  formError.value = ''

  if (!authStore.user) return

  const petData = {
    name: petForm.name,
    category_id: petForm.category_id || null,
    breed: petForm.breed || null,
    age: petForm.age,
    gender: petForm.gender,
    status: petForm.status,
    image_url: petForm.image_url || null,
    description: petForm.description || null,
    health_status: petForm.health_status || null,
    created_by: authStore.user.id,
  }

  let result
  if (editingPet.value) {
    result = await petsStore.updatePet(editingPet.value.id, petData)
  } else {
    result = await petsStore.createPet(petData)
  }

  if (result.success) {
    showPetForm.value = false
    resetPetForm()
  } else {
    formError.value = result.error || '保存失败'
  }
}

async function handleDeletePet(petId: string) {
  if (!confirm('确定要删除这只宠物吗？')) return

  const result = await petsStore.deletePet(petId)
  if (!result.success) {
    alert('删除失败: ' + result.error)
  }
}

async function handleApproveApplication(appId: string) {
  const notes = prompt('请输入批准备注（可选）:')
  const result = await applicationsStore.updateApplicationStatus(appId, 'approved', notes || undefined)

  if (result.success) {
    await applicationsStore.fetchAllApplications()
    alert('申请已批准')
  } else {
    alert('操作失败: ' + result.error)
  }
}

async function handleRejectApplication(appId: string) {
  const notes = prompt('请输入拒绝理由:')
  if (!notes) return

  const result = await applicationsStore.updateApplicationStatus(appId, 'rejected', notes)

  if (result.success) {
    await applicationsStore.fetchAllApplications()
    alert('申请已拒绝')
  } else {
    alert('操作失败: ' + result.error)
  }
}

function resetPetForm() {
  editingPet.value = null
  petForm.name = ''
  petForm.category_id = ''
  petForm.breed = ''
  petForm.age = null
  petForm.gender = 'unknown'
  petForm.status = 'available'
  petForm.image_url = ''
  petForm.description = ''
  petForm.health_status = ''
}

function statusText(status: string) {
  const map: Record<string, string> = {
    available: '可领养',
    pending: '待审核',
    adopted: '已领养',
  }
  return map[status] || status
}

function appStatusText(status: string) {
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
.admin-container {
  min-height: 100vh;
  min-width: 100vw;
  width: 100%;
  background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
  background-attachment: fixed;
  padding: 20px;
  position: relative;
}

.back-button {
  max-width: 1400px;
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

.admin-content {
  max-width: 1400px;
  margin: 0 auto;
}

.admin-header {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.admin-header h1 {
  font-size: 28px;
  color: #333;
}

.admin-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 12px 30px;
  border: none;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-btn:hover {
  background: #f5f5f5;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.tab-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.section-header h2 {
  font-size: 22px;
  color: #333;
}

.btn-primary {
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 10px 24px;
  background: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.loading,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
}

.pets-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f9f9f9;
}

th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #e0e0e0;
}

td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.pet-thumbnail {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: white;
}

.status-badge.available {
  background: #52c41a;
}

.status-badge.pending {
  background: #faad14;
}

.status-badge.adopted {
  background: #999;
}

.btn-edit,
.btn-delete {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  margin-right: 5px;
  transition: opacity 0.3s;
}

.btn-edit {
  background: #1890ff;
  color: white;
}

.btn-delete {
  background: #f5222d;
  color: white;
}

.btn-edit:hover,
.btn-delete:hover {
  opacity: 0.8;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  font-size: 20px;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 32px;
  color: #999;
  cursor: pointer;
  line-height: 1;
  transition: color 0.3s;
}

.btn-close:hover {
  color: #333;
}

.pet-form {
  padding: 30px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  background: #fff1f0;
  color: #f5222d;
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 14px;
  border: 1px solid #ffa39e;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 25px;
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
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  background: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
}

.app-info h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
}

.applicant-info {
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
}

.app-date {
  color: #999;
  font-size: 13px;
}

.app-status {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: white;
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

.app-body {
  padding: 20px;
}

.app-field {
  margin-bottom: 15px;
}

.app-field strong {
  display: block;
  color: #555;
  margin-bottom: 5px;
  font-size: 14px;
}

.app-field p {
  color: #333;
  line-height: 1.6;
  font-size: 15px;
}

.app-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.btn-approve,
.btn-reject {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}

.btn-approve {
  background: #52c41a;
  color: white;
}

.btn-reject {
  background: #f5222d;
  color: white;
}

.btn-approve:hover,
.btn-reject:hover {
  opacity: 0.9;
}

.admin-notes {
  background: #fff7e6;
  padding: 15px;
  border-radius: 8px;
  border-left: 3px solid #faad14;
  margin-top: 15px;
}

.admin-notes strong {
  display: block;
  color: #d48806;
  margin-bottom: 8px;
  font-size: 14px;
}

.admin-notes p {
  color: #595959;
  line-height: 1.6;
}
</style>
