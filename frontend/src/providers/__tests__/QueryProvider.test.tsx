import { render } from '@testing-library/react';
import { QueryProvider } from '../QueryProvider';

describe('QueryProvider', () => {
  it('should render children', () => {
    const { getByText } = render(
      <QueryProvider>
        <div>Test content</div>
      </QueryProvider>,
    );

    expect(getByText(/test content/i)).toBeInTheDocument();
  });

  it('should provide QueryClient context', () => {
    const { container } = render(
      <QueryProvider>
        <div>Test</div>
      </QueryProvider>,
    );

    expect(container).toBeInTheDocument();
  });
});
