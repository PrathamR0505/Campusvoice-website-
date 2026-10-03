import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import {
  MapPin,
  Building,
  PlusCircle,
  CheckCircle2,
  X,
  ChevronRight,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Move,
  Info
} from 'lucide-react';

// Real Campus Blocks identified from the user's official top-view campus map
const DEFAULT_CAMPUS_BLOCKS = [
  {
    id: 'admin-block',
    name: 'Admin Block',
    building: 'Administrative Offices & Dean',
    description: 'Main administration building, accounts, principal office, and student affairs.',
    category: 'Administrative'
  },
  {
    id: 'main-building',
    name: 'Main Building',
    building: 'Academic Block & Classrooms',
    description: 'Primary academic halls, central lecture rooms, and departmental offices.',
    category: 'Academic'
  },
  {
    id: 'commerce-block',
    name: 'Commerce Block',
    building: 'Commerce & Management Sciences',
    description: 'Classrooms and faculty cabins for commerce and management students.',
    category: 'Academic'
  },
  {
    id: 'mechanical-building',
    name: 'Mechanical Building',
    building: 'Engineering Workshops & Labs',
    description: 'Mechanical engineering laboratories, workshops, and machine halls.',
    category: 'Laboratories'
  },
  {
    id: 'boys-hostel',
    name: 'Boys Hostel',
    building: 'Student Residential Complex',
    description: 'Boys residential quarters, mess hall, and common rooms.',
    category: 'Hostels'
  },
  {
    id: 'girls-hostel',
    name: 'Girls Hostel',
    building: 'Female Residential Complex',
    description: 'Girls residential quarters and dedicated campus security wing.',
    category: 'Hostels'
  },
  {
    id: 'cricket-ground',
    name: 'Cricket Ground',
    building: 'College Sports Field',
    description: 'Central cricket ground of college (Restricted access zone).',
    category: 'Sports & Amenities'
  },
  {
    id: 'indoor-sports',
    name: 'Indoor Sports & Gym Area',
    building: 'Fitness & Indoor Recreation',
    description: 'Indoor gymnasium and sports area (Frequently reported closed/unusable).',
    category: 'Sports & Amenities'
  },
  {
    id: 'old-canteen-building',
    name: 'Old Broken Building & Canteen',
    building: 'Ground Floor Canteen Zone',
    description: 'Old broken building with ground floor canteen (Unfixed for 10+ years).',
    category: 'Infrastructure Alert'
  },
  {
    id: 'unused-waste-land',
    name: 'Northwest Perimeter & Land Area',
    building: 'Campus Boundary & Land Zone',
    description: 'Unused land area near illegal waste dumping boundary.',
    category: 'Environmental'
  }
];

