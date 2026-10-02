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
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  Search, 
  Filter, 
  Upload, 
  X, 
  Eye, 
  Layers, 
  RotateCcw,
  Users,
  Camera,
  MessageSquare
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
  const [activeTab, setActiveTab] = useState('reports'); // 'reports', 'moderation', 'verification'

  // Status Update Modal State
  const [selectedReport, setSelectedReport] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/overview');
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const openStatusModal = (report) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setStatusNote('');
    setEvidenceFiles([]);
    setModalError('');
    setModalSuccess('');
  };

  const closeStatusModal = () => {
    setSelectedReport(null);
    setNewStatus('');
    setStatusNote('');
    setEvidenceFiles([]);
    setModalError('');
    setModalSuccess('');
  };

  const handleStatusUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport || !newStatus) return;

    setModalError('');
    setModalSuccess('');
    setUpdating(true);

    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      if (statusNote.trim()) formData.append('note', statusNote.trim());

      evidenceFiles.forEach((file) => {
        formData.append('evidence', file);
      });

      const res = await api.put(`/admin/reports/${selectedReport.id}/status`, formData);
      setModalSuccess(`Status updated to ${newStatus}`);

      // Refresh overview
      await fetchOverview();

      setTimeout(() => {
        closeStatusModal();
      }, 1000);
    } catch (err) {
      setModalError(err.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  // Filtered reports
  const filteredReports = (data.reports || []).filter((r) => {
    const matchesSearch =
      !search.trim() ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || r.category?.name === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading administration operations..." />
      </div>
    );
  }

  const { stats } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Campus Facility Administration Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Facility Management & Issue Resolution
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Review student-reported facility problems, dispatch work orders, upload photographic resolution evidence, and review student feedback.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
              Admin: {profile?.full_name}
            </span>
          </div>
        </div>
      </div>

      {/* Admin Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Reports</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{stats.totalReports}</p>
        </div>

        <div className="bg-white rounded-2xl border border-red-100 p-4 shadow-2xs bg-gradient-to-b from-red-50/20 to-white">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-red-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Reported
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-red-700 mt-1">{stats.openReports}</p>
        </div>

        <div className="bg-white rounded-2xl border border-amber-100 p-4 shadow-2xs bg-gradient-to-b from-amber-50/20 to-white">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">Under Review</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-1">{stats.underReviewReports}</p>
        </div>

        <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-2xs bg-gradient-to-b from-blue-50/20 to-white">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">Action Initiated</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 mt-1">{stats.actionInitiatedReports}</p>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-2xs bg-gradient-to-b from-emerald-50/20 to-white">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Resolved</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">{stats.resolvedReports}</p>
        </div>

        <div className="bg-white rounded-2xl border border-orange-100 p-4 shadow-2xs bg-gradient-to-b from-orange-50/20 to-white">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-600">Reopened</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-orange-700 mt-1">{stats.reopenedReports}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Campus Reports ({data.reports.length})
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'verification'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Student Verification Feedback</span>
          </button>
        </div>

        {/* Tab 1: All Reports Management Table */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-5">
            {/* Table Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Reported">Reported</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Action Initiated">Action Initiated</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Reopened">Reopened</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {data.categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Issue Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Impact</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Reporter</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No reports matching current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate">
                          <Link to={`/issue/${report.id}`} className="hover:text-blue-600">
                            {report.title}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <CategoryBadge category={report.category} size="xs" />
                        </td>
                        <td className="py-3 px-4 text-slate-600 truncate max-w-[150px]">
                          {report.location?.name || 'Campus'}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {report.affected_count || 1} students
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={report.status} size="xs" />
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {report.is_anonymous ? (
                            <span className="italic text-slate-400">Anonymous</span>
                          ) : (
                            report.reporter?.full_name || 'Student'
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <Link
                            to={`/issue/${report.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>

                          <button
                            onClick={() => openStatusModal(report)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-2xs transition-colors cursor-pointer"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Update Status</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Resolution Verification Feedback */}
        {activeTab === 'verification' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Student Resolution Verification</h3>
              <p className="text-xs text-slate-500 mt-1">
                When an issue is marked resolved, students verify whether the facility problem is truly fixed.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                <span className="text-xs font-semibold uppercase tracking-wider">Confirmed Resolved</span>
                <p className="text-3xl font-extrabold mt-1">{stats.satisfiedResolutions || 0}</p>
                <span className="text-xs text-emerald-600 mt-1 block">Students satisfied with repair</span>
              </div>

              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
                <span className="text-xs font-semibold uppercase tracking-wider">Disputed / Still an Issue</span>
                <p className="text-3xl font-extrabold mt-1">{stats.disputedResolutions || 0}</p>
                <span className="text-xs text-red-600 mt-1 block">Students reporting reoccurrence</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                  Update Official Status
                </span>
                <h3 className="font-bold text-base text-slate-900 truncate max-w-sm">
                  {selectedReport.title}
                </h3>
              </div>
              <button
                onClick={closeStatusModal}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {modalError}
              </div>
            )}

            {modalSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                {modalSuccess}
              </div>
            )}

            <form onSubmit={handleStatusUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Select New Status <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Reported">🔴 Reported (Queue)</option>
                  <option value="Under Review">🟡 Under Review</option>
                  <option value="Action Initiated">🔵 Action Initiated (Technician Dispatched)</option>
                  <option value="Resolved">🟢 Resolved (Completed)</option>
                  <option value="Reopened">⚠️ Reopened</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Administrative Note / Work Order Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Work order dispatched to maintenance team. Expected completion within 48 hours..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  This note will be recorded into the public issue timeline and notify affected students.
                </p>
              </div>

              {/* Resolution Evidence Uploader (Especially when marking Resolved) */}
              {newStatus === 'Resolved' && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Attach Resolution Evidence (Photos)</span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => setEvidenceFiles(Array.from(e.target.files))}
                    className="block w-full text-xs text-slate-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                  />
                  <p className="text-[11px] text-emerald-700">
                    Photographic proof that the facility is restored builds trust and allows students to verify.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeStatusModal}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  {updating ? 'Saving & Notifying...' : 'Save & Publish Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
