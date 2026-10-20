import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  Search,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Globe,
  Lock,
  ExternalLink,
  ShieldAlert,
  Server,
  Layers,
  Info,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { api } from '../services/api';
import { URLInspection } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { RiskScoreGauge } from '../components/common/RiskScoreGauge';
import { useAuth } from '../context/AuthContext';

export const LinkInspectorPage: React.FC = () => {
  const { consentStoreContent } = useAuth();
  const [urlInput, setUrlInput] = useState('');
  const [consentStore, setConsentStore] = useState(consentStoreContent);
  const [isInspecting, setIsInspecting] = useState(false);
  const [result, setResult] = useState<URLInspection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sampleUrls, setSampleUrls] = useState<any[]>([]);

  useEffect(() => {
    api.getSampleUrls().then(setSampleUrls).catch(() => {});
  }, []);

  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setError('Please provide a URL to inspect.');
      return;
    }

    setIsInspecting(true);
    setError(null);
    try {
      const res = await api.inspectUrl({
        url: urlInput.trim(),
        consent_store: consentStore,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Inspection failed');
    } finally {
      setIsInspecting(false);
    }
  };

  const handleLoadSample = (sampleUrl: string) => {
    setUrlInput(sampleUrl);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider">
          <LinkIcon className="w-4 h-4" />
          <span>Structural Domain & Scheme Analysis</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Suspicious Link Inspector</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Evaluate links for deceptive brand positioning, punycode spoofing, IP hosting, shorteners, and abuse-prone TLDs before you click.
        </p>
      </div>

      {/* Preset Test URLs */}
      {sampleUrls.length > 0 && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            Load Sample Verification Links:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleUrls.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadSample(s.url)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* URL Input Form */}
      <form onSubmit={handleInspect} className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            URL to Inspect (HTTP/HTTPS) *
          </label>
          <div className="relative">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. https://paypal.com.verify-billing-update.top/login"
              className="w-full pl-10 pr-24 py-3 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              required
            />
            <div className="absolute left-3.5 top-3.5 text-slate-500">
              <Globe className="w-4 h-4" />
            </div>
            {urlInput && (
              <button
                type="button"
                onClick={() => setUrlInput('')}
                className="absolute right-3 top-3 p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
            <input
              type="checkbox"
              checked={consentStore}
              onChange={(e) => setConsentStore(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-cyan-600 focus:ring-0"
            />
            <span>Store this URL analysis in my history records</span>
          </label>

          <button
            type="submit"
            disabled={isInspecting || !urlInput.trim()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-all shadow-md shadow-cyan-950 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isInspecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Inspecting Structure...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Inspect URL
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Results View */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
          
          {/* Main Inspection Metrics */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Risk Assessment</span>
                  <div>
                    <RiskBadge assessment={result.assessment} size="lg" />
                  </div>
                  <p className="text-xs text-slate-300 font-mono pt-1">
                    Host: <strong className="text-cyan-300">{result.normalized_domain || '[Rejected]'}</strong>
                  </p>
                </div>
                <RiskScoreGauge score={result.risk_score} assessment={result.assessment} size={110} />
              </div>

              {/* Recommendation Box */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Safety Recommendation:</strong>
                  <span>{result.details?.recommendation}</span>
                </div>
              </div>
            </div>

            {/* Structural Flags Detailed Breakdown */}
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                Observed Structural Flags ({result.structural_flags.length})
              </h3>

              {result.structural_flags.length === 0 ? (
                <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Clean Structural Syntax
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    No punycode, brand stuffing, IP addresses, or known disposable TLDs were detected in this domain hierarchy.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {result.details?.flag_explanations?.map((flag, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg border border-slate-800 bg-slate-950 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold text-amber-300">{flag.flag}</span>
                        <RiskBadge severity={flag.severity as any} size="sm" />
                      </div>
                      <p className="text-slate-400 leading-relaxed text-[11px] pt-1">
                        {flag.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Information & Disclaimers */}
          <div className="lg:col-span-5 space-y-6">
            {/* Domain Architecture Metadata */}
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                Parsed Hierarchy Details
              </h3>
              <div className="space-y-2 text-xs font-mono bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">Scheme:</span>
                  <span className="text-slate-200">{result.details?.scheme || 'https'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">Hostname:</span>
                  <span className="text-cyan-300 font-semibold">{result.details?.host || result.normalized_domain}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">TLD Extension:</span>
                  <span className="text-slate-200">.{result.details?.tld || 'com'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">Path:</span>
                  <span className="text-slate-200 truncate max-w-[180px]">{result.details?.path || '/'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Reputation Provider:</span>
                  <span className="text-slate-300">{result.reputation_provider}</span>
                </div>
              </div>
            </div>

            {/* SSRF & Zero-Arbitrary-Fetch Notice */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                <Server className="w-4 h-4" />
                <span>Zero-Fetch Security Architecture</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                To safeguard the backend against Server-Side Request Forgery (SSRF) and DNS rebinding attacks, ScamSense performs static URI parsing and structural threat inspection without executing external requests to user-submitted web servers.
              </p>
            </div>

            {/* General Advice */}
            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/30 text-xs text-slate-400 space-y-1.5">
              <span className="font-semibold text-slate-300 block">Crucial Browser Safety Rule:</span>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Never enter banking credentials or personal details on a website you arrived at from an unsolicited email, SMS, or WhatsApp link. Open your browser and navigate to the known, bookmarked homepage.
              </p>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
