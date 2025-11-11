import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export interface Pet {
  id: string
  name: string
  category_id: string | null
  age: number | null
  gender: 'male' | 'female' | 'unknown'
  breed: string | null
  description: string | null
  health_status: string | null
  image_url: string | null
  status: 'available' | 'pending' | 'adopted'
  created_by: string | null
  created_at: string
  updated_at: string
  category?: {
    id: string
    name: string
    description: string | null
  }
}

export const usePetsStore = defineStore('pets', () => {
  const pets = ref<Pet[]>([])
  const currentPet = ref<Pet | null>(null)
  const loading = ref(false)
  const categories = ref<any[]>([])

  // 获取所有宠物
  async function fetchPets(filters?: { category?: string; status?: string; search?: string }) {
    loading.value = true
    try {
      let query = supabase
        .from('pets')
        .select('*, category:pet_categories(*)')
        .order('created_at', { ascending: false })

      if (filters?.category) {
        query = query.eq('category_id', filters.category)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,breed.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error

      pets.value = data || []
      return { success: true, error: null }
    } catch (error: any) {
      console.error('获取宠物列表失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 获取单个宠物详情
  async function fetchPetById(id: string) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*, category:pet_categories(*)')
        .eq('id', id)
        .single()

      if (error) throw error

      currentPet.value = data
      return { success: true, error: null }
    } catch (error: any) {
      console.error('获取宠物详情失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 获取分类列表
  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('pet_categories')
        .select('*')
        .order('name')

      if (error) throw error

      categories.value = data || []
      return { success: true, error: null }
    } catch (error: any) {
      console.error('获取分类列表失败:', error)
      return { success: false, error: error.message }
    }
  }

  // 创建宠物（管理员）
  async function createPet(petData: any) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('pets')
        .insert(petData)
        .select()
        .single()

      if (error) throw error

      await fetchPets()
      return { success: true, data, error: null }
    } catch (error: any) {
      console.error('创建宠物失败:', error)
      return { success: false, data: null, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 更新宠物（管理员）
  async function updatePet(id: string, updates: any) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('pets')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await fetchPets()
      return { success: true, data, error: null }
    } catch (error: any) {
      console.error('更新宠物失败:', error)
      return { success: false, data: null, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 删除宠物（管理员）
  async function deletePet(id: string) {
    loading.value = true
    try {
      const { error } = await supabase.from('pets').delete().eq('id', id)

      if (error) throw error

      await fetchPets()
      return { success: true, error: null }
    } catch (error: any) {
      console.error('删除宠物失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  return {
    pets,
    currentPet,
    loading,
    categories,
    fetchPets,
    fetchPetById,
    fetchCategories,
    createPet,
    updatePet,
    deletePet,
  }
})
