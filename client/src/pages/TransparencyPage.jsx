import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CategoryBadge from '../components/common/CategoryBadge';
import StatusBadge from '../components/common/StatusBadge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Building, 
  Info,
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
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Generating real-time campus transparency statistics..." />
      </div>
    );
  }

  const { stats, categoryStats = [], locationStats = [], recentIssues = [] } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Title & Mission */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 sm:p-10 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold uppercase tracking-wider">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Institutional Open Data & Accountability</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Campus Facility Transparency Dashboard
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
          Real-time metrics calculated directly from verified database records. Track how campus facilities perform, monitor open work orders, and audit resolution efficiency.
        </p>
      </div>

      {/* Primary KPI Metrics (Requirement 15) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* TOTAL REPORTS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Reports
          </span>
          <p className="text-4xl font-extrabold text-slate-900 mt-2">
            {stats?.totalReports || 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Documented by students</span>
        </div>

        {/* OPEN */}
        <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-2xs bg-gradient-to-b from-red-50/20 to-white">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Open Issues
          </span>
          <p className="text-4xl font-extrabold text-red-700 mt-2">
            {stats?.openReports || 0}
          </p>
          <span className="text-[11px] text-red-600/70 mt-1 block">Awaiting admin review</span>
        </div>

        {/* UNDER REVIEW */}
        <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-2xs bg-gradient-to-b from-amber-50/20 to-white">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Under Review
          </span>
          <p className="text-4xl font-extrabold text-amber-700 mt-2">
            {stats?.underReview || 0}
          </p>
          <span className="text-[11px] text-amber-600/70 mt-1 block">Technician work orders</span>
        </div>

        {/* RESOLVED */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-2xs bg-gradient-to-b from-emerald-50/20 to-white">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Resolved Issues
          </span>
          <p className="text-4xl font-extrabold text-emerald-700 mt-2">
            {stats?.resolvedReports || 0}
          </p>
          <span className="text-[11px] text-emerald-600/70 mt-1 block">Verified repaired</span>
        </div>

        {/* STUDENTS AFFECTED */}
        <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl border border-blue-100 p-6 shadow-2xs bg-gradient-to-b from-blue-50/20 to-white">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            Students Affected
          </span>
          <p className="text-4xl font-extrabold text-blue-700 mt-2">
            {stats?.studentsAffected || 0}
          </p>
          <span className="text-[11px] text-blue-600/70 mt-1 block">Verified impact count</span>
        </div>
      </div>

      {/* Category Distribution Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Most Frequently Reported Facility Categories
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Categorical distribution of documented campus complaints
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryStats.map((cat) => {
            const percentage = stats?.totalReports > 0
              ? Math.round((cat.count / stats.totalReports) * 100)
              : 0;

            return (
              <div
                key={cat.id}
                className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <CategoryBadge category={cat} size="sm" />
                  <span className="text-sm font-extrabold text-slate-900">
                    {cat.count} reports
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: cat.color || '#2563EB',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Share of total: {percentage}%</span>
                  <span>{cat.count > 0 ? 'Active tracking' : 'No issues'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Open Issues by Campus Location */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            Open Issues by Campus Zone
          </h2>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {locationStats.map((loc) => (
              <div
                key={loc.id}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    {loc.building}
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs">{loc.name}</h4>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900 block">
                      {loc.count} Total
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {loc.openCount} Open
                    </span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    loc.openCount > 0
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {loc.openCount > 0 ? `${loc.openCount} Open` : 'Clean'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Rate & Standards Guarantee */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Resolution Efficiency Metrics
            </h2>

            <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Verified Resolution Efficiency Rate
              </span>
              <p className="text-5xl font-black text-white">
                {stats?.resolutionRate || 0}%
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Calculated from verified closed work orders where affected students signed off on satisfactory repair.
              </p>
            </div>
          </div>

          {/* Fee & Resource Clarity Notice (Requirement 15) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Institutional Policy & Documentation Notice</span>
            </div>
            <p className="leading-relaxed">
              CampusVoice displays officially documented facility reports and student body impact counts. All statistical indicators are calculated dynamically from database submissions. Financial and fee-related figures are restricted to officially published institutional budgets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
