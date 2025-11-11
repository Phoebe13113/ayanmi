import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('缺少 Supabase 环境变量')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 定义数据库类型
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          full_name: string | null
          phone: string | null
          address: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pet_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      pets: {
        Row: {
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
        }
        Insert: {
          id?: string
          name: string
          category_id?: string | null
          age?: number | null
          gender?: 'male' | 'female' | 'unknown'
          breed?: string | null
          description?: string | null
          health_status?: string | null
          image_url?: string | null
          status?: 'available' | 'pending' | 'adopted'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category_id?: string | null
          age?: number | null
          gender?: 'male' | 'female' | 'unknown'
          breed?: string | null
          description?: string | null
          health_status?: string | null
          image_url?: string | null
          status?: 'available' | 'pending' | 'adopted'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      adoption_applications: {
        Row: {
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
        }
        Insert: {
          id?: string
          pet_id: string
          user_id: string
          reason: string
          living_situation?: string | null
          experience?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pet_id?: string
          user_id?: string
          reason?: string
          living_situation?: string | null
          experience?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
