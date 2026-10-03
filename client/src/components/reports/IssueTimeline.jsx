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
  reported: { icon: FileText, color: 'text-red-400 bg-red-950/80 border border-red-800/60' },
  support_milestone: { icon: Users, color: 'text-blue-400 bg-blue-950/80 border border-blue-800/60' },
  status_change: { icon: Clock, color: 'text-amber-400 bg-amber-950/80 border border-amber-800/60' },
  admin_response: { icon: MessageSquare, color: 'text-indigo-400 bg-indigo-950/80 border border-indigo-800/60' },
  evidence_added: { icon: Camera, color: 'text-purple-400 bg-purple-950/80 border border-purple-800/60' },
  action_initiated: { icon: Wrench, color: 'text-sky-400 bg-sky-950/80 border border-sky-800/60' },
  resolved: { icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-950/80 border border-emerald-800/60' },
  reopened: { icon: RotateCcw, color: 'text-orange-400 bg-orange-950/80 border border-orange-800/60' },
};

export default function IssueTimeline({ updates = [] }) {
  if (!updates || updates.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-zinc-500">
        No timeline events recorded yet.
      </div>
    );
  }

  // Sort chronologically (oldest to newest for timeline story)
  const sorted = [...updates].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
      {sorted.map((item, idx) => {
        const eventConfig = iconByEvent[item.event_type] || {
          icon: AlertCircle,
          color: 'text-zinc-400 bg-zinc-900 border border-zinc-700',
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
              className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-[#121214] shadow-xs ${eventConfig.color}`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>

            {/* Event Content */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 transition-colors group-hover:border-zinc-700">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-xs font-bold text-white">{item.title}</h4>
                <span className="text-[11px] font-medium text-zinc-400 flex-shrink-0">
                  {dateStr} • {timeStr}
                </span>
              </div>
              {item.description && (
                <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                  {item.description}
                </p>
              )}
              {item.new_status && (
                <div className="mt-2 text-[11px] text-zinc-400">
                  Status changed to: <strong className="text-white capitalize">{item.new_status}</strong>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
