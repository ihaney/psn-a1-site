export interface Product {
  id: string;
  name: string;
  Product_Price: string;
  image: string;
  country: string;
  category: string;
  supplier: string;
  Product_MOQ: string;
  sourceUrl: string;
  marketplace: string;
}

export interface Supplier {
  id: string;
  name: string;
  description: string;
  website: string;
  country: string;
  address: string;
  email: string;
  phone: string;
  products: Product[];
}

type Category = {
  id: string;
  name: string;
  description: string;
}

export interface TariffCategory {
  id: string;
  name: string;
  rate: number;
  description?: string;
}

interface TariffCalculation {
  categories: TariffCategory[];
  baseAmount: number;
  totalTariff: number;
  effectiveRate: number;
}

export interface SearchTerm {
  id: string;
  term: string;
  type: 'product' | 'supplier';
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  imageUrl?: string; // Added for thumbnail display
}

export interface SavedSupplierItem {
  id: string;
  name: string;
  description: string;
  website: string;
  email: string;
  location: string;
  whatsapp: string;
  country: string;
  city: string;
  sourceId: string;
}