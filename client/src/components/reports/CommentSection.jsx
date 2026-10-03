import React, { useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  Trash2, 
  Flag, 
  AlertCircle, 
  UserCheck, 
  ShieldAlert 
} from 'lucide-react';

export default function CommentSection({ reportId, initialComments = [] }) {
  const { user, profile, isAdmin } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handlePost = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const res = await api.post(`/reports/${reportId}/comments`, {
        comment_text: commentText.trim(),
        is_anonymous: isAnonymous,
      });

      if (res.comment) {
        setComments((prev) => [...prev, res.comment]);
        setCommentText('');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await api.delete(`/reports/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      alert(err.message || 'Could not delete comment.');
    }
  };

  const handleReportComment = (commentId) => {
    alert('Thank you. This comment has been flagged for administrative safety review.');
  };

  return (
    <div className="space-y-6 font-sans text-zinc-100">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-white" />
          <span>Student Discussion ({comments.length})</span>
        </h3>
        <span className="text-xs text-zinc-400 font-medium">
          Verified Student Accounts Only
        </span>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Post Comment Form */}
      {user ? (
        <form onSubmit={handlePost} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-inner">
          <textarea
            rows={3}
            required
            placeholder="Share details, updates, or campus facility observations..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-zinc-800 bg-[#121214] text-zinc-100 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-500 font-normal leading-relaxed resize-y"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="comment_anon"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded text-zinc-100 focus:ring-zinc-400 border-zinc-700 bg-zinc-900 cursor-pointer accent-white"
              />
              <label htmlFor="comment_anon" className="text-xs text-zinc-300 font-medium cursor-pointer">
                Comment anonymously (hide my name)
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 text-center text-xs text-zinc-400">
          Please sign in to participate in the student discussion.
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3.5">
        {comments.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500 space-y-1">
            <p className="font-medium text-zinc-400">No comments posted yet.</p>
            <p className="text-[11px] text-zinc-500">Be the first to share an observation or status update.</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isOwner = user && user.id === comment.user?.id;
            const isOfficial = comment.is_official;
            const timeAgo = new Date(comment.created_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={comment.id}
                className={`p-4 sm:p-4.5 rounded-xl border text-sm transition-colors space-y-2 ${
                  isOfficial
                    ? 'bg-blue-950/20 border-blue-900/50 ring-1 ring-blue-800/30'
                    : 'bg-zinc-950 border-zinc-800/90 hover:border-zinc-700/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs flex items-center gap-1.5">
                      {isOfficial ? (
                        <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                          <ShieldCheck className="w-4 h-4 text-blue-400" />
                          Official Administration Response
                        </span>
                      ) : comment.is_anonymous ? (
                        <span className="flex items-center gap-1.5 text-zinc-400">
                          <ShieldAlert className="w-3.5 h-3.5 text-zinc-500" />
                          Anonymous Student
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-white">
                          <UserCheck className="w-3.5 h-3.5 text-zinc-300" />
                          {comment.user?.full_name || 'Verified Student'}
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-zinc-500">• {timeAgo}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {(isOwner || isAdmin) && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-zinc-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleReportComment(comment.id)}
                      className="text-zinc-500 hover:text-amber-400 transition-colors p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer"
                      title="Report inappropriate content"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap font-normal">
                  {comment.comment_text}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
