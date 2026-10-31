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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          id: string
          learning_day_id: string
          member_id: string
          mime_type: string
          size_bytes: number
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          learning_day_id: string
          member_id?: string
          mime_type: string
          size_bytes: number
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          learning_day_id?: string
          member_id?: string
          mime_type?: string
          size_bytes?: number
        }
        Relationships: [
          {
            foreignKeyName: "attachments_learning_day_id_fkey"
            columns: ["learning_day_id"]
            isOneToOne: false
            referencedRelation: "learning_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_days: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          estimated_minutes: number
          id: string
          position: number
          scheduled_date: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string
          estimated_minutes?: number
          id?: string
          position?: number
          scheduled_date: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          estimated_minutes?: number
          id?: string
          position?: number
          scheduled_date?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_days_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_days_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_resources: {
        Row: {
          added_by: string | null
          created_at: string
          day_id: string
          id: string
          resource_type: Database["public"]["Enums"]["resource_type"]
          title: string
          url: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          day_id: string
          id?: string
          resource_type?: Database["public"]["Enums"]["resource_type"]
          title: string
          url: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          day_id?: string
          id?: string
          resource_type?: Database["public"]["Enums"]["resource_type"]
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_resources_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_resources_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "learning_days"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_sessions: {
        Row: {
          accumulated_seconds: number
          created_at: string
          credited_date: string | null
          ended_at: string | null
          focused_seconds: number
          id: string
          learning_day_id: string | null
          member_id: string
          planned_seconds: number
          resumed_at: string | null
          started_at: string
          status: Database["public"]["Enums"]["session_status"]
          updated_at: string
        }
        Insert: {
          accumulated_seconds?: number
          created_at?: string
          credited_date?: string | null
          ended_at?: string | null
          focused_seconds?: number
          id?: string
          learning_day_id?: string | null
          member_id: string
          planned_seconds: number
          resumed_at?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          updated_at?: string
        }
        Update: {
          accumulated_seconds?: number
          created_at?: string
          credited_date?: string | null
          ended_at?: string | null
          focused_seconds?: number
          id?: string
          learning_day_id?: string | null
          member_id?: string
          planned_seconds?: number
          resumed_at?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_sessions_learning_day_id_fkey"
            columns: ["learning_day_id"]
            isOneToOne: false
            referencedRelation: "learning_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_sessions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_tasks: {
        Row: {
          created_at: string
          created_by: string | null
          day_id: string
          id: string
          position: number
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          day_id: string
          id?: string
          position?: number
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          day_id?: string
          id?: string
          position?: number
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_tasks_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "learning_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_tasks_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      member_task_progress: {
        Row: {
          completed_at: string | null
          id: string
          member_id: string
          status: Database["public"]["Enums"]["task_status"]
          task_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          member_id?: string
          status?: Database["public"]["Enums"]["task_status"]
          task_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          member_id?: string
          status?: Database["public"]["Enums"]["task_status"]
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_task_progress_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_task_progress_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "learning_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_notes: {
        Row: {
          body: string
          created_at: string
          id: string
          learning_day_id: string
          member_id: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          learning_day_id: string
          member_id?: string
          title?: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          learning_day_id?: string
          member_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_notes_learning_day_id_fkey"
            columns: ["learning_day_id"]
            isOneToOne: false
            referencedRelation: "learning_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_notes_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          is_claimed: boolean | null
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_claimed?: boolean | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_claimed?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      session_corrections: {
        Row: {
          created_at: string
          id: string
          member_id: string
          new_seconds: number
          previous_seconds: number
          reason: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_id: string
          new_seconds: number
          previous_seconds: number
          reason: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          member_id?: string
          new_seconds?: number
          previous_seconds?: number
          reason?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_corrections_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_corrections_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "learning_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_notes: {
        Row: {
          created_at: string
          duration_seconds: number
          file_name: string
          file_path: string
          id: string
          learning_day_id: string
          member_id: string
          mime_type: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number
          file_name: string
          file_path: string
          id?: string
          learning_day_id: string
          member_id?: string
          mime_type?: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number
          file_name?: string
          file_path?: string
          id?: string
          learning_day_id?: string
          member_id?: string
          mime_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_notes_learning_day_id_fkey"
            columns: ["learning_day_id"]
            isOneToOne: false
            referencedRelation: "learning_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_notes_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      correct_session: {
        Args: { _id: string; _new_seconds: number; _reason: string }
        Returns: {
          accumulated_seconds: number
          created_at: string
          credited_date: string | null
          ended_at: string | null
          focused_seconds: number
          id: string
          learning_day_id: string | null
          member_id: string
          planned_seconds: number
          resumed_at: string | null
          started_at: string
          status: Database["public"]["Enums"]["session_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "learning_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_profile_id: { Args: never; Returns: string }
      discard_session: { Args: { _id: string }; Returns: undefined }
      is_member: { Args: never; Returns: boolean }
      member_email: { Args: { _name: string }; Returns: string }
      pause_session: {
        Args: { _id: string }
        Returns: {
          accumulated_seconds: number
          created_at: string
          credited_date: string | null
          ended_at: string | null
          focused_seconds: number
          id: string
          learning_day_id: string | null
          member_id: string
          planned_seconds: number
          resumed_at: string | null
          started_at: string
          status: Database["public"]["Enums"]["session_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "learning_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      resume_session: {
        Args: { _id: string }
        Returns: {
          accumulated_seconds: number
          created_at: string
          credited_date: string | null
          ended_at: string | null
          focused_seconds: number
          id: string
          learning_day_id: string | null
          member_id: string
          planned_seconds: number
          resumed_at: string | null
          started_at: string
          status: Database["public"]["Enums"]["session_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "learning_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      save_session: {
        Args: { _id: string }
        Returns: {
          accumulated_seconds: number
          created_at: string
          credited_date: string | null
          ended_at: string | null
          focused_seconds: number
          id: string
          learning_day_id: string | null
          member_id: string
          planned_seconds: number
          resumed_at: string | null
          started_at: string
          status: Database["public"]["Enums"]["session_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "learning_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      session_elapsed: {
        Args: { s: Database["public"]["Tables"]["learning_sessions"]["Row"] }
        Returns: number
      }
      start_session: {
        Args: { _day_id: string; _planned_seconds: number }
        Returns: {
          accumulated_seconds: number
          created_at: string
          credited_date: string | null
          ended_at: string | null
          focused_seconds: number
          id: string
          learning_day_id: string | null
          member_id: string
          planned_seconds: number
          resumed_at: string | null
          started_at: string
          status: Database["public"]["Enums"]["session_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "learning_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      stop_session: {
        Args: { _id: string }
        Returns: {
          accumulated_seconds: number
          created_at: string
          credited_date: string | null
          ended_at: string | null
          focused_seconds: number
          id: string
          learning_day_id: string | null
          member_id: string
          planned_seconds: number
          resumed_at: string | null
          started_at: string
          status: Database["public"]["Enums"]["session_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "learning_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      resource_type: "youtube" | "website" | "documentation" | "other"
      session_status:
        | "running"
        | "paused"
        | "stopped"
        | "completed"
        | "discarded"
      task_status: "todo" | "in_progress" | "completed"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      resource_type: ["youtube", "website", "documentation", "other"],
      session_status: [
        "running",
        "paused",
        "stopped",
        "completed",
        "discarded",
      ],
      task_status: ["todo", "in_progress", "completed"],
    },
  },
} as const
