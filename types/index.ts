/**
 * types/index.ts - 프로젝트 전체 TypeScript 타입 정의 모음
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * 프로젝트에서 사용하는 데이터의 "형태(Shape)"를 한 곳에서 정의합니다.
 * 모든 컴포넌트와 유틸리티 함수는 이 파일의 타입을 import해서 사용합니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * TypeScript란?
 * ═══════════════════════════════════════════════════════════════
 * TypeScript = JavaScript + 정적 타입 시스템
 *
 * JavaScript는 변수에 어떤 타입이든 넣을 수 있습니다 (동적 타입):
 *   let price = 10000;
 *   price = "만 원"; // 에러 없음! (버그 가능성)
 *
 * TypeScript는 타입을 미리 지정합니다 (정적 타입):
 *   let price: number = 10000;
 *   price = "만 원"; // 컴파일 에러! string은 number에 넣을 수 없음
 *
 * → 버그를 실행 전에 잡아주고, IDE 자동완성을 강화합니다.
 * → Java처럼 정적 타입 언어의 안전성을 JavaScript에 더합니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * 핵심 TypeScript 문법 포인트
 * ═══════════════════════════════════════════════════════════════
 * - type: 간단한 타입 "별칭(alias)"을 만들 때 사용합니다.
 * - interface: 객체 형태의 구조를 정의할 때 사용합니다.
 * - 유니온(|): "A 또는 B" 중 하나임을 표현합니다.
 * - 제네릭(<T>): "나중에 타입을 채울 자리 표시자"입니다. Java의 <T>와 같습니다.
 * - ?: optional 필드 — 있어도 되고 없어도 됩니다.
 * - export: 다른 파일에서 import할 수 있게 내보냅니다.
 */

// ============================================================================
// 기본 도메인 타입 (Primitive Domain Types)
// ============================================================================

export const ACTIVE_BRAND_CODES = [
  'HM',
  'ZARA',
  'UNIQLO',
  'MUJI',
  'CHARLESKEITH',
] as const;

export const NO_SALE_BRAND_CODES = [
  'COS',
  'ARKET',
  'MASSIMODUTTI',
] as const;

export const PLANNED_BRAND_CODES = [
  'MANGO',
  'EIGHTSECONDS',
  'MIXXO',
  'MUSINSASTANDARD',
  'TOPTEN',
  'SPAO',
  'GIORDANO',
] as const;

export const BRAND_CODES = [
  ...ACTIVE_BRAND_CODES,
  ...NO_SALE_BRAND_CODES,
  ...PLANNED_BRAND_CODES,
  'UNKNOWN',
] as const;

/**
 * Brand - UI와 API에서 인식하는 브랜드 코드
 *
 * 지원 중/세일 없음/준비 중 브랜드를 한 타입으로 관리합니다.
 * 실제 필터 UI에서는 상태값으로 구분하고, API 요청에는 활성 브랜드만 전달합니다.
 */
export type ActiveBrand = typeof ACTIVE_BRAND_CODES[number];
export type NoSaleBrand = typeof NO_SALE_BRAND_CODES[number];
export type PlannedBrand = typeof PLANNED_BRAND_CODES[number];
export type Brand = typeof BRAND_CODES[number];
export type BrandStatus = 'active' | 'noSale' | 'planned' | 'unknown';

export interface BrandMetadata {
  code: Brand;
  name: string;
  logo?: string;
  emoji?: string;
  status: BrandStatus;
}

