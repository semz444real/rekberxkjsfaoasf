export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          user_id: string;
          email?: string;
          role: 'user' | 'admin' | 'owner';
          custom_role?: string;
          custom_role_color?: string;
          custom_role_emoji?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          user_id: string;
          email?: string;
          role?: 'user' | 'admin' | 'owner';
          custom_role?: string;
          custom_role_color?: string;
          custom_role_emoji?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          user_id?: string;
          email?: string;
          role?: 'user' | 'admin' | 'owner';
          custom_role?: string;
          custom_role_color?: string;
          custom_role_emoji?: string;
          updated_at?: string;
        };
      };
      chat_rooms: {
        Row: {
          id: string;
          name: string;
          type: 'public' | 'rekber' | 'private';
          game?: string;
          participants?: string[];
          claimed_by?: string;
          status?: 'active' | 'completed' | 'cancelled';
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'public' | 'rekber' | 'private';
          game?: string;
          participants?: string[];
          claimed_by?: string;
          status?: 'active' | 'completed' | 'cancelled';
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'public' | 'rekber' | 'private';
          game?: string;
          participants?: string[];
          claimed_by?: string;
          status?: 'active' | 'completed' | 'cancelled';
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          room_id: string;
          sender_id: string;
          sender_username: string;
          content: string;
          message_type: 'text' | 'image';
          image_url?: string;
          is_edited: boolean;
          edited_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          sender_id: string;
          sender_username: string;
          content: string;
          message_type?: 'text' | 'image';
          image_url?: string;
          is_edited?: boolean;
          edited_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          is_edited?: boolean;
          edited_at?: string;
          updated_at?: string;
        };
      };
      game_topics: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          icon_url?: string;
          is_active: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon: string;
          icon_url?: string;
          is_active?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          icon_url?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      rekber_invites: {
        Row: {
          id: string;
          from_user_id: string;
          from_username: string;
          to_user_id: string;
          to_username: string;
          game: string;
          status: 'pending' | 'accepted' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          from_user_id: string;
          from_username: string;
          to_user_id: string;
          to_username: string;
          game: string;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          status?: 'pending' | 'accepted' | 'rejected';
          updated_at?: string;
        };
      };
      user_reports: {
        Row: {
          id: string;
          reporter_id: string;
          reporter_username: string;
          reported_user_id: string;
          reported_username: string;
          reason: 'scam' | 'spam' | 'harassment' | 'inappropriate' | 'other';
          description: string;
          evidence?: string;
          status: 'pending' | 'resolved' | 'dismissed';
          admin_action?: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reporter_username: string;
          reported_user_id: string;
          reported_username: string;
          reason: 'scam' | 'spam' | 'harassment' | 'inappropriate' | 'other';
          description: string;
          evidence?: string;
          status?: 'pending' | 'resolved' | 'dismissed';
          admin_action?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          status?: 'pending' | 'resolved' | 'dismissed';
          admin_action?: any;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'user' | 'admin' | 'owner';
      room_type: 'public' | 'rekber' | 'private';
      message_type: 'text' | 'image';
      invite_status: 'pending' | 'accepted' | 'rejected';
      report_reason: 'scam' | 'spam' | 'harassment' | 'inappropriate' | 'other';
      report_status: 'pending' | 'resolved' | 'dismissed';
    };
  };
}

// Helper types
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type ChatRoom = Database['public']['Tables']['chat_rooms']['Row'];
export type ChatRoomInsert = Database['public']['Tables']['chat_rooms']['Insert'];
export type ChatRoomUpdate = Database['public']['Tables']['chat_rooms']['Update'];

export type Message = Database['public']['Tables']['messages']['Row'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];
export type MessageUpdate = Database['public']['Tables']['messages']['Update'];

export type GameTopic = Database['public']['Tables']['game_topics']['Row'];
export type GameTopicInsert = Database['public']['Tables']['game_topics']['Insert'];
export type GameTopicUpdate = Database['public']['Tables']['game_topics']['Update'];

export type RekberInvite = Database['public']['Tables']['rekber_invites']['Row'];
export type RekberInviteInsert = Database['public']['Tables']['rekber_invites']['Insert'];
export type RekberInviteUpdate = Database['public']['Tables']['rekber_invites']['Update'];

export type UserReport = Database['public']['Tables']['user_reports']['Row'];
export type UserReportInsert = Database['public']['Tables']['user_reports']['Insert'];
export type UserReportUpdate = Database['public']['Tables']['user_reports']['Update'];