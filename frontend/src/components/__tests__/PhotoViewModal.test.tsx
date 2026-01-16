import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhotoViewModal from '../PhotoViewModal';
import { Photo } from '../../types/photo';

const mockPhoto: Photo = {
  id: '1',
  title: 'Test Photo',
  description: 'Test Description',
  filename: 'test.jpg',
  size: 1024,
  acquisitionDate: '2024-01-01T10:00:00Z',
  dominantColor: '#FF0000',
  createdAt: '2024-01-01',
};

describe('PhotoViewModal', () => {
  const mockOnClose = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render photo details', () => {
    render(
      <PhotoViewModal
        photo={mockPhoto}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText(/test photo/i)).toBeInTheDocument();
    expect(screen.getByText(/test description/i)).toBeInTheDocument();
    expect(screen.getByText(/1.00 KB/i)).toBeInTheDocument();
  });

  it('should display image', () => {
    render(
      <PhotoViewModal
        photo={mockPhoto}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
      />,
    );

    const img = screen.getByAltText(/test photo/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', expect.stringContaining('test.jpg'));
  });

  it('should call onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <PhotoViewModal
        photo={mockPhoto}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
      />,
    );

    const deleteButton = screen.getByRole('button', { name: /excluir foto/i });
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('should display dominant color', () => {
    render(
      <PhotoViewModal
        photo={mockPhoto}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText(/#FF0000/i)).toBeInTheDocument();
  });

  it('should display "Sem descrição" when description is empty', () => {
    const photoWithoutDescription = { ...mockPhoto, description: '' };
    render(
      <PhotoViewModal
        photo={photoWithoutDescription}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText(/sem descrição/i)).toBeInTheDocument();
  });
});
