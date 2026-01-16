import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../Input';

describe('Input', () => {
  it('should render input with label', () => {
    render(<Input label="Email" id="email" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('should render input without label', () => {
    render(<Input id="email" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(<Input id="email" error="Email is required" />);
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  it('should apply error styles when error is present', () => {
    render(<Input id="email" error="Error" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-300');
  });

  it('should handle user input', async () => {
    const user = userEvent.setup();
    render(<Input id="email" />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test@example.com');

    expect(input).toHaveValue('test@example.com');
  });

  it('should forward ref correctly', () => {
    const ref = { current: null };
    render(<Input id="email" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
