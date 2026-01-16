import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('should render title', () => {
    render(<EmptyState title="No items" />);
    expect(screen.getByText(/no items/i)).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    render(<EmptyState title="No items" description="Add your first item" />);
    expect(screen.getByText(/add your first item/i)).toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    const handleAction = jest.fn();
    render(
      <EmptyState
        title="No items"
        actionLabel="Add item"
        onAction={handleAction}
      />,
    );
    expect(
      screen.getByRole('button', { name: /add item/i }),
    ).toBeInTheDocument();
  });

  it('should call onAction when button is clicked', async () => {
    const handleAction = jest.fn();
    const user = userEvent.setup();

    render(
      <EmptyState
        title="No items"
        actionLabel="Add item"
        onAction={handleAction}
      />,
    );

    await user.click(screen.getByRole('button', { name: /add item/i }));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('should render icon when provided', () => {
    const icon = <div data-testid="icon">Icon</div>;
    render(<EmptyState title="No items" icon={icon} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
