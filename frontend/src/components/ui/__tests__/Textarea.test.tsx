import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '../Textarea';

describe('Textarea', () => {
  it('should render textarea with label', () => {
    render(<Textarea label="Description" id="desc" />);
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('should render textarea without label', () => {
    render(<Textarea id="desc" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(<Textarea id="desc" error="Description is required" />);
    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
  });

  it('should apply error styles when error is present', () => {
    render(<Textarea id="desc" error="Error" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('border-red-300');
  });

  it('should handle user input', async () => {
    const user = userEvent.setup();
    render(<Textarea id="desc" />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Test description');

    expect(textarea).toHaveValue('Test description');
  });

  it('should forward ref correctly', () => {
    const ref = { current: null };
    render(<Textarea id="desc" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});
