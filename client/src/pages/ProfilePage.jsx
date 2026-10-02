import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Hash, 
  ShieldCheck, 
  Calendar, 
  Building, 
  CheckCircle2, 
  AlertCircle,
  Save
} from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Full name cannot be blank.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ full_name: fullName.trim() });
      setSuccessMsg('Profile updated successfully.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            Administrator
          </span>
        );
      case 'moderator':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            Moderator
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <User className="w-3.5 h-3.5 text-blue-600" />
            Verified Student
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Student Profile & Settings</h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage your verified campus credentials and reporting preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left ID Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-2xl font-bold flex items-center justify-center mx-auto shadow-md shadow-blue-500/20 mb-4">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
            </div>
            
            <h2 className="text-lg font-bold text-slate-900">{profile?.full_name || 'Campus Student'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{profile?.email || user?.email}</p>

            <div className="mt-3">
              {getRoleBadge(profile?.role)}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <Hash className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Student ID: <strong className="text-slate-900">{profile?.student_id || 'N/A'}</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <Building className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Domain: <strong className="text-slate-900">@{profile?.college_domain || 'campus.edu'}</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '2026'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h3 className="text-base font-bold text-slate-900 mb-4">Account Information</h3>

            {successMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  College Email (Verified)
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Institutional email addresses cannot be altered once verified.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Student ID Number
                </label>
                <div className="relative">
                  <Hash className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    disabled
                    value={profile?.student_id || ''}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Privacy & Accountability Guarantees */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Privacy & Anonymity Commitment
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              When you submit a report or supporting statement anonymously, CampusVoice guarantees that your full name, student ID, and email address will NEVER be visible to students or facility administrators. Your identity is stored strictly for abuse prevention and duplicate-vote mitigation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
