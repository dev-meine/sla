export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      athletes: {
        Row: {
          id: string
          name: string
          nickname: string | null
          image: string | null
          sport: string | null
          bio: string | null
          nationality: string | null
          date_of_birth: string | null
          club: string | null
          coach: string | null
          training_base: string | null
          height_meters: number | null
          weight_kg: number | null
          place_of_birth: string | null
          personal_bests: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          nickname?: string | null
          image?: string | null
          sport?: string | null
          bio?: string | null
          nationality?: string | null
          date_of_birth?: string | null
          club?: string | null
          coach?: string | null
          training_base?: string | null
          height_meters?: number | null
          weight_kg?: number | null
          place_of_birth?: string | null
          personal_bests?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          nickname?: string | null
          image?: string | null
          sport?: string | null
          bio?: string | null
          nationality?: string | null
          date_of_birth?: string | null
          club?: string | null
          coach?: string | null
          training_base?: string | null
          height_meters?: number | null
          weight_kg?: number | null
          place_of_birth?: string | null
          personal_bests?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      swimming_packages: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          duration_weeks: number | null
          sessions_per_week: number | null
          max_participants: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          duration_weeks?: number | null
          sessions_per_week?: number | null
          max_participants?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          duration_weeks?: number | null
          sessions_per_week?: number | null
          max_participants?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      swimming_registrations: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          package_id: string
          transaction_id: string
          status: string | null
          tutor_name: string | null
          class_date: string | null
          class_time: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          package_id: string
          transaction_id: string
          status?: string | null
          tutor_name?: string | null
          class_date?: string | null
          class_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          package_id?: string
          transaction_id?: string
          status?: string | null
          tutor_name?: string | null
          class_date?: string | null
          class_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "swimming_registrations_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "swimming_packages"
            referencedColumns: ["id"]
          }
        ]
      }
      reschedule_requests: {
        Row: {
          id: string
          registration_id: string
          requested_date: string
          requested_time: string
          reason: string
          status: string
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          registration_id: string
          requested_date: string
          requested_time: string
          reason: string
          status?: string
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          registration_id?: string
          requested_date?: string
          requested_time?: string
          reason?: string
          status?: string
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reschedule_requests_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "swimming_registrations"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}