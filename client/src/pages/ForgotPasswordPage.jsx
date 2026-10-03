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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#09090b] font-sans">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-zinc-100 text-zinc-950 font-bold shadow-lg mb-4">
            <Megaphone className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-tight">
            Reset Password
          </h1>
          <p className="font-sans text-sm text-zinc-400 mt-2 font-normal">
            Enter your college email address and we'll send you recovery instructions.
          </p>
        </div>

        <div className="bg-[#121214] rounded-2xl border border-zinc-800 shadow-xl p-6 sm:p-8 font-sans">
          {message && (
            <div className="mb-5 p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm flex items-start gap-2.5 font-medium">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-white" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm flex items-start gap-2.5 font-medium">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-white" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-sans">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                College Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="student@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all placeholder:text-zinc-600 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 font-sans"
            >
              <span>{submitting ? 'Sending Link...' : 'Send Password Reset Link'}</span>
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-400 mt-6 font-sans">
          <Link to="/login" className="font-semibold text-white hover:underline flex items-center justify-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