export const BRAND_METADATA: Record<Brand, BrandMetadata> = {
  HM: { code: 'HM', name: 'H&M', logo: '/logos/hm.svg', status: 'active' },
  ZARA: { code: 'ZARA', name: 'ZARA', logo: '/logos/zara.svg', status: 'active' },
  UNIQLO: { code: 'UNIQLO', name: 'UNIQLO', logo: '/logos/uniqlo.svg', status: 'active' },
  MUJI: { code: 'MUJI', name: 'MUJI', logo: '/logos/muji.svg', status: 'active' },
  CHARLESKEITH: { code: 'CHARLESKEITH', name: '찰스앤키스', logo: '/logos/charleskeith.svg', status: 'active' },
  COS: { code: 'COS', name: 'COS', logo: '/logos/cos.svg', status: 'noSale' },
  ARKET: { code: 'ARKET', name: 'ARKET', logo: '/logos/arket.svg', status: 'noSale' },
  MASSIMODUTTI: { code: 'MASSIMODUTTI', name: 'Massimo Dutti', logo: '/logos/massimodutti.svg', status: 'noSale' },
  MANGO: { code: 'MANGO', name: 'Mango', logo: '/logos/mango.svg', emoji: '🥭', status: 'planned' },
  EIGHTSECONDS: { code: 'EIGHTSECONDS', name: '에잇세컨즈', logo: '/logos/eightseconds.svg', status: 'planned' },
  MIXXO: { code: 'MIXXO', name: '미쏘', logo: '/logos/mixxo.svg', status: 'planned' },
  MUSINSASTANDARD: { code: 'MUSINSASTANDARD', name: '무신사 스탠다드', logo: '/logos/musinsastandard.svg', status: 'planned' },
  TOPTEN: { code: 'TOPTEN', name: '탑텐', logo: '/logos/topten.svg', status: 'planned' },
  SPAO: { code: 'SPAO', name: '스파오', logo: '/logos/spao.svg', status: 'planned' },
  GIORDANO: { code: 'GIORDANO', name: '지오다노', logo: '/logos/giordano.svg', status: 'planned' },
  UNKNOWN: { code: 'UNKNOWN', name: '브랜드 미정', status: 'unknown' },
};

export const isBrand = (value: unknown): value is Brand => {
  return typeof value === 'string' && (BRAND_CODES as readonly string[]).includes(value);
};

/**
 * Gender - 허용되는 성별 코드
 *
 * 'MAN' | 'WOMAN' | 'UNISEX': 세 가지 값 중 하나
 * Java 비유: public enum Gender { MAN, WOMAN, UNISEX }
 */
export type Gender = 'MAN' | 'WOMAN' | 'UNISEX';

/**
 * Category - 허용되는 카테고리 코드
 *
 * Java 비유: public enum Category { TOP, BOTTOM, OUTER, SHOES, ETC }
 */
export type Category = 'TOP' | 'BOTTOM' | 'OUTER' | 'SHOES' | 'ETC';

// ============================================================================
// 정렬 관련 타입 (Sort Types)
// ============================================================================

/**
 * SortBy - 정렬 기준 컬럼
 * 백엔드에 전달하는 정렬 컬럼명입니다.
 * - discount: 할인율
 * - price: 판매가
 * - createdAt: 등록일(최신순)
 * - popular: 인기(조회수/찜수 기반, 백엔드 지원 시)
 */
export type SortBy = 'discount' | 'price' | 'createdAt' | 'popular';

/**
 * SortDirection - 정렬 방향 (오름/내림차순)
 */
export type SortDirection = 'asc' | 'desc';

/**
 * SortOption - 정렬 드롭다운 UI에서 사용하는 옵션 한 개의 구조
 *
 * value: URL/상태로 관리하는 고유 키 (예: 'discount_desc')
 * label: 사용자에게 보여줄 한글 라벨 (예: '할인율 높은순')
 * sortBy/sortDirection: 실제 API에 전달할 값
 */
export interface SortOption {
  value: string;
  label: string;
  sortBy: SortBy;
  sortDirection: SortDirection;
}

/**
 * SORT_OPTIONS - 정렬 드롭다운에 노출할 옵션 목록
 *
 * 첫 번째(할인율 높은순)가 기본값입니다.
 * "할인 서비스"의 핵심 정렬이므로 가장 먼저 둡니다.
 */
export const SORT_OPTIONS: SortOption[] = [
  { value: 'discount_desc', label: '할인율 높은순', sortBy: 'discount', sortDirection: 'desc' },
  { value: 'price_asc', label: '가격 낮은순', sortBy: 'price', sortDirection: 'asc' },
  { value: 'price_desc', label: '가격 높은순', sortBy: 'price', sortDirection: 'desc' },
  { value: 'createdAt_desc', label: '최신 등록순', sortBy: 'createdAt', sortDirection: 'desc' },
  { value: 'popular_desc', label: '인기순', sortBy: 'popular', sortDirection: 'desc' },
];

/**
 * DEFAULT_SORT_VALUE - 기본 정렬 값 (할인율 높은순)
 */
export const DEFAULT_SORT_VALUE = 'discount_desc';

// ============================================================================
// 상품 관련 타입 (Product Types)
// ============================================================================

