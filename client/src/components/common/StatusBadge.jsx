import React from 'react';
import { AlertCircle, Clock, Wrench, CheckCircle2, RotateCcw } from 'lucide-react';

export default function StatusBadge({ status, size = 'sm' }) {
  const configs = {
    'Reported': {
      bg: 'bg-zinc-900/90 text-zinc-200 border-zinc-700/80',
      dot: 'bg-white',
      icon: AlertCircle,
      label: 'Reported',
    },
    'Under Review': {
      bg: 'bg-zinc-900/90 text-zinc-200 border-zinc-700/80',
      dot: 'bg-zinc-400',
      icon: Clock,
      label: 'Under Review',
    },
    'Action Initiated': {
      bg: 'bg-zinc-900/90 text-zinc-200 border-zinc-700/80',
      dot: 'bg-zinc-300',
      icon: Wrench,
      label: 'Action Initiated',
    },
    'Resolved': {
      bg: 'bg-zinc-900/90 text-zinc-100 border-zinc-600',
      dot: 'bg-white',
      icon: CheckCircle2,
      label: 'Resolved',
    },
    'Reopened': {
      bg: 'bg-zinc-900/90 text-zinc-200 border-zinc-700/80',
      dot: 'bg-zinc-400',
      icon: RotateCcw,
      label: 'Reopened',
    },
  };

  const config = configs[status] || configs['Reported'];
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[11px] gap-1',
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border shadow-2xs backdrop-blur-xs ${config.bg} ${
        sizeClasses[size] || sizeClasses.sm
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}
