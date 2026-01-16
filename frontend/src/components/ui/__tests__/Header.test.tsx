import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../Header';

describe('Header', () => {
  it('should render title', () => {
    render(<Header title="My Gallery" />);
    expect(screen.getByText(/my gallery/i)).toBeInTheDocument();
  });

  it('should render right content when provided', () => {
    render(
      <Header title="My Gallery" rightContent={<div>Right content</div>} />,
    );
    expect(screen.getByText(/right content/i)).toBeInTheDocument();
  });

  it('should render back button when showBackButton is true', () => {
    const handleBack = jest.fn();
    render(<Header title="My Gallery" showBackButton onBack={handleBack} />);
    expect(screen.getByText(/voltar/i)).toBeInTheDocument();
  });

  it('should call onBack when back button is clicked', async () => {
    const handleBack = jest.fn();
    const user = userEvent.setup();

    render(<Header title="My Gallery" showBackButton onBack={handleBack} />);

    await user.click(screen.getByText(/voltar/i));
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('should not render back button when showBackButton is false', () => {
    render(<Header title="My Gallery" />);
    expect(screen.queryByText(/voltar/i)).not.toBeInTheDocument();
  });
});
