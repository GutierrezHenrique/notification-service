import { render, screen } from '@testing-library/react';
import { Alert } from '../Alert';

describe('Alert', () => {
  it('should render alert with children', () => {
    render(<Alert>Error message</Alert>);
    expect(screen.getByText(/error message/i)).toBeInTheDocument();
  });

  it('should apply success styles', () => {
    render(<Alert type="success">Success message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass(
      'bg-green-50',
      'border-green-200',
      'text-green-700',
    );
  });

  it('should apply error styles', () => {
    render(<Alert type="error">Error message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-red-50', 'border-red-200', 'text-red-700');
  });

  it('should apply warning styles', () => {
    render(<Alert type="warning">Warning message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass(
      'bg-yellow-50',
      'border-yellow-200',
      'text-yellow-700',
    );
  });

  it('should apply info styles', () => {
    render(<Alert type="info">Info message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-700');
  });
});
