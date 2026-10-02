import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { MapPin, AlertCircle, Building, Layers } from 'lucide-react';

// Custom Leaflet marker icon creator
const createCustomMarker = (count, hasOpen) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${hasOpen ? '#EF4444' : '#10B981'};
        color: white;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border-radius: 9999px;
        padding: 4px 10px;
        font-weight: bold;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
      ">
        <span style="font-size: 14px;">📍</span>
        <span>${count}</span>
      </div>
    `,
    iconSize: [40, 30],
    iconAnchor: [20, 15],
  });
};

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function CampusMapView({ locations = [], reports = [] }) {
  // Default campus center (Bangalore Tech Campus coords as sample center)
  const defaultCenter = [12.9716, 77.5946];

  // Group reports by location ID
  const reportsByLocation = {};
  reports.forEach((r) => {
    if (r.location_id) {
      if (!reportsByLocation[r.location_id]) {
        reportsByLocation[r.location_id] = [];
      }
      reportsByLocation[r.location_id].push(r);
    }
  });

  return (
    <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={16}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <ChangeView center={defaultCenter} zoom={16} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((loc) => {
          const locReports = reportsByLocation[loc.id] || [];
          const count = locReports.length;
          const hasOpen = locReports.some((r) => r.status !== 'Resolved');

          if (!loc.latitude || !loc.longitude) return null;

          return (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              icon={createCustomMarker(count, hasOpen)}
            >
              <Popup className="custom-popup">
                <div className="p-2 space-y-2 max-w-xs">
                  <div className="border-b border-slate-100 pb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      {loc.building}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{loc.name}</h4>
                    <p className="text-[11px] text-slate-500">{count} total reports</p>
                  </div>

                  {locReports.length === 0 ? (
                    <p className="text-xs text-slate-400 py-1">No active issues recorded for this zone.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {locReports.slice(0, 3).map((rep) => (
                        <div key={rep.id} className="p-1.5 rounded bg-slate-50 border border-slate-100 text-xs">
                          <Link
                            to={`/issue/${rep.id}`}
                            className="font-semibold text-slate-900 hover:text-blue-600 truncate block"
                          >
                            {rep.title}
                          </Link>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                            <span>👥 {rep.affected_count || 1} affected</span>
                            <StatusBadge status={rep.status} size="xs" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
