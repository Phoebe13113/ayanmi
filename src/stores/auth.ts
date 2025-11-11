import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const userProfile = ref<any>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => userProfile.value?.is_admin || false)

  // 初始化认证状态
  async function initAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        user.value = session.user
        await fetchUserProfile()
      }
    } catch (error) {
      console.error('初始化认证失败:', error)
    }
  }

  // 获取用户资料
  async function fetchUserProfile() {
    if (!user.value) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (error) throw error
      userProfile.value = data
    } catch (error) {
      console.error('获取用户资料失败:', error)
    }
  }

  // 注册
  async function signUp(email: string, password: string, username: string, fullName?: string) {
    loading.value = true
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      })

      if (authError) throw authError

      if (authData.user) {
        // 创建用户资料
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            username,
            full_name: fullName || null
          })

        if (profileError) throw profileError

        user.value = authData.user
        await fetchUserProfile()
      }

      return { success: true, error: null }
    } catch (error: any) {
      console.error('注册失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 登录
  async function signIn(email: string, password: string) {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      user.value = data.user
      await fetchUserProfile()

      return { success: true, error: null }
    } catch (error: any) {
      console.error('登录失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 登出
  async function signOut() {
    loading.value = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      user.value = null
      userProfile.value = null

      return { success: true, error: null }
    } catch (error: any) {
      console.error('登出失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 更新用户资料
  async function updateProfile(updates: any) {
    if (!user.value) return { success: false, error: '未登录' }

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.value.id)
        .select()
        .single()

      if (error) throw error

      userProfile.value = data
      return { success: true, error: null }
    } catch (error: any) {
      console.error('更新资料失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    userProfile,
    loading,
    isAuthenticated,
    isAdmin,
    initAuth,
    fetchUserProfile,
    signUp,
    signIn,
    signOut,
    updateProfile
  }
})
