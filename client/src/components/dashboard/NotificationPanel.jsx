import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Bell, Check, Clock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function NotificationPanel() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Poll every 20s
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Bell Button with Badge */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 flex items-center justify-center transition-all focus:outline-none cursor-pointer shadow-sm"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-white text-zinc-950 text-[10px] font-bold flex items-center justify-center animate-pulse shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popup Drawer */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#121214] border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-white font-sans"
          onClick={() => setOpen(false)}
        >
          <div className="p-4 bg-zinc-950 border-b border-zinc-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-white" />
              <h4 className="font-bold text-sm font-serif">Notifications</h4>
            </div>
            {unreadCount > 0 && (
              <span className="text-[11px] font-bold bg-zinc-800 text-white border border-zinc-700 px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-400 font-medium">
                No notifications at this time.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 flex items-start justify-between gap-3 text-xs transition-colors ${
                    !item.is_read ? 'bg-zinc-900/90' : 'bg-[#121214]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">{item.title}</span>
                      {!item.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <p className="text-zinc-300 leading-relaxed text-[11px] font-normal">
                      {item.message}
                    </p>
                    {item.report_id && (
                      <Link
                        to={`/issue/${item.report_id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-white hover:underline pt-0.5"
                      >
                        View Issue Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  {!item.is_read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(item.id);
                      }}
                      className="text-zinc-400 hover:text-white p-1 flex-shrink-0 cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
