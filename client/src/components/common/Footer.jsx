import React from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Megaphone className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base">CampusVoice</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md">
              A student-powered platform for documenting campus facility conditions, sharing verified evidence, and tracking whether reported issues are actually resolved.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified College Student Accounts • Strict Privacy Safeguards</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/feed" className="hover:text-blue-400 transition-colors">Campus Feed</Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-blue-400 transition-colors">Interactive Campus Map</Link>
              </li>
              <li>
                <Link to="/transparency" className="hover:text-blue-400 transition-colors">Transparency Analytics</Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-blue-400 transition-colors">Report New Issue</Link>
              </li>
            </ul>
          </div>

          {/* Accountability Standards */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Accountability</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>Evidence-Based Documentation</li>
              <li>Community Impact Verification</li>
              <li>Official Administration Audit Trail</li>
              <li>Student Resolution Sign-Off</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} CampusVoice Platform. Built for student body facility transparency.</p>
          <p className="flex items-center gap-1">
            Student-first campus governance
          </p>
        </div>
      </div>
    </footer>
  );
}
