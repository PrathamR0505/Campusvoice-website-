import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import CategoryBadge from '../components/common/CategoryBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  ShieldCheck, 
  BarChart3, 
  Wrench, 
  Search, 
  X, 
  Eye, 
  Trash2
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      totalReports: 0,
      openReports: 0,
      underReviewReports: 0,
      actionInitiatedReports: 0,
      resolvedReports: 0,
      reopenedReports: 0,
      totalAffected: 0,
      pendingModeration: 0,
      satisfiedResolutions: 0,
      disputedResolutions: 0,
    },
    reports: [],
    categories: [],
    locations: [],
    moderationQueue: [],
  });

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('reports');

  // Status Update Modal State
  const [selectedReport, setSelectedReport] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [updating, setUpdating] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/overview');
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.error('Error loading admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleOpenStatusModal = (report) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setStatusNote('');
    setEvidenceFiles([]);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedReport || !newStatus) return;

    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      if (statusNote.trim()) formData.append('note', statusNote.trim());

      evidenceFiles.forEach((file) => {
        formData.append('evidence', file);
      });

      await api.put(`/admin/reports/${selectedReport.id}/status`, formData);

      setSelectedReport(null);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update report status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteReport = async (report) => {
    if (!window.confirm(`Are you sure you want to permanently delete the report "${report.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Optimistically remove from state so UI and counts update smoothly
      setData((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          totalReports: Math.max(0, (prev.stats?.totalReports || 1) - 1),
          openReports: report.status === 'Reported' ? Math.max(0, (prev.stats?.openReports || 1) - 1) : prev.stats?.openReports,
          underReviewReports: report.status === 'Under Review' ? Math.max(0, (prev.stats?.underReviewReports || 1) - 1) : prev.stats?.underReviewReports,
          actionInitiatedReports: report.status === 'Action Initiated' ? Math.max(0, (prev.stats?.actionInitiatedReports || 1) - 1) : prev.stats?.actionInitiatedReports,
          resolvedReports: report.status === 'Resolved' ? Math.max(0, (prev.stats?.resolvedReports || 1) - 1) : prev.stats?.resolvedReports,
        },
        reports: (prev.reports || []).filter((r) => r.id !== report.id),
      }));

      await api.delete(`/admin/reports/${report.id}`);
      const res = await api.get('/admin/overview');
      if (res) {
        setData(res);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete report.');
      fetchAdminData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-sans bg-[#09090b]">
        <LoadingSpinner size="lg" text="Loading administration control center..." />
      </div>
    );
  }

  const { stats, reports = [], categories = [], moderationQueue = [] } = data;

  const filteredReports = reports.filter((r) => {
    const titleStr = (r.title || '').toLowerCase();
    const descStr = (r.description || '').toLowerCase();
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || titleStr.includes(query) || descStr.includes(query);
    const matchesCategory =
      categoryFilter === 'all' ||
      r.category_id === categoryFilter ||
      r.category?.id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans bg-[#09090b] text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121214] border border-zinc-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/80 text-xs font-semibold uppercase tracking-wider mb-3 font-sans">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>Administration Facility Control Panel</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-white font-bold">
            Campus Operations Center
          </h1>
          <p className="font-sans text-xs sm:text-sm text-zinc-400 mt-1 font-normal">
            Manage student reports, update maintenance status, upload resolution evidence, and oversee moderation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/feed"
            className="px-4.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 font-bold text-xs transition-colors flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4 text-white" />
            Campus Feed
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 font-sans">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          All Reports Management ({reports.length})
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'moderation'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <span>Content Safety Queue</span>
          {moderationQueue.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-white border border-zinc-700 text-[10px] font-bold">
              {moderationQueue.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab: Reports Management */}
      {activeTab === 'reports' && (
        <div className="space-y-4 font-sans">
          {/* Filters Bar */}
          <div className="bg-[#121214] rounded-2xl border border-zinc-800 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reports by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs focus:outline-none focus:border-zinc-600 font-medium"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-200 text-xs focus:outline-none focus:border-zinc-600 font-medium"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">
                Showing {filteredReports.length} of {reports.length}
              </span>
            </div>
          </div>

          {/* Admin Table */}
          <div className="bg-[#121214] rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Issue / Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Impact</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 text-zinc-200 font-medium">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-zinc-500">
                        No reports found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-white max-w-xs truncate">{report.title}</p>
                          <p className="text-[11px] text-zinc-400 truncate max-w-xs">{report.description}</p>
                        </td>
                        <td className="p-4">
                          <CategoryBadge category={report.category} size="xs" />
                        </td>
                        <td className="p-4 text-zinc-300">
                          {report.location?.name || report.custom_location || 'Campus Grounds'}
                        </td>
                        <td className="p-4 font-bold text-white">
                          👥 {report.affected_count || 1}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <Link
                            to={`/issue/${report.id}`}
                            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80 text-zinc-300 hover:text-white inline-flex items-center transition-colors"
                            title="View Public Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleOpenStatusModal(report)}
                            className="px-3.5 py-2 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 cursor-pointer inline-flex items-center gap-1.5 transition-all shadow-xs"
                          >
                            <Wrench className="w-3.5 h-3.5 text-zinc-950 stroke-[2.2]" />
                            <span>Update Status</span>
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report)}
                            className="p-2 rounded-xl bg-zinc-900 hover:bg-red-950/80 border border-zinc-700/80 hover:border-red-800/80 text-zinc-400 hover:text-red-400 inline-flex items-center cursor-pointer transition-colors"
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-[#121214] rounded-2xl border border-zinc-800 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-xl font-bold text-white">
                Update Report Maintenance Status
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 font-sans">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Target Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-sm focus:outline-none focus:border-zinc-600 font-semibold"
                >
                  <option value="Reported">🔴 Reported</option>
                  <option value="Under Review">🟡 Under Review</option>
                  <option value="Action Initiated">🔵 Action Initiated</option>
                  <option value="Resolved">🟢 Resolved (Work Completed)</option>
                  <option value="Reopened">⚠️ Reopened</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Official Response / Maintenance Note
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide maintenance details, work order number, or progress update..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full p-3 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-all cursor-pointer shadow-sm"
                >
                  {updating ? 'Updating...' : 'Save & Publish Timeline Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
