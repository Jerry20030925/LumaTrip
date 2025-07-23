import { supabase } from '../utils/supabaseClient';

export interface NotificationData {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'location' | 'system';
  title: string;
  message: string;
  avatar?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  senderId?: string;
  targetId?: string;
  targetType?: 'post' | 'user' | 'comment';
}

export const getNotifications = async (limit = 20): Promise<NotificationData[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select(`
        id,
        type,
        title,
        message,
        avatar,
        created_at,
        read,
        action_url,
        sender_id,
        target_id,
        target_type,
        profiles:sender_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Get notifications error:', error);
      return [];
    }

    return data?.map(notification => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      avatar: notification.avatar || (notification as any).profiles?.avatar_url,
      timestamp: new Date(notification.created_at),
      read: notification.read,
      actionUrl: notification.action_url,
      senderId: notification.sender_id,
      targetId: notification.target_id,
      targetType: notification.target_type
    })) || [];
  } catch (error) {
    console.error('Get notifications error:', error);
    return [];
  }
};

export const markAsRead = async (id: string): Promise<{ success: boolean }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Mark as read error:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Mark as read error:', error);
    return { success: false };
  }
};

export const markAllAsRead = async (): Promise<{ success: boolean }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      console.error('Mark all as read error:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Mark all as read error:', error);
    return { success: false };
  }
};

export const deleteNotification = async (id: string): Promise<{ success: boolean }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Delete notification error:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete notification error:', error);
    return { success: false };
  }
};

export const getUnreadCount = async (): Promise<number> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      console.error('Get unread count error:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Get unread count error:', error);
    return 0;
  }
};

export const createNotification = async (
  userId: string,
  type: NotificationData['type'],
  title: string,
  message: string,
  senderId?: string,
  targetId?: string,
  targetType?: string,
  actionUrl?: string
): Promise<{ success: boolean; id?: string }> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        sender_id: senderId,
        target_id: targetId,
        target_type: targetType,
        action_url: actionUrl,
        read: false
      })
      .select('id')
      .single();

    if (error) {
      console.error('Create notification error:', error);
      return { success: false };
    }

    return { success: true, id: data.id };
  } catch (error) {
    console.error('Create notification error:', error);
    return { success: false };
  }
};

// Real-time notification subscription
export const subscribeToNotifications = (
  userId: string,
  callback: (notification: NotificationData) => void
) => {
  const subscription = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        const notification = payload.new as any;
        callback({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          avatar: notification.avatar,
          timestamp: new Date(notification.created_at),
          read: notification.read,
          actionUrl: notification.action_url,
          senderId: notification.sender_id,
          targetId: notification.target_id,
          targetType: notification.target_type
        });
      }
    )
    .subscribe();

  return subscription;
};

// Helper functions for creating specific types of notifications
export const createLikeNotification = async (
  postOwnerId: string,
  likerId: string,
  postId: string,
  postTitle: string
) => {
  if (postOwnerId === likerId) return; // Don't notify self

  const { data: liker } = await supabase
    .from('profiles')
    .select('full_name, username')
    .eq('id', likerId)
    .single();

  const likerName = liker?.full_name || liker?.username || '用户';

  return createNotification(
    postOwnerId,
    'like',
    '新的点赞',
    `${likerName} 点赞了你的帖子「${postTitle}」`,
    likerId,
    postId,
    'post',
    `/app/discover/post/${postId}`
  );
};

export const createCommentNotification = async (
  postOwnerId: string,
  commenterId: string,
  postId: string,
  _postTitle: string,
  commentContent: string
) => {
  if (postOwnerId === commenterId) return; // Don't notify self

  const { data: commenter } = await supabase
    .from('profiles')
    .select('full_name, username')
    .eq('id', commenterId)
    .single();

  const commenterName = commenter?.full_name || commenter?.username || '用户';

  return createNotification(
    postOwnerId,
    'comment',
    '新评论',
    `${commenterName} 评论了你的帖子：「${commentContent.slice(0, 50)}${commentContent.length > 50 ? '...' : ''}」`,
    commenterId,
    postId,
    'post',
    `/app/discover/post/${postId}`
  );
};

export const createFollowNotification = async (
  followeeId: string,
  followerId: string
) => {
  if (followeeId === followerId) return; // Don't notify self

  const { data: follower } = await supabase
    .from('profiles')
    .select('full_name, username')
    .eq('id', followerId)
    .single();

  const followerName = follower?.full_name || follower?.username || '用户';

  return createNotification(
    followeeId,
    'follow',
    '新关注者',
    `${followerName} 开始关注你`,
    followerId,
    followerId,
    'user',
    `/app/profile/${followerId}`
  );
};

export const createMessageNotification = async (
  receiverId: string,
  senderId: string,
  messageContent: string
) => {
  if (receiverId === senderId) return; // Don't notify self

  const { data: sender } = await supabase
    .from('profiles')
    .select('full_name, username')
    .eq('id', senderId)
    .single();

  const senderName = sender?.full_name || sender?.username || '用户';

  return createNotification(
    receiverId,
    'message',
    '新消息',
    `${senderName} 给你发送了一条消息: ${messageContent.slice(0, 50)}${messageContent.length > 50 ? '...' : ''}`,
    senderId,
    senderId,
    'user',
    `/app/messages/${senderId}`
  );
};