/**
 * Product - 상품 데이터의 기본 구조
 *
 * interface: 객체의 "형태(Shape)"를 정의합니다.
 * 실제 값은 없고, "이런 필드와 타입을 가진 객체여야 한다"는 규칙입니다.
 *
 * Java 비유:
 * public class Product {
 *   private String id;
 *   private String name;
 *   private Brand brand;
 *   private Category category;
 *   private Gender gender;
 *   private int originalPrice;
 *   private int salePrice;
 *   private int discountRate;
 *   private String imageUrl;
 *   private String productUrl;
 *   private String createdAt;  // @Nullable
 *   private String updatedAt;  // @Nullable
 * }
 *
 * TypeScript의 interface는 Java와 달리 구현 없이 구조만 정의합니다.
 * (Java interface와 달리 메서드 선언도 포함할 수 있지만, 주로 데이터 구조에 씁니다)
 */
export interface Product {
  id: string;               // 상품 ID (문자열 — 숫자 ID를 문자열로 통일)
  name: string;             // 상품명
  brand: Brand;             // 브랜드 코드 (Brand 유니온 타입 중 하나)
  category: Category;       // 카테고리 코드
  gender: Gender;           // 성별 코드
  originalPrice: number;    // 원가 (할인 전 가격)
  salePrice: number;        // 할인가 (현재 판매가)
  discountRate: number;     // 할인율 (0~100 사이의 정수, 단위: %)
  imageUrl: string;         // 대표 이미지 URL
  productUrl: string;       // 브랜드 공식 사이트 상품 상세 링크
  // ?: optional 필드 — 백엔드가 항상 주지 않을 수 있습니다.
  // Java의 @Nullable 또는 Optional<String>과 유사합니다.
  createdAt?: string;       // 데이터 생성일 (ISO 8601, 예: "2024-01-15T10:30:00Z")
  updatedAt?: string;       // 데이터 수정일
}

