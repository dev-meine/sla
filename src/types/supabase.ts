export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement: string
          athlete_id: string | null
          id: number
        }
        Insert: {
          achievement: string
          athlete_id?: string | null
          id?: number
        }
        Update: {
          achievement?: string
          athlete_id?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "achievements_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      activities: {
        Row: {
          category: string
          created_at: string | null
          date: string
          description: string | null
          id: string
          image_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          is_super_admin: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_super_admin?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_super_admin?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      anonymous_reports: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          report_content: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          report_content: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          report_content?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      athlete_caps: {
        Row: {
          athlete_id: string | null
          competition_name: string
          created_at: string | null
          id: string
          location: string
          updated_at: string | null
          year: number
        }
        Insert: {
          athlete_id?: string | null
          competition_name: string
          created_at?: string | null
          id?: string
          location: string
          updated_at?: string | null
          year: number
        }
        Update: {
          athlete_id?: string | null
          competition_name?: string
          created_at?: string | null
          id?: string
          location?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "athlete_caps_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_records: {
        Row: {
          athlete_id: string | null
          created_at: string | null
          date: string | null
          id: string
          record: string
          updated_at: string | null
        }
        Insert: {
          athlete_id?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          record: string
          updated_at?: string | null
        }
        Update: {
          athlete_id?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          record?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_records_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_specialties: {
        Row: {
          athlete_id: string | null
          created_at: string | null
          id: string
          specialty: string
          updated_at: string | null
        }
        Insert: {
          athlete_id?: string | null
          created_at?: string | null
          id?: string
          specialty: string
          updated_at?: string | null
        }
        Update: {
          athlete_id?: string | null
          created_at?: string | null
          id?: string
          specialty?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_specialties_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      athletes: {
        Row: {
          bio: string | null
          caps: string | null
          club: string | null
          coach: string | null
          created_at: string | null
          date_of_birth: string | null
          height_meters: number | null
          id: string
          image: string | null
          name: string
          nationality: string | null
          nickname: string | null
          personal_bests: string | null
          place_of_birth: string | null
          specialties: string | null
          sport: string | null
          training_base: string | null
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          bio?: string | null
          caps?: string | null
          club?: string | null
          coach?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          height_meters?: number | null
          id?: string
          image?: string | null
          name: string
          nationality?: string | null
          nickname?: string | null
          personal_bests?: string | null
          place_of_birth?: string | null
          specialties?: string | null
          sport?: string | null
          training_base?: string | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          bio?: string | null
          caps?: string | null
          club?: string | null
          coach?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          height_meters?: number | null
          id?: string
          image?: string | null
          name?: string
          nationality?: string | null
          nickname?: string | null
          personal_bests?: string | null
          place_of_birth?: string | null
          specialties?: string | null
          sport?: string | null
          training_base?: string | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      board_members: {
        Row: {
          bio: string | null
          created_at: string | null
          id: string
          image: string | null
          name: string
          position: string
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          id?: string
          image?: string | null
          name: string
          position: string
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          id?: string
          image?: string | null
          name?: string
          position?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string | null
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          image: string | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          image?: string | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          image?: string | null
          title?: string
        }
        Relationships: []
      }
      ferry_schedules: {
        Row: {
          arrival_port: string
          arrival_time: string
          booking_status: string
          created_at: string | null
          departure_port: string
          departure_time: string
          id: string
          operator: string
          price: number | null
          route: string
          travel_record_id: string | null
          updated_at: string | null
        }
        Insert: {
          arrival_port: string
          arrival_time: string
          booking_status?: string
          created_at?: string | null
          departure_port: string
          departure_time: string
          id?: string
          operator: string
          price?: number | null
          route: string
          travel_record_id?: string | null
          updated_at?: string | null
        }
        Update: {
          arrival_port?: string
          arrival_time?: string
          booking_status?: string
          created_at?: string | null
          departure_port?: string
          departure_time?: string
          id?: string
          operator?: string
          price?: number | null
          route?: string
          travel_record_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ferry_schedules_travel_record_id_fkey"
            columns: ["travel_record_id"]
            isOneToOne: false
            referencedRelation: "travel_records"
            referencedColumns: ["id"]
          },
        ]
      }
      flights: {
        Row: {
          airline: string
          arrival_airport: string
          arrival_time: string
          booking_status: string
          created_at: string | null
          departure_airport: string
          departure_time: string
          flight_number: string
          id: string
          price: number | null
          travel_record_id: string | null
          updated_at: string | null
        }
        Insert: {
          airline: string
          arrival_airport: string
          arrival_time: string
          booking_status?: string
          created_at?: string | null
          departure_airport: string
          departure_time: string
          flight_number: string
          id?: string
          price?: number | null
          travel_record_id?: string | null
          updated_at?: string | null
        }
        Update: {
          airline?: string
          arrival_airport?: string
          arrival_time?: string
          booking_status?: string
          created_at?: string | null
          departure_airport?: string
          departure_time?: string
          flight_number?: string
          id?: string
          price?: number | null
          travel_record_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flights_travel_record_id_fkey"
            columns: ["travel_record_id"]
            isOneToOne: false
            referencedRelation: "travel_records"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_items: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          id: string
          title: string
          type: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          title: string
          type: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          title?: string
          type?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      news_posts: {
        Row: {
          author: string | null
          category: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          image_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      personal_bests: {
        Row: {
          athlete_id: string | null
          date: string
          event: string
          id: number
          location: string
          time: string
        }
        Insert: {
          athlete_id?: string | null
          date: string
          event: string
          id?: number
          location: string
          time: string
        }
        Update: {
          athlete_id?: string | null
          date?: string
          event?: string
          id?: number
          location?: string
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_bests_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      records: {
        Row: {
          athlete_id: string | null
          id: number
          record: string
        }
        Insert: {
          athlete_id?: string | null
          id?: number
          record: string
        }
        Update: {
          athlete_id?: string | null
          id?: number
          record?: string
        }
        Relationships: [
          {
            foreignKeyName: "records_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      reschedule_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          reason: string
          registration_id: string
          requested_date: string
          requested_time: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          reason: string
          registration_id: string
          requested_date: string
          requested_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          reason?: string
          registration_id?: string
          requested_date?: string
          requested_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reschedule_requests_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "swimming_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      specialties: {
        Row: {
          athlete_id: string | null
          id: number
          specialty: string
        }
        Insert: {
          athlete_id?: string | null
          id?: number
          specialty: string
        }
        Update: {
          athlete_id?: string | null
          id?: number
          specialty?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialties_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      swimming_packages: {
        Row: {
          created_at: string | null
          description: string | null
          duration_weeks: number | null
          id: string
          max_participants: number | null
          name: string
          price: number
          sessions_per_week: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_weeks?: number | null
          id?: string
          max_participants?: number | null
          name: string
          price: number
          sessions_per_week?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_weeks?: number | null
          id?: string
          max_participants?: number | null
          name?: string
          price?: number
          sessions_per_week?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      swimming_registrations: {
        Row: {
          class_date: string | null
          class_time: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          package_id: string
          phone: string | null
          status: string | null
          transaction_id: string
          tutor_name: string | null
          updated_at: string
        }
        Insert: {
          class_date?: string | null
          class_time?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          package_id: string
          phone?: string | null
          status?: string | null
          transaction_id: string
          tutor_name?: string | null
          updated_at?: string
        }
        Update: {
          class_date?: string | null
          class_time?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          package_id?: string
          phone?: string | null
          status?: string | null
          transaction_id?: string
          tutor_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "swimming_registrations_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "swimming_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_record_board_members: {
        Row: {
          board_member_id: string
          created_at: string | null
          id: string
          travel_record_id: string
        }
        Insert: {
          board_member_id: string
          created_at?: string | null
          id?: string
          travel_record_id: string
        }
        Update: {
          board_member_id?: string
          created_at?: string | null
          id?: string
          travel_record_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_record_board_members_board_member_id_fkey"
            columns: ["board_member_id"]
            isOneToOne: false
            referencedRelation: "board_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_record_board_members_travel_record_id_fkey"
            columns: ["travel_record_id"]
            isOneToOne: false
            referencedRelation: "travel_records"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_records: {
        Row: {
          created_at: string | null
          departure_date: string
          destination: string
          id: string
          notes: string | null
          purpose: string
          return_date: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          departure_date: string
          destination: string
          id?: string
          notes?: string | null
          purpose: string
          return_date?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          departure_date?: string
          destination?: string
          id?: string
          notes?: string | null
          purpose?: string
          return_date?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Row: infer R
    }
      ? R
      : never)
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
    ? (Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Row: infer R
      }
        ? R
        : never)
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
      ? I
      : never)
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
    ? (Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
        ? I
        : never)
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
      ? U
      : never)
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
    ? (Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
        ? U
        : never)
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof (Database["public"]["Enums"])
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicEnumNameOrOptions["schema"]]["Enums"])
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName])
  : PublicEnumNameOrOptions extends keyof (Database["public"]["Enums"])
    ? (Database["public"]["Enums"][PublicEnumNameOrOptions])
    : never