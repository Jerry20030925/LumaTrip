import { supabase } from '../utils/supabaseClient';

export interface Feedback {
  id: string;
  type: 'bug' | 'feature' | 'general' | 'compliment';
  title: string;
  content: string;
  userEmail: string;
  userName: string;
  createdAt: Date;
  status: 'pending' | 'reviewed' | 'resolved' | 'rejected';
  rating?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  response?: string;
  tags?: string[];
}

class FeedbackService {
  private tableName = 'feedbacks';
  private storageKey = 'lumatrip_feedbacks';

  // 获取本地存储的反馈数据
  private getLocalFeedbacks(): Feedback[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        return data.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }));
      }
    } catch (error) {
      console.error('读取本地反馈数据失败:', error);
    }
    return [];
  }

  // 保存反馈数据到本地存储
  private saveLocalFeedbacks(feedbacks: any[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(feedbacks));
    } catch (error) {
      console.error('保存本地反馈数据失败:', error);
    }
  }

  // 获取用户自己的反馈
  async getUserFeedbacks(userId: string): Promise<Feedback[]> {
    try {
      // 首先尝试从数据库获取
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('数据库获取失败，使用本地存储:', error);
        // 如果数据库失败，使用本地存储
        const localFeedbacks = this.getLocalFeedbacks();
        return localFeedbacks.filter(f => f.userEmail === userId);
      }

      return data?.map(this.mapDatabaseToFeedback) || [];
    } catch (error) {
      console.error('获取用户反馈异常，使用本地存储:', error);
      const localFeedbacks = this.getLocalFeedbacks();
      return localFeedbacks.filter(f => f.userEmail === userId);
    }
  }

  // 获取所有反馈（管理员用）
  async getAllFeedbacks(): Promise<Feedback[]> {
    try {
      // 首先尝试从数据库获取
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('数据库获取失败，使用本地存储:', error);
        // 如果数据库失败，使用本地存储
        return this.getLocalFeedbacks();
      }

      return data?.map(this.mapDatabaseToFeedback) || [];
    } catch (error) {
      console.error('获取所有反馈异常，使用本地存储:', error);
      return this.getLocalFeedbacks();
    }
  }

  // 提交新反馈
  async submitFeedback(feedback: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback | null> {
    try {
      const newFeedback: Feedback = {
        id: Date.now().toString(),
        ...feedback,
        createdAt: new Date()
      };

      // 首先尝试保存到数据库
      const feedbackData = {
        type: feedback.type,
        title: feedback.title,
        content: feedback.content,
        user_email: feedback.userEmail,
        user_name: feedback.userName,
        user_id: feedback.userEmail,
        status: feedback.status,
        rating: feedback.rating,
        priority: feedback.priority,
        assigned_to: feedback.assignedTo,
        response: feedback.response,
        tags: feedback.tags,
        created_at: newFeedback.createdAt.toISOString()
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([feedbackData])
        .select()
        .single();

      if (error) {
        console.log('数据库保存失败，使用本地存储:', error);
        // 如果数据库失败，保存到本地存储
        const localFeedbacks = this.getLocalFeedbacks();
        localFeedbacks.unshift(newFeedback);
        this.saveLocalFeedbacks(localFeedbacks);
        return newFeedback;
      }

      return this.mapDatabaseToFeedback(data);
    } catch (error) {
      console.error('提交反馈异常，使用本地存储:', error);
      // 异常情况下也保存到本地存储
      const newFeedback: Feedback = {
        id: Date.now().toString(),
        ...feedback,
        createdAt: new Date()
      };
      const localFeedbacks = this.getLocalFeedbacks();
      localFeedbacks.unshift(newFeedback);
      this.saveLocalFeedbacks(localFeedbacks);
      return newFeedback;
    }
  }

  // 更新反馈状态
  async updateFeedbackStatus(feedbackId: string, status: string): Promise<boolean> {
    try {
      // 首先尝试更新数据库
      const { error } = await supabase
        .from(this.tableName)
        .update({ status })
        .eq('id', feedbackId);

      if (error) {
        console.log('数据库更新失败，使用本地存储:', error);
        // 如果数据库失败，更新本地存储
        const localFeedbacks = this.getLocalFeedbacks();
        const updatedFeedbacks = localFeedbacks.map(f => 
          f.id === feedbackId ? { ...f, status: status as any } : f
        ) as Feedback[];
        this.saveLocalFeedbacks(updatedFeedbacks);
        return true;
      }

      return true;
    } catch (error) {
      console.error('更新反馈状态异常，使用本地存储:', error);
      // 异常情况下也更新本地存储
      const localFeedbacks = this.getLocalFeedbacks();
      const updatedFeedbacks = localFeedbacks.map(f => 
        f.id === feedbackId ? { ...f, status: status as any } : f
      ) as Feedback[];
      this.saveLocalFeedbacks(updatedFeedbacks);
      return true;
    }
  }

  // 回复反馈
  async replyToFeedback(feedbackId: string, response: string): Promise<boolean> {
    try {
      // 首先尝试更新数据库
      const { error } = await supabase
        .from(this.tableName)
        .update({ 
          response,
          status: 'reviewed',
          updated_at: new Date().toISOString()
        })
        .eq('id', feedbackId);

      if (error) {
        console.log('数据库更新失败，使用本地存储:', error);
        // 如果数据库失败，更新本地存储
        const localFeedbacks = this.getLocalFeedbacks();
        const updatedFeedbacks = localFeedbacks.map(f => 
          f.id === feedbackId ? { ...f, response, status: 'reviewed' } : f
        );
        this.saveLocalFeedbacks(updatedFeedbacks);
        return true;
      }

      return true;
    } catch (error) {
      console.error('回复反馈异常，使用本地存储:', error);
      // 异常情况下也更新本地存储
      const localFeedbacks = this.getLocalFeedbacks();
      const updatedFeedbacks = localFeedbacks.map(f => 
        f.id === feedbackId ? { ...f, response, status: 'reviewed' } : f
      );
      this.saveLocalFeedbacks(updatedFeedbacks);
      return true;
    }
  }

  // 数据库记录转换为Feedback对象
  private mapDatabaseToFeedback(dbRecord: any): Feedback {
    return {
      id: dbRecord.id,
      type: dbRecord.type,
      title: dbRecord.title,
      content: dbRecord.content,
      userEmail: dbRecord.user_email,
      userName: dbRecord.user_name,
      createdAt: new Date(dbRecord.created_at),
      status: dbRecord.status,
      rating: dbRecord.rating,
      priority: dbRecord.priority,
      assignedTo: dbRecord.assigned_to,
      response: dbRecord.response,
      tags: dbRecord.tags
    };
  }
}

export const feedbackService = new FeedbackService(); 