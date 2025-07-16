import { supabase } from '../lib/supabase/client';
import type { UserReport, UserReportInsert, UserReportUpdate } from '../lib/supabase/types';

export class ReportsService {
  // Submit user report
  static async submitReport(report: UserReportInsert): Promise<{ success: boolean; report?: UserReport; error?: string }> {
    try {
      const { data: newReport, error } = await supabase
        .from('user_reports')
        .insert(report)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, report: newReport };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get all reports (admin only)
  static async getAllReports(): Promise<UserReport[]> {
    try {
      const { data: reports, error } = await supabase
        .from('user_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        return [];
      }

      return reports || [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  }

  // Get reports by status (admin only)
  static async getReportsByStatus(status: 'pending' | 'resolved' | 'dismissed'): Promise<UserReport[]> {
    try {
      const { data: reports, error } = await supabase
        .from('user_reports')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports by status:', error);
        return [];
      }

      return reports || [];
    } catch (error) {
      console.error('Error fetching reports by status:', error);
      return [];
    }
  }

  // Update report (admin only)
  static async updateReport(reportId: string, updates: UserReportUpdate): Promise<{ success: boolean; report?: UserReport; error?: string }> {
    try {
      const { data: updatedReport, error } = await supabase
        .from('user_reports')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', reportId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, report: updatedReport };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Take action on report (admin only)
  static async takeActionOnReport(
    reportId: string, 
    action: {
      actionType: 'mute' | 'ban' | 'warning' | 'none';
      duration?: number;
      adminId: string;
      adminUsername: string;
      notes?: string;
    }
  ): Promise<boolean> {
    try {
      const adminAction = {
        ...action,
        actionTimestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_reports')
        .update({ 
          status: 'resolved',
          admin_action: adminAction,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      return !error;
    } catch (error) {
      console.error('Error taking action on report:', error);
      return false;
    }
  }

  // Subscribe to new reports (admin only)
  static subscribeToReports(callback: (report: UserReport) => void) {
    return supabase
      .channel('user_reports')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_reports'
        },
        (payload) => {
          callback(payload.new as UserReport);
        }
      )
      .subscribe();
  }
}