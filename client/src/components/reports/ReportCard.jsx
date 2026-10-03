import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import CategoryBadge from '../common/CategoryBadge';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Image as ImageIcon, 
  ShieldAlert, 
  Sparkles,
  UserCheck
} from 'lucide-react';

export default function ReportCard({ report }) {
  const primaryMedia = report.media && report.media.length > 0 ? report.media[0] : null;
  const isAnonymous = report.is_anonymous;

  const formattedDate = new Date(report.incident_date || report.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-[#121214] rounded-2xl border border-zinc-800 shadow-lg hover:border-zinc-600 transition-all duration-200 flex flex-col overflow-hidden group font-sans">
      {/* Media Image or Fallback */}
      <Link to={`/issue/${report.id}`} className="relative block aspect-video w-full bg-zinc-950 overflow-hidden">
        {primaryMedia ? (
          primaryMedia.media_type === 'video' ? (
            <video
              src={primaryMedia.url}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <img
              src={primaryMedia.url}
              alt={report.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-500">
            <ImageIcon className="w-10 h-10 mb-1 opacity-40" />
            <span className="text-xs font-sans font-medium text-zinc-400">No media attached</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3 z-10">
          <StatusBadge status={report.status} size="xs" />
        </div>

        {/* Severity indicator */}
        {report.severity && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider text-zinc-100 bg-zinc-900/90 border border-zinc-700 backdrop-blur-xs">
            {report.severity}
          </div>
        )}

        {/* Media count pill if multiple */}
        {report.media && report.media.length > 1 && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-white text-[11px] font-sans font-medium flex items-center gap-1 border border-zinc-800">
            <ImageIcon className="w-3 h-3" />
            <span>+{report.media.length - 1}</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between font-sans">
        <div>
          {/* Category & Anonymity Row */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <CategoryBadge category={report.category} size="xs" />

            <span className={`inline-flex items-center gap-1 text-[11px] font-sans font-semibold px-2 py-0.5 rounded-md ${
              isAnonymous
                ? 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                : 'bg-zinc-900 text-zinc-200 border border-zinc-700'
            }`}>
              {isAnonymous ? (
                <>
                  <ShieldAlert className="w-3 h-3 text-zinc-400" />
                  <span>Anonymous</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3 h-3 text-white" />
                  <span className="truncate max-w-[100px]">{report.reporter?.full_name || 'Verified'}</span>
                </>
              )}
            </span>
          </div>

          {/* Title */}
          <Link to={`/issue/${report.id}`} className="block group-hover:text-zinc-300 transition-colors">
            <h3 className="font-sans font-bold text-base text-white line-clamp-1 leading-snug">
              {report.title}
            </h3>
          </Link>

          {/* Description snippet */}
          <p className="font-sans text-xs text-zinc-300 line-clamp-2 mt-1.5 leading-relaxed font-normal">
            {report.description}
          </p>

          {/* AI Summary tag */}
          {report.ai_summary && (
            <div className="mt-2.5 p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-sans text-zinc-300 flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-white flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1 font-medium">{report.ai_summary}</span>
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <div className="mt-4 pt-3.5 border-t border-zinc-800 space-y-2 font-sans">
          {/* Location & Date */}
          <div className="flex items-center justify-between text-xs text-zinc-400 gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              <span className="truncate font-medium text-zinc-300">
                {report.location?.name || report.custom_location || 'Campus Grounds'}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 text-[11px] font-medium text-zinc-400">
              <Calendar className="w-3 h-3 text-zinc-500" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Impact & Action */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs font-sans font-extrabold text-white">
              <Users className="w-4 h-4 text-white" />
              <span>{report.affected_count || 1} students affected</span>
            </div>

            <Link
              to={`/issue/${report.id}`}
              className="text-xs font-sans font-bold text-white hover:underline transition-colors"
            >
              View Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
