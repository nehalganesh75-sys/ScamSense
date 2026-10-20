import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  X,
  AlertTriangle,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Lock
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/common/RiskBadge';
import { RiskScoreGauge } from '../components/common/RiskScoreGauge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [assessmentFilter, setAssessmentFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(0);
  const [limit] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchReports = () => {
    setIsLoading(true);
    api.getReports({
      search: search || undefined,
      assessment: assessmentFilter !== 'all' ? assessmentFilter : undefined,
      analysis_type: typeFilter !== 'all' ? typeFilter : undefined,
      limit,
      offset: page * limit,
    })
      .then((data) => {
        setReports(data.items || []);
        setTotalCount(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, [search, assessmentFilter, typeFilter, page]);

  const handleDeleteOne = async (id: number) => {
    try {
      await api.deleteReport(id);
      if (selectedReport?.id === id) setSelectedReport(null);
      setActionMessage(`Report #${id} deleted.`);
      setTimeout(() => setActionMessage(null), 3000);
      fetchReports();
    } catch {
      alert('Failed to delete report.');
    }
  };

  const handleClearAll = async () => {
    try {
      await api.clearAllReports();
      setShowClearConfirm(false);
      setSelectedReport(null);
      setActionMessage('All historical analysis records cleared.');
      setTimeout(() => setActionMessage(null), 3000);
      fetchReports();
    } catch {
      alert('Failed to clear records.');
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Inspection Audit Records</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Analysis History & Reports</h1>
          <p className="text-sm text-slate-400">
            Review past assessments, inspect indicator evidence, or export data in CSV/JSON.
          </p>
        </div>

        {/* Export & Clear Actions */}
        <div className="flex items-center gap-2">
          <a
            href={api.getExportUrl('csv')}
            download
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </a>
          <a
            href={api.getExportUrl('json')}
            download
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </a>
          {reports.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-lg bg-cyan-950/80 border border-cyan-700 text-cyan-300 text-xs">
          {actionMessage}
        </div>
      )}

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Clear Entire Analysis History?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This will permanently wipe all analysis records and associated indicator evidence from the database for your session. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
              >
                Yes, Wipe History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="sm:col-span-5 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search report summaries or keywords..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        {/* Assessment Filter */}
        <div className="sm:col-span-4 flex items-center gap-1.5">
          <span className="text-xs text-slate-400 shrink-0">Severity:</span>
          <select
            value={assessmentFilter}
            onChange={(e) => { setAssessmentFilter(e.target.value); setPage(0); }}
            className="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Assessments</option>
            <option value="high_suspicion">High Suspicion</option>
            <option value="caution_advised">Caution Advised</option>
            <option value="low_risk">Low Observed Risk</option>
          </select>
        </div>

        {/* Type Filter */}
        <div className="sm:col-span-3 flex items-center gap-1.5">
          <span className="text-xs text-slate-400 shrink-0">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
            className="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Types</option>
            <option value="job_offer">Job / Internship</option>
            <option value="message">SMS / Chat</option>
            <option value="email">Email</option>
            <option value="payment_request">Payment / UPI</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : reports.length === 0 ? (
        <EmptyState
          title="No Analysis Reports Stored"
          description={
            search || assessmentFilter !== 'all' || typeFilter !== 'all'
              ? 'No reports match your active filter criteria.'
              : 'Analyses with consent to store will appear here for review and CSV export.'
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Risk Status</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Summary</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400">#{r.id}</td>
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] uppercase">
                          {r.analysis_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge assessment={r.assessment} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {r.risk_score} <span className="text-[10px] text-slate-500 font-normal">/100</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                        {r.summary}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => setSelectedReport(r)}
                          className="p-1.5 rounded hover:bg-slate-800 text-cyan-400 hover:text-cyan-300"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOne(r.id)}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-slate-400 px-2">
              <span>Showing {page * limit + 1} to {Math.min((page + 1) * limit, totalCount)} of {totalCount} reports</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(prev => Math.max(0, prev - 1))}
                  className="p-1.5 rounded bg-slate-900 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>Page {page + 1} of {totalPages}</span>
                <button
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                  className="p-1.5 rounded bg-slate-900 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 text-slate-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-500">Report #{selectedReport.id}</span>
                <RiskBadge assessment={selectedReport.assessment} size="sm" />
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400">Summary</span>
                <p className="text-xs text-slate-200 leading-relaxed">{selectedReport.summary}</p>
                <span className="text-[10px] text-slate-500 block pt-1">
                  Type: {selectedReport.analysis_type} &bull; Stored: {new Date(selectedReport.created_at).toLocaleString()}
                </span>
              </div>
              <RiskScoreGauge score={selectedReport.risk_score} assessment={selectedReport.assessment} size={90} />
            </div>

            {selectedReport.content_preview && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Content Preview:</span>
                <p className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                  {selectedReport.content_preview}
                </p>
              </div>
            )}

            {/* Indicators */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                Warning Indicators ({selectedReport.indicators?.length || 0}):
              </span>
              <div className="space-y-2">
                {selectedReport.indicators?.map((ind: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{ind.title}</span>
                      <RiskBadge severity={ind.severity} size="sm" />
                    </div>
                    {ind.evidence && (
                      <p className="text-cyan-300 font-mono text-[11px] bg-slate-900 p-1.5 rounded">
                        Excerpt: &ldquo;{ind.evidence}&rdquo;
                      </p>
                    )}
                    <p className="text-slate-400 text-[11px]">{ind.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
