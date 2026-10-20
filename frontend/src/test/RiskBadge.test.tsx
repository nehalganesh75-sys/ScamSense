import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { RiskBadge } from '../components/common/RiskBadge';

describe('RiskBadge Component', () => {
  it('renders High Suspicion assessment correctly', () => {
    render(<RiskBadge assessment="high_suspicion" />);
    expect(screen.getByText('High Suspicion')).toBeInTheDocument();
  });

  it('renders Caution Advised assessment correctly', () => {
    render(<RiskBadge assessment="caution_advised" />);
    expect(screen.getByText('Caution Advised')).toBeInTheDocument();
  });

  it('renders Low Observed Risk assessment correctly', () => {
    render(<RiskBadge assessment="low_risk" />);
    expect(screen.getByText('Low Observed Risk')).toBeInTheDocument();
  });

  it('renders critical indicator severity badge correctly', () => {
    render(<RiskBadge severity="critical" />);
    expect(screen.getByText('Critical Indicator')).toBeInTheDocument();
  });
});
