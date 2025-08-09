import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useProducts } from '../useProducts';
import { queryClient } from '../../lib/queryClient';

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('useProducts', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('fetches and transforms products correctly', async () => {
    const { result } = renderHook(() => useProducts(), { wrapper });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data to be loaded
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Check data
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]).toEqual({
      id: '1',
      name: 'Test Product',
      Product_Price: '$99.99',
      image: 'https://example.com/image.jpg',
      country: 'Mexico',
      category: 'Test Category',
      supplier: 'Test Supplier',
      Product_MOQ: '10',
      sourceUrl: 'https://example.com/product',
      marketplace: 'Test Source'
    });
  });
});