// Brand types
export type Brand = 'HM' | 'ZARA' | 'UNIQLO' | 'MUJI' | 'CHARLESKEITH';

// Gender types
export type Gender = 'MAN' | 'WOMAN' | 'UNISEX';

// Category types
export type Category = 'TOP' | 'BOTTOM' | 'OUTER' | 'SHOES' | 'ETC';

// Product interface
export interface Product {
  id: number;
  name: string;
  brand: Brand;
  category: Category;
  gender: Gender;
  originalPrice: number;
  salePrice: number;
  discountRate: number;
  imageUrl: string;
  productUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

// API Response types
export interface ProductsResponse {
  products: Product[];
  totalCount: number;
  page?: number;
  size?: number;
}

export interface ProductDetailResponse {
  product: Product;
  priceHistory?: PriceHistory[];
}

export interface PriceHistory {
  date: string;
  price: number;
}

export interface SaleCountResponse {
  count: number;
  brand?: Brand;
}

// Filter types
export interface FilterState {
  selectedBrands: Brand[];
  selectedGenders: Gender[];
  selectedCategories: Category[];
  keyword: string;
  maxPrice: number;
  minDiscountRate: number;
}

export interface AdvancedFilters {
  maxPrice: number;
  minDiscountRate: number;
}

// Pagination types
export interface PaginationState {
  page: number;
  size: number;
  hasMore: boolean;
  loading: boolean;
}

// LocalStorage types
export interface FavoritesStorage {
  favorites: number[];
}

export interface RecentlyViewedStorage {
  items: Product[];
}

// API request types
export interface SearchProductsParams {
  brands?: Brand[];
  genders?: Gender[];
  categories?: Category[];
  keyword?: string;
  maxPrice?: number;
  minDiscountRate?: number;
  page?: number;
  size?: number;
}

// Component prop types
export interface ProductCardProps {
  product: Product;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: number) => void;
}

export interface FilterSectionProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  productCount: number;
}

export interface PaginationProps {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}

// Contact form types
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

// Theme types
export type Theme = 'light' | 'dark';
