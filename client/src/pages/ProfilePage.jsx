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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/60 font-sans">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Administrator
          </span>
        );
      case 'moderator':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/60 font-sans">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            Moderator
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-sans">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Verified Student
          </span>
        );
    }
  };

  const formattedJoinDate = new Date(profile?.created_at || Date.now()).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl text-white tracking-tight">
          Student Profile Settings
        </h1>
        <p className="font-sans text-sm text-slate-300 mt-1 font-normal">
          Manage your account profile details, college domain affiliation, and verification status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: User Summary Card */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-6 text-center space-y-4 font-sans">
          <div className="w-24 h-24 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-3xl mx-auto border-2 border-slate-700 shadow-md">
            {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="font-serif text-xl text-white">{profile?.full_name || 'Student User'}</h2>
            <p className="font-sans text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>

          <div className="pt-2">{getRoleBadge(profile?.role)}</div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-2 text-left font-medium">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-500" />
                Student ID
              </span>
              <strong className="text-white font-mono">{profile?.student_id || 'STU-VERIFIED'}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                Campus Domain
              </span>
              <strong className="text-white">{profile?.college_domain || 'campus.edu'}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Member Since
              </span>
              <strong className="text-slate-200">{formattedJoinDate}</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-6 sm:p-8 space-y-6 font-sans">
          <h2 className="font-serif text-2xl text-white">Edit Profile Details</h2>

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-900/50 text-red-300 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4 font-sans">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                College Email Address (Read-only)
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 text-sm cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Student Identification Number (Read-only)
              </label>
              <div className="relative">
                <Hash className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  disabled
                  value={profile?.student_id || 'STU-VERIFIED'}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 text-sm uppercase cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
