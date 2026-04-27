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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      character_sprites: {
        Row: {
          character_id: string
          created_at: string
          id: string
          image_url: string
          name: string
          position_y: number | null
          scale: number | null
          tag: string | null
        }
        Insert: {
          character_id: string
          created_at?: string
          id?: string
          image_url: string
          name: string
          position_y?: number | null
          scale?: number | null
          tag?: string | null
        }
        Update: {
          character_id?: string
          created_at?: string
          id?: string
          image_url?: string
          name?: string
          position_y?: number | null
          scale?: number | null
          tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "character_sprites_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          age: string | null
          background_color: string | null
          background_image_url: string | null
          background_overlay_opacity: number | null
          battlefront_desc: string | null
          battlefront_name: string | null
          blaze_image_size: string | null
          blaze_image_url: string | null
          blaze_show_border: boolean | null
          blaze_type: string | null
          card_bg_color: string | null
          card_bg_opacity: number | null
          character_category: string | null
          clan_desc: string | null
          clan_name: string | null
          created_at: string
          defensive_power: string | null
          element_advanced: string | null
          element_blaze: string | null
          element_primary: string | null
          element_secondary: string | null
          element_user: string | null
          faction: string | null
          font_body: string | null
          font_heading: string | null
          frame_style: string | null
          height: string | null
          id: string
          id_photo_border: string | null
          id_photo_url: string | null
          image_fit: string | null
          image_url: string | null
          is_npc: boolean | null
          layout: Json | null
          luck: string | null
          mana_amount: string | null
          mana_control: string | null
          name: string | null
          nationality: string | null
          noble_arts: Json | null
          offensive_power: string | null
          physical_ability: string | null
          quote: string | null
          quote_color: string | null
          quote_font: string | null
          quote_italic: boolean | null
          quote_size: string | null
          show_ability: boolean | null
          show_clan: boolean | null
          show_elements: boolean | null
          show_stats: boolean | null
          special_ability_desc: string | null
          special_ability_name: string | null
          status: string | null
          subtitle: string | null
          text_color: string | null
          theme_color: string | null
          type_desc: string | null
          type_name: string | null
          user_id: string
        }
        Insert: {
          age?: string | null
          background_color?: string | null
          background_image_url?: string | null
          background_overlay_opacity?: number | null
          battlefront_desc?: string | null
          battlefront_name?: string | null
          blaze_image_size?: string | null
          blaze_image_url?: string | null
          blaze_show_border?: boolean | null
          blaze_type?: string | null
          card_bg_color?: string | null
          card_bg_opacity?: number | null
          character_category?: string | null
          clan_desc?: string | null
          clan_name?: string | null
          created_at?: string
          defensive_power?: string | null
          element_advanced?: string | null
          element_blaze?: string | null
          element_primary?: string | null
          element_secondary?: string | null
          element_user?: string | null
          faction?: string | null
          font_body?: string | null
          font_heading?: string | null
          frame_style?: string | null
          height?: string | null
          id?: string
          id_photo_border?: string | null
          id_photo_url?: string | null
          image_fit?: string | null
          image_url?: string | null
          is_npc?: boolean | null
          layout?: Json | null
          luck?: string | null
          mana_amount?: string | null
          mana_control?: string | null
          name?: string | null
          nationality?: string | null
          noble_arts?: Json | null
          offensive_power?: string | null
          physical_ability?: string | null
          quote?: string | null
          quote_color?: string | null
          quote_font?: string | null
          quote_italic?: boolean | null
          quote_size?: string | null
          show_ability?: boolean | null
          show_clan?: boolean | null
          show_elements?: boolean | null
          show_stats?: boolean | null
          special_ability_desc?: string | null
          special_ability_name?: string | null
          status?: string | null
          subtitle?: string | null
          text_color?: string | null
          theme_color?: string | null
          type_desc?: string | null
          type_name?: string | null
          user_id: string
        }
        Update: {
          age?: string | null
          background_color?: string | null
          background_image_url?: string | null
          background_overlay_opacity?: number | null
          battlefront_desc?: string | null
          battlefront_name?: string | null
          blaze_image_size?: string | null
          blaze_image_url?: string | null
          blaze_show_border?: boolean | null
          blaze_type?: string | null
          card_bg_color?: string | null
          card_bg_opacity?: number | null
          character_category?: string | null
          clan_desc?: string | null
          clan_name?: string | null
          created_at?: string
          defensive_power?: string | null
          element_advanced?: string | null
          element_blaze?: string | null
          element_primary?: string | null
          element_secondary?: string | null
          element_user?: string | null
          faction?: string | null
          font_body?: string | null
          font_heading?: string | null
          frame_style?: string | null
          height?: string | null
          id?: string
          id_photo_border?: string | null
          id_photo_url?: string | null
          image_fit?: string | null
          image_url?: string | null
          is_npc?: boolean | null
          layout?: Json | null
          luck?: string | null
          mana_amount?: string | null
          mana_control?: string | null
          name?: string | null
          nationality?: string | null
          noble_arts?: Json | null
          offensive_power?: string | null
          physical_ability?: string | null
          quote?: string | null
          quote_color?: string | null
          quote_font?: string | null
          quote_italic?: boolean | null
          quote_size?: string | null
          show_ability?: boolean | null
          show_clan?: boolean | null
          show_elements?: boolean | null
          show_stats?: boolean | null
          special_ability_desc?: string | null
          special_ability_name?: string | null
          status?: string | null
          subtitle?: string | null
          text_color?: string | null
          theme_color?: string | null
          type_desc?: string | null
          type_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chatroom_characters: {
        Row: {
          advantage_status: string | null
          chatroom_id: string
          created_at: string
          default_sprite_id: string | null
          hp: number | null
          id: string
          mana: number | null
          max_hp: number | null
          max_mana: number | null
          name: string
          owner_id: string
          vault_character_id: string | null
        }
        Insert: {
          advantage_status?: string | null
          chatroom_id: string
          created_at?: string
          default_sprite_id?: string | null
          hp?: number | null
          id?: string
          mana?: number | null
          max_hp?: number | null
          max_mana?: number | null
          name: string
          owner_id: string
          vault_character_id?: string | null
        }
        Update: {
          advantage_status?: string | null
          chatroom_id?: string
          created_at?: string
          default_sprite_id?: string | null
          hp?: number | null
          id?: string
          mana?: number | null
          max_hp?: number | null
          max_mana?: number | null
          name?: string
          owner_id?: string
          vault_character_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatroom_characters_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "chatrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatroom_characters_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatroom_characters_vault_character_id_fkey"
            columns: ["vault_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_default_sprite"
            columns: ["default_sprite_id"]
            isOneToOne: false
            referencedRelation: "character_sprites"
            referencedColumns: ["id"]
          },
        ]
      }
      chatrooms: {
        Row: {
          background_url: string | null
          bgm_state: Json | null
          bgm_url: string | null
          chat_type: string | null
          chatters_ids: string[] | null
          created_at: string
          creator_id: string
          description: string | null
          id: string
          masters_ids: string[] | null
          portrait_url: string | null
          proposal_note: string | null
          resources: Json | null
          roleplay_type: Database["public"]["Enums"]["roleplay_mode"] | null
          status: string | null
          title: string
          turns: Json | null
        }
        Insert: {
          background_url?: string | null
          bgm_state?: Json | null
          bgm_url?: string | null
          chat_type?: string | null
          chatters_ids?: string[] | null
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          masters_ids?: string[] | null
          portrait_url?: string | null
          proposal_note?: string | null
          resources?: Json | null
          roleplay_type?: Database["public"]["Enums"]["roleplay_mode"] | null
          status?: string | null
          title: string
          turns?: Json | null
        }
        Update: {
          background_url?: string | null
          bgm_state?: Json | null
          bgm_url?: string | null
          chat_type?: string | null
          chatters_ids?: string[] | null
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          masters_ids?: string[] | null
          portrait_url?: string | null
          proposal_note?: string | null
          resources?: Json | null
          roleplay_type?: Database["public"]["Enums"]["roleplay_mode"] | null
          status?: string | null
          title?: string
          turns?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "chatrooms_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          character_id: string | null
          chatroom_id: string
          content: string
          created_at: string
          dice_result: Json | null
          id: string
          is_dm_whisper: boolean | null
          is_system_message: boolean | null
          sender_id: string
          sprite_id: string | null
          target_user_id: string | null
        }
        Insert: {
          character_id?: string | null
          chatroom_id: string
          content: string
          created_at?: string
          dice_result?: Json | null
          id?: string
          is_dm_whisper?: boolean | null
          is_system_message?: boolean | null
          sender_id: string
          sprite_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          character_id?: string | null
          chatroom_id?: string
          content?: string
          created_at?: string
          dice_result?: Json | null
          id?: string
          is_dm_whisper?: boolean | null
          is_system_message?: boolean | null
          sender_id?: string
          sprite_id?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "chatroom_characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "chatrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sprite_id_fkey"
            columns: ["sprite_id"]
            isOneToOne: false
            referencedRelation: "character_sprites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          role: string | null
          username: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          role?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          role?: string | null
          username?: string | null
        }
        Relationships: []
      }
      tma_character_evidences: {
        Row: {
          added_at: string
          character_id: string
          evidence_id: string
          id: string
        }
        Insert: {
          added_at?: string
          character_id: string
          evidence_id: string
          id?: string
        }
        Update: {
          added_at?: string
          character_id?: string
          evidence_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tma_character_evidences_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "tma_characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tma_character_evidences_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "tma_evidences"
            referencedColumns: ["id"]
          },
        ]
      }
      tma_characters: {
        Row: {
          created_at: string
          current_room_id: string | null
          id: string
          image_url: string | null
          investigation_points: number
          is_hidden: boolean | null
          sprite_expressions: Json | null
          sprite_idle_url: string | null
          status: Database["public"]["Enums"]["tma_character_status"]
          tma_biography: string
          tma_name: string | null
          tma_title: string
          tmc_character_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_room_id?: string | null
          id?: string
          image_url?: string | null
          investigation_points?: number
          is_hidden?: boolean | null
          sprite_expressions?: Json | null
          sprite_idle_url?: string | null
          status?: Database["public"]["Enums"]["tma_character_status"]
          tma_biography: string
          tma_name?: string | null
          tma_title: string
          tmc_character_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_room_id?: string | null
          id?: string
          image_url?: string | null
          investigation_points?: number
          is_hidden?: boolean | null
          sprite_expressions?: Json | null
          sprite_idle_url?: string | null
          status?: Database["public"]["Enums"]["tma_character_status"]
          tma_biography?: string
          tma_name?: string | null
          tma_title?: string
          tmc_character_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tma_characters_current_room_id_fkey"
            columns: ["current_room_id"]
            isOneToOne: false
            referencedRelation: "tma_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tma_characters_tmc_character_id_fkey"
            columns: ["tmc_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      tma_evidence_polls: {
        Row: {
          created_at: string
          evidence_id: string
          id: string
          initiator_id: string
          no_count: number | null
          status: string
          yes_count: number | null
        }
        Insert: {
          created_at?: string
          evidence_id: string
          id?: string
          initiator_id: string
          no_count?: number | null
          status?: string
          yes_count?: number | null
        }
        Update: {
          created_at?: string
          evidence_id?: string
          id?: string
          initiator_id?: string
          no_count?: number | null
          status?: string
          yes_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tma_evidence_polls_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "tma_evidences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tma_evidence_polls_initiator_id_fkey"
            columns: ["initiator_id"]
            isOneToOne: false
            referencedRelation: "tma_characters"
            referencedColumns: ["id"]
          },
        ]
      }
      tma_evidence_votes: {
        Row: {
          created_at: string
          id: string
          poll_id: string
          vote: boolean
          voter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          poll_id: string
          vote: boolean
          voter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          poll_id?: string
          vote?: boolean
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tma_evidence_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "tma_evidence_polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tma_evidence_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "tma_characters"
            referencedColumns: ["id"]
          },
        ]
      }
      tma_evidences: {
        Row: {
          created_at: string
          description: string | null
          description_brief: string | null
          description_full: string | null
          id: string
          image_url: string | null
          investigation_cost: number
          is_fake: boolean | null
          is_hidden: boolean
          pos_x: number | null
          pos_y: number | null
          pos_z: number | null
          room_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_brief?: string | null
          description_full?: string | null
          id?: string
          image_url?: string | null
          investigation_cost?: number
          is_fake?: boolean | null
          is_hidden?: boolean
          pos_x?: number | null
          pos_y?: number | null
          pos_z?: number | null
          room_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_brief?: string | null
          description_full?: string | null
          id?: string
          image_url?: string | null
          investigation_cost?: number
          is_fake?: boolean | null
          is_hidden?: boolean
          pos_x?: number | null
          pos_y?: number | null
          pos_z?: number | null
          room_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tma_evidences_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "tma_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      tma_game_state: {
        Row: {
          body_discovery_active: boolean
          current_motive: string | null
          current_period: Database["public"]["Enums"]["tma_game_period"]
          id: number
          updated_at: string
        }
        Insert: {
          body_discovery_active?: boolean
          current_motive?: string | null
          current_period?: Database["public"]["Enums"]["tma_game_period"]
          id?: number
          updated_at?: string
        }
        Update: {
          body_discovery_active?: boolean
          current_motive?: string | null
          current_period?: Database["public"]["Enums"]["tma_game_period"]
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      tma_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_system_message: boolean | null
          is_whisper: boolean | null
          sender_tma_id: string
          target_tma_id: string | null
          tma_room_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_system_message?: boolean | null
          is_whisper?: boolean | null
          sender_tma_id: string
          target_tma_id?: string | null
          tma_room_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_system_message?: boolean | null
          is_whisper?: boolean | null
          sender_tma_id?: string
          target_tma_id?: string | null
          tma_room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tma_messages_sender_tma_id_fkey"
            columns: ["sender_tma_id"]
            isOneToOne: false
            referencedRelation: "tma_characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tma_messages_target_tma_id_fkey"
            columns: ["target_tma_id"]
            isOneToOne: false
            referencedRelation: "tma_characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tma_messages_tma_room_id_fkey"
            columns: ["tma_room_id"]
            isOneToOne: false
            referencedRelation: "tma_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      tma_room_privacy_polls: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          initiator_id: string
          no_count: number
          room_id: string
          status: string
          total_voters: number
          yes_count: number
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          initiator_id: string
          no_count?: number
          room_id: string
          status?: string
          total_voters: number
          yes_count?: number
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          initiator_id?: string
          no_count?: number
          room_id?: string
          status?: string
          total_voters?: number
          yes_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "tma_room_privacy_polls_initiator_id_fkey"
            columns: ["initiator_id"]
            isOneToOne: false
            referencedRelation: "tma_characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tma_room_privacy_polls_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "tma_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      tma_room_privacy_votes: {
        Row: {
          created_at: string
          id: string
          poll_id: string
          vote: boolean
          voter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          poll_id: string
          vote: boolean
          voter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          poll_id?: string
          vote?: boolean
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tma_room_privacy_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "tma_room_privacy_polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tma_room_privacy_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "tma_characters"
            referencedColumns: ["id"]
          },
        ]
      }
      tma_rooms: {
        Row: {
          background_url: string | null
          created_at: string
          description: string | null
          id: string
          is_private: boolean
          name: string
        }
        Insert: {
          background_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean
          name: string
        }
        Update: {
          background_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_skip_dormant_turns: { Args: never; Returns: undefined }
      skip_dormant_turns: { Args: never; Returns: undefined }
    }
    Enums: {
      roleplay_mode:
        | "free_roleplay"
        | "combat"
        | "turn_based"
        | "tma_murder_game"
      tma_character_status: "ALIVE" | "DEAD" | "MISSING" | "GUILTY"
      tma_game_period: "FREE_TIME" | "INVESTIGATION" | "NIGHTTIME"
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
    Enums: {
      roleplay_mode: [
        "free_roleplay",
        "combat",
        "turn_based",
        "tma_murder_game",
      ],
      tma_character_status: ["ALIVE", "DEAD", "MISSING", "GUILTY"],
      tma_game_period: ["FREE_TIME", "INVESTIGATION", "NIGHTTIME"],
    },
  },
} as const