// Interactive Pan & Zoom Canvas Sub-Component
function InteractiveMapCanvas({ onExpandFullscreen, isFullWindow = false }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.3, 3.5));
  const handleZoomOut = () => {
    setZoom((prev) => {
      const nextZoom = Math.max(prev - 0.3, 1);
      if (nextZoom === 1) setPan({ x: 0, y: 0 });
      return nextZoom;
    });
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom((prev) => {
      const nextZoom = Math.min(Math.max(prev + delta, 1), 3.5);
      if (nextZoom === 1) setPan({ x: 0, y: 0 });
      return nextZoom;
    });
  };

  // Attach wheel listener natively to prevent scroll interference
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative w-full rounded-2xl overflow-hidden bg-slate-950 select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      } ${isFullWindow ? 'h-[82vh]' : 'h-[520px]'}`}
    >
      {/* Pan & Zoom Image Container */}
      <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
        <img
          src="/campus_map.jpg"
          alt="Official Interactive Top View Campus Map"
          draggable={false}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
          className="max-w-full max-h-full object-contain pointer-events-none rounded-lg"
        />
      </div>

      {/* Floating Instructions Helper */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-slate-300 text-xs font-medium shadow-lg">
          <Move className="w-3.5 h-3.5 text-emerald-400" />
          <span>Click & Drag to pan • Scroll to zoom</span>
        </div>
      </div>

      {/* Floating Controls Bar (Zoom + Expand Full Map View) */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <div className="inline-flex items-center bg-slate-900/90 backdrop-blur-md rounded-xl p-1 shadow-xl text-xs gap-1 border border-slate-800/60">
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-emerald-400 px-2 min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Reset Zoom & Position"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {onExpandFullscreen && (
          <button
            onClick={onExpandFullscreen}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xl transition-all cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Expand Full Map View</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function CampusMapView({ locations = [], reports = [] }) {
  const navigate = useNavigate();
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Combine DB locations with actual campus map blocks
  const campusBlocks = locations.length > 0 ? locations : DEFAULT_CAMPUS_BLOCKS;

  // Group reports by location ID or location name match
  const getReportsForBlock = (block) => {
    return reports.filter((r) => {
      if (r.location_id && (r.location_id === block.id || r.location_id === block._id)) return true;
      if (r.location?.name && r.location.name.toLowerCase().includes(block.name.toLowerCase())) return true;
      if (r.custom_location && r.custom_location.toLowerCase().includes(block.name.toLowerCase())) return true;
      if (r.title && r.title.toLowerCase().includes(block.name.toLowerCase())) return true;
      return false;
    });
  };

  const handleReportAtLocation = (block) => {
    const locIdParam = block.id || block._id || encodeURIComponent(block.name);
    navigate(`/report?location=${locIdParam}&locationName=${encodeURIComponent(block.name)}`);
  };

  return (
    <div className="w-full flex flex-col space-y-6 font-sans">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Campus Geographic View</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-white tracking-tight">
            Campus Facility Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 font-normal">
            Drag, scroll, and zoom on the campus map below. Select any facility from the directory to file or inspect reports.
          </p>
        </div>

        <button
          onClick={() => setIsFullscreen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex-shrink-0 cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
          <span>Expand Full Map View</span>
        </button>
      </div>

      {/* Main Split Grid: Interactive Pan & Zoom Map (Left) & Campus Blocks Directory (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map Canvas (No borders) */}
        <div className="lg:col-span-7 space-y-2">
          <InteractiveMapCanvas onExpandFullscreen={() => setIsFullscreen(true)} />
        </div>

        {/* Right Column: Campus Blocks Directory */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col space-y-4">
          <div className="border-b border-slate-800/80 pb-3">
            <h3 className="font-serif text-xl text-white font-bold flex items-center justify-between">
              <span>Campus Zone Directory</span>
              <span className="text-xs font-sans font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                {campusBlocks.length} Zones
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select any block to view complaints or file a report for that section.
            </p>
          </div>

          {/* Blocks List */}
          <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
            {campusBlocks.map((block, idx) => {
              const blockReports = getReportsForBlock(block);
              const openCount = blockReports.filter((r) => r.status !== 'Resolved').length;

              return (
                <div
                  key={block.id || idx}
                  onClick={() => setSelectedBlock(block)}
                  className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800/80 hover:border-emerald-500/50 transition-all cursor-pointer group flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                        {block.name}
                      </span>
                      {openCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-800/80 text-red-400 text-[10px] font-extrabold flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {openCount} active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 font-normal">
                      {block.description || block.building}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="p-1.5 rounded-lg bg-slate-900 group-hover:bg-emerald-600 text-slate-400 group-hover:text-white transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Block Interactive Report Action Modal */}
      {selectedBlock && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold uppercase tracking-wider mb-1.5 font-sans">
                  <Building className="w-3 h-3 text-emerald-400" />
                  <span>{selectedBlock.building || 'Campus Zone'}</span>
                </div>
                <h3 className="font-serif text-2xl text-white font-bold">{selectedBlock.name}</h3>
                <p className="text-xs text-slate-300 mt-1">{selectedBlock.description}</p>
              </div>

              <button
                onClick={() => setSelectedBlock(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Box: Direct Report Trigger */}
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white font-serif">Have an issue in {selectedBlock.name}?</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Submit an instant report directly assigned to this location.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleReportAtLocation(selectedBlock)}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Report Issue in {selectedBlock.name}
              </button>
            </div>

            {/* List of existing reports for this block */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recent Reports Logged at Location ({getReportsForBlock(selectedBlock).length})
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {getReportsForBlock(selectedBlock).length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-400 text-xs space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                    <p className="font-semibold text-white">No Active Unresolved Complaints</p>
                    <p className="text-[11px] text-slate-400">
                      No active issues currently logged for {selectedBlock.name}.
                    </p>
                  </div>
                ) : (
                  getReportsForBlock(selectedBlock).map((rep) => (
                    <div
                      key={rep.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <Link
                          to={`/issue/${rep.id}`}
                          className="font-bold text-white text-xs hover:text-emerald-400 transition-colors truncate block"
                        >
                          {rep.title}
                        </Link>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>👥 {rep.affected_count || 1} affected</span>
                          <span>•</span>
                          <span>{new Date(rep.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusBadge status={rep.status} size="xs" />
                        <Link
                          to={`/issue/${rep.id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer Close */}
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedBlock(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Map Viewer Modal with Pan & Zoom Canvas */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-400" />
              Full Screen Interactive Campus Blueprint Map
            </h3>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden p-2 mt-4">
            <InteractiveMapCanvas isFullWindow={true} />
          </div>
        </div>
      )}
    </div>
  );
}



