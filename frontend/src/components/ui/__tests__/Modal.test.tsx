import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('should not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={jest.fn()}>
        Content
      </Modal>,
    );
    expect(screen.queryByText(/content/i)).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()}>
        Content
      </Modal>,
    );
    expect(screen.getByText(/content/i)).toBeInTheDocument();
  });

  it('should display title when provided', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} title="Test Modal">
        Content
      </Modal>,
    );
    expect(screen.getByText(/test modal/i)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        Content
      </Modal>,
    );

    const closeButton = screen.getByRole('button', { name: /×/i });
    await user.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking outside', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div>Content</div>
      </Modal>,
    );

    const overlay = screen.getByText(/content/i).closest('.fixed');
    if (overlay) {
      // Click on the overlay but not on the modal content
      await user.click(overlay as HTMLElement);
    }

    expect(handleClose).toHaveBeenCalled();
  });

  it('should apply correct size classes', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={jest.fn()} size="sm">
        Content
      </Modal>,
    );

    expect(
      screen.getByText(/content/i).closest('.max-w-md'),
    ).toBeInTheDocument();

    rerender(
      <Modal isOpen={true} onClose={jest.fn()} size="xl">
        Content
      </Modal>,
    );

    expect(
      screen.getByText(/content/i).closest('.max-w-4xl'),
    ).toBeInTheDocument();
  });
});
