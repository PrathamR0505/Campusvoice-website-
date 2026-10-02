import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Megaphone, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.message || 'Password reset instructions have been sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to request password reset. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 mb-4">
            <Megaphone className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Reset Password
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Enter your college email address and we'll send you recovery instructions.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {message && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Registered College Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="student@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Sending Request...' : 'Send Reset Instructions'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
