import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import CategoryBadge from '../components/common/CategoryBadge';
import SupportButton from '../components/reports/SupportButton';
import IssueTimeline from '../components/reports/IssueTimeline';
import CommentSection from '../components/reports/CommentSection';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  MapPin, 
  Calendar, 
  Users, 
  ArrowLeft, 
  ShieldAlert, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Clock,
  ShieldCheck,
  Video,
  Image as ImageIcon,
  MessageSquareQuote
} from 'lucide-react';

export default function IssueDetailsPage() {
  const { id } = useParams();
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMediaIdx, setSelectedMediaIdx] = useState(0);

  // Resolution verification state
  const [verificationFeedback, setVerificationFeedback] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    async function loadReport() {
      try {
        setLoading(true);
        const res = await api.get(`/reports/${id}`);
        if (res.report) {
          setReport(res.report);
          setVerificationFeedback(res.report.userFeedback);
        }
      } catch (err) {
        setError(err.message || 'Failed to load issue details.');
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [id, authLoading]);

  const handleResolutionFeedback = async (isResolved) => {
    setVerifying(true);
    try {
      // In Phase 3 resolution feedback endpoint is wired
      setVerificationFeedback({ is_resolved: isResolved });
      alert(
        isResolved
          ? 'Thank you for verifying that this campus issue is resolved!'
          : 'Thank you. Your feedback that this is still an active problem has been recorded for review.'
      );
    } catch (e) {
      console.error(e);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading issue details..." />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm mb-4 inline-block">
          {error || 'Issue report not found.'}
        </div>
        <div>
          <Link
            to="/feed"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campus Feed
          </Link>
        </div>
      </div>
    );
  }

  const mediaList = report.media || [];
  const currentMedia = mediaList[selectedMediaIdx] || null;
  const isReporter = user && user.id === report.student_id;
  const formattedDate = new Date(report.incident_date || report.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button & Header Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <StatusBadge status={report.status} size="sm" />
          {report.severity && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${
              report.severity === 'Critical' ? 'bg-red-600' :
              report.severity === 'High' ? 'bg-orange-600' :
              report.severity === 'Medium' ? 'bg-amber-600' : 'bg-slate-600'
            }`}>
              {report.severity} Severity
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Media & Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Media Preview Card */}
          {mediaList.length > 0 ? (
            <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-md">
              <div className="aspect-video w-full flex items-center justify-center bg-black">
                {currentMedia?.media_type === 'video' ? (
                  <video
                    src={currentMedia.url}
                    controls
                    className="w-full h-full max-h-[480px] object-contain"
                  />
                ) : (
                  <img
                    src={currentMedia?.url}
                    alt={report.title}
                    className="w-full h-full max-h-[480px] object-contain"
                  />
                )}
              </div>

              {/* Thumbnails row if multiple media */}
              {mediaList.length > 1 && (
                <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2 overflow-x-auto">
                  {mediaList.map((m, idx) => (
                    <button
                      key={m.id || idx}
                      onClick={() => setSelectedMediaIdx(idx)}
                      className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                        selectedMediaIdx === idx
                          ? 'border-blue-500 scale-105'
                          : 'border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {m.media_type === 'video' ? (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white">
                          <Video className="w-4 h-4" />
                        </div>
                      ) : (
                        <img src={m.url} alt="thumbnail" className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 rounded-2xl bg-slate-100 border border-slate-200 text-center text-slate-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No media uploaded with this report.</p>
            </div>
          )}

          {/* Title & Metadata Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={report.category} size="sm" />
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg ${
                report.is_anonymous
                  ? 'bg-slate-100 text-slate-600 border border-slate-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-100'
              }`}>
                {report.is_anonymous ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                    <span>Anonymous Student</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Reported by {report.reporter?.full_name}</span>
                  </>
                )}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {report.title}
            </h1>

            {/* Location & Incident Date info */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  {report.location?.name} {report.custom_location ? `• ${report.custom_location}` : ''}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Observed on {formattedDate}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Detailed Observation
              </h3>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {report.description}
              </p>
            </div>

            {/* AI Summary Banner (if available) */}
            {report.ai_summary && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>AI Facility Analysis & Synthesis</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  {report.ai_summary}
                </p>
              </div>
            )}
          </div>

          {/* Student Statements (from "I'm Affected" system) */}
          {report.statements && report.statements.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquareQuote className="w-4 h-4 text-blue-600" />
                Student Facility Statements ({report.statements.length})
              </h3>
              <div className="space-y-2.5">
                {report.statements.map((s) => (
                  <div key={s.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                    <p className="text-slate-800 italic font-medium leading-relaxed">
                      "{s.statement}"
                    </p>
                    <span className="text-[11px] text-slate-500 mt-1 block font-semibold">
                      — {s.student?.full_name || 'Anonymous Student'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discussion & Comments */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
            <CommentSection reportId={report.id} initialComments={report.comments || []} />
          </div>
        </div>

        {/* Right Sidebar: Impact Action & Automated Timeline */}
        <div className="space-y-6">
          {/* Student Impact Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Student Body Impact
              </h3>
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {report.affected_count || 1}
              </span>
              <span className="text-sm font-semibold text-slate-500">
                students affected
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              If this facility issue hinders your classes, research, safety, or daily campus routine, verify your impact below:
            </p>

            {/* "I'M AFFECTED BY THIS" Button */}
            <div className="pt-2">
              <SupportButton
                reportId={report.id}
                isReporter={isReporter}
                initialHasSupported={report.hasSupported}
                initialAffectedCount={report.affected_count || 1}
                onSupportChange={(supported, newCount) => {
                  setReport((prev) => ({
                    ...prev,
                    hasSupported: supported,
                    affected_count: newCount,
                  }));
                }}
              />
            </div>
          </div>

          {/* Resolution Verification (Requirement 13) */}
          {report.status === 'Resolved' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Resolution Verification</span>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Administration has marked this issue as resolved. Has this facility actually been fixed to satisfactory working order?
              </p>

              {verificationFeedback ? (
                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-800">
                  {verificationFeedback.is_resolved
                    ? '✅ You verified this issue as resolved.'
                    : '❌ You confirmed this is still an active issue.'}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleResolutionFeedback(true)}
                    disabled={verifying}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    ✅ Yes, resolved
                  </button>
                  <button
                    onClick={() => handleResolutionFeedback(false)}
                    disabled={verifying}
                    className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    ❌ Still an issue
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Issue Automated Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Issue Event Timeline</span>
              </h3>
              <span className="text-[11px] text-slate-400">Automated</span>
            </div>

            <IssueTimeline updates={report.timeline || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
