import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { EmptyState } from '../components/common/EmptyState';

describe('EmptyState Component', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        title="No Reports Found"
        description="Try adjusting your active filter."
      />
    );
    expect(screen.getByText('No Reports Found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your active filter.')).toBeInTheDocument();
  });

  it('triggers action callback when action button is clicked', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="Empty Table"
        description="No items exist"
        actionText="Create Item"
        onAction={handleAction}
      />
    );
    const btn = screen.getByText('Create Item');
    fireEvent.click(btn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
