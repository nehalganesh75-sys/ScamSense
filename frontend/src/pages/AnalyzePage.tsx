import React, { useState, useEffect } from 'react';
import {
  Search,
  AlertTriangle,
  ShieldCheck,
  AlertOctagon,
  Link2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle,
  Copy,
  ExternalLink,
  Lock,
  Sparkles,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { AnalysisResult, Indicator } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { RiskScoreGauge } from '../components/common/RiskScoreGauge';
import { useAuth } from '../context/AuthContext';

export const AnalyzePage: React.FC = () => {
  const { consentStoreContent } = useAuth();
  const [content, setContent] = useState('');
  const [analysisType, setAnalysisType] = useState('job_offer');
  const [suspiciousUrl, setSuspiciousUrl] = useState('');
  const [consentStore, setConsentStore] = useState(consentStoreContent);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [presetSamples, setPresetSamples] = useState<any[]>([]);
  const [expandedIndicator, setExpandedIndicator] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.getPresetSamples()
      .then(setPresetSamples)
      .catch(() => {});
  }, []);

  const handleSelectPreset = (sample: any) => {
    setContent(sample.content);
    setAnalysisType(sample.category);
    setSuspiciousUrl(sample.suspicious_url || '');
    setError(null);
  };

  const handleClear = () => {
    setContent('');
    setSuspiciousUrl('');
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 5) {
      setError('Please provide at least 5 characters of message content to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await api.analyzeContent({
        content: content.trim(),
        analysis_type: analysisType,
        suspicious_url: suspiciousUrl.trim() || undefined,
        consent_store: consentStore,
      });
      setResult(res);
      if (res.indicators.length > 0) {
        setExpandedIndicator(res.indicators[0].code);
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopySummary = () => {
    if (!result) return;
    const text = `ScamSense Assessment: ${result.assessment.toUpperCase()} (Score: ${result.risk_score}/100)\nSummary: ${result.summary}\nIndicators: ${result.indicators.map(i => i.title).join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider">
          <Search className="w-4 h-4" />
          <span>Core Detection Engine</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Explainable Scam Analyzer</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Paste any suspicious email, SMS, job/internship offer, or payment request. The engine decomposes the text to pinpoint pressure tactics, upfront fee demands, and credential traps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Input Form (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Preset Test Scenarios */}
          {presetSamples.length > 0 && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Load Fictional Test Scenarios:
              </span>
              <div className="flex flex-wrap gap-2">
                {presetSamples.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectPreset(sample)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors"
                  >
                    {sample.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleAnalyze} className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
            {/* Category Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'job_offer', label: 'Job / Internship' },
                { id: 'message', label: 'SMS / Chat' },
                { id: 'email', label: 'Phishing Email' },
                { id: 'payment_request', label: 'Payment / UPI' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setAnalysisType(cat.id)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all text-center ${
                    analysisType === cat.id
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Content Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs text-slate-400">
                <label className="font-medium text-slate-300">Message Content to Analyze *</label>
                <span className="font-mono text-slate-500">{content.length} / 25,000 chars</span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={7}
                maxLength={25000}
                required
                placeholder="Paste the suspicious SMS, WhatsApp message, email body, or job offer here..."
                className="w-full p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono leading-relaxed placeholder:text-slate-600"
              />
            </div>

            {/* Optional URL Input */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                Embedded or Attached Link (Optional)
              </label>
              <input
                type="text"
                value={suspiciousUrl}
                onChange={(e) => setSuspiciousUrl(e.target.value)}
                placeholder="https://example-suspicious-portal.top/login"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono placeholder:text-slate-600"
              />
            </div>

            {/* Privacy Consent Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={consentStore}
                  onChange={(e) => setConsentStore(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-950 text-cyan-600 focus:ring-0"
                />
                <span>
                  Save this analysis report in my session history. (If unchecked, text is analyzed in memory and immediately discarded).
                </span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>

              <button
                type="submit"
                disabled={isAnalyzing || !content.trim()}
                className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-all shadow-md shadow-cyan-950 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Evaluating Rules...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Analyze Content
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Privacy Note */}
          <div className="flex items-center gap-2 text-xs text-slate-500 px-2">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Do not submit personal passwords, banking PINs, or confidential IDs. ScamSense evaluates structure and language patterns.</span>
          </div>
        </div>

        {/* Right Findings Panel (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Assessment Summary Card */}
              <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Assessment</span>
                    <div>
                      <RiskBadge assessment={result.assessment} size="lg" />
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {result.summary}
                    </p>
                  </div>
                  <RiskScoreGauge score={result.risk_score} assessment={result.assessment} size={110} />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                  <span className="text-slate-500 font-mono">
                    {result.indicators.length} warning indicator(s)
                  </span>
                  <button
                    onClick={handleCopySummary}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'Copied!' : 'Copy Summary'}
                  </button>
                </div>
              </div>

              {/* Detected Warning Indicators Breakdown */}
              <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                  Detected Warning Indicators ({result.indicators.length})
                </h3>

                {result.indicators.length === 0 ? (
                  <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Zero suspicious indicators identified
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      No known pressure tactics, advance fee terms, or credential harvesting signals were recognized in this message.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {result.indicators.map((ind) => {
                      const isExpanded = expandedIndicator === ind.code;
                      return (
                        <div
                          key={ind.code}
                          className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden transition-all"
                        >
                          <button
                            type="button"
                            onClick={() => setExpandedIndicator(isExpanded ? null : ind.code)}
                            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-900 transition-colors"
                          >
                            <div className="space-y-1 pr-2">
                              <span className="text-xs font-semibold text-slate-200 block">
                                {ind.title}
                              </span>
                              <RiskBadge severity={ind.severity} size="sm" />
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="px-3.5 pb-3.5 space-y-2.5 text-xs border-t border-slate-800/80 pt-2.5">
                              {ind.evidence && (
                                <div>
                                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5">
                                    Flagged Excerpt:
                                  </span>
                                  <p className="font-mono text-cyan-300 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800 text-[11px] leading-relaxed">
                                    &ldquo;{ind.evidence}&rdquo;
                                  </p>
                                </div>
                              )}
                              <div>
                                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5">
                                  Why This Matters:
                                </span>
                                <p className="text-slate-300 leading-relaxed">
                                  {ind.explanation}
                                </p>
                              </div>
                              <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 text-amber-300/90 text-[11px] flex items-start gap-2">
                                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                                <span>{ind.recommendation}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Embedded URL Inspection Card */}
              {result.url_inspection && (
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-cyan-400" />
                      Attached Link Analysis
                    </span>
                    <RiskBadge assessment={result.url_inspection.assessment} size="sm" />
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1 font-mono">
                    <p className="text-slate-400 truncate">Domain: <strong className="text-cyan-300">{result.url_inspection.normalized_domain}</strong></p>
                    <p className="text-slate-500 text-[11px]">Provider: {result.url_inspection.reputation_provider}</p>
                    {result.url_inspection.structural_flags.length > 0 && (
                      <p className="text-amber-400 text-[11px]">Flags: {result.url_inspection.structural_flags.join(', ')}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Recommended Safety Actions */}
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Recommended Next Steps
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold shrink-0">&bull;</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Assessment Limitations */}
              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/50 text-[11px] text-slate-500 space-y-1.5">
                <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">
                  Methodological Limitations:
                </span>
                {result.limitations.map((lim, i) => (
                  <p key={i} className="leading-relaxed">&bull; {lim}</p>
                ))}
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-slate-800 bg-slate-900/20 text-center space-y-3">
              <div className="p-4 rounded-full bg-slate-800/60 text-slate-500 border border-slate-800">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-slate-300">Awaiting Input Content</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Paste a suspicious message or choose one of the fictional sample scenarios on the left to view evidence indicators and explainable scoring.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
