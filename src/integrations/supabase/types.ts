export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)";
  };
  public: {
    Tables: {
      assets: {
        Row: {
          address: string | null;
          asset_story: string | null;
          created_at: string;
          currency_code: string | null;
          estimated_value: number | null;
          id: string;
          metadata: Json | null;
          name: string;
          property_registry_number: string | null;
          type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          address?: string | null;
          asset_story?: string | null;
          created_at?: string;
          currency_code?: string | null;
          estimated_value?: number | null;
          id?: string;
          metadata?: Json | null;
          name: string;
          property_registry_number?: string | null;
          type: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          address?: string | null;
          asset_story?: string | null;
          created_at?: string;
          currency_code?: string | null;
          estimated_value?: number | null;
          id?: string;
          metadata?: Json | null;
          name?: string;
          property_registry_number?: string | null;
          type?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      contacts: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          name: string;
          notes: string | null;
          phone_number: string | null;
          role: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: string;
          name: string;
          notes?: string | null;
          phone_number?: string | null;
          role: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string;
          notes?: string | null;
          phone_number?: string | null;
          role?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          country_code: string;
          created_at: string;
          expiration_date: string | null;
          file_path: string;
          file_size: number | null;
          id: string;
          is_key_document: boolean;
          mime_type: string | null;
          name: string;
          type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          country_code: string;
          created_at?: string;
          expiration_date?: string | null;
          file_path: string;
          file_size?: number | null;
          id?: string;
          is_key_document?: boolean;
          mime_type?: string | null;
          name: string;
          type: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          country_code?: string;
          created_at?: string;
          expiration_date?: string | null;
          file_path?: string;
          file_size?: number | null;
          id?: string;
          is_key_document?: boolean;
          mime_type?: string | null;
          name?: string;
          type?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      guardians: {
        Row: {
          accepted_at: string | null;
          country_code: string;
          created_at: string;
          full_name: string;
          id: string;
          invitation_email: string | null;
          invitation_status: string | null;
          invitation_token: string | null;
          invited_at: string | null;
          relationship: string;
          roles: string[];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          accepted_at?: string | null;
          country_code: string;
          created_at?: string;
          full_name: string;
          id?: string;
          invitation_email?: string | null;
          invitation_status?: string | null;
          invitation_token?: string | null;
          invited_at?: string | null;
          relationship: string;
          roles?: string[];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          accepted_at?: string | null;
          country_code?: string;
          created_at?: string;
          full_name?: string;
          id?: string;
          invitation_email?: string | null;
          invitation_status?: string | null;
          invitation_token?: string | null;
          invited_at?: string | null;
          relationship?: string;
          roles?: string[];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      instructions: {
        Row: {
          created_at: string;
          digital_accounts_shutdown: string | null;
          funeral_wishes: string | null;
          id: string;
          messages_to_loved_ones: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          digital_accounts_shutdown?: string | null;
          funeral_wishes?: string | null;
          id?: string;
          messages_to_loved_ones?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          digital_accounts_shutdown?: string | null;
          funeral_wishes?: string | null;
          id?: string;
          messages_to_loved_ones?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      wills: {
        Row: {
          created_at: string;
          document_path: string | null;
          executor_contact_id: string | null;
          id: string;
          notes: string | null;
          physical_location: string | null;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          document_path?: string | null;
          executor_contact_id?: string | null;
          id?: string;
          notes?: string | null;
          physical_location?: string | null;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          document_path?: string | null;
          executor_contact_id?: string | null;
          id?: string;
          notes?: string | null;
          physical_location?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_type: "starter" | "premium" | "enterprise";
          status: "active" | "cancelled" | "expired" | "trial";
          started_at: string;
          expires_at: string | null;
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_type?: "starter" | "premium" | "enterprise";
          status?: "active" | "cancelled" | "expired" | "trial";
          started_at?: string;
          expires_at?: string | null;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_type?: "starter" | "premium" | "enterprise";
          status?: "active" | "cancelled" | "expired" | "trial";
          started_at?: string;
          expires_at?: string | null;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_plan: {
        Args: {
          user_uuid: string;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
