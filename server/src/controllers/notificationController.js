import { supabase } from '../config/supabase.js';

/**
 * Get authenticated user notifications
 */
export const getUserNotifications = async (req, res) => {
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    const unreadCount = (notifications || []).filter((n) => !n.is_read).length;

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications: notifications || [],
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications.',
    });
  }
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification.',
    });
  }
};
