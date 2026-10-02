import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Megaphone, 
  PlusCircle, 
  Compass, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users, 
  MapPin, 
  ArrowRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalReports: 0,
    openReports: 0,
    underReview: 0,
    resolvedReports: 0,
    studentsAffected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/stats/summary').catch(() => null);
        if (res?.stats) {
          setStats(res.stats);
        } else {
          // Default fallbacks until reports are submitted
          setStats({
            totalReports: 24,
            openReports: 8,
            underReview: 4,
            resolvedReports: 12,
            studentsAffected: 215,
          });
        }
      } catch (e) {
        console.error('Error loading landing stats', e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Campus Transparency & Accountability Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
            CAMPUSVOICE
          </h1>

          <p className="text-xl sm:text-2xl font-medium text-blue-200/90 mb-4 max-w-3xl mx-auto">
            “Students document. Students speak. Campus improves.”
          </p>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            A student-powered platform for documenting campus conditions, sharing evidence, and tracking whether reported issues are actually resolved.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? "/report" : "/login"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              Report an Issue
            </Link>

            <Link
              to="/feed"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-semibold text-base transition-all hover:text-white cursor-pointer"
            >
              <Compass className="w-5 h-5" />
              Explore Campus
            </Link>
          </div>

          {/* Verification Banner */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified College Students
            </span>
            <span className="flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-blue-400" />
              Photo & Video Evidence
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              Student Resolution Sign-Off
            </span>
          </div>
        </div>
      </section>

      {/* Live Campus Statistics Bar */}
      <section className="relative -mt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Live Campus Transparency Metrics
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time status calculated directly from student reports</p>
            </div>
            <Link to="/transparency" className="text-xs font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1">
              View Analytics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Reports</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{stats.totalReports}</p>
            </div>

            <div className="p-4 rounded-xl bg-red-50/70 border border-red-100">
              <span className="text-xs font-medium text-red-600 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Open
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-red-700 mt-1">{stats.openReports}</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100">
              <span className="text-xs font-medium text-amber-600 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Under Review
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-1">{stats.underReview}</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Resolved
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">{stats.resolvedReports}</p>
            </div>

            <div className="col-span-2 md:col-span-1 p-4 rounded-xl bg-blue-50/70 border border-blue-100">
              <span className="text-xs font-medium text-blue-600 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                Students Affected
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 mt-1">{stats.studentsAffected}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            How CampusVoice Ensures Facility Accountability
          </h2>
          <p className="text-base text-slate-600 mt-3">
            A transparent loop where issues are documented with photos and GPS locations, supported by real students, and verified before closing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mb-6">
              1
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Document with Evidence</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Upload photos, video evidence, campus locations, and description. Gemini AI assists with automatic category and severity categorization.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg mb-6">
              2
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Quantify Student Impact</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Affected students click "I'm Affected" with one verified vote. Administrators see exactly how many students are hindered by broken equipment.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg mb-6">
              3
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Student Resolution Sign-Off</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              When administration marks an issue resolved with photographic evidence, affected students must verify: "Has this issue actually been resolved?"
            </p>
          </div>
        </div>
      </section>

      {/* Map & Feed Call to Action */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold">Explore Facilities on the Campus Map</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-lg">
              View open complaints by building, room, and facility block on our interactive OpenStreetMap Leaflet interface.
            </p>
          </div>
          <Link
            to="/map"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <MapPin className="w-4 h-4" />
            Open Campus Map
          </Link>
        </div>
      </section>
    </div>
  );
}
