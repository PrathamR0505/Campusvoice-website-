import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CategoryBadge from '../components/common/CategoryBadge';
import StatusBadge from '../components/common/StatusBadge';
import { 
  BarChart3, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TransparencyPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTransparencyStats() {
      try {
        setLoading(true);
        const res = await api.get('/stats/summary');
        if (res) setData(res);
      } catch (err) {
        console.error('Error loading transparency analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTransparencyStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-sans">
        <LoadingSpinner size="lg" text="Generating real-time campus transparency statistics..." />
      </div>
    );
  }

  const { stats, categoryStats = [], locationStats = [], recentIssues = [] } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 font-sans min-h-[calc(100vh-4rem)] flex-1 flex flex-col justify-between">
      <div>
        {/* Page Title & Mission */}
        <div className="bg-[#121214] border border-zinc-800 text-white rounded-2xl p-6 sm:p-10 shadow-lg space-y-3 font-sans">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-700 text-xs font-semibold uppercase tracking-wider font-sans">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Institutional Open Data & Accountability</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Campus Facility Transparency Dashboard
          </h1>
          <p className="font-sans text-sm text-zinc-400 max-w-3xl leading-relaxed font-normal">
            Real-time metrics compiled directly from verified student submissions. Track resolution efficiency, active maintenance backlogs, and breakdown distributions across campus blocks.
          </p>
        </div>

        {/* Top 4 Primary Analytics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-sans mt-8">
          <div className="bg-[#121214] rounded-2xl border border-zinc-800 p-6 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Documented</span>
            <p className="font-serif text-3xl sm:text-4xl font-extrabold text-white">{stats?.totalReports || 0}</p>
          </div>

          <div className="bg-[#121214] rounded-2xl border border-zinc-800 p-6 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-white" />
              Active Backlog
            </span>
            <p className="font-serif text-3xl sm:text-4xl font-extrabold text-white">{stats?.openReports || 0}</p>
          </div>

          <div className="bg-[#121214] rounded-2xl border border-zinc-800 p-6 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-white" />
              Verified Resolved
            </span>
            <p className="font-serif text-3xl sm:text-4xl font-extrabold text-white">{stats?.resolvedReports || 0}</p>
          </div>

          <div className="bg-[#121214] rounded-2xl border border-zinc-800 p-6 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-white" />
              Students Impacted
            </span>
            <p className="font-serif text-3xl sm:text-4xl font-extrabold text-white">{stats?.studentsAffected || 0}+</p>
          </div>
        </div>

        {/* Category Breakdown & Location Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans mt-8">
          {/* Breakdown by Facility Category */}
          <div className="bg-[#121214] rounded-2xl border border-zinc-800 p-6 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-white" />
              Issue Volume by Category
            </h2>

            <div className="space-y-3">
              {categoryStats.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No category metrics logged yet.</p>
              ) : (
                categoryStats.map((c, idx) => {
                  const total = stats?.totalReports || 1;
                  const pct = Math.round(((c.count || 0) / total) * 100);
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-zinc-200">{c.category_name}</span>
                        <span className="text-zinc-400">{c.count} issues ({pct}%)</span>
                      </div>
                      <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Breakdown by Campus Location */}
          <div className="bg-[#121214] rounded-2xl border border-zinc-800 p-6 space-y-4 font-sans">
            <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-white" />
              Facility Breakdown by Location
            </h2>

            <div className="space-y-3">
              {locationStats.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No location metrics logged yet.</p>
              ) : (
                locationStats.map((loc, idx) => {
                  const total = stats?.totalReports || 1;
                  const pct = Math.round(((loc.count || 0) / total) * 100);
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-zinc-200">{loc.location_name}</span>
                        <span className="text-zinc-400">{loc.count} reports ({pct}%)</span>
                      </div>
                      <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800">
                        <div
                          className="h-full bg-zinc-300 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
