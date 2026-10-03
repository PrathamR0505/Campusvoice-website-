import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ReportCard from '../components/reports/ReportCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  PlusCircle, 
  ArrowRight
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
  const [myReports, setMyReports] = useState([]);
  const [activeTab, setActiveTab] = useState('recent');

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
      <div className="min-h-[70vh] flex items-center justify-center font-sans">
        <LoadingSpinner size="lg" text="Loading campus statistics & reports..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans min-h-[calc(100vh-4rem)] flex-1 flex flex-col justify-between">
      <div>
        {/* Header Greeting & Quick CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121214] border border-zinc-800 text-white rounded-2xl p-6 sm:p-8 shadow-lg">
          <div>
            <span className="font-sans text-xs uppercase tracking-wider font-bold text-zinc-300">
              Student Issue & Transparency Hub
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
              Welcome, {profile?.full_name?.split(' ')[0] || 'Student'}!
            </h1>
            <p className="font-sans text-zinc-400 text-xs sm:text-sm mt-1 max-w-xl font-normal">
              Track campus facilities, document problems with evidence, and verify real administration solutions.
            </p>
          </div>

          <Link
            to="/report"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-sans font-bold text-sm shadow-md transition-all flex-shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            Report an Issue
          </Link>
        </div>

        {/* Dynamic Statistics Cards */}
        <div className="max-w-md mx-auto mt-6">
          <div className="bg-[#121214] rounded-2xl border border-zinc-800 p-6 text-center space-y-1 shadow-lg">
            <span className="font-sans text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Reports Logged</span>
            <p className="font-serif text-4xl font-extrabold text-white">{stats.totalReports || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-6 mt-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('recent')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-sans font-bold transition-all cursor-pointer ${
                  activeTab === 'recent'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                Latest Campus Feed
              </button>

              {user && (
                <button
                  onClick={() => setActiveTab('my_reports')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-sans font-bold transition-all cursor-pointer ${
                    activeTab === 'my_reports'
                      ? 'bg-white text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  My Reported Issues ({myReports.length})
                </button>
              )}
            </div>

            <Link
              to="/feed"
              className="text-xs font-sans font-bold text-white hover:underline flex items-center gap-1"
            >
              Explore All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Tab Content */}
          {activeTab === 'recent' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentIssues.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}

          {activeTab === 'my_reports' && (
            myReports.length === 0 ? (
              <div className="bg-[#121214] rounded-2xl border border-zinc-800 p-12 text-center max-w-md mx-auto font-sans">
                <h3 className="font-serif text-xl font-bold text-white">You haven't reported any issues yet</h3>
                <p className="font-sans text-xs text-zinc-400 mt-1">
                  Notice broken equipment or room maintenance needed? Document it to get it fixed.
                </p>
                <Link
                  to="/report"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-sans font-bold text-xs shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  Submit Your First Report
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
