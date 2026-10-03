import React from 'react';
import { 
  Building2, 
  Wifi, 
  Droplet, 
  Zap, 
  Bath, 
  School, 
  FlaskConical, 
  Utensils, 
  Bus, 
  ShieldAlert, 
  Sparkles, 
  HelpCircle 
} from 'lucide-react';

const iconMap = {
  Building2,
  Wifi,
  Droplet,
  Zap,
  Bath,
  School,
  FlaskConical,
  Utensils,
  Bus,
  ShieldAlert,
  Sparkles,
  HelpCircle,
};

export default function CategoryBadge({ category, size = 'sm' }) {
  if (!category) return null;

  const IconComponent = (category.icon && iconMap[category.icon]) || HelpCircle;

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px] gap-1',
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-lg bg-zinc-900 text-zinc-200 border border-zinc-800 ${
        sizeClasses[size] || sizeClasses.sm
      }`}
    >
      <span className="text-zinc-400">
        <IconComponent className="w-3.5 h-3.5" />
      </span>
      <span>{category.name}</span>
    </span>
  );
}
