import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ReportCard from '../components/reports/ReportCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  PlusCircle, 
  BarChart3, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  TrendingUp,
  MapPin,
  ArrowRight,
  Filter
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    openReports: 0,
    underReview: 0,
    resolvedReports: 0,
    participatingStudents: 0,
  });
  const [recentIssues, setRecentIssues] = useState([]);
  const [trendingIssues, setTrendingIssues] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [activeTab, setActiveTab] = useState('recent'); // 'recent', 'trending', 'my_reports'

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [statsData, feedData] = await Promise.all([
          api.get('/stats/summary'),
          api.get('/reports?limit=10'),
        ]);

        if (statsData?.stats) {
          setStats(statsData.stats);
          setTrendingIssues(statsData.trendingIssues || []);
        }

        if (feedData?.reports) {
          setRecentIssues(feedData.reports);
          if (user) {
            setMyReports(feedData.reports.filter((r) => r.student_id === user.id));
          }
        }
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading campus statistics & reports..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Greeting & Quick CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-blue-400">
            Student Issue & Transparency Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">
            Welcome, {profile?.full_name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Track campus facilities, document problems with evidence, and verify real administration solutions.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] flex-shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          Report an Issue
        </Link>
      </div>

      {/* Dynamic Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Campus Reports */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Reports
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalReports}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Campus-wide documented</span>
        </div>

        {/* Open Issues */}
        <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-2xs bg-gradient-to-b from-red-50/20 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Open Issues
            </span>
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-red-700 mt-2">{stats.openReports}</p>
          <span className="text-[11px] text-red-600/70 mt-1 block">Awaiting admin review</span>
        </div>

        {/* Under Review */}
        <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-2xs bg-gradient-to-b from-amber-50/20 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Under Review
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-700 mt-2">{stats.underReview}</p>
          <span className="text-[11px] text-amber-600/70 mt-1 block">Action in progress</span>
        </div>

        {/* Resolved Issues */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-2xs bg-gradient-to-b from-emerald-50/20 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Resolved
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">{stats.resolvedReports}</p>
          <span className="text-[11px] text-emerald-600/70 mt-1 block">Verified fixed</span>
        </div>

        {/* Students Participating */}
        <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl border border-blue-100 p-5 shadow-2xs bg-gradient-to-b from-blue-50/20 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              Participating
            </span>
          </div>
          <p className="text-3xl font-extrabold text-blue-700 mt-2">{stats.participatingStudents}</p>
          <span className="text-[11px] text-blue-600/70 mt-1 block">Verified student body</span>
        </div>
      </div>

      {/* Tabs Row: Recent Issues | Trending / High-Impact | My Submissions */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'recent'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Recent Campus Issues
            </button>

            <button
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'trending'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Trending / High-Impact
            </button>

            <button
              onClick={() => setActiveTab('my_reports')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'my_reports'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              My Reported Issues ({myReports.length})
            </button>
          </div>

          <Link
            to="/feed"
            className="text-xs font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1"
          >
            Explore Complete Feed <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Content based on Active Tab */}
        {activeTab === 'recent' && (
          <div>
            {recentIssues.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <p className="text-slate-500 text-sm">No campus issues reported yet.</p>
                <Link
                  to="/report"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
                >
                  <PlusCircle className="w-4 h-4" />
                  Be the first to submit a report
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentIssues.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'trending' && (
          <div>
            {trendingIssues.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
                No high-impact issues recorded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingIssues.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'my_reports' && (
          <div>
            {myReports.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <p className="text-slate-500 text-sm">You haven't submitted any reports yet.</p>
                <Link
                  to="/report"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
                >
                  <PlusCircle className="w-4 h-4" />
                  Submit your first issue report
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
