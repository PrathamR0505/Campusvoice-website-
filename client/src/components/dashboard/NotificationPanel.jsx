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
        className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popup Drawer */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900"
          onClick={() => setOpen(false)}
        >
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-400" />
              <h4 className="font-bold text-sm">Notifications</h4>
            </div>
            {unreadCount > 0 && (
              <span className="text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No notifications at this time.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 flex items-start justify-between gap-3 text-xs transition-colors ${
                    !item.is_read ? 'bg-blue-50/50' : 'bg-white'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{item.title}</span>
                      {!item.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {item.message}
                    </p>
                    {item.report_id && (
                      <Link
                        to={`/issue/${item.report_id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline pt-0.5"
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
                      className="text-slate-400 hover:text-blue-600 p-1 flex-shrink-0"
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
