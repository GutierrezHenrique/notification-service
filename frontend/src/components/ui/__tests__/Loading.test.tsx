import { render, screen } from '@testing-library/react';
import { Loading } from '../Loading';

describe('Loading', () => {
  it('should render loading spinner', () => {
    const { container } = render(<Loading />);
    const spinner = container.querySelector('svg');
    expect(spinner).toBeInTheDocument();
  });

  it('should display text when provided', () => {
    render(<Loading text="Loading data..." />);
    expect(screen.getByText(/loading data/i)).toBeInTheDocument();
  });

  it('should render in full screen mode', () => {
    render(<Loading fullScreen text="Loading..." />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    const container = screen.getByText(/loading/i).closest('.min-h-screen');
    expect(container).toBeInTheDocument();
  });

  it('should apply correct size classes', () => {
    const { container, rerender } = render(<Loading size="sm" />);
    let spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-4', 'w-4');

    rerender(<Loading size="lg" />);
    spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-12', 'w-12');
  });
});
