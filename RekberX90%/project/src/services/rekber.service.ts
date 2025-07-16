import { supabase } from '../lib/supabase/client';
import type { 
  RekberInvite, 
  RekberInviteInsert, 
  RekberInviteUpdate,
  ChatRoom,
  ChatRoomInsert 
} from '../lib/supabase/types';

export class RekberService {
  // Get rekber invites for a user
  static async getRekberInvites(userId: string): Promise<RekberInvite[]> {
    try {
      const { data: invites, error } = await supabase
        .from('rekber_invites')
        .select('*')
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching rekber invites:', error);
        return [];
      }

      return invites || [];
    } catch (error) {
      console.error('Error fetching rekber invites:', error);
      return [];
    }
  }

  // Send rekber invite
  static async sendRekberInvite(invite: RekberInviteInsert): Promise<{ success: boolean; invite?: RekberInvite; error?: string }> {
    try {
      const { data: newInvite, error } = await supabase
        .from('rekber_invites')
        .insert(invite)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, invite: newInvite };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Accept rekber invite
  static async acceptRekberInvite(inviteId: string, acceptorId: string): Promise<{ success: boolean; room?: ChatRoom; error?: string }> {
    try {
      // Update invite status
      const { data: invite, error: inviteError } = await supabase
        .from('rekber_invites')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteId)
        .select()
        .single();

      if (inviteError || !invite) {
        return { success: false, error: inviteError?.message || 'Invite not found' };
      }

      // Create rekber chat room
      const roomData: ChatRoomInsert = {
        name: `${invite.game} - ${invite.from_username} & ${invite.to_username}`,
        type: 'rekber',
        game: invite.game,
        participants: [invite.from_user_id, invite.to_user_id],
        status: 'active',
        created_by: acceptorId
      };

      const { data: newRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .insert(roomData)
        .select()
        .single();

      if (roomError) {
        return { success: false, error: roomError.message };
      }

      // Add welcome message
      await supabase
        .from('messages')
        .insert({
          room_id: newRoom.id,
          sender_id: 'SYSTEM',
          sender_username: 'RekberX System',
          content: `🛡️ Grup Rekber ${invite.game} telah dibuat. Admin akan membantu memastikan transaksi berjalan aman untuk kedua belah pihak.`,
          message_type: 'text'
        });

      return { success: true, room: newRoom };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Reject rekber invite
  static async rejectRekberInvite(inviteId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rekber_invites')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteId);

      return !error;
    } catch (error) {
      console.error('Error rejecting rekber invite:', error);
      return false;
    }
  }

  // Get rekber groups (for admin)
  static async getRekberGroups(): Promise<ChatRoom[]> {
    try {
      const { data: rooms, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('type', 'rekber')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching rekber groups:', error);
        return [];
      }

      return rooms || [];
    } catch (error) {
      console.error('Error fetching rekber groups:', error);
      return [];
    }
  }

  // Claim rekber group (admin)
  static async claimRekberGroup(roomId: string, adminId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_rooms')
        .update({ 
          claimed_by: adminId,
          updated_at: new Date().toISOString()
        })
        .eq('id', roomId)
        .eq('type', 'rekber')
        .is('claimed_by', null);

      return !error;
    } catch (error) {
      console.error('Error claiming rekber group:', error);
      return false;
    }
  }

  // Update rekber status (admin)
  static async updateRekberStatus(roomId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_rooms')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', roomId)
        .eq('type', 'rekber');

      return !error;
    } catch (error) {
      console.error('Error updating rekber status:', error);
      return false;
    }
  }

  // Subscribe to rekber invites
  static subscribeToRekberInvites(userId: string, callback: (invite: RekberInvite) => void) {
    return supabase
      .channel(`rekber_invites:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rekber_invites',
          filter: `to_user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as RekberInvite);
        }
      )
      .subscribe();
  }
}