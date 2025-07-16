import { supabase } from '../lib/supabase/client';
import type { GameTopic, GameTopicInsert, GameTopicUpdate } from '../lib/supabase/types';

export class GameTopicsService {
  // Get all game topics
  static async getGameTopics(): Promise<GameTopic[]> {
    try {
      const { data: topics, error } = await supabase
        .from('game_topics')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching game topics:', error);
        return [];
      }

      return topics || [];
    } catch (error) {
      console.error('Error fetching game topics:', error);
      return [];
    }
  }

  // Get all game topics (including inactive, for admin)
  static async getAllGameTopics(): Promise<GameTopic[]> {
    try {
      const { data: topics, error } = await supabase
        .from('game_topics')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching all game topics:', error);
        return [];
      }

      return topics || [];
    } catch (error) {
      console.error('Error fetching all game topics:', error);
      return [];
    }
  }

  // Add game topic
  static async addGameTopic(topic: GameTopicInsert): Promise<{ success: boolean; topic?: GameTopic; error?: string }> {
    try {
      const { data: newTopic, error } = await supabase
        .from('game_topics')
        .insert(topic)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Create corresponding public chat room
      const { error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          name: newTopic.name,
          type: 'public',
          game: newTopic.name,
          created_by: topic.created_by
        });

      if (roomError) {
        console.error('Error creating chat room for topic:', roomError);
      }

      return { success: true, topic: newTopic };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Update game topic
  static async updateGameTopic(id: string, updates: GameTopicUpdate): Promise<{ success: boolean; topic?: GameTopic; error?: string }> {
    try {
      const { data: updatedTopic, error } = await supabase
        .from('game_topics')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, topic: updatedTopic };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Delete game topic
  static async deleteGameTopic(id: string): Promise<boolean> {
    try {
      // First, delete associated chat room
      const { data: topic } = await supabase
        .from('game_topics')
        .select('name')
        .eq('id', id)
        .single();

      if (topic) {
        await supabase
          .from('chat_rooms')
          .delete()
          .eq('game', topic.name)
          .eq('type', 'public');
      }

      // Then delete the topic
      const { error } = await supabase
        .from('game_topics')
        .delete()
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('Error deleting game topic:', error);
      return false;
    }
  }

  // Subscribe to game topics changes
  static subscribeToGameTopics(callback: (topic: GameTopic) => void) {
    return supabase
      .channel('game_topics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_topics'
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            callback(payload.new as GameTopic);
          }
        }
      )
      .subscribe();
  }
}