import React from 'react';
import { AssessmentType, SeverityType } from '../../types';
import { ShieldCheck, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

interface RiskBadgeProps {
  assessment?: AssessmentType;
  severity?: SeverityType;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ assessment, severity, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3.5 py-1.5 gap-2 font-medium',
  }[size];

  if (severity) {
    switch (severity) {
      case 'critical':
        return (
          <span className={`inline-flex items-center rounded-full font-medium bg-red-950/70 text-red-400 border border-red-700/60 ${sizeClasses}`}>
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            Critical Indicator
          </span>
        );
      case 'high':
        return (
          <span className={`inline-flex items-center rounded-full font-medium bg-orange-950/70 text-orange-400 border border-orange-700/60 ${sizeClasses}`}>
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
            High Severity
          </span>
        );
      case 'medium':
        return (
          <span className={`inline-flex items-center rounded-full font-medium bg-amber-950/70 text-amber-300 border border-amber-700/60 ${sizeClasses}`}>
            <Info className="w-3.5 h-3.5 text-amber-300" />
            Medium Warning
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses}`}>
            <Info className="w-3.5 h-3.5 text-slate-400" />
            Low Signal
          </span>
        );
    }
  }

  switch (assessment) {
    case 'high_suspicion':
      return (
        <span className={`inline-flex items-center rounded-full font-semibold bg-red-950/80 text-red-400 border border-red-600/70 shadow-sm ${sizeClasses}`}>
          <AlertOctagon className="w-4 h-4 text-red-400" />
          High Suspicion
        </span>
      );
    case 'caution_advised':
      return (
        <span className={`inline-flex items-center rounded-full font-semibold bg-amber-950/80 text-amber-300 border border-amber-600/70 shadow-sm ${sizeClasses}`}>
          <AlertTriangle className="w-4 h-4 text-amber-300" />
          Caution Advised
        </span>
      );
    case 'low_risk':
    default:
      return (
        <span className={`inline-flex items-center rounded-full font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-600/70 shadow-sm ${sizeClasses}`}>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Low Observed Risk
        </span>
      );
  }
};
