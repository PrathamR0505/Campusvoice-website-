import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import CampusMapView from '../components/map/CampusMapView';
import LoadingSpinner from '../components/common/LoadingSpinner';

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
      <div className="min-h-[70vh] flex items-center justify-center font-sans">
        <LoadingSpinner size="lg" text="Loading official campus layout..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans flex-1 flex flex-col justify-center min-h-[calc(100vh-4rem)]">
      <CampusMapView locations={locations} reports={reports} />
    </div>
  );
}

