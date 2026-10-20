import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Trash2,
  Lock,
  User,
  CheckCircle,
  AlertTriangle,
  Info,
  LogOut,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { user, isAuthenticated, logout, consentStoreContent, setConsentStoreContent } = useAuth();
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeMessage, setPurgeMessage] = useState<string | null>(null);

  const handlePurge = async () => {
    try {
      if (isAuthenticated) {
        const res = await api.purgeUserData();
        setPurgeMessage(res.message);
      } else {
        await api.clearAllReports();
        setPurgeMessage('Guest session history and temporary records cleared.');
      }
      setShowPurgeModal(false);
      setTimeout(() => setPurgeMessage(null), 4000);
    } catch {
      alert('Failed to purge data.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>User Privacy & Controls</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Preferences & Privacy Settings</h1>
        <p className="text-sm text-slate-400">
          Control how your submitted data is handled, manage your session telemetry, or permanently erase your history.
        </p>
      </div>

      {purgeMessage && (
        <div className="p-4 rounded-xl bg-cyan-950/80 border border-cyan-700 text-cyan-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{purgeMessage}</span>
        </div>
      )}

      {/* Account Profile Card */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Account Profile</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300">
            {isAuthenticated ? 'Authenticated Account' : 'Anonymous Guest Session'}
          </span>
        </div>

        {isAuthenticated && user ? (
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-400">Email Address:</span>
              <span className="text-white font-mono">{user.email}</span>
            </div>
            {user.full_name && (
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-400">Full Name:</span>
                <span className="text-white">{user.full_name}</span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Account Created:</span>
              <span className="text-slate-300">{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 space-y-2">
            <p>
              You are currently utilizing ScamSense as an anonymous guest. Your analyses are mapped to an ephemeral local session token and can be wiped anytime.
            </p>
            <p className="text-cyan-400">
              Register an account to sync your reports and simulator progress across multiple browsers.
            </p>
          </div>
        )}
      </div>

      {/* Privacy & Storage Preferences */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-5">
        <div className="flex items-center gap-2 text-white font-semibold text-sm pb-3 border-b border-slate-800">
          <Lock className="w-4 h-4 text-indigo-400" />
          <span>Data Retention & Storage Preferences</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-200 block">
              Retain Content Summaries in Analysis History
            </span>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              When enabled, a truncated preview of analyzed text is saved to your history to allow subsequent review. When disabled, ScamSense runs in zero-retention mode where raw text is analyzed in memory and immediately discarded.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={consentStoreContent}
              onChange={(e) => setConsentStoreContent(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
          </label>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1.5 font-mono">
          <span className="text-slate-300 font-semibold block text-[11px] uppercase tracking-wider">
            Zero-Telemetry Guarantee:
          </span>
          <p className="text-[11px] leading-relaxed">
            ScamSense never logs passwords, credit card PINs, banking numbers, or authentication OTPs. Database fields store deterministic indicator classifications, risk scores, and mathematical hash fingerprints.
          </p>
        </div>
      </div>

      {/* Danger Zone: Wipe All Records */}
      <div className="p-6 rounded-xl border border-red-900/40 bg-red-950/10 space-y-4">
        <div className="flex items-center gap-2 text-red-400 font-semibold text-sm pb-3 border-b border-red-900/30">
          <Trash2 className="w-4 h-4" />
          <span>Data Erasure & Purge</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-200 block">
              Permanently Purge All Data Records
            </span>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              Instantly delete all historical message analyses, link inspection audit logs, and simulator attempts associated with this profile.
            </p>
          </div>

          <button
            onClick={() => setShowPurgeModal(true)}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shrink-0 transition-colors"
          >
            Purge All Data
          </button>
        </div>
      </div>

      {/* Purge Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Confirm Permanent Data Purge
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to permanently delete all your analysis reports and simulator progress from the server? This action is irreversible.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPurgeModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handlePurge}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
              >
                Yes, Purge Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
