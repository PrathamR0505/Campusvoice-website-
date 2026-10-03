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
  Sparkles, 
  Clock,
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
      <div className="min-h-[70vh] flex items-center justify-center font-sans">
        <LoadingSpinner size="lg" text="Loading issue details..." />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center font-sans">
        <div className="p-4 rounded-xl bg-zinc-900 text-zinc-200 border border-zinc-700 text-sm mb-4 inline-block font-medium">
          {error || 'Issue report not found.'}
        </div>
        <div>
          <Link
            to="/feed"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold shadow-md"
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans min-h-[calc(100vh-4rem)] flex-1 flex flex-col justify-between">
      {/* Back Button & Header Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <StatusBadge status={report.status} size="sm" />
          {report.severity && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-100 bg-zinc-900 border border-zinc-700">
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
            <div className="bg-[#121214] rounded-2xl overflow-hidden border border-zinc-800 shadow-md">
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

              {/* Thumbnails row */}
              {mediaList.length > 1 && (
                <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2 overflow-x-auto">
                  {mediaList.map((m, idx) => (
                    <button
                      key={m.id || idx}
                      onClick={() => setSelectedMediaIdx(idx)}
                      className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                        selectedMediaIdx === idx
                          ? 'border-white scale-105'
                          : 'border-zinc-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {m.media_type === 'video' ? (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-white">
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
            <div className="p-10 rounded-2xl bg-[#121214] border border-zinc-800 text-center text-zinc-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No media uploaded with this report.</p>
            </div>
          )}

          {/* Title & Metadata Card */}
          <div className="bg-[#121214] rounded-2xl border border-zinc-800 shadow-lg p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={report.category} size="sm" />
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg ${
                report.is_anonymous
                  ? 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  : 'bg-zinc-900 text-zinc-200 border border-zinc-700'
              }`}>
                {report.is_anonymous ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Anonymous Student</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-white" />
                    <span>Reported by {report.reporter?.full_name}</span>
                  </>
                )}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight leading-snug">
              {report.title}
            </h1>

            {/* Location & Incident Date */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1 pb-3 border-b border-zinc-800 font-medium">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-white flex-shrink-0" />
                <span className="text-zinc-200">
                  {report.location?.name} {report.custom_location ? `• ${report.custom_location}` : ''}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                <span>Observed on {formattedDate}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-400">
                Detailed Observation
              </h3>
              <p className="font-sans text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap font-normal">
                {report.description}
              </p>
            </div>

            {/* AI Summary Banner */}
            {report.ai_summary && (
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>AI Facility Analysis & Synthesis</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                  {report.ai_summary}
                </p>
              </div>
            )}
          </div>

          {/* Student Statements */}
          {report.statements && report.statements.length > 0 && (
            <div className="bg-[#121214] rounded-2xl border border-zinc-800 shadow-lg p-6 space-y-3 font-sans">
              <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <MessageSquareQuote className="w-5 h-5 text-white" />
                Student Statements ({report.statements.length})
              </h3>
              <div className="space-y-2.5">
                {report.statements.map((s) => (
                  <div key={s.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
                    <p className="text-zinc-200 italic font-medium leading-relaxed">
                      "{s.statement}"
                    </p>
                    <span className="text-[11px] text-zinc-400 mt-1 block font-semibold">
                      — {s.student?.full_name || 'Anonymous Student'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discussion & Comments */}
          <div className="bg-[#121214] rounded-2xl border border-zinc-800 shadow-lg p-6">
            <CommentSection reportId={report.id} initialComments={report.comments || []} />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6 font-sans">
          {/* Student Impact Card */}
          <div className="bg-[#121214] rounded-2xl border border-zinc-800 shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-400">
                Student Body Impact
              </h3>
              <div className="p-1.5 rounded-lg bg-zinc-900 text-white border border-zinc-700">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-sans text-4xl font-extrabold text-white tracking-tight">
                {report.affected_count || 1}
              </span>
              <span className="font-sans text-sm font-semibold text-zinc-300">
                students affected
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              If this facility issue hinders your classes, safety, or routine, verify your impact below:
            </p>

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

          {/* Resolution Verification */}
          {report.status === 'Resolved' && (
            <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 space-y-3 font-sans">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>Resolution Verification</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                Administration marked this issue resolved. Has this facility actually been fixed to satisfactory working order?
              </p>

              {verificationFeedback ? (
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-200">
                  {verificationFeedback.is_resolved
                    ? '✅ You verified this issue as resolved.'
                    : '❌ You confirmed this is still an active issue.'}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleResolutionFeedback(true)}
                    disabled={verifying}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    ✅ Yes, resolved
                  </button>
                  <button
                    onClick={() => handleResolutionFeedback(false)}
                    disabled={verifying}
                    className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 transition-colors cursor-pointer"
                  >
                    ❌ Still an issue
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Issue Automated Timeline */}
          <div className="bg-[#121214] rounded-2xl border border-zinc-800 shadow-lg p-6 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-white" />
                <span>Issue Event Timeline</span>
              </h3>
              <span className="text-[11px] text-zinc-400 font-medium">Automated</span>
            </div>

            <IssueTimeline updates={report.timeline || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
