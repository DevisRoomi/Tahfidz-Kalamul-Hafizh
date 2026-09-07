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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      pengaturan: {
        Row: {
          alamat: string | null
          id: number
          logo_url: string | null
          nama_pesantren: string
          semester: string
          tahun_ajaran: string
          tema: string
          updated_at: string
        }
        Insert: {
          alamat?: string | null
          id?: number
          logo_url?: string | null
          nama_pesantren?: string
          semester?: string
          tahun_ajaran?: string
          tema?: string
          updated_at?: string
        }
        Update: {
          alamat?: string | null
          id?: number
          logo_url?: string | null
          nama_pesantren?: string
          semester?: string
          tahun_ajaran?: string
          tema?: string
          updated_at?: string
        }
        Relationships: []
      }
      santri: {
        Row: {
          alamat: string | null
          created_at: string
          id: string
          jenis_kelamin: string
          kelas: number
          nama: string
          nama_wali: string | null
          nis: string
          no_hp_wali: string | null
          status: string
          tanggal_lahir: string | null
          updated_at: string
          ustadz_id: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          id?: string
          jenis_kelamin?: string
          kelas: number
          nama: string
          nama_wali?: string | null
          nis: string
          no_hp_wali?: string | null
          status?: string
          tanggal_lahir?: string | null
          updated_at?: string
          ustadz_id?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string
          id?: string
          jenis_kelamin?: string
          kelas?: number
          nama?: string
          nama_wali?: string | null
          nis?: string
          no_hp_wali?: string | null
          status?: string
          tanggal_lahir?: string | null
          updated_at?: string
          ustadz_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "santri_ustadz_id_fkey"
            columns: ["ustadz_id"]
            isOneToOne: false
            referencedRelation: "ustadz"
            referencedColumns: ["id"]
          },
        ]
      }
      setoran: {
        Row: {
          ayat_mulai: number
          ayat_selesai: number
          catatan: string | null
          created_at: string
          id: string
          jenis: string
          jumlah_ayat: number
          juz: number | null
          kelancaran: string
          nilai: number
          predikat: string
          santri_id: string
          surah: string
          tanggal: string
          updated_at: string
          ustadz_id: string | null
        }
        Insert: {
          ayat_mulai?: number
          ayat_selesai?: number
          catatan?: string | null
          created_at?: string
          id?: string
          jenis: string
          jumlah_ayat?: number
          juz?: number | null
          kelancaran?: string
          nilai?: number
          predikat?: string
          santri_id: string
          surah: string
          tanggal?: string
          updated_at?: string
          ustadz_id?: string | null
        }
        Update: {
          ayat_mulai?: number
          ayat_selesai?: number
          catatan?: string | null
          created_at?: string
          id?: string
          jenis?: string
          jumlah_ayat?: number
          juz?: number | null
          kelancaran?: string
          nilai?: number
          predikat?: string
          santri_id?: string
          surah?: string
          tanggal?: string
          updated_at?: string
          ustadz_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "setoran_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "santri"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "setoran_ustadz_id_fkey"
            columns: ["ustadz_id"]
            isOneToOne: false
            referencedRelation: "ustadz"
            referencedColumns: ["id"]
          },
        ]
      }
      ustadz: {
        Row: {
          created_at: string
          id: string
          jenis_kelamin: string
          keterangan: string | null
          nama: string
          nip: string | null
          no_hp: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jenis_kelamin?: string
          keterangan?: string | null
          nama: string
          nip?: string | null
          no_hp?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jenis_kelamin?: string
          keterangan?: string | null
          nama?: string
          nip?: string | null
          no_hp?: string | null
          updated_at?: string
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
    Enums: {},
  },
} as const
