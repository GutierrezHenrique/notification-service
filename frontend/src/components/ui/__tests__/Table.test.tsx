import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table, TableRow, TableCell } from '../Table';

describe('Table', () => {
  it('should render table with headers', () => {
    render(
      <Table headers={['Name', 'Email']}>
        <TableRow>
          <TableCell>John</TableCell>
          <TableCell>john@example.com</TableCell>
        </TableRow>
      </Table>,
    );

    expect(screen.getByText(/name/i)).toBeInTheDocument();
    expect(screen.getByText(/email/i)).toBeInTheDocument();
    expect(screen.getByText(/john/i)).toBeInTheDocument();
  });

  it('should render table rows', () => {
    render(
      <Table headers={['Name']}>
        <TableRow>
          <TableCell>John</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Jane</TableCell>
        </TableRow>
      </Table>,
    );

    expect(screen.getByText(/john/i)).toBeInTheDocument();
    expect(screen.getByText(/jane/i)).toBeInTheDocument();
  });

  it('should call onClick when row is clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(
      <Table headers={['Name']}>
        <TableRow onClick={handleClick}>
          <TableCell>John</TableCell>
        </TableRow>
      </Table>,
    );

    await user.click(screen.getByText(/john/i).closest('tr')!);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className to TableCell', () => {
    render(
      <Table headers={['Name']}>
        <TableRow>
          <TableCell className="custom-class">John</TableCell>
        </TableRow>
      </Table>,
    );

    const cell = screen.getByText(/john/i).closest('td');
    expect(cell).toHaveClass('custom-class');
  });
});
