import React from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#09090b] border-t border-zinc-800 text-zinc-400 text-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold text-white tracking-tight">CampusVoice</span>
                <span className="font-sans text-xs text-zinc-400 font-medium">Student–Powered Transparency</span>
              </div>
            </div>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-md font-normal">
              A student-powered platform for documenting campus facility conditions, sharing verified evidence, and tracking whether reported issues are actually resolved.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-zinc-200" />
              <span>Verified Student Accounts • Strict Privacy Safeguards</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-zinc-200 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs sm:text-sm font-medium">
              <li>
                <Link to="/feed" className="hover:text-white transition-colors">Campus Feed</Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-white transition-colors">Interactive Campus Map</Link>
              </li>
              <li>
                <Link to="/transparency" className="hover:text-white transition-colors">Transparency Analytics</Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-white transition-colors">Report New Issue</Link>
              </li>
            </ul>
          </div>

          {/* Accountability Standards */}
          <div>
            <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-zinc-200 mb-3">Accountability</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-400 font-normal">
              <li>Evidence-Based Documentation</li>
              <li>Community Impact Verification</li>
              <li>Official Administration Audit Trail</li>
              <li>Student Resolution Sign-Off</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-400 gap-4 font-medium">
          <div className="flex flex-col sm:flex-row items-center gap-2.5 text-center sm:text-left">
            <span className="text-zinc-300 font-normal whitespace-nowrap">
              Created by Pratham
            </span>
            <span className="text-white font-bold text-sm sm:text-base leading-relaxed max-w-xl">
              • Website Created to raise voice against illegal fees hike For VTU Students To show what facilities the college is providing
            </span>
          </div>
          <p className="text-white font-bold text-center md:text-right tracking-tight max-w-md">
            Our campus. Our voice. Our Demand against illegal fees hike
          </p>
        </div>
      </div>
    </footer>
  );
}
