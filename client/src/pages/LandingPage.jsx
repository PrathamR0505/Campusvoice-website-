import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Megaphone, 
  PlusCircle, 
  LayoutDashboard, 
  CheckCircle2, 
  Users, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Flame,
  ThumbsUp,
  Building2,
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recentIssues, setRecentIssues] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    openReports: 0,
    resolvedReports: 0,
    studentsAffected: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, reportsRes] = await Promise.all([
          api.get('/stats/summary').catch(() => null),
          api.get('/reports?limit=3').catch(() => null)
        ]);

        if (statsRes?.stats) {
          setStats(statsRes.stats);
        } else {
          setStats({
            totalReports: 48,
            openReports: 8,
            resolvedReports: 40,
            studentsAffected: 520,
          });
        }

        if (reportsRes?.reports && reportsRes.reports.length > 0) {
          setRecentIssues(reportsRes.reports.slice(0, 3));
        } else {
          setRecentIssues([
            {
              id: '1',
              title: 'Main Academic Block 3rd Floor AC Not Cooling',
              category: { name: 'Electricity', color: '#3F3F46' },
              location: { name: 'Main Academic Block A' },
              status: 'Action Initiated',
              affected_count: 34,
              created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
            },
            {
              id: '2',
              title: 'No Wi-Fi Connectivity in CS Lab 4',
              category: { name: 'Wi-Fi / Internet', color: '#3F3F46' },
              location: { name: 'Computer Science Block C' },
              status: 'Under Review',
              affected_count: 58,
              created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
            },
            {
              id: '3',
              title: 'Water Dispenser Out of Water on Ground Floor',
              category: { name: 'Water', color: '#3F3F46' },
              location: { name: 'Student Canteen' },
              status: 'Resolved',
              affected_count: 82,
              created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
            },
          ]);
        }
      } catch (e) {
        console.error('Error loading landing page data', e);
      }
    }
    loadData();
  }, []);

  return (
    <div className="bg-[#09090b] text-white font-sans selection:bg-white selection:text-black">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (100vh Viewport Section) */}
      {/* ========================================================================= */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 overflow-hidden border-b border-zinc-800/60">
        
        {/* Subtle Monochrome Atmospheric Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[500px] bg-white/[0.03] rounded-full blur-[170px] pointer-events-none" />
        <div className="absolute top-12 right-12 w-96 h-96 bg-zinc-800/20 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 my-auto">
          {/* Hero Main Heading */}
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl text-white tracking-tight leading-[1.1] mb-6 font-bold">
            Your Campus.<br />
            Your Voice.<br />
            <span className="italic font-normal text-white underline decoration-zinc-600 decoration-1 underline-offset-8">Real Change.</span>
          </h1>

          {/* Subheading */}
          <p className="font-sans text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            A transparent platform connecting students directly with campus administration. Report broken facilities, gather verified student support, and hold management accountable.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
            
            <button
              onClick={() => navigate(user ? '/report' : '/login?redirect=/report')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 rounded-xl bg-white text-black font-sans font-bold text-base sm:text-lg hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-5 h-5 text-black" />
              <span>Report an Issue</span>
            </button>

            <button
              onClick={() => navigate('/feed')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-sans font-semibold text-base sm:text-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-sm"
            >
              <LayoutDashboard className="w-5 h-5 text-zinc-300" />
              <span>Dashboard</span>
            </button>

          </div>

          {/* Trust Badges */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-zinc-400 font-sans">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span className="text-zinc-300">Verified Student Identity</span>
            </span>
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-300" />
              <span className="text-zinc-300">Student Power in Numbers</span>
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-zinc-300" />
              <span className="text-zinc-300">Resolution Sign-Off</span>
            </span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. IMPACT STATS SECTION (100vh Viewport Section) */}
      {/* ========================================================================= */}
      <section className="min-h-[70vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-16 border-b border-zinc-800/60">
        <div className="max-w-3xl w-full mx-auto">
          <div className="bg-[#121214] rounded-3xl border border-zinc-800 p-12 text-center shadow-2xl space-y-4">
            <span className="text-xs sm:text-sm font-sans font-bold text-zinc-400 uppercase tracking-widest block">
              Total Reports Logged Across Campus
            </span>
            <p className="font-serif text-6xl sm:text-8xl font-bold text-white tracking-tight">
              {stats.totalReports || 0}
            </p>
            <p className="font-sans text-sm text-zinc-400 max-w-md mx-auto font-normal">
              Documented facility reports, equipment issues, and maintenance tickets logged by students.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. RECENT ISSUES SECTION (100vh Viewport Section) */}
      {/* ========================================================================= */}
      <section className="min-h-[calc(100vh-4rem)] flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b border-zinc-800/60">
        <div className="w-full my-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-white" />
                Active Campus Reports
              </h2>
              <p className="font-sans text-sm text-zinc-400 mt-1">Real issues documented across campus blocks</p>
            </div>
            <button
              onClick={() => navigate('/feed')}
              className="font-sans text-sm font-bold text-white hover:underline inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>View All Issues</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentIssues.map((issue) => (
              <div 
                key={issue.id}
                onClick={() => navigate(`/issue/${issue.id}`)}
                className="bg-[#121214] rounded-2xl border border-zinc-800 p-6 hover:border-zinc-600 transition-all cursor-pointer flex flex-col justify-between group shadow-lg min-h-[220px]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span 
                      className="text-[11px] font-sans font-bold px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-200 border border-zinc-800"
                    >
                      {issue.category?.name || 'General'}
                    </span>
                    <span className="text-xs font-sans font-semibold px-2.5 py-0.5 rounded-full border bg-zinc-900 text-zinc-200 border-zinc-700">
                      {issue.status}
                    </span>
                  </div>

                  <h3 className="font-sans text-base font-bold text-white group-hover:text-zinc-300 transition-colors line-clamp-2 mb-2">
                    {issue.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs font-sans text-zinc-400 mb-4">
                    <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="truncate">{issue.location?.name || 'Campus Location'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs font-sans text-zinc-400">
                  <span className="flex items-center gap-1 font-bold text-white">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {issue.affected_count || 1} Students Affected
                  </span>
                  <span className="text-zinc-400 group-hover:text-white transition-colors">Details →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CALL TO ACTION SECTION (100vh Viewport Section) */}
      {/* ========================================================================= */}
      <section className="min-h-[70vh] flex flex-col justify-center items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[#121214] rounded-3xl border border-zinc-800 p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl w-full max-w-4xl my-auto">
          
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">
            Facing a Campus Issue Right Now?
          </h2>
          <p className="font-sans text-base sm:text-lg text-zinc-400 max-w-xl mx-auto mb-8 font-normal">
            Report it instantly on CampusVoice and get your fellow students to back you up.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate(user ? '/report' : '/login?redirect=/report')}
              className="w-full sm:w-auto px-9 py-4 rounded-xl bg-white text-black font-sans font-bold text-lg hover:bg-zinc-200 hover:scale-105 transition-all cursor-pointer shadow-sm"
            >
              Report an Issue Now
            </button>

            <button
              onClick={() => navigate('/feed')}
              className="w-full sm:w-auto px-9 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-sans font-semibold text-lg transition-all cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}

