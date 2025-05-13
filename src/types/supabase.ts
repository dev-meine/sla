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
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          image: string | null
          category: string | null
          date: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          image?: string | null
          category?: string | null
          date?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          image?: string | null
          category?: string | null
          date?: string | null
          created_at?: string | null
        }
      }
      specialties: {
        Row: {
          id: number
          athlete_id: string
          specialty: string
        }
        Insert: {
          id?: number
          athlete_id: string
          specialty: string
        }
        Update: {
          id?: number
          athlete_id?: string
          specialty?: string
        }
      }
      records: {
        Row: {
          id: number
          athlete_id: string
          record: string
        }
        Insert: {
          id?: number
          athlete_id: string
          record: string
        }
        Update: {
          id?: number
          athlete_id?: string
          record?: string
        }
      }
      achievements: {
        Row: {
          id: number
          athlete_id: string
          achievement: string
        }
        Insert: {
          id?: number
          athlete_id: string
          achievement: string
        }
        Update: {
          id?: number
          athlete_id?: string
          achievement?: string
        }
      }
      personal_bests: {
        Row: {
          id: number
          athlete_id: string
          event: string
          time: string
          date: string
          location: string
        }
        Insert: {
          id?: number
          athlete_id: string
          event: string
          time: string
          date: string
          location: string
        }
        Update: {
          id?: number
          athlete_id?: string
          event?: string
          time?: string
          date?: string
          location?: string
        }
      }
      travel_records: {
        Row: {
          id: string
          athlete_id: string | null
          event_id: string | null
          departure_date: string
          return_date: string
          destination: string
          accommodation: string | null
          travel_details: string | null
          status: string
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          athlete_id?: string | null
          event_id?: string | null
          departure_date: string
          return_date: string
          destination: string
          accommodation?: string | null
          travel_details?: string | null
          status?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          athlete_id?: string | null
          event_id?: string | null
          departure_date?: string
          return_date?: string
          destination?: string
          accommodation?: string | null
          travel_details?: string | null
          status?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      flights: {
        Row: {
          id: string
          airline: string
          flight_number: string
          departure_airport: string
          arrival_airport: string
          departure_time: string
          arrival_time: string
          price: number | null
          booking_status: string
          travel_record_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          airline: string
          flight_number: string
          departure_airport: string
          arrival_airport: string
          departure_time: string
          arrival_time: string
          price?: number | null
          booking_status?: string
          travel_record_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          airline?: string
          flight_number?: string
          departure_airport?: string
          arrival_airport?: string
          departure_time?: string
          arrival_time?: string
          price?: number | null
          booking_status?: string
          travel_record_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      ferry_schedules: {
        Row: {
          id: string
          operator: string
          route: string
          departure_port: string
          arrival_port: string
          departure_time: string
          arrival_time: string
          price: number | null
          booking_status: string
          travel_record_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          operator: string
          route: string
          departure_port: string
          arrival_port: string
          departure_time: string
          arrival_time: string
          price?: number | null
          booking_status?: string
          travel_record_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          operator?: string
          route?: string
          departure_port?: string
          arrival_port?: string
          departure_time?: string
          arrival_time?: string
          price?: number | null
          booking_status?: string
          travel_record_id?: string | null
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