import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  AlertOctagon,
  AlertTriangle,
  ShieldCheck,
  Search,
  Link2,
  Gamepad2,
  BarChart3,
  Calendar,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { DashboardSummary, TrendPoint } from '../types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState('all');

  useEffect(() => {
    setIsLoading(true);
    Promise.all([api.getDashboardSummary(), api.getDashboardTrends()])
      .then(([s, t]) => {
        setSummary(s);
        setTrends(t);
      })
      .catch((err) => setError(err.message || 'Failed to load dashboard metrics'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingSkeleton rows={8} />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-400">
        {error || 'Unable to display dashboard data.'}
      </div>
    );
  }

  // Risk Donut Data
  const riskPieData = [
    { name: 'High Suspicion', value: summary.risk_distribution.high_suspicion, color: '#EF4444' },
    { name: 'Caution Advised', value: summary.risk_distribution.caution_advised, color: '#F59E0B' },
    { name: 'Low Risk', value: summary.risk_distribution.low_risk, color: '#10B981' },
  ].filter(d => riskFilter === 'all' || d.name.toLowerCase().includes(riskFilter));

  // Type Breakdown Data
  const typeData = Object.entries(summary.type_distribution).map(([key, val]) => ({
    name: key.replace('_', ' ').toUpperCase(),
    count: val,
  }));

  // Top Indicators Chart Data
  const indicatorData = summary.top_indicators.map((ind) => ({
    name: ind.title.length > 20 ? ind.title.substring(0, 18) + '...' : ind.title,
    count: ind.count,
    severity: ind.severity,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider">
            <LayoutDashboard className="w-4 h-4" />
            <span>Operational Threat Intelligence</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Detection Analytics Dashboard</h1>
          <p className="text-sm text-slate-400">
            Real-time telemetry and risk distribution trends across submitted content and simulator responses.
          </p>
        </div>

        {summary.is_demo_data && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pre-seeded Demo Dataset Active</span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Content Analyses</span>
            <Search className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{summary.total_analyses}</div>
          <div className="text-[11px] text-slate-500 font-mono">
            Across messages, emails, & job offers
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>High Suspicion Flags</span>
            <AlertOctagon className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400">{summary.risk_distribution.high_suspicion}</div>
          <div className="text-[11px] text-slate-500 font-mono">
            {Math.round((summary.risk_distribution.high_suspicion / Math.max(1, summary.total_analyses)) * 100)}% of submitted volume
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Link Inspections</span>
            <Link2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{summary.total_url_inspections}</div>
          <div className="text-[11px] text-slate-500 font-mono">
            Structural & brand spoof checks
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Simulator Attempts</span>
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{summary.simulator_stats.total_attempts}</div>
          <div className="text-[11px] text-slate-500 font-mono">
            Avg Score: <strong className="text-emerald-400">{summary.simulator_stats.average_score}%</strong>
          </div>
        </div>
      </div>

      {/* Primary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Trend (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Analysis Volume & Severity Timeline
            </h3>
            <span className="text-xs text-slate-500 font-mono">7-Day Trajectory</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCaution" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="high_suspicion" name="High Suspicion" stroke="#EF4444" fillOpacity={1} fill="url(#colorHigh)" />
                <Area type="monotone" dataKey="caution_advised" name="Caution Advised" stroke="#F59E0B" fillOpacity={1} fill="url(#colorCaution)" />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Donut (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Risk Severity Ratio
            </h3>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> High Suspicion
              </span>
              <strong className="text-white font-mono">{summary.risk_distribution.high_suspicion}</strong>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Caution Advised
              </span>
              <strong className="text-white font-mono">{summary.risk_distribution.caution_advised}</strong>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low Observed Risk
              </span>
              <strong className="text-white font-mono">{summary.risk_distribution.low_risk}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Secondary Row: Top Indicators & Content Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Warning Indicators Bar Chart (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Most Frequently Detected Fraud Indicators
            </h3>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={indicatorData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={11} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#06B6D4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Type Breakdown (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Submitted Content Formats
            </h3>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
