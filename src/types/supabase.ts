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