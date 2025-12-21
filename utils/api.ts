/**
 * API 통신 유틸리티 (TypeScript 버전)
 * 백엔드 API 통신을 위한 타입 안전한 클라이언트
 */

import type {
  Product,
  ProductDetailResponse,
  SearchProductsParams,
  SaleCountResponse,
  Brand,
} from '../types';

// ============================================================================
// 환경별 기본 API URL 상수 정의
// ============================================================================
const DEFAULT_DEV_API = 'http://localhost:8080';
const DEFAULT_PROD_API = 'https://apimion.click';

const isDev = process.env.NODE_ENV !== 'production';

/**
 * API Base URL 결정 함수
 */
function resolveApiBaseUrl(): string {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    (isDev ? DEFAULT_DEV_API : DEFAULT_PROD_API);

  if (!rawBaseUrl) {
    throw new Error('API URL이 설정되지 않았습니다. NEXT_PUBLIC_API_URL 환경변수를 확인하세요.');
  }

  try {
    const urlObj = new URL(rawBaseUrl);

    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error(`지원하지 않는 프로토콜입니다: ${urlObj.protocol}`);
    }

    return rawBaseUrl.replace(/\/$/, '');
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`유효하지 않은 URL입니다: ${rawBaseUrl}`);
    }
    throw error;
  }
}

// API Base URL 초기화
const API_BASE_URL = resolveApiBaseUrl();

/**
 * API 엔드포인트 상수
 */
const API_ENDPOINTS = {
  PRODUCTS_SALE: '/api/v1/products/sale',
  PRODUCTS_BY_BRAND: '/api/v1/products/brand',
  PRODUCT_DETAIL: '/api/v1/products',
  PRODUCT_SEARCH: '/api/v1/product/search',
  SALE_COUNT: '/api/v1/products/sale/count',
  BRANDS: '/api/v1/brands',
} as const;

/**
 * fetch 래퍼 함수 - 공통 에러 처리 및 타입 안전성 제공
 */
async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('API 요청 실패:', error);
    throw error;
  }
}

/**
 * 쿼리 파라미터를 URL 문자열로 변환
 */
function buildQueryString(params: Record<string, any>): string {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((item) => queryParams.append(key, String(item)));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * 모든 세일 상품 조회
 */
export async function getProducts(params: Record<string, any> = {}): Promise<Product[]> {
  try {
    const queryString = buildQueryString(params);
    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS_SALE}${queryString}`;

    const data = await fetchAPI<Product[]>(url);
    return data;
  } catch (error) {
    console.error('상품 목록 조회 실패:', error);
    return [];
  }
}

/**
 * 브랜드별 세일 상품 조회
 */
export async function getProductsByBrand(brandCode: Brand): Promise<Product[]> {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS_BY_BRAND}/${brandCode}/sale`;
    const data = await fetchAPI<Product[]>(url);
    return data;
  } catch (error) {
    console.error(`${brandCode} 브랜드 상품 조회 실패:`, error);
    return [];
  }
}

/**
 * 특정 상품 상세 정보 조회
 */
export async function getProductById(productId: number): Promise<Product | null> {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_DETAIL}/${productId}`;
    const data = await fetchAPI<Product>(url);
    return data;
  } catch (error) {
    console.error(`상품 ${productId} 조회 실패:`, error);
    return null;
  }
}

/**
 * 브랜드 목록 조회
 */
export async function getBrands(): Promise<Brand[]> {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.BRANDS}`;
    const data = await fetchAPI<Brand[]>(url);
    return data;
  } catch (error) {
    console.error('브랜드 목록 조회 실패:', error);
    return [];
  }
}

/**
 * 상품 검색 (필터 포함)
 */
export async function searchProducts(
  query: string = '',
  filters: Partial<SearchProductsParams> = {}
): Promise<Product[]> {
  try {
    const params: Record<string, any> = {
      keyword: query,
      ...filters,
    };

    const queryString = buildQueryString(params);
    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_SEARCH}${queryString}`;

    const data = await fetchAPI<Product[]>(url);
    return data;
  } catch (error) {
    console.error('상품 검색 실패:', error);
    return [];
  }
}

/**
 * 세일 상품 조회 (페이지네이션 지원)
 */
export async function fetchSaleProducts(params: {
  brands?: Brand[];
  genders?: string[];
  categories?: string[];
  keyword?: string;
  page?: number;
  size?: number;
}): Promise<Product[]> {
  try {
    const queryParams: Record<string, any> = {
      page: params.page ?? 0,
      size: params.size ?? 12,
    };

    if (params.brands && params.brands.length > 0) {
      queryParams.brands = params.brands.join(',');
    }
    if (params.genders && params.genders.length > 0) {
      queryParams.genders = params.genders.join(',');
    }
    if (params.categories && params.categories.length > 0) {
      queryParams.categories = params.categories.join(',');
    }
    if (params.keyword) {
      queryParams.keyword = params.keyword;
    }

    const queryString = buildQueryString(queryParams);
    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS_SALE}${queryString}`;

    const data = await fetchAPI<Product[]>(url);
    return data;
  } catch (error) {
    console.error('세일 상품 조회 실패:', error);
    return [];
  }
}

/**
 * 세일 상품 개수 조회
 */
export async function fetchSaleProductCount(): Promise<number> {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.SALE_COUNT}`;
    const data = await fetchAPI<SaleCountResponse>(url);
    return data.count;
  } catch (error) {
    console.error('세일 상품 개수 조회 실패:', error);
    return 0;
  }
}

/**
 * 상품 상세 정보 조회 (가격 히스토리 포함)
 */
export async function fetchProductDetail(productId: number): Promise<ProductDetailResponse | null> {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_DETAIL}/${productId}`;
    const product = await fetchAPI<Product>(url);

    // 가격 히스토리는 시뮬레이션 데이터 (백엔드 구현 전까지)
    const priceHistory = generateMockPriceHistory(product);

    return {
      product,
      priceHistory,
    };
  } catch (error) {
    console.error(`상품 ${productId} 상세 정보 조회 실패:`, error);
    return null;
  }
}

/**
 * Mock 가격 히스토리 생성 (임시)
 */
function generateMockPriceHistory(product: Product) {
  const history = [];
  const today = new Date();

  for (let i = 30; i >= 0; i -= 5) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const randomVariation = Math.random() * 0.1 - 0.05; // -5% ~ +5%
    const price = Math.round(product.salePrice * (1 + randomVariation));

    history.push({
      date: date.toISOString().split('T')[0],
      price,
    });
  }

  return history;
}

// 브랜드 이름 매핑 유틸리티
export const BRAND_NAMES: Record<Brand, string> = {
  HM: 'H&M',
  ZARA: 'ZARA',
  UNIQLO: 'UNIQLO',
  MUJI: 'MUJI',
  CHARLESKEITH: 'Charles & Keith',
};

export const getBrandDisplayName = (brand: Brand): string => {
  return BRAND_NAMES[brand] || brand;
};
