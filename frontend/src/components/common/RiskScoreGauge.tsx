import React from 'react';
import { AssessmentType } from '../../types';

interface RiskScoreGaugeProps {
  score: number;
  assessment: AssessmentType;
  size?: number;
}

export const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({
  score,
  assessment,
  size = 140,
}) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Score clamped between 0 and 100
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let strokeColor = '#10B981'; // Emerald
  let glowColor = 'rgba(16, 185, 129, 0.2)';
  let labelText = 'Low Risk';

  if (assessment === 'high_suspicion') {
    strokeColor = '#EF4444'; // Red
    glowColor = 'rgba(239, 68, 68, 0.25)';
    labelText = 'High Suspicion';
  } else if (assessment === 'caution_advised') {
    strokeColor = '#F59E0B'; // Amber
    glowColor = 'rgba(245, 158, 11, 0.25)';
    labelText = 'Caution Advised';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Indicator */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 6px ${glowColor})`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold tracking-tight text-white">
            {clampedScore}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
            / 100 Score
          </span>
        </div>
      </div>
      <span
        className="mt-2 text-xs font-semibold tracking-wide uppercase"
        style={{ color: strokeColor }}
      >
        {labelText}
      </span>
    </div>
  );
};
