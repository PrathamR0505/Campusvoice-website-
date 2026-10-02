import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import CategoryBadge from '../common/CategoryBadge';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Image as ImageIcon, 
  MessageSquare, 
  ShieldAlert, 
  Sparkles,
  UserCheck
} from 'lucide-react';

export default function ReportCard({ report }) {
  const primaryMedia = report.media && report.media.length > 0 ? report.media[0] : null;
  const isAnonymous = report.is_anonymous;

  // Format date: e.g. "2 Oct 2026"
  const formattedDate = new Date(report.incident_date || report.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Media Image or Fallback */}
      <Link to={`/issue/${report.id}`} className="relative block aspect-video w-full bg-slate-900 overflow-hidden">
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
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-500">
            <ImageIcon className="w-10 h-10 mb-1 opacity-40" />
            <span className="text-xs font-medium text-slate-400">No media attached</span>
          </div>
        )}

        {/* Status Badge in top-left */}
        <div className="absolute top-3 left-3 z-10">
          <StatusBadge status={report.status} size="xs" />
        </div>

        {/* Severity indicator in top-right */}
        {report.severity && (
          <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-xs ${
            report.severity === 'Critical' ? 'bg-red-600' :
            report.severity === 'High' ? 'bg-orange-600' :
            report.severity === 'Medium' ? 'bg-amber-600' : 'bg-slate-600'
          }`}>
            {report.severity}
          </div>
        )}

        {/* Media count pill if multiple */}
        {report.media && report.media.length > 1 && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            <span>+{report.media.length - 1}</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Anonymity Row */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <CategoryBadge category={report.category} size="xs" />

            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
              isAnonymous
                ? 'bg-slate-100 text-slate-600 border border-slate-200'
                : 'bg-blue-50 text-blue-700 border border-blue-100'
            }`}>
              {isAnonymous ? (
                <>
                  <ShieldAlert className="w-3 h-3 text-slate-400" />
                  <span>Anonymous</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3 h-3 text-blue-500" />
                  <span className="truncate max-w-[100px]">{report.reporter?.full_name || 'Verified'}</span>
                </>
              )}
            </span>
          </div>

          {/* Title */}
          <Link to={`/issue/${report.id}`} className="block group-hover:text-blue-600 transition-colors">
            <h3 className="font-bold text-base text-slate-900 line-clamp-1 leading-snug">
              {report.title}
            </h3>
          </Link>

          {/* Description snippet */}
          <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
            {report.description}
          </p>

          {/* AI Summary tag if generated */}
          {report.ai_summary && (
            <div className="mt-2.5 p-2 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1 font-medium">{report.ai_summary}</span>
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2">
          {/* Location & Date */}
          <div className="flex items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate font-medium text-slate-700">
                {report.location?.name || report.custom_location || 'Campus Grounds'}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 text-[11px]">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Impact & Action */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Users className="w-4 h-4 text-blue-600" />
              <span>{report.affected_count || 1} students affected</span>
            </div>

            <Link
              to={`/issue/${report.id}`}
              className="text-xs font-semibold text-blue-600 hover:text-blue-500 hover:underline"
            >
              View Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
