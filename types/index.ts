/**
 * types/index.ts
 *
 * 이 파일은 "데이터의 모양(타입)"을 한 곳에 모아두는 곳입니다.
 * TypeScript는 이런 타입 정보를 통해:
 * - 어떤 값이 들어오는지
 * - 어떤 값이 반환되는지
 * - 오타/누락을 컴파일 단계에서 잡아주는지
 * 를 결정합니다.
 *
 * 문법 포인트:
 * - type: 간단한 "별칭"을 만들 때 사용합니다.
 * - interface: 객체 형태의 구조를 정의할 때 사용합니다.
 * - 유니온(|): 여러 값 중 하나가 될 수 있음을 의미합니다.
 * - 제네릭(<T>): "나중에 타입을 넣는" 자리 표시자입니다.
 */

// Brand types: 브랜드 코드로 허용되는 값 목록 (문자열 리터럴 유니온)
export type Brand = 'HM' | 'ZARA' | 'UNIQLO' | 'MUJI' | 'CHARLESKEITH';

// Gender types: 성별 코드 (문자열 리터럴 유니온)
export type Gender = 'MAN' | 'WOMAN' | 'UNISEX';

// Category types: 카테고리 코드 (문자열 리터럴 유니온)
export type Category = 'TOP' | 'BOTTOM' | 'OUTER' | 'SHOES' | 'ETC';

// Product interface: 상품 데이터의 기본 형태
// interface는 객체 구조를 정의합니다.
export interface Product {
  id: number; // 상품 ID (숫자)
  name: string; // 상품명
  brand: Brand; // 브랜드 코드
  category: Category; // 카테고리 코드
  gender: Gender; // 성별 코드
  originalPrice: number; // 원가
  salePrice: number; // 할인가
  discountRate: number; // 할인율(퍼센트)
  imageUrl: string; // 대표 이미지 URL
  productUrl: string; // 상품 상세 링크
  createdAt?: string; // 생성일 (옵셔널: 있을 수도 없을 수도 있음)
  updatedAt?: string; // 수정일 (옵셔널)
}

// API Response types: API 응답 기본 형태
export interface ProductsResponse {
  products: Product[]; // 상품 배열
  totalCount: number; // 전체 개수
  page?: number; // 페이지 번호 (옵셔널)
  size?: number; // 페이지 크기 (옵셔널)
}

/**
 * 백엔드 API의 표준 응답 형식
 * 모든 API 응답은 이 구조를 따릅니다
 */
export interface ApiResponse<T> {
  success: boolean; // 성공 여부
  data: T; // 실제 데이터
  message: string | null; // 에러 메시지 또는 안내 메시지
}

/**
 * 페이지네이션이 포함된 API 응답
 * Spring Boot의 Page 객체 구조와 동일합니다
 */
export interface PagedResponse<T> {
  content: T[]; // 현재 페이지의 데이터 배열
  pageable: {
    pageNumber: number; // 현재 페이지 번호
    pageSize: number; // 페이지당 개수
    sort: any[]; // 정렬 정보 (정확한 타입이 없어서 any 사용)
    offset: number; // 시작 위치
    paged: boolean; // 페이징 여부
    unpaged: boolean; // 비페이징 여부
  };
  totalPages: number; // 전체 페이지 수
  totalElements: number; // 전체 데이터 수
  last: boolean; // 마지막 페이지 여부
  size: number; // 현재 페이지 크기
  number: number; // 현재 페이지 번호
  sort: any[]; // 정렬 정보
  numberOfElements: number; // 현재 페이지의 데이터 개수
  first: boolean; // 첫 페이지 여부
  empty: boolean; // 비어있는 페이지 여부
}

export interface ProductDetailResponse {
  product: Product; // 상품 정보
  priceHistory?: PriceHistory[]; // 가격 히스토리 (옵셔널)
}

export interface PriceHistory {
  date: string; // 날짜 (YYYY-MM-DD 등)
  price: number; // 해당 날짜의 가격
}

export interface SaleCountResponse {
  count: number; // 세일 상품 개수
  brand?: Brand; // 특정 브랜드 기준이면 브랜드 코드가 있을 수 있음
}

// Filter types: 필터 상태를 표현하는 데이터 구조
export interface FilterState {
  selectedBrands: Brand[]; // 선택된 브랜드 목록
  selectedGenders: Gender[]; // 선택된 성별 목록
  selectedCategories: Category[]; // 선택된 카테고리 목록
  keyword: string; // 검색어
  maxPrice: number; // 최대 가격
  minDiscountRate: number; // 최소 할인율
}

export interface AdvancedFilters {
  maxPrice: number; // 최대 가격
  minDiscountRate: number; // 최소 할인율
}

// Pagination types: 페이징 상태
export interface PaginationState {
  page: number; // 현재 페이지
  size: number; // 페이지 크기
  hasMore: boolean; // 다음 페이지 존재 여부
  loading: boolean; // 로딩 여부
}

// LocalStorage types: 로컬 저장 데이터 구조
export interface FavoritesStorage {
  favorites: number[]; // 찜한 상품 ID 목록
}

export interface RecentlyViewedStorage {
  items: Product[]; // 최근 본 상품 목록
}

// API request types: 검색/필터 API 요청 파라미터
export interface SearchProductsParams {
  brands?: Brand[]; // 브랜드 필터
  genders?: Gender[]; // 성별 필터
  categories?: Category[]; // 카테고리 필터
  keyword?: string; // 검색어
  maxPrice?: number; // 최대 가격
  minDiscountRate?: number; // 최소 할인율
  page?: number; // 페이지 번호
  size?: number; // 페이지 크기
}

// Component prop types: 컴포넌트에 넘길 props 구조
export interface ProductCardProps {
  product: Product; // 상품 데이터
  isFavorite?: boolean; // 찜 여부 (옵셔널)
  onToggleFavorite?: (productId: number) => void; // 찜 토글 콜백 (옵셔널)
}

export interface FilterSectionProps {
  filters: FilterState; // 현재 필터 상태
  onFilterChange: (filters: FilterState) => void; // 필터 변경 콜백
  productCount: number; // 결과 상품 개수
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
