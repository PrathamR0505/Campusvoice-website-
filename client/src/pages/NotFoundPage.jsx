import React from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center font-sans">
      <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 text-emerald-400 border border-emerald-900/60 flex items-center justify-center mb-4">
        <Megaphone className="w-8 h-8" />
      </div>
      <h1 className="font-serif text-5xl text-white">404</h1>
      <p className="font-serif text-xl text-slate-200 mt-2">Campus Page Not Found</p>
      <p className="font-sans text-sm text-slate-400 max-w-sm mt-1 font-normal">
        The requested issue report or campus view could not be located.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-semibold text-sm transition-all shadow-md"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Home
      </Link>
    </div>
  );
}
