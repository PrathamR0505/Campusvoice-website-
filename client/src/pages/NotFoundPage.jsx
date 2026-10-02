import React from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
        <Megaphone className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <p className="text-lg font-medium text-slate-700 mt-2">Campus Page Not Found</p>
      <p className="text-sm text-slate-500 max-w-sm mt-1">
        The requested issue report or campus view could not be located.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Home
      </Link>
    </div>
  );
}
