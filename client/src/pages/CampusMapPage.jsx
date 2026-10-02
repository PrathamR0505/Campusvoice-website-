import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import CampusMapView from '../components/map/CampusMapView';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { MapPin, Building, AlertCircle, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CampusMapPage() {
  const [locations, setLocations] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMapData() {
      try {
        setLoading(true);
        const [optionsRes, reportsRes] = await Promise.all([
          api.get('/reports/options'),
          api.get('/reports?limit=100'),
        ]);

        if (optionsRes.locations) setLocations(optionsRes.locations);
        if (reportsRes.reports) setReports(reportsRes.reports);
      } catch (err) {
        console.error('Error loading campus map data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMapData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading interactive campus map..." />
      </div>
    );
  }

  // Count reports by location
  const locationCounts = {};
  reports.forEach((r) => {
    if (r.location_id) {
      locationCounts[r.location_id] = (locationCounts[r.location_id] || 0) + 1;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Interactive Campus Geographic View</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Campus Facility Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Click on any building or zone marker to inspect active student reports and facility conditions.
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

      {/* Map View */}
      <CampusMapView locations={locations} reports={reports} />

      {/* Location Summary Cards */}
      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-600" />
          Campus Zone Summary
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {locations.map((loc) => {
            const count = locationCounts[loc.id] || 0;
            return (
              <div
                key={loc.id}
                className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-1"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  {loc.building}
                </span>
                <h4 className="font-bold text-slate-900 text-xs truncate">{loc.name}</h4>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 pt-1">
                  <span>{count} Reports</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    count > 0 ? 'bg-red-50 text-red-700 font-bold' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {count > 0 ? `${count} Active` : 'Clean'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
