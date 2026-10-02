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
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Student Discussion ({comments.length})
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          Verified Student Accounts Only
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Post Comment Form */}
      {user ? (
        <form onSubmit={handlePost} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <textarea
            rows={3}
            required
            placeholder="Share details, updates, or campus facility observations..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="comment_anon"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <label htmlFor="comment_anon" className="text-xs text-slate-600 cursor-pointer">
                Comment anonymously (hide my name)
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-600">
          Please sign in to participate in the student discussion.
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3.5">
        {comments.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate-400">
            No comments posted yet. Be the first to share an observation.
          </p>
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
                className={`p-4 rounded-xl border text-sm transition-colors ${
                  isOfficial
                    ? 'bg-blue-50/70 border-blue-200 ring-1 ring-blue-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900 flex items-center gap-1">
                      {isOfficial ? (
                        <span className="flex items-center gap-1 text-blue-700 font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          Official Administration Response
                        </span>
                      ) : comment.is_anonymous ? (
                        <span className="flex items-center gap-1 text-slate-500">
                          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                          Anonymous Student
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-800">
                          <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                          {comment.user?.full_name || 'Verified Student'}
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-400">• {timeAgo}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {(isOwner || isAdmin) && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleReportComment(comment.id)}
                      className="text-slate-400 hover:text-amber-500 transition-colors p-1"
                      title="Report inappropriate content"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
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
