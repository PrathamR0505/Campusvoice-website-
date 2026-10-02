import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import ReportCard from '../components/reports/ReportCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  MapPin, 
  Layers, 
  CheckCircle2, 
  RotateCcw,
  SlidersHorizontal,
  Flame,
  ArrowUpDown
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function IssueFeedPage() {
  const { loading: authLoading } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  // Filter & Search State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'most_affected', 'oldest'

  // Load Categories & Locations for filters
  useEffect(() => {
    async function loadOptions() {
      try {
        const res = await api.get('/reports/options');
        if (res.categories) setCategories(res.categories);
        if (res.locations) setLocations(res.locations);
      } catch (e) {
        console.error('Failed to load filter options:', e);
      }
    }
    loadOptions();
  }, []);

  // Fetch Reports whenever filters or sorting change
  useEffect(() => {
    if (authLoading) return;

    const fetchReports = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search.trim()) params.append('search', search.trim());
        if (selectedCategory !== 'all') params.append('category_id', selectedCategory);
        if (selectedLocation !== 'all') params.append('location_id', selectedLocation);
        if (selectedStatus !== 'all') params.append('status', selectedStatus);
        params.append('sort_by', sortBy);
        params.append('page', pagination.page);
        params.append('limit', 18);

        const res = await api.get(`/reports?${params.toString()}`);
        if (res.reports) {
          setReports(res.reports);
          if (res.pagination) setPagination(res.pagination);
        }
      } catch (err) {
        console.error('Error fetching issue feed:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchReports();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedLocation, selectedStatus, sortBy, pagination.page, authLoading]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSelectedStatus('all');
    setSortBy('recent');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Campus Issues Feed
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse and support active facility reports submitted by verified students across campus.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex-shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Report an Issue
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search issues by title, equipment, keyword, or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Campus Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="Reported">🔴 Reported</option>
              <option value="Under Review">🟡 Under Review</option>
              <option value="Action Initiated">🔵 Action Initiated</option>
              <option value="Resolved">🟢 Resolved</option>
              <option value="Reopened">⚠️ Reopened</option>
            </select>
          </div>

          {/* Sorting Filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="recent">Most Recent</option>
              <option value="most_affected">🔥 Most Affected</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Filter results count and clear button */}
        {(selectedCategory !== 'all' || selectedLocation !== 'all' || selectedStatus !== 'all' || search) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Filtered results: <strong className="text-slate-800">{pagination.total}</strong> issues found
            </span>
            <button
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-500 font-semibold cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" text="Fetching reports..." />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No matching issues found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query, location, or category filters.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
