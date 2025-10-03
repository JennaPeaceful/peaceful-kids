export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          name: string
          sort_order: number | null
          thumbnail_png_url: string | null
          thumbnail_svg_url: string | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          name: string
          sort_order?: number | null
          thumbnail_png_url?: string | null
          thumbnail_svg_url?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          name?: string
          sort_order?: number | null
          thumbnail_png_url?: string | null
          thumbnail_svg_url?: string | null
        }
        Relationships: []
      }
      content_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          sort_order: number | null
          thumbnail_png_url: string | null
          thumbnail_svg_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          sort_order?: number | null
          thumbnail_png_url?: string | null
          thumbnail_svg_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          thumbnail_png_url?: string | null
          thumbnail_svg_url?: string | null
        }
        Relationships: []
      }
      meditation_usage: {
        Row: {
          completed: boolean | null
          created_at: string | null
          device_type: string | null
          duration_seconds: number | null
          id: string
          meditation_id: string | null
          started_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          meditation_id?: string | null
          started_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          meditation_id?: string | null
          started_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meditation_usage_meditation_id_fkey"
            columns: ["meditation_id"]
            isOneToOne: false
            referencedRelation: "meditations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meditation_usage_meditation_id_fkey"
            columns: ["meditation_id"]
            isOneToOne: false
            referencedRelation: "meditations_adults"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meditation_usage_meditation_id_fkey"
            columns: ["meditation_id"]
            isOneToOne: false
            referencedRelation: "meditations_by_age"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meditation_usage_meditation_id_fkey"
            columns: ["meditation_id"]
            isOneToOne: false
            referencedRelation: "meditations_kids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meditation_usage_meditation_id_fkey"
            columns: ["meditation_id"]
            isOneToOne: false
            referencedRelation: "meditations_missing_thumbnails"
            referencedColumns: ["id"]
          },
        ]
      }
      meditations: {
        Row: {
          age_group: string | null
          categories: string[] | null
          category: string | null
          content_categories: string[] | null
          courses: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          featured_for_plan: string[] | null
          google_drive_id: string | null
          id: string
          is_free: boolean | null
          max_age: number | null
          media_type: string | null
          media_url: string | null
          min_age: number | null
          primary_content_category: string | null
          public_title: string | null
          sort_order: number | null
          target_audience: string[] | null
          themes: string[] | null
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          age_group?: string | null
          categories?: string[] | null
          category?: string | null
          content_categories?: string[] | null
          courses?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          featured_for_plan?: string[] | null
          google_drive_id?: string | null
          id?: string
          is_free?: boolean | null
          max_age?: number | null
          media_type?: string | null
          media_url?: string | null
          min_age?: number | null
          primary_content_category?: string | null
          public_title?: string | null
          sort_order?: number | null
          target_audience?: string[] | null
          themes?: string[] | null
          thumbnail_url?: string | null
          title: string
        }
        Update: {
          age_group?: string | null
          categories?: string[] | null
          category?: string | null
          content_categories?: string[] | null
          courses?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          featured_for_plan?: string[] | null
          google_drive_id?: string | null
          id?: string
          is_free?: boolean | null
          max_age?: number | null
          media_type?: string | null
          media_url?: string | null
          min_age?: number | null
          primary_content_category?: string | null
          public_title?: string | null
          sort_order?: number | null
          target_audience?: string[] | null
          themes?: string[] | null
          thumbnail_url?: string | null
          title?: string
        }
        Relationships: []
      }
      themes: {
        Row: {
          category: string[] | null
          color: string | null
          created_at: string | null
          icon: string | null
          icon_png_url: string | null
          icon_svg_url: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          category?: string[] | null
          color?: string | null
          created_at?: string | null
          icon?: string | null
          icon_png_url?: string | null
          icon_svg_url?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          category?: string[] | null
          color?: string | null
          created_at?: string | null
          icon?: string | null
          icon_png_url?: string | null
          icon_svg_url?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          meditation_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meditation_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meditation_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_meditation_id_fkey"
            columns: ["meditation_id"]
            isOneToOne: false
            referencedRelation: "meditations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_meditation_id_fkey"
            columns: ["meditation_id"]
            isOneToOne: false
            referencedRelation: "meditations_adults"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_meditation_id_fkey"
            columns: ["meditation_id"]
            isOneToOne: false
            referencedRelation: "meditations_by_age"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_meditation_id_fkey"
            columns: ["meditation_id"]
            isOneToOne: false
            referencedRelation: "meditations_kids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_meditation_id_fkey"
            columns: ["meditation_id"]
            isOneToOne: false
            referencedRelation: "meditations_missing_thumbnails"
            referencedColumns: ["id"]
          },
        ]
      }
      user_flags: {
        Row: {
          created_at: string | null
          flags: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          flags?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          flags?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          language: string | null
          notification_settings: Json | null
          preferred_age_group: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string | null
          notification_settings?: Json | null
          preferred_age_group?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string | null
          notification_settings?: Json | null
          preferred_age_group?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          category_preference: string | null
          created_at: string | null
          display_name: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          category_preference?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          category_preference?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed_at: string | null
          id: string
          is_completed: boolean | null
          meditation_id: string | null
          progress_seconds: number | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          meditation_id?: string | null
          progress_seconds?: number | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          meditation_id?: string | null
          progress_seconds?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_meditation_id_fkey"
            columns: ["meditation_id"]
            isOneToOne: false
            referencedRelation: "meditations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_meditation_id_fkey"
            columns: ["meditation_id"]
            isOneToOne: false
            referencedRelation: "meditations_adults"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_meditation_id_fkey"
            columns: ["meditation_id"]
            isOneToOne: false
            referencedRelation: "meditations_by_age"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_meditation_id_fkey"
            columns: ["meditation_id"]
            isOneToOne: false
            referencedRelation: "meditations_kids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_meditation_id_fkey"
            columns: ["meditation_id"]
            isOneToOne: false
            referencedRelation: "meditations_missing_thumbnails"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          plan_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          plan_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          plan_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      adults_themes: {
        Row: {
          category: string[] | null
          color: string | null
          created_at: string | null
          icon: string | null
          id: string | null
          name: string | null
          sort_order: number | null
        }
        Insert: {
          category?: string[] | null
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string | null
          name?: string | null
          sort_order?: number | null
        }
        Update: {
          category?: string[] | null
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string | null
          name?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      kids_themes: {
        Row: {
          category: string[] | null
          color: string | null
          created_at: string | null
          icon: string | null
          id: string | null
          name: string | null
          sort_order: number | null
        }
        Insert: {
          category?: string[] | null
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string | null
          name?: string | null
          sort_order?: number | null
        }
        Update: {
          category?: string[] | null
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string | null
          name?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      meditations_adults: {
        Row: {
          age_group: string | null
          categories: string[] | null
          category: string | null
          content_categories: string[] | null
          created_at: string | null
          description: string | null
          duration: number | null
          google_drive_id: string | null
          id: string | null
          is_free: boolean | null
          max_age: number | null
          media_type: string | null
          media_url: string | null
          min_age: number | null
          sort_order: number | null
          target_audience: string[] | null
          themes: string[] | null
          thumbnail_url: string | null
          title: string | null
        }
        Insert: {
          age_group?: string | null
          categories?: string[] | null
          category?: string | null
          content_categories?: string[] | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          google_drive_id?: string | null
          id?: string | null
          is_free?: boolean | null
          max_age?: number | null
          media_type?: string | null
          media_url?: string | null
          min_age?: number | null
          sort_order?: number | null
          target_audience?: string[] | null
          themes?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
        }
        Update: {
          age_group?: string | null
          categories?: string[] | null
          category?: string | null
          content_categories?: string[] | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          google_drive_id?: string | null
          id?: string | null
          is_free?: boolean | null
          max_age?: number | null
          media_type?: string | null
          media_url?: string | null
          min_age?: number | null
          sort_order?: number | null
          target_audience?: string[] | null
          themes?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
        }
        Relationships: []
      }
      meditations_by_age: {
        Row: {
          age_display: string | null
          age_group: string | null
          categories: string[] | null
          category: string | null
          content_categories: string[] | null
          created_at: string | null
          description: string | null
          duration: number | null
          google_drive_id: string | null
          id: string | null
          is_free: boolean | null
          max_age: number | null
          media_type: string | null
          media_url: string | null
          min_age: number | null
          sort_order: number | null
          target_audience: string[] | null
          themes: string[] | null
          thumbnail_url: string | null
          title: string | null
        }
        Insert: {
          age_display?: never
          age_group?: string | null
          categories?: string[] | null
          category?: string | null
          content_categories?: string[] | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          google_drive_id?: string | null
          id?: string | null
          is_free?: boolean | null
          max_age?: number | null
          media_type?: string | null
          media_url?: string | null
          min_age?: number | null
          sort_order?: number | null
          target_audience?: string[] | null
          themes?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
        }
        Update: {
          age_display?: never
          age_group?: string | null
          categories?: string[] | null
          category?: string | null
          content_categories?: string[] | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          google_drive_id?: string | null
          id?: string | null
          is_free?: boolean | null
          max_age?: number | null
          media_type?: string | null
          media_url?: string | null
          min_age?: number | null
          sort_order?: number | null
          target_audience?: string[] | null
          themes?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
        }
        Relationships: []
      }
      meditations_kids: {
        Row: {
          age_group: string | null
          categories: string[] | null
          category: string | null
          content_categories: string[] | null
          created_at: string | null
          description: string | null
          duration: number | null
          google_drive_id: string | null
          id: string | null
          is_free: boolean | null
          max_age: number | null
          media_type: string | null
          media_url: string | null
          min_age: number | null
          sort_order: number | null
          target_audience: string[] | null
          themes: string[] | null
          thumbnail_url: string | null
          title: string | null
        }
        Insert: {
          age_group?: string | null
          categories?: string[] | null
          category?: string | null
          content_categories?: string[] | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          google_drive_id?: string | null
          id?: string | null
          is_free?: boolean | null
          max_age?: number | null
          media_type?: string | null
          media_url?: string | null
          min_age?: number | null
          sort_order?: number | null
          target_audience?: string[] | null
          themes?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
        }
        Update: {
          age_group?: string | null
          categories?: string[] | null
          category?: string | null
          content_categories?: string[] | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          google_drive_id?: string | null
          id?: string | null
          is_free?: boolean | null
          max_age?: number | null
          media_type?: string | null
          media_url?: string | null
          min_age?: number | null
          sort_order?: number | null
          target_audience?: string[] | null
          themes?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
        }
        Relationships: []
      }
      meditations_missing_thumbnails: {
        Row: {
          category: string | null
          courses: string | null
          created_at: string | null
          google_drive_id: string | null
          id: string | null
          is_free: boolean | null
          media_type: string | null
          primary_content_category: string | null
          thumbnail_url: string | null
          title: string | null
        }
        Insert: {
          category?: string | null
          courses?: string | null
          created_at?: string | null
          google_drive_id?: string | null
          id?: string | null
          is_free?: boolean | null
          media_type?: string | null
          primary_content_category?: string | null
          thumbnail_url?: string | null
          title?: string | null
        }
        Update: {
          category?: string | null
          courses?: string | null
          created_at?: string | null
          google_drive_id?: string | null
          id?: string | null
          is_free?: boolean | null
          media_type?: string | null
          primary_content_category?: string | null
          thumbnail_url?: string | null
          title?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_meditations_for_age: {
        Args: { user_age: number }
        Returns: {
          age_group: string | null
          categories: string[] | null
          category: string | null
          content_categories: string[] | null
          courses: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          featured_for_plan: string[] | null
          google_drive_id: string | null
          id: string
          is_free: boolean | null
          max_age: number | null
          media_type: string | null
          media_url: string | null
          min_age: number | null
          primary_content_category: string | null
          public_title: string | null
          sort_order: number | null
          target_audience: string[] | null
          themes: string[] | null
          thumbnail_url: string | null
          title: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
