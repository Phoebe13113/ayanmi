import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export interface AdoptionApplication {
  id: string
  pet_id: string
  user_id: string
  reason: string
  living_situation: string | null
  experience: string | null
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  created_at: string
  updated_at: string
  pet?: any
  user?: any
}

export const useApplicationsStore = defineStore('applications', () => {
  const applications = ref<AdoptionApplication[]>([])
  const loading = ref(false)

  // 创建领养申请
  async function createApplication(applicationData: {
    pet_id: string
    user_id: string
    reason: string
    living_situation?: string
    experience?: string
  }) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('adoption_applications')
        .insert(applicationData)
        .select()
        .single()

      if (error) throw error

      // 申请创建成功后，将宠物状态更新为待审核
      await supabase
        .from('pets')
        .update({ status: 'pending' })
        .eq('id', applicationData.pet_id)

      return { success: true, data, error: null }
    } catch (error: any) {
      console.error('创建申请失败:', error)
      return { success: false, data: null, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 获取用户的所有申请
  async function fetchUserApplications(userId: string) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('adoption_applications')
        .select('*, pet:pets(*, category:pet_categories(*))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      applications.value = data || []
      return { success: true, error: null }
    } catch (error: any) {
      console.error('获取申请列表失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 获取所有申请（管理员）
  async function fetchAllApplications() {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('adoption_applications')
        .select('*, pet:pets(*), user:users(*)')
        .order('created_at', { ascending: false })

      if (error) throw error

      applications.value = data || []
      return { success: true, error: null }
    } catch (error: any) {
      console.error('获取所有申请失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 更新申请状态（管理员）
  async function updateApplicationStatus(
    id: string,
    status: 'approved' | 'rejected',
    adminNotes?: string
  ) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('adoption_applications')
        .update({
          status,
          admin_notes: adminNotes,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // 根据审核结果更新宠物状态
      if (data) {
        if (status === 'approved') {
          // 如果批准了申请，更新宠物状态为已领养
          await supabase
            .from('pets')
            .update({ status: 'adopted' })
            .eq('id', data.pet_id)
        } else if (status === 'rejected') {
          // 如果拒绝了申请，将宠物状态恢复为可领养
          await supabase
            .from('pets')
            .update({ status: 'available' })
            .eq('id', data.pet_id)
        }
      }

      return { success: true, data, error: null }
    } catch (error: any) {
      console.error('更新申请状态失败:', error)
      return { success: false, data: null, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 检查用户是否已经申请过某个宠物
  async function checkExistingApplication(petId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('adoption_applications')
        .select('*')
        .eq('pet_id', petId)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .maybeSingle()

      if (error) throw error

      return { exists: !!data, data }
    } catch (error: any) {
      console.error('检查申请失败:', error)
      return { exists: false, data: null }
    }
  }

  return {
    applications,
    loading,
    createApplication,
    fetchUserApplications,
    fetchAllApplications,
    updateApplicationStatus,
    checkExistingApplication,
  }
})
