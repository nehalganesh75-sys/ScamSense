import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  PhoneCall,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Search,
  BookOpen,
  CheckCircle,
  FileCheck2,
  Lock,
  ChevronDown,
  ChevronUp,
  Building
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const SafetyCenterPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedGuide, setExpandedGuide] = useState<string | null>('guide_fake_internships');

  useEffect(() => {
    setIsLoading(true);
    api.getSafetyResources(selectedCategory)
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [selectedCategory]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  const helplines = data?.emergency_helplines || [];
  const guides = data?.guides || [];

  const filteredGuides = guides.filter((g: any) =>
    search === '' ||
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    g.summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          <span>Verified Official Channels & Protocols</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Digital Safety & Reporting Center</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Actionable safety guides, evidence preservation standards, and verified Indian cybercrime reporting helplines.
        </p>
      </div>

      {/* Emergency Helplines Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-red-400" />
            Official Indian Cybercrime Helplines & Portals
          </h2>
          <span className="text-xs text-red-400 font-mono bg-red-950/60 border border-red-800/60 px-2 py-0.5 rounded">
            Immediate Response
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {helplines.map((h: any, idx: number) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                    {h.operational_hours}
                  </span>
                  <span className="text-xs font-bold text-cyan-400 font-mono">{h.contact}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{h.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {h.description}
                </p>
              </div>

              <a
                href={h.action_url}
                target={h.action_url.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {h.action_url.startsWith('tel:') ? (
                  <>
                    <PhoneCall className="w-3.5 h-3.5 text-red-400" />
                    Call {h.contact}
                  </>
                ) : (
                  <>
                    <span>Visit Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  </>
                )}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Educational Guides Section */}
      <div className="space-y-6 pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Practical Digital Safety Playbooks
            </h2>
            <p className="text-xs text-slate-400">
              Clear defense strategies for students, online sellers, and digital banking users.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter guides..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Guides Accordion */}
        <div className="space-y-3">
          {filteredGuides.map((guide: any) => {
            const isExpanded = expandedGuide === guide.id;
            return (
              <div
                key={guide.id}
                className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setExpandedGuide(isExpanded ? null : guide.id)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-900/70 transition-colors"
                >
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {guide.category.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white pt-1">{guide.title}</h3>
                    <p className="text-xs text-slate-400">{guide.summary}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-5 border-t border-slate-800 bg-slate-950/70 space-y-5 text-xs animate-in fade-in duration-150">
                    {/* Key Takeaways */}
                    <div className="space-y-2">
                      <span className="font-semibold text-cyan-400 uppercase tracking-wider text-[11px] block">
                        Core Principles:
                      </span>
                      <ul className="space-y-1.5">
                        {guide.key_takeaways.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-slate-300">
                            <span className="text-cyan-400 font-bold shrink-0">&bull;</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Checklist */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        Immediate Action Checklist:
                      </span>
                      <ul className="space-y-2">
                        {guide.action_checklist.map((act: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Advisory Notice */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-500 space-y-1">
        <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">
          Legal & Regulatory Disclaimer:
        </span>
        <p className="leading-relaxed">
          The safety guides and helpline directories provided above are for general cybersecurity education and preventive assistance. ScamSense is an independent academic project and does not offer formal legal representation, banking arbitration, or law enforcement services. In the event of monetary theft, always file an official FIR through cybercrime.gov.in or your local police station.
        </p>
      </div>
    </div>
  );
};
