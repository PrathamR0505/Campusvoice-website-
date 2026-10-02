import React from 'react';
import { AlertCircle, Clock, Wrench, CheckCircle2, RotateCcw } from 'lucide-react';

export default function StatusBadge({ status, size = 'sm' }) {
  const configs = {
    'Reported': {
      bg: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-500',
      icon: AlertCircle,
      label: 'Reported',
    },
    'Under Review': {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      icon: Clock,
      label: 'Under Review',
    },
    'Action Initiated': {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
      icon: Wrench,
      label: 'Action Initiated',
    },
    'Resolved': {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
      label: 'Resolved',
    },
    'Reopened': {
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
      dot: 'bg-orange-500',
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
      className={`inline-flex items-center font-semibold rounded-full border shadow-2xs ${config.bg} ${
        sizeClasses[size] || sizeClasses.sm
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}
