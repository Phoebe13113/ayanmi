<template>
  <div class="home-container">
    <header class="page-header">
      <div class="header-content">
        <h1>宠物领养平台</h1>
        <p>给流浪的小生命一个温暖的家</p>
      </div>

      <nav class="nav-bar">
        <div class="nav-left">
          <router-link to="/" class="nav-link active">首页</router-link>
          <router-link v-if="authStore.isAuthenticated" to="/profile" class="nav-link">
            我的申请
          </router-link>
          <router-link v-if="authStore.isAdmin" to="/admin" class="nav-link">
            管理后台
          </router-link>
        </div>
        <div class="nav-right">
          <button v-if="!authStore.isAuthenticated" @click="router.push('/login')" class="btn-login">
            登录/注册
          </button>
          <div v-else class="user-menu">
            <span>{{ authStore.userProfile?.username }}</span>
            <button @click="handleLogout" class="btn-logout">退出</button>
          </div>
        </div>
      </nav>
    </header>

    <div class="search-section">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="搜索宠物名称或品种..."
        />
      </div>

      <div class="filters">
        <select v-model="selectedCategory" @change="handleFilter">
          <option value="">所有分类</option>
          <option v-for="cat in petsStore.categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>

        <select v-model="selectedStatus" @change="handleFilter">
          <option value="">所有状态</option>
          <option value="available">可领养</option>
          <option value="pending">待审核</option>
          <option value="adopted">已领养</option>
        </select>
      </div>
    </div>

    <div class="pets-grid">
      <div v-if="petsStore.loading" class="loading">
        加载中...
      </div>

      <div v-else-if="petsStore.pets.length === 0" class="empty-state">
        暂无宠物数据
      </div>

      <div
        v-else
        v-for="pet in petsStore.pets"
        :key="pet.id"
        class="pet-card"
        @click="router.push(`/pets/${pet.id}`)"
      >
        <div class="pet-image">
          <img
            :src="pet.image_url || 'https://via.placeholder.com/300x200?text=No+Image'"
            :alt="pet.name"
          />
          <span class="pet-status" :class="pet.status">
            {{ statusText(pet.status) }}
          </span>
        </div>

        <div class="pet-info">
          <h3>{{ pet.name }}</h3>
          <div class="pet-details">
            <span v-if="pet.category">{{ pet.category.name }}</span>
            <span v-if="pet.breed">{{ pet.breed }}</span>
            <span v-if="pet.age">{{ pet.age }}岁</span>
            <span>{{ genderText(pet.gender) }}</span>
          </div>
          <p class="pet-description">
            {{ pet.description || '暂无描述' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePetsStore } from '@/stores/pets'

const router = useRouter()
const authStore = useAuthStore()
const petsStore = usePetsStore()

const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')

onMounted(async () => {
  await authStore.initAuth()
  await petsStore.fetchCategories()
  await petsStore.fetchPets()
})

function handleSearch() {
  handleFilter()
}

function handleFilter() {
  petsStore.fetchPets({
    search: searchQuery.value,
    category: selectedCategory.value,
    status: selectedStatus.value,
  })
}

async function handleLogout() {
  await authStore.signOut()
  router.push('/login')
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
.home-container {
  min-height: 100vh;
  min-width: 100vw;
  width: 100%;
  background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
  background-attachment: fixed;
  position: relative;
}

.page-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
  width: 100%;
}

.header-content {
  text-align: center;
  padding: 50px 20px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.header-content::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.header-content::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -5%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.header-content h1 {
  font-size: 42px;
  margin-bottom: 12px;
  font-weight: 700;
  position: relative;
  z-index: 1;
}

.header-content p {
  font-size: 18px;
  opacity: 0.95;
  position: relative;
  z-index: 1;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 60px;
  border-top: 1px solid #eee;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.nav-left, .nav-right {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.active {
  color: #667eea;
}

.btn-login,
.btn-logout {
  padding: 8px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-login {
  background: #667eea;
  color: white;
}

.btn-login:hover {
  background: #5568d3;
}

.btn-logout {
  background: #eee;
  color: #666;
}

.btn-logout:hover {
  background: #ddd;
}

.user-menu {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-section {
  max-width: 1400px;
  margin: 0 auto 30px;
  padding: 0 60px;
  width: 100%;
}

.search-bar input {
  width: 100%;
  padding: 16px 24px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 16px;
  margin-bottom: 15px;
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-bar input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  transform: translateY(-1px);
}

.filters {
  display: flex;
  gap: 15px;
}

.filters select {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filters select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.pets-grid {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 60px 60px 60px;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.loading,
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 18px;
}

.pet-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.pet-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.1);
}

.pet-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.pet-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pet-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 12px;
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

.pet-info {
  padding: 20px;
}

.pet-info h3 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #333;
}

.pet-details {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.pet-details span {
  padding: 4px 12px;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 13px;
  color: #666;
}

.pet-description {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .nav-bar,
  .search-section,
  .pets-grid {
    padding-left: 40px;
    padding-right: 40px;
  }
}

@media (max-width: 768px) {
  .nav-bar {
    padding: 15px 20px;
    flex-direction: column;
    gap: 15px;
  }

  .search-section,
  .pets-grid {
    padding-left: 20px;
    padding-right: 20px;
  }

  .pets-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    padding-bottom: 40px;
  }

  .header-content h1 {
    font-size: 32px;
  }
}

@media (max-width: 480px) {
  .pets-grid {
    grid-template-columns: 1fr;
  }

  .filters {
    flex-direction: column;
  }
}
</style>