export interface ApiProduct {
  id?: string | number | null;
  productCode?: string | number | null;
  name?: string | null;
  brand?: string | null;
  brandType?: string | null;
  brandName?: string | null;
  gender?: string | null;
  category?: string | null;
  mainCategory?: string | null;
  subCategory?: string | null;
  originalPrice?: number | string | null;
  salePrice?: number | string | null;
  currentPrice?: number | string | null;
  discountRate?: number | string | null;
  imageUrl?: unknown;
  imageUrls?: unknown;
  productUrl?: string | null;
  description?: string | null;
  colors?: unknown;
  sizes?: unknown;
  inStock?: boolean | null;
  material?: string | null;
  tags?: unknown;
  vibeTags?: unknown;
  saleStartDate?: string | null;
  saleEndDate?: string | null;
  viewCount?: number | string | null;
  likeCount?: number | string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface NormalizedProduct extends Product {
  brandCode: Brand;
  brandName: string;
  productCode: string;
  description?: string;
  mainCategory: Category;
  categoryGroup: Category;
  subCategory?: string;
  price: number;
  currentPrice: number;
  onSale: boolean;
  imageUrls: string[];
  colors: string[];
  sizes: string[];
  inStock?: boolean;
  material?: string;
  tags: string[];
  vibeTags: string[];
  vibe: string | null;
  saleStartDate?: string;
  saleEndDate?: string;
  viewCount: number;
  likeCount: number;
}

export interface StoredFavoriteProduct extends NormalizedProduct {
  addedAt: string;
}

// ============================================================================
// API 응답 관련 타입 (API Response Types)
// ============================================================================

/**
 * ProductsResponse - 상품 목록 API 응답 구조
 *
 * 상품 배열과 페이지네이션 정보를 함께 담는 응답 구조입니다.
 */
export interface ProductsResponse {
  products: Product[];  // 상품 배열
  totalCount: number;   // 전체 상품 수
  page?: number;        // 현재 페이지 번호 (선택)
  size?: number;        // 페이지당 상품 수 (선택)
}

/**
 * ApiResponse<T> - 백엔드 API의 표준 응답 구조
 *
 * 제네릭(Generic) <T>:
 * - T는 "Type Parameter"로, 호출 시 원하는 타입으로 채울 수 있습니다.
 * - 마치 빈칸(□)이 있는 양식 같습니다. 쓸 때 빈칸을 채웁니다.
 *
 * 예:
 * ApiResponse<Product>    → { success, data: Product, message }
 * ApiResponse<Product[]>  → { success, data: Product[], message }
 * ApiResponse<number>     → { success, data: number, message }
 *
 * Java 비유: public class ApiResponse<T> { boolean success; T data; String message; }
 *
 * 이 구조는 Spring Boot의 표준 응답 래퍼 클래스와 동일합니다:
 * @Data
 * public class ApiResponse<T> {
 *   private boolean success;
 *   private T data;
 *   private String message;
 * }
 */
export interface ApiResponse<T> {
  success: boolean;      // 요청 성공 여부
  data: T;               // 실제 데이터 (제네릭 타입 T)
  message: string | null; // 에러 메시지 또는 안내 메시지 (없을 수도 있음 → null 허용)
}

/**
 * PagedResponse<T> - 페이지네이션이 포함된 API 응답 구조
 *
 * Spring Boot의 Page<T> 객체 구조와 동일합니다.
 * Spring의 Pageable을 사용하면 이 형태로 응답이 옵니다.
 *
 * Spring Boot 비유:
 * @GetMapping("/products")
 * Page<Product> getProducts(Pageable pageable) {
 *   return productRepository.findAll(pageable);
 * }
 * → 위 코드가 반환하는 Page<Product> JSON이 이 타입과 일치합니다.
 *
 * <T>: 어떤 데이터 타입의 페이지든 표현 가능합니다.
 * PagedResponse<Product>   → 상품 목록 페이지
 * PagedResponse<Brand>     → 브랜드 목록 페이지
 */
export interface PagedResponse<T> {
  content: T[];         // 현재 페이지의 데이터 배열 — Spring의 page.getContent()
  pageable: {
    pageNumber: number; // 현재 페이지 번호 (0부터 시작)
    pageSize: number;   // 페이지당 데이터 수
    sort: unknown[];    // 정렬 정보
    offset: number;     // 전체 데이터에서 현재 페이지 시작 위치
    paged: boolean;     // 페이징 적용 여부
    unpaged: boolean;   // 페이징 미적용 여부 (paged의 반대)
  };
  totalPages: number;    // 전체 페이지 수
  totalElements: number; // 전체 데이터 수 (모든 페이지 합산)
  last: boolean;         // 마지막 페이지 여부 — Spring의 page.isLast()
  size: number;          // 현재 페이지 크기
  number: number;        // 현재 페이지 번호 (pageable.pageNumber와 동일)
  sort: unknown[];       // 정렬 정보
  numberOfElements: number; // 현재 페이지의 실제 데이터 수
  first: boolean;        // 첫 페이지 여부 — Spring의 page.isFirst()
  empty: boolean;        // 현재 페이지가 비어있는지 여부
}

/**
 * ProductDetailResponse - 상품 상세 페이지 응답 구조
 *
 * 상품 정보와 가격 히스토리를 함께 반환합니다.
 * pages/product/[id].tsx에서 사용됩니다.
 */
export interface ProductDetailResponse {
  product: NormalizedProduct; // 정규화된 상품 기본 정보
  priceHistory?: PriceHistory[]; // 가격 변동 이력 (선택 — 백엔드 미구현 시 없을 수 있음)
}

/**
 * PriceHistory - 특정 날짜의 가격 정보
 *
 * 상품 상세 페이지의 가격 변동 차트에서 사용됩니다.
 */
export interface PriceHistory {
  date: string;   // 날짜 (YYYY-MM-DD 형식, 예: "2024-01-15")
  price: number;  // 해당 날짜의 가격
}

/**
 * SaleCountResponse - 세일 상품 개수 응답 구조
 *
 * /api/v1/products/sale/count API의 응답입니다.
 * 메인 페이지 헤더에 "X개 할인 중" 표시에 사용됩니다.
 */
export interface SaleCountResponse {
  count: number;    // 세일 상품 총 개수
  brand?: Brand;    // 특정 브랜드 기준 조회 시 해당 브랜드 코드 (선택)
}

// ============================================================================
// 필터 관련 타입 (Filter Types)
// ============================================================================

/**
 * FilterState - 현재 선택된 필터 조건들의 집합
 *
 * index.tsx에서 여러 상태를 하나의 객체로 관리할 때 사용합니다.
 * (현재는 각 상태를 개별 useState로 관리하므로 직접 사용되지 않습니다)
 */
export interface FilterState {
  selectedBrands: Brand[];      // 선택된 브랜드 목록 (여러 개 선택 가능)
  selectedGenders: Gender[];    // 선택된 성별 목록
  selectedCategories: Category[]; // 선택된 카테고리 목록
  keyword: string;              // 검색어
  maxPrice: number;             // 최대 가격 필터
  minDiscountRate: number;      // 최소 할인율 필터
}

/**
 * AdvancedFilters - 상세 필터 조건
 *
 * DetailedFilters 컴포넌트에서 사용하는 필터 구조입니다.
 */
export interface AdvancedFilters {
  maxPrice: number;         // 최대 가격 (이 가격 이하인 상품만 표시)
  minDiscountRate: number;  // 최소 할인율 (이 비율 이상인 상품만 표시)
}

// ============================================================================
// 페이지네이션 타입 (Pagination Types)
// ============================================================================

/**
 * PaginationState - 무한 스크롤/페이지네이션 상태
 */
export interface PaginationState {
  page: number;      // 현재 페이지 번호 (0부터 시작)
  size: number;      // 페이지당 데이터 수
  hasMore: boolean;  // 다음 페이지가 있는지 여부
  loading: boolean;  // 현재 로딩 중인지 여부
}

// ============================================================================
// localStorage 저장 타입 (Local Storage Types)
// ============================================================================

/**
 * FavoritesStorage - localStorage에 저장되는 찜 목록 구조
 */
export interface FavoritesStorage {
  favorites: string[]; // 찜한 상품 ID 목록 (string 배열)
}

/**
 * RecentlyViewedStorage - localStorage에 저장되는 최근 본 상품 구조
 */
export interface RecentlyViewedStorage {
  items: Product[]; // 최근 본 상품 목록 (최대 10개)
}

// ============================================================================
// API 요청 파라미터 타입 (API Request Parameter Types)
// ============================================================================

/**
 * SearchProductsParams - 상품 검색/필터 API 요청 파라미터
 *
 * 모든 필드가 optional(?)입니다.
 * → 원하는 필드만 선택해서 전달할 수 있습니다.
 *
 * Java 비유:
 * @Data
 * @Builder
 * public class SearchProductsParams {
 *   @Nullable private List<Brand> brands;
 *   @Nullable private List<Gender> genders;
 *   ...
 * }
 */
export interface SearchProductsParams {
  brands?: Brand[];        // 브랜드 필터 (여러 개 가능)
  genders?: Gender[];      // 성별 필터
  categories?: Category[]; // 카테고리 필터
  keyword?: string;        // 검색어
  maxPrice?: number;       // 최대 가격 필터
  minDiscountRate?: number; // 최소 할인율 필터
  page?: number;           // 페이지 번호 (0부터 시작)
  size?: number;           // 페이지당 상품 수
}

// ============================================================================
// 컴포넌트 Props 타입 (Component Props Types)
// ============================================================================

/**
 * ProductCardProps - ProductCard 컴포넌트가 받는 props 구조
 *
 * 부모 컴포넌트가 ProductCard를 사용할 때 어떤 값을 전달해야 하는지 정의합니다.
 * TypeScript는 이 타입을 보고 잘못된 props 전달을 컴파일 시 잡아줍니다.
 */
export interface ProductCardProps {
  product: Product;                          // 상품 데이터 (필수)
  isFavorite?: boolean;                      // 찜 여부 (선택, 기본값 false)
  onToggleFavorite?: (productId: string) => void; // 찜 토글 콜백 (선택)
}

/**
 * FilterSectionProps - 필터 섹션 컴포넌트 props
 */
export interface FilterSectionProps {
  filters: FilterState;                          // 현재 필터 상태
  onFilterChange: (filters: FilterState) => void; // 필터 변경 콜백
  productCount: number;                          // 현재 표시 중인 상품 수
}

/**
 * PaginationProps - 페이지네이션 컴포넌트 props
 */
export interface PaginationProps {
  hasMore: boolean;       // 더 불러올 데이터가 있는지
  loading: boolean;       // 현재 로딩 중인지
  onLoadMore: () => void; // "더 보기" 클릭 시 호출할 함수
}

// ============================================================================
// 기타 타입 (Miscellaneous Types)
// ============================================================================

/**
 * ContactFormData - 문의하기 폼 데이터 구조
 */
export interface ContactFormData {
  name: string;     // 문의자 이름
  email: string;    // 문의자 이메일
  message: string;  // 문의 내용
}

/**
 * Theme - 테마 타입
 *
 * 'light' | 'dark': 라이트 또는 다크 모드 중 하나
 * Java의 enum Theme { LIGHT, DARK }와 같습니다.
 */
export type Theme = 'light' | 'dark';
