import React from 'react';
import { 
  FileText, 
  Users, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  Camera, 
  RotateCcw, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';

const iconByEvent = {
  reported: { icon: FileText, color: 'text-red-500 bg-red-100' },
  support_milestone: { icon: Users, color: 'text-blue-500 bg-blue-100' },
  status_change: { icon: Clock, color: 'text-amber-500 bg-amber-100' },
  admin_response: { icon: MessageSquare, color: 'text-indigo-500 bg-indigo-100' },
  evidence_added: { icon: Camera, color: 'text-purple-500 bg-purple-100' },
  action_initiated: { icon: Wrench, color: 'text-blue-500 bg-blue-100' },
  resolved: { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-100' },
  reopened: { icon: RotateCcw, color: 'text-orange-500 bg-orange-100' },
};

export default function IssueTimeline({ updates = [] }) {
  if (!updates || updates.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-500">
        No timeline events recorded yet.
      </div>
    );
  }

  // Sort chronologically (oldest to newest for timeline story)
  const sorted = [...updates].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {sorted.map((item, idx) => {
        const eventConfig = iconByEvent[item.event_type] || {
          icon: AlertCircle,
          color: 'text-slate-500 bg-slate-100',
        };
        const Icon = eventConfig.icon;

        const dateStr = new Date(item.created_at).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        const timeStr = new Date(item.created_at).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div key={item.id || idx} className="relative group">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-xs ${eventConfig.color}`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>

            {/* Event Content */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 transition-colors group-hover:border-slate-300">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                <span className="text-[11px] font-medium text-slate-500 flex-shrink-0">
                  {dateStr} • {timeStr}
                </span>
              </div>
              {item.description && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              )}
              {item.new_status && (
                <div className="mt-2 text-[11px] text-slate-500">
                  Status changed to: <strong className="text-slate-800">{item.new_status}</strong>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
