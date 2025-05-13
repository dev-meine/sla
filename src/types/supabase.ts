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
          image: string | null
          sport: string | null
          bio: string | null
          nationality: string | null
          date_of_birth: string | null
          club: string | null
          coach: string | null
          training_base: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          image?: string | null
          sport?: string | null
          bio?: string | null
          nationality?: string | null
          date_of_birth?: string | null
          club?: string | null
          coach?: string | null
          training_base?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          image?: string | null
          sport?: string | null
          bio?: string | null
          nationality?: string | null
          date_of_birth?: string | null
          club?: string | null
          coach?: string | null
          training_base?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      travel_record_athletes: {
        Row: {
          id: string
          travel_record_id: string
          athlete_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          travel_record_id: string
          athlete_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          travel_record_id?: string
          athlete_id?: string
          created_at?: string | null
        }
      }
      travel_record_staff: {
        Row: {
          id: string
          travel_record_id: string
          staff_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          travel_record_id: string
          staff_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          travel_record_id?: string
          staff_id?: string
          created_at?: string | null
        }
      }
      travel_record_board_members: {
        Row: {
          id: string
          travel_record_id: string
          board_member_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          travel_record_id: string
          board_member_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          travel_record_id?: string
          board_member_id?: string
          created_at?: string | null
        }
      }
      technical_staff: {
        Row: {
          id: string
          name: string
          role: string
          specialization: string | null
          image: string | null
          bio: string | null
          qualifications: string | null
          experience: string | null
          email: string | null
          phone: string | null
          start_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          role: string
          specialization?: string | null
          image?: string | null
          bio?: string | null
          qualifications?: string | null
          experience?: string | null
          email?: string | null
          phone?: string | null
          start_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          role?: string
          specialization?: string | null
          image?: string | null
          bio?: string | null
          qualifications?: string | null
          experience?: string | null
          email?: string | null
          phone?: string | null
          start_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      // ... rest of the existing types
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
  }
}