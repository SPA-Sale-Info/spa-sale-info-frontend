/**
 * API 통신 유틸리티 (TypeScript 버전)
 *
 * 이 파일은 "백엔드 API 호출"을 모아서 관리합니다.
 * - fetch를 직접 쓰는 대신 여기서 공통 로직을 처리합니다.
 * - 타입을 붙여 응답 형태를 명확히 합니다.
 *
 * TypeScript 문법 포인트:
 * - `import type`은 "타입만 가져오기"입니다. 런타임 코드에 영향이 없습니다.
 * - `<T>`는 제네릭으로, "이 함수는 T 타입 데이터를 반환한다"를 의미합니다.
 * - `Promise<T>`는 "비동기 결과가 T"임을 뜻합니다.
 */

import type {
  Product,
  ProductDetailResponse,
  SearchProductsParams,
  SaleCountResponse,
  Brand,
  ApiResponse,
  PagedResponse,
} from '../types';

// ============================================================================
// 환경별 기본 API URL 상수 정의
// ============================================================================
const DEFAULT_DEV_API = 'http://localhost:8080';
const DEFAULT_PROD_API = 'https://apimion.click';

// 환경 변수 `NODE_ENV`가 production이 아니면 개발 환경으로 간주합니다.
const isDev = process.env.NODE_ENV !== 'production';

/**
 * API Base URL 결정 함수
 */
// 반환 타입을 명시합니다. (string)
function resolveApiBaseUrl(): string {
  // 가능한 환경 변수 우선순위를 적용합니다.
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    (isDev ? DEFAULT_DEV_API : DEFAULT_PROD_API);

  if (!rawBaseUrl) {
    throw new Error('API URL이 설정되지 않았습니다. NEXT_PUBLIC_API_URL 환경변수를 확인하세요.');
  }

  try {
    // URL 객체로 파싱해 유효성을 검증합니다.
    const urlObj = new URL(rawBaseUrl);

    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error(`지원하지 않는 프로토콜입니다: ${urlObj.protocol}`);
    }

    // 끝의 "/"를 제거해 URL을 통일합니다.
    return rawBaseUrl.replace(/\/$/, '');
  } catch (error) {
    // URL 생성이 실패하면 TypeError가 발생합니다.
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
// API 엔드포인트 모음. `as const`는 "값 그대로의 리터럴 타입"으로 고정합니다.
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
 * 백엔드 API의 표준 응답 형식 { success, data, message }을 처리합니다
 */
// 공통 fetch 래퍼
// - 제네릭 <T>로 "응답 data의 타입"을 호출 시 결정합니다.
async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
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

  // 백엔드 API 응답 구조: { success: boolean, data: T, message: string | null }
  const apiResponse: ApiResponse<T> = await response.json();

  // success가 false이거나 data가 없으면 에러 처리
  if (!apiResponse.success) {
    throw new Error(apiResponse.message || 'API 요청이 실패했습니다');
  }

  // data 필드를 추출하여 반환
  return apiResponse.data;
}

/**
 * 쿼리 파라미터를 URL 문자열로 변환
 */
// 쿼리 파라미터 객체를 "?a=1&b=2" 형태로 변환합니다.
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
// 모든 세일 상품 조회 (간단 버전)
export async function getProducts(params: Record<string, any> = {}): Promise<Product[]> {
  try {
    const queryString = buildQueryString(params);
    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS_SALE}${queryString}`;

    const data = await fetchAPI<Product[]>(url);
    return data;
  } catch {
    return [];
  }
}

/**
 * 브랜드별 세일 상품 조회
 */
// 브랜드별 세일 상품 조회
export async function getProductsByBrand(brandCode: Brand): Promise<Product[]> {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS_BY_BRAND}/${brandCode}/sale`;
    const data = await fetchAPI<Product[]>(url);
    return data;
  } catch {
    return [];
  }
}

/**
 * 특정 상품 상세 정보 조회
 */
// 단일 상품 상세 조회
export async function getProductById(productId: number): Promise<Product | null> {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_DETAIL}/${productId}`;
    const data = await fetchAPI<Product>(url);
    return data;
  } catch {
    return null;
  }
}

/**
 * 브랜드 목록 조회
 */
// 브랜드 목록 조회
export async function getBrands(): Promise<Brand[]> {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.BRANDS}`;
    const data = await fetchAPI<Brand[]>(url);
    return data;
  } catch {
    return [];
  }
}

/**
 * 상품 검색 (필터 포함)
 */
// 검색/필터 기반 상품 조회
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
  } catch {
    return [];
  }
}

/**
 * 세일 상품 조회 결과 타입
 * 상품 목록과 페이지네이션 정보를 포함합니다
 */
// 세일 목록 페이징 결과
export interface SaleProductsResult {
  products: Product[];
  totalPages: number;
  totalElements: number;
  hasMore: boolean; // last의 반대 (더 불러올 데이터가 있는지)
  currentPage: number;
}

/**
 * 세일 상품 조회 (페이지네이션 지원)
 * 백엔드 API의 페이지네이션 응답을 처리하여 상품 목록과 페이지 정보를 반환합니다
 */
// 세일 상품 조회 (페이지네이션 지원)
export async function fetchSaleProducts(params: {
  brands?: Brand[];
  genders?: string[];
  categories?: string[];
  keyword?: string;
  page?: number;
  size?: number;
}): Promise<SaleProductsResult> {
  try {
    // params에서 필요한 값만 골라 쿼리 파라미터로 만듭니다.
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

    // URL 완성: BASE + ENDPOINT + ?query
    const queryString = buildQueryString(queryParams);
    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS_SALE}${queryString}`;

    // fetchAPI는 이미 ApiResponse를 처리하여 data 필드를 반환합니다
    // 여기서는 PagedResponse<any> 타입의 데이터를 받습니다
    // (백엔드 API의 Product 구조가 프론트엔드 타입과 다르므로 any 사용)
    // 응답은 백엔드 Page 구조로 온다고 가정
    const pagedData = await fetchAPI<PagedResponse<any>>(url);

    // PagedResponse에서 필요한 정보를 추출하여 반환
    // 우리가 쓰기 쉬운 형태로 변환
    const result = {
      products: pagedData.content,
      totalPages: pagedData.totalPages,
      totalElements: pagedData.totalElements,
      hasMore: !pagedData.last, // last가 false이면 더 불러올 데이터가 있음
      currentPage: pagedData.number,
    };

    return result;
  } catch (error) {
    console.error('❌ fetchSaleProducts 에러:', error);
    // 에러 발생 시 빈 결과 반환
    return {
      products: [],
      totalPages: 0,
      totalElements: 0,
      hasMore: false,
      currentPage: 0,
    };
  }
}

/**
 * 세일 상품 개수 조회
 */
// 세일 상품 총 개수 조회
export async function fetchSaleProductCount(): Promise<number> {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.SALE_COUNT}`;
    const data = await fetchAPI<SaleCountResponse>(url);
    if (typeof data === 'number') {
      return data;
    }

    if (data && typeof data.count === 'number') {
      return data.count;
    }

    return 0;
  } catch {
    return 0;
  }
}

/**
 * 상품 상세 정보 조회 (가격 히스토리 포함)
 */
// 상품 상세 정보 조회 (가격 히스토리 포함)
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
  } catch {
    return null;
  }
}

/**
 * Mock 가격 히스토리 생성 (임시)
 */
// 임시 가격 히스토리 생성 (백엔드 구현 전까지 사용)
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
