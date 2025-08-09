import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from '../ProductCard';
import { analytics } from '../../lib/analytics';
import { vi } from 'vitest';

// Mock analytics
vi.mock('../../lib/analytics', () => ({
  analytics: {
    trackEvent: vi.fn(),
  },
}));

const mockProduct = {
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
};

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders product information correctly', () => {
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Mexico')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('Test Source • Mexico')).toBeInTheDocument();
  });

  it('tracks click event and navigates when clicked', () => {
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Test Product'));

    expect(analytics.trackEvent).toHaveBeenCalledWith('product_click', {
      props: {
        product_id: '1',
        product_name: 'Test Product',
        product_category: 'Test Category',
        product_country: 'Mexico'
      }
    });
  });
});