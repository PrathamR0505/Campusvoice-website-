import React, { useState } from 'react';
import { api } from '../../services/api';
import { Users, CheckCircle2, MessageSquare, Plus, AlertCircle } from 'lucide-react';

export default function SupportButton({
  reportId,
  isReporter,
  initialHasSupported = false,
  initialAffectedCount = 1,
  onSupportChange,
}) {
  const [hasSupported, setHasSupported] = useState(initialHasSupported);
  const [affectedCount, setAffectedCount] = useState(initialAffectedCount);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [statement, setStatement] = useState('');
  const [isAnonymousStatement, setIsAnonymousStatement] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = async (statementText = null) => {
    if (isReporter) return;

    setError('');
    setLoading(true);

    try {
      const res = await api.post(`/reports/${reportId}/support`, {
        statement: statementText,
        is_anonymous: isAnonymousStatement,
      });

      setHasSupported(res.supported);
      setAffectedCount(res.affected_count);
      setModalOpen(false);
      setStatement('');

      if (onSupportChange) {
        onSupportChange(res.supported, res.affected_count);
      }
    } catch (err) {
      setError(err.message || 'Failed to update impact status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-2 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {/* Main "I'm Affected" Button */}
        <button
          type="button"
          disabled={loading || isReporter}
          onClick={() => {
            setError('');
            if (!hasSupported) {
              setModalOpen(true);
            } else {
              handleToggle();
            }
          }}
          className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs cursor-pointer ${
            isReporter
              ? 'bg-blue-50 text-blue-700 border border-blue-200 cursor-default'
              : hasSupported
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
          } disabled:opacity-70`}
        >
          {hasSupported || isReporter ? (
            <CheckCircle2 className="w-4 h-4 text-white" />
          ) : (
            <Users className="w-4 h-4" />
          )}
          <span>
            {isReporter
              ? "You reported this issue"
              : hasSupported
              ? "I'm Affected • Verified"
              : "I'M AFFECTED BY THIS"}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            hasSupported || isReporter ? 'bg-white/20 text-white' : 'bg-blue-700 text-white'
          }`}>
            {affectedCount}
          </span>
        </button>

        {hasSupported && !isReporter && (
          <span className="text-xs text-slate-500">
            Click again to remove your impact confirmation.
          </span>
        )}
      </div>

      {/* Statement Modal when adding impact */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-blue-600 mb-2">
              <Users className="w-5 h-5" />
              <h3 className="font-bold text-lg text-slate-900">Confirm You Are Affected</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Your verified student confirmation will increase the official severity metrics for administration review.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Add an Optional Student Statement (Facility Condition Note)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. 'Our laboratory has 30 computers, but only 18 were functioning during today\'s practical session.'"
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Please focus on documented equipment and facility conditions.
              </p>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <input
                type="checkbox"
                id="statement_anon"
                checked={isAnonymousStatement}
                onChange={(e) => setIsAnonymousStatement(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <label htmlFor="statement_anon" className="text-xs text-slate-700 font-medium cursor-pointer">
                Submit statement anonymously (hide my name and student ID)
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleToggle(statement)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Confirming...' : "Confirm Impact"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
