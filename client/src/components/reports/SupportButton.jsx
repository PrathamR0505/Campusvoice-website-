import React, { useState } from 'react';
import { api } from '../../services/api';
import { Users, CheckCircle2, AlertCircle } from 'lucide-react';

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
        <div className="mb-2 p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs flex items-center gap-1.5 font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-white" />
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
          className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer ${
            isReporter
              ? 'bg-zinc-800 text-zinc-300 border border-zinc-700 cursor-default'
              : hasSupported
              ? 'bg-zinc-100 hover:bg-white text-zinc-950 shadow-white/10'
              : 'bg-white hover:bg-zinc-200 text-zinc-950 shadow-white/10'
          } disabled:opacity-70 font-sans`}
        >
          {hasSupported || isReporter ? (
            <CheckCircle2 className="w-4 h-4 text-zinc-950" />
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
            hasSupported || isReporter ? 'bg-zinc-950 text-white' : 'bg-zinc-900 text-white'
          }`}>
            {affectedCount}
          </span>
        </button>

        {hasSupported && !isReporter && (
          <span className="text-xs text-zinc-400 font-sans">
            Click again to remove your impact confirmation.
          </span>
        )}
      </div>

      {/* Statement Modal when adding impact */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-[#121214] rounded-2xl border border-zinc-800 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150 text-zinc-100">
            <div className="flex items-center gap-2.5 text-white mb-2">
              <Users className="w-5 h-5 text-white" />
              <h3 className="font-serif text-xl font-bold text-white">Confirm You Are Affected</h3>
            </div>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed font-normal">
              Your verified student confirmation will help prioritize this issue for administration review.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Add an Optional Student Statement (Facility Condition Note)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. 'Our laboratory has 30 computers, but only 18 were functioning during today\'s practical session.'"
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                className="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all placeholder:text-zinc-600 font-normal"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Please focus on documented equipment and facility conditions.
              </p>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <input
                type="checkbox"
                id="statement_anon"
                checked={isAnonymousStatement}
                onChange={(e) => setIsAnonymousStatement(e.target.checked)}
                className="w-4 h-4 rounded text-zinc-100 focus:ring-zinc-400 border-zinc-700 bg-zinc-950 cursor-pointer"
              />
              <label htmlFor="statement_anon" className="text-xs text-zinc-300 font-medium cursor-pointer">
                Submit statement anonymously (hide my name and student ID)
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleToggle(statement)}
                className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
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
