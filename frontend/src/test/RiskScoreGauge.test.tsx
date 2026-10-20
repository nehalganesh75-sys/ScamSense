import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { RiskScoreGauge } from '../components/common/RiskScoreGauge';

describe('RiskScoreGauge Component', () => {
  it('renders score value and category text', () => {
    render(<RiskScoreGauge score={84} assessment="high_suspicion" />);
    expect(screen.getByText('84')).toBeInTheDocument();
    expect(screen.getByText('High Suspicion')).toBeInTheDocument();
  });

  it('clamps score within 0 to 100 range', () => {
    render(<RiskScoreGauge score={120} assessment="high_suspicion" />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});
