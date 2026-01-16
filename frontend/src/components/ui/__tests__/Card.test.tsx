import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from '../Card';

describe('Card', () => {
  it('should render children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText(/card content/i)).toBeInTheDocument();
  });

  it('should apply hover styles when hover prop is true', () => {
    const { container } = render(<Card hover>Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('hover:shadow-lg');
  });

  it('should apply cursor pointer when onClick is provided', () => {
    const handleClick = jest.fn();
    const { container } = render(<Card onClick={handleClick}>Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('cursor-pointer');
  });

  it('should call onClick when clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Card onClick={handleClick}>Content</Card>);

    await user.click(screen.getByText(/content/i));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });
});
