import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import ReportCard from '../components/reports/ReportCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Search, 
  PlusCircle, 
  Layers
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
  const [sortBy, setSortBy] = useState('recent');

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans min-h-[calc(100vh-4rem)] flex-1 flex flex-col justify-between">
      <div>
        {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Campus Issues Feed
          </h1>
          <p className="font-sans text-sm text-zinc-400 mt-1 font-normal">
            Browse and support active facility reports submitted by verified students across campus.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-sans font-bold text-xs sm:text-sm shadow-md transition-all flex-shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Report an Issue
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#121214] rounded-2xl border border-zinc-800 p-4 sm:p-5 shadow-lg space-y-3 font-sans">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search issues by title, equipment, keyword, or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent transition-all placeholder:text-zinc-500 font-sans font-normal"
          />
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-400 font-sans font-medium"
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
            <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Campus Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-400 font-sans font-medium"
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
            <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-400 font-sans font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="Under Review">Under Review</option>
              <option value="Action Initiated">Action Initiated</option>
              <option value="Resolved">Resolved</option>
              <option value="Reopened">Reopened</option>
            </select>
          </div>

          {/* Sorting Filter */}
          <div>
            <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-400 font-sans font-medium"
            >
              <option value="recent">Most Recent</option>
              <option value="most_affected">Most Affected</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Filter results count and clear button */}
        {(selectedCategory !== 'all' || selectedLocation !== 'all' || selectedStatus !== 'all' || search) && (
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs font-sans">
            <span className="text-zinc-400 font-normal">
              Filtered results: <strong className="text-zinc-100 font-semibold">{pagination.total}</strong> issues found
            </span>
            <button
              onClick={resetFilters}
              className="text-white hover:underline font-semibold cursor-pointer"
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
        <div className="bg-[#121214] rounded-2xl border border-zinc-800 p-12 text-center max-w-md mx-auto font-sans">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 text-zinc-400 flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-white">No matching issues found</h3>
          <p className="text-xs text-zinc-400 mt-1 font-normal">
            Try adjusting your search query, location, or category filters.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors cursor-pointer"
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
    </div>
  );
}
