import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  Search,
  Link2,
  Gamepad2,
  Network,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Eye,
  FileCheck2,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { api } from '../services/api';
import { AnalysisResult } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { RiskScoreGauge } from '../components/common/RiskScoreGauge';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [demoText, setDemoText] = useState(
    'Congratulations! You have been selected for the Google India Software Engineering Internship. Monthly stipend: Rs 85,000. Pay a refundable laptop security deposit of Rs 2,500 via UPI within 2 hours to confirm your slot. Contact HR on WhatsApp: wa.me/919988776655.'
  );
  const [demoResult, setDemoResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunDemo = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await api.analyzeContent({
        content: demoText,
        analysis_type: 'job_offer',
        consent_store: false,
      });
      setDemoResult(result);
    } catch (err: any) {
      setError(err.message || 'Demo analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Advisory Banner */}
      <div className="bg-red-950/40 border-b border-red-900/40 px-4 py-2 text-center text-xs text-red-300 flex items-center justify-center gap-2">
        <PhoneCall className="w-3.5 h-3.5 text-red-400 shrink-0" />
        <span>Financial cyber fraud victim? Call India&rsquo;s 24x7 Cyber Crime Helpline: <strong>1930</strong> immediately.</span>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-radial-gradient">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Transparent, Rule-Assisted Cybersecurity Assistant
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Think Before You Trust.
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Analyze suspicious messages, inspect questionable links, understand scam warning signs, and make safer decisions online.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/analyze"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-base transition-all shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Analyze a Message
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/simulator"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-semibold text-base transition-all flex items-center justify-center gap-2"
            >
              <Gamepad2 className="w-5 h-5 text-indigo-400" />
              Try the Scam Simulator
            </Link>
          </div>
        </div>

        {/* Live Interactive Demo Section */}
        <div className="max-w-4xl mx-auto mt-16 p-6 rounded-2xl border border-slate-800 bg-slate-900/70 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-cyan-400">Live Interactive Demo</span>
              <h3 className="text-base font-semibold text-white">Experience Explainable Scam Detection in Seconds</h3>
            </div>
            <span className="text-xs text-amber-400/90 font-mono bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
              Fictional Test Sample
            </span>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Editable Sample Content (or type your own message to test):
              </label>
              <textarea
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono leading-relaxed"
                placeholder="Paste an SMS, email, or job offer to analyze..."
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Processed locally by ScamSense rule engine. Content is never shared.
              </span>
              <button
                onClick={handleRunDemo}
                disabled={isAnalyzing || !demoText.trim()}
                className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Run Instant Test
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-950/50 border border-red-800 text-xs text-red-300">
                {error}
              </div>
            )}

            {/* Live Demo Result Preview */}
            {demoResult && (
              <div className="mt-6 p-5 rounded-xl border border-slate-700/60 bg-slate-950/90 space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <RiskBadge assessment={demoResult.assessment} size="lg" />
                    </div>
                    <p className="text-xs text-slate-300 font-medium pt-1 max-w-md">
                      {demoResult.summary}
                    </p>
                  </div>
                  <RiskScoreGauge score={demoResult.risk_score} assessment={demoResult.assessment} size={110} />
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Detected Evidence Indicators ({demoResult.indicators.length}):
                  </h4>
                  <div className="space-y-2">
                    {demoResult.indicators.map((ind, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200">{ind.title}</span>
                          <RiskBadge severity={ind.severity} size="sm" />
                        </div>
                        {ind.evidence && (
                          <p className="text-cyan-300 font-mono text-[11px] bg-slate-950 px-2 py-1 rounded border border-slate-800/80">
                            Excerpt: &ldquo;{ind.evidence}&rdquo;
                          </p>
                        )}
                        <p className="text-slate-400">{ind.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => navigate('/analyze')}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    Open Full Multi-Indicator Workspace <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs uppercase font-mono tracking-wider text-cyan-400">Core Architecture</span>
          <h2 className="text-3xl font-bold text-white">Engineered for Explainable Digital Safety</h2>
          <p className="text-sm text-slate-400">
            Unlike opaque black-box AI tools, ScamSense isolates exact phrases, structural URL markers, and known fraud playbooks to show you the evidence behind every assessment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-colors space-y-3">
            <div className="p-3 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 w-fit">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Explainable Scam Analyzer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deconstructs SMS, emails, job offers, and payment requests. Highlights urgency, advance deposit demands, and credential traps with transparent reasoning.
            </p>
            <Link to="/analyze" className="inline-flex items-center text-xs font-semibold text-cyan-400 hover:text-cyan-300 pt-2">
              Launch Analyzer &rarr;
            </Link>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-colors space-y-3">
            <div className="p-3 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 w-fit">
              <Link2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Suspicious Link Inspector</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Static URL structural inspection detecting punycode homoglyphs, brand positioning in subdomains, raw IP hosting, shorteners, and strict SSRF defenses.
            </p>
            <Link to="/link-inspector" className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 pt-2">
              Inspect a Link &rarr;
            </Link>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-colors space-y-3">
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 w-fit">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Awareness Simulator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive scenario-based training covering fake internships, UPI QR tricks, digital arrests, and parcel customs fraud with real-time scoring.
            </p>
            <Link to="/simulator" className="inline-flex items-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 pt-2">
              Start Simulator &rarr;
            </Link>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-colors space-y-3">
            <div className="p-3 rounded-lg bg-purple-950/60 border border-purple-800/50 text-purple-400 w-fit">
              <Network className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Scam Pattern Explorer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive relational graph mapping connections between recurring scam campaigns, impersonated corporations, malicious domains, and delivery channels.
            </p>
            <Link to="/pattern-explorer" className="inline-flex items-center text-xs font-semibold text-purple-400 hover:text-purple-300 pt-2">
              Explore Graph &rarr;
            </Link>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-colors space-y-3">
            <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-800/50 text-amber-400 w-fit">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">History & Consent Controls</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full control over your data. Opt in to retain summaries or operate in completely content-free mode. Export to CSV/JSON or permanently purge anytime.
            </p>
            <Link to="/reports" className="inline-flex items-center text-xs font-semibold text-amber-400 hover:text-amber-300 pt-2">
              View History &rarr;
            </Link>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-colors space-y-3">
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/50 text-red-400 w-fit">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Emergency Safety Center</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct access to National Cyber Crime Reporting Portal (cybercrime.gov.in), 1930 Helpline, DoT Chakshu, and evidence preservation guidelines.
            </p>
            <Link to="/safety-center" className="inline-flex items-center text-xs font-semibold text-red-400 hover:text-red-300 pt-2">
              Access Safety Center &rarr;
            </Link>
          </div>

        </div>
      </section>

      {/* Trust & Transparency Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-800 bg-slate-950/40">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Guiding Principles</span>
            <h2 className="text-2xl font-bold text-white">Trust, Transparency, and Limitations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Assessments, Not Absolute Guarantees</span>
              </div>
              <p className="text-slate-400">
                A &ldquo;Low observed risk&rdquo; result indicates that known heuristics were not triggered in the submitted snippet. It does not certify that an offer, sender, or website is completely genuine.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>Zero Fabricated Statistics</span>
              </div>
              <p className="text-slate-400">
                We do not display inflated accuracy claims, false customer counts, or fictitious certifications. ScamSense is an open academic engineering project for verifiable digital safety.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                <Lock className="w-4 h-4" />
                <span>Privacy-First Architecture</span>
              </div>
              <p className="text-slate-400">
                You can analyze content without an account. Submitted text is never retained without your explicit opt-in consent, and content-free hashes are used for integrity.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Eye className="w-4 h-4" />
                <span>Independent Verification Always</span>
              </div>
              <p className="text-slate-400">
                Always verify sensitive banking or recruitment communications by navigating to official bookmarks or calling verified numbers, never by replying to unsolicited prompts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Have a Suspicious Message Right Now?</h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Test it with ScamSense in seconds. No registration required to analyze.
        </p>
        <div className="pt-2">
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-all shadow-md"
          >
            Open Scam Analyzer <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
