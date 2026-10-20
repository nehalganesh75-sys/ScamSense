import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, PhoneCall, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800 bg-[#080C14] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand & Purpose */}
        <div className="md:col-span-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Shield className="w-4 h-4" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">ScamSense</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            AI-powered digital safety assistant designed for transparent scam detection, suspicious link inspection, and cyber awareness education.
          </p>
          <div className="pt-2">
            <span className="inline-block px-2 py-1 text-[11px] font-mono rounded bg-slate-900 border border-slate-800 text-slate-400">
              Academic & Open Safety Project
            </span>
          </div>
        </div>

        {/* Core Navigation */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Tools</h4>
          <ul className="space-y-1.5 text-xs">
            <li><Link to="/analyze" className="hover:text-cyan-400 transition-colors">Scam Analyzer</Link></li>
            <li><Link to="/link-inspector" className="hover:text-cyan-400 transition-colors">Link Inspector</Link></li>
            <li><Link to="/pattern-explorer" className="hover:text-cyan-400 transition-colors">Pattern Explorer</Link></li>
            <li><Link to="/simulator" className="hover:text-cyan-400 transition-colors">Scam Simulator</Link></li>
            <li><Link to="/dashboard" className="hover:text-cyan-400 transition-colors">Analytics Dashboard</Link></li>
          </ul>
        </div>

        {/* Resources & Safety */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Safety & Rights</h4>
          <ul className="space-y-1.5 text-xs">
            <li><Link to="/safety-center" className="hover:text-cyan-400 transition-colors">Safety Center & Helplines</Link></li>
            <li><Link to="/reports" className="hover:text-cyan-400 transition-colors">Your Analysis History</Link></li>
            <li><Link to="/settings" className="hover:text-cyan-400 transition-colors">Privacy & Data Settings</Link></li>
            <li>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
              >
                Cyber Crime Portal <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>

        {/* Official Reporting Advisory */}
        <div className="space-y-3 p-4 rounded-xl border border-red-900/50 bg-red-950/20">
          <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>Emergency Cyber Reporting</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            If you have lost money to a financial cyber fraud, dial the 24x7 National Helpline immediately:
          </p>
          <a
            href="tel:1930"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors shadow-sm"
          >
            <PhoneCall className="w-4 h-4" />
            Dial 1930 (Helpline)
          </a>
          <span className="block text-[11px] text-slate-400 text-center">
            Act within 2 hours to freeze illicit debits.
          </span>
        </div>

      </div>

      {/* Disclaimers & Transparency Notice */}
      <div className="max-w-7xl mx-auto border-t border-slate-800/80 mt-8 pt-6 text-[11px] text-slate-500 space-y-2">
        <p className="leading-relaxed">
          <strong className="text-slate-400">Important Advisory:</strong> ScamSense is an educational and heuristic risk assessment assistant. An assessment of &ldquo;Low observed risk&rdquo; does not guarantee that a message, offer, or URL is genuine or safe. Always verify unexpected contacts through independently verified official channels. Never enter passwords, PINs, or OTPs.
        </p>
        <p className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-slate-500">
          <span>&copy; {new Date().getFullYear()} ScamSense Project. Built for digital safety and computer science research.</span>
          <span className="font-mono text-[10px]">Zero telemetry without consent &bull; Content-free mode supported</span>
        </p>
      </div>
    </footer>
  );
};
