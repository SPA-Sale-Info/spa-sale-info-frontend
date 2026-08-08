/**
 * utils/api.ts - 백엔드 API 통신 유틸리티 (TypeScript 버전)
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * 백엔드 서버와의 HTTP 통신을 담당하는 함수들을 모아놓은 파일입니다.
 * 컴포넌트가 직접 fetch를 호출하는 대신, 이 파일의 함수를 통해 API를 호출합니다.
 *
 * 왜 별도 파일로 분리하나요?
 * - 관심사 분리(Separation of Concerns): UI 로직과 데이터 통신 로직을 분리합니다.
 * - 재사용성: 여러 컴포넌트에서 같은 API 함수를 공유할 수 있습니다.
 * - 유지보수: API 주소나 응답 구조가 바뀌어도 이 파일만 수정하면 됩니다.
 *
 * Java/Spring 비유:
 * - RestTemplate / WebClient를 주입받아 API를 호출하는 Service 클래스와 비슷합니다.
 * - 예: @Service public class ProductApiService { ... }
 *
 * ═══════════════════════════════════════════════════════════════
 * TypeScript 핵심 문법 포인트
 * ═══════════════════════════════════════════════════════════════
 * - import type: 타입 정보만 가져옵니다. 빌드된 JavaScript에는 포함되지 않습니다.
 * - <T> 제네릭: "나중에 타입을 넣는 자리 표시자"입니다.
 *   예: fetchAPI<Product[]>() → "Product 배열을 반환하는 함수"
 *   Java의 List<T>, Optional<T>와 완전히 같은 개념입니다.
 * - async/await: 비동기 처리를 동기 코드처럼 읽기 좋게 작성하는 문법입니다.
 *   Java의 CompletableFuture / @Async와 유사합니다.
 * - Promise<T>: 비동기 작업의 "나중에 완료될 결과"를 나타내는 타입입니다.
 *   Java의 Future<T>와 유사합니다.
 */

// import type: 타입 정보만 가져옵니다 (런타임 코드에 포함 안 됨)
// types/index.ts에서 공통 타입들을 가져옵니다.
import type {
  ApiProduct,
  Product,             // 상품 데이터 구조
  NormalizedProduct,   // 정규화된 상품 구조 (카탈로그 캐시의 필터/정렬 매칭용)
  ProductDetailResponse, // 상품 상세 응답 구조 (가격 히스토리 포함)
  SearchProductsParams,  // 검색 파라미터 구조
  SaleCountResponse,     // 세일 개수 응답 구조
  Brand,               // 브랜드 코드 유니온 타입 ('HM' | 'ZARA' | ...)
  Category,
  Gender,
  SortBy,              // 정렬 기준 컬럼
  SortDirection,       // 정렬 방향
  ApiResponse,         // 백엔드 표준 응답 구조 { success, data, message }
  PagedResponse,       // 페이지네이션 응답 구조 (Spring Page<T>)
} from '../types';
import { BRAND_METADATA } from '../types';
import { normalizeProduct } from './productNormalization';

// ============================================================================
// API Base URL 설정
// ============================================================================
//
// 브라우저(클라이언트)와 서버(SSR)에서 API 요청 방식이 다릅니다:
//
// [브라우저 환경]
// next.config.js의 rewrites 설정 덕분에
// 브라우저는 항상 같은 도메인(/api/v1/...)으로 요청합니다.
// Next.js 서버가 받아서 실제 백엔드 서버로 프록시(중계)합니다.
// 브라우저 → Next.js(/api/v1/...) → 백엔드(https://apimion.click/api/v1/...)
// 이렇게 하면 CORS(Cross-Origin Resource Sharing) 에러가 발생하지 않습니다.
// → API_BASE_URL = '' (빈 문자열, 현재 origin 사용)
//
// [서버 환경 - SSR/getServerSideProps]
// Next.js 서버에서는 rewrites가 적용되지 않으므로
// 환경변수(API_URL)로 직접 백엔드 주소를 지정합니다.
// → API_BASE_URL = process.env.API_URL (예: https://apimion.click)
//
// CORS란?
// 브라우저의 보안 정책으로, 다른 출처(도메인/포트)의 서버에 직접 요청을 막습니다.
// Java/Spring 비유: @CrossOrigin, CorsFilter와 관련된 개념입니다.

// typeof window !== 'undefined': 현재 실행 환경이 브라우저인지 확인합니다.
// window 객체는 브라우저에만 존재합니다. 서버(Node.js)에는 없습니다.
// Java 비유: System.getProperty("java.runtime.name").contains("browser") (가상의 예시)
const isBrowser = typeof window !== 'undefined';

/**
 * API_BASE_URL 결정 로직
 * 즉시 실행 함수 표현식(IIFE: Immediately Invoked Function Expression)을 사용합니다.
 * (() => { ... })() — 함수를 정의하고 즉시 호출하여 결과를 상수에 저장합니다.
 *
 * 우선순위:
 * 1. NEXT_PUBLIC_API_URL 환경변수 (명시적으로 설정된 경우 항상 우선)
 * 2. 브라우저: '' (빈 문자열, Next.js rewrites가 /api/v1/... 를 백엔드로 중계)
 * 3. 서버: API_URL 환경변수 (없으면 빈 문자열)
 *
 * .replace(/\/$/, ''): 끝에 슬래시(/)가 있으면 제거합니다.
 * 예: "https://api.com/" → "https://api.com"
 * 이후 "/api/v1/..." 를 붙일 때 슬래시가 두 번 나오는 것을 방지합니다.
 */
const API_BASE_URL: string = (() => {
  // NEXT_PUBLIC_API_URL: 클라이언트와 서버 모두에서 접근 가능한 환경변수
  // (NEXT_PUBLIC_ 접두사가 붙은 환경변수만 브라우저에서 접근할 수 있습니다)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  // 브라우저 환경: 빈 문자열 → 현재 도메인 기준으로 요청 (rewrites 프록시 활용)
  if (isBrowser) {
    return '';
  }
  // 서버 환경(SSR): API_URL 환경변수 사용 (없으면 빈 문자열)
  return (process.env.API_URL || '').replace(/\/$/, '');
})();

/**
 * API 엔드포인트 상수
 *
 * `as const`: TypeScript에서 객체를 "리터럴 타입으로 고정"합니다.
 * as const 없이는 type이 string, as const 하면 type이 '/api/v1/products/sale' 처럼
 * 정확한 문자열 리터럴 타입이 됩니다. → 오타를 컴파일 단계에서 잡을 수 있습니다.
 *
 * Java 비유:
 * public static final String PRODUCTS_SALE = "/api/v1/products/sale";
 */
const API_ENDPOINTS = {
  PRODUCTS_SALE: '/api/v1/products/sale',       // 세일 상품 목록
  PRODUCTS_BY_BRAND: '/api/v1/products/brand',  // 브랜드별 상품 목록
  PRODUCT_DETAIL: '/api/v1/products',           // 상품 상세
  PRODUCT_SEARCH: '/api/v1/product/search',     // 검색/필터
  SALE_COUNT: '/api/v1/products/sale/count',    // 세일 상품 개수
  BRANDS: '/api/v1/brands',                     // 브랜드 목록
} as const;

export class ApiRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

/**
 * fetchAPI<T> - 공통 HTTP 요청 함수 (제네릭 래퍼)
 *
 * ─────────────────────────────────────────────────────────
 * 이 함수가 하는 일:
 * 1. fetch()로 HTTP GET/POST 요청을 보냅니다.
 * 2. 응답 상태 코드가 2xx가 아니면 에러를 던집니다(throw).
 * 3. 응답 JSON을 파싱하여 백엔드 표준 응답 구조를 확인합니다.
 * 4. { success: true, data: ... } 구조에서 data만 추출하여 반환합니다.
 *
 * ─────────────────────────────────────────────────────────
 * async/await 문법:
 * - async function: "이 함수는 비동기입니다"라는 선언입니다.
 *   반환 타입이 자동으로 Promise<T>가 됩니다.
 * - await: Promise가 완료될 때까지 기다립니다. async 함수 안에서만 사용 가능합니다.
 *
 * Java 비유:
 * @Async
 * public CompletableFuture<T> fetchAPI(String url) {
 *   ResponseEntity<ApiResponse<T>> response = restTemplate.getForEntity(url, ...);
 *   return CompletableFuture.completedFuture(response.getBody().getData());
 * }
 *
 * ─────────────────────────────────────────────────────────
 * 제네릭 <T>:
 * - 이 함수는 어떤 타입의 데이터든 반환할 수 있습니다.
 * - 호출 시 타입을 지정합니다: fetchAPI<Product[]>(url)
 * - Java의 <T>와 완전히 같은 개념입니다.
 *
 * ─────────────────────────────────────────────────────────
 * @param url - 요청할 URL (문자열)
 * @param options - fetch의 옵션 (method, headers, body 등). 생략 가능(옵셔널)
 * @returns Promise<T> - 비동기로 T 타입 데이터를 반환
 * @throws Error - HTTP 오류 또는 API 실패 시 에러를 던집니다
 */
async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  /**
   * fetch(url, options): 브라우저/Node.js 내장 HTTP 요청 함수입니다.
   * - XMLHttpRequest(XHR)의 현대적 대안입니다.
   * - 항상 Promise를 반환합니다.
   * - ...options: 스프레드 연산자로 options 객체를 펼쳐 넣습니다.
   *
   * RequestInit 타입: fetch()의 두 번째 인자 구조
   * {
   *   method: 'GET' | 'POST' | 'PUT' | 'DELETE',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify(data),
   * }
   */
  const response = await fetch(url, {
    ...options, // 호출자가 넘긴 옵션들을 그대로 유지하면서
    headers: {
      'Content-Type': 'application/json', // JSON 형식으로 요청을 보냄을 명시
      ...options?.headers, // 호출자가 추가 헤더를 넘겼으면 덮어씀
      // options?.headers: 옵셔널 체이닝(?.) — options가 undefined이면 undefined 반환 (에러 없음)
    },
  });

  /**
   * response.ok: HTTP 상태 코드가 200~299이면 true, 그 외(400, 500 등)이면 false
   * !response.ok이면 에러를 throw합니다.
   *
   * throw new Error(...): 예외를 던집니다.
   * → try-catch로 이 함수를 호출한 곳에서 처리해야 합니다.
   *
   * Java 비유:
   * if (!response.isSuccessful()) throw new RuntimeException("HTTP error: " + status);
   */
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;

    try {
      const errorBody = await response.json();
      if (errorBody?.message) {
        errorMessage = errorBody.message;
      }
    } catch {
      // 오류 응답이 JSON이 아니면 HTTP 상태 메시지를 그대로 사용합니다.
    }

    throw new ApiRequestError(errorMessage, response.status);
  }

  /**
   * await response.json(): 응답 바디를 JSON으로 파싱합니다.
   * - 이것도 비동기 작업이라 await가 필요합니다.
   * - ApiResponse<T>: 백엔드의 표준 응답 구조로 타입을 지정합니다.
   *   { success: boolean, data: T, message: string | null }
   *
   * Java 비유:
   * ApiResponse<T> body = response.getBody();
   */
  const apiResponse: ApiResponse<T> = await response.json();

  /**
   * success 필드 확인: 백엔드가 명시적으로 실패라고 응답한 경우를 처리합니다.
   * HTTP 상태 코드가 200이어도 success: false로 비즈니스 로직 실패를 표현할 수 있습니다.
   *
   * Java 비유:
   * if (!apiResponse.isSuccess()) throw new BusinessException(apiResponse.getMessage());
   */
  if (!apiResponse.success) {
    throw new ApiRequestError(apiResponse.message || 'API 요청이 실패했습니다');
  }

  // data 필드만 추출하여 반환합니다.
  // 호출자는 래핑 구조({ success, data, message })를 신경 쓰지 않아도 됩니다.
  return apiResponse.data;
}

/**
 * buildQueryString - 쿼리 파라미터 객체를 URL 문자열로 변환하는 함수
 *
 * 예: { page: 0, size: 12, brands: 'HM' }
 * →  "?page=0&size=12&brands=HM"
 *
 * @param params - 키-값 쌍의 파라미터 객체
 * @returns "?key=value&..." 형태의 쿼리 문자열 (파라미터가 없으면 빈 문자열)
 *
 * Record<string, unknown>: 키는 string, 값은 아직 구체화하지 않은 타입입니다.
 * Java의 Map<String, Object>와 비슷하지만, 사용 전에 타입 확인이 필요합니다.
 */
function buildQueryString(params: Record<string, unknown>): string {
  /**
   * URLSearchParams: 브라우저/Node.js 내장 클래스입니다.
   * 쿼리 파라미터를 안전하게 인코딩합니다. (특수문자, 공백 등을 %xx 형태로 변환)
   *
   * Java 비유: UriComponentsBuilder.fromUriString(...).queryParam(k, v).build()
   */
  const queryParams = new URLSearchParams();

  /**
   * Object.entries(params): 객체의 [키, 값] 쌍 배열을 반환합니다.
   * 예: { page: 0, size: 12 } → [['page', 0], ['size', 12]]
   * Java의 entrySet().stream() 과 유사합니다.
   *
   * .forEach(([key, value]) => { ... }): 배열 구조분해 할당으로 키/값을 꺼냅니다.
   *
   * 값이 undefined, null, 빈 문자열('')이면 파라미터에서 제외합니다.
   * 이렇게 하면 "?page=0&brands=undefined" 같은 잘못된 파라미터가 생기지 않습니다.
   *
   * Array.isArray(value): 값이 배열이면 각 항목을 개별 파라미터로 추가합니다.
   * 예: brands: ['HM', 'ZARA'] → "brands=HM&brands=ZARA"
   * 백엔드(Spring)에서 @RequestParam List<Brand> brands로 받을 수 있습니다.
   */
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        // 배열인 경우: 같은 키로 여러 번 추가
        value.forEach((item) => queryParams.append(key, String(item)));
      } else {
        // 단일 값: 한 번 추가
        queryParams.append(key, String(value));
      }
    }
  });

  // queryParams.toString(): "page=0&size=12" 형태의 문자열 반환
  // 파라미터가 있으면 앞에 "?"를 붙여 완성합니다.
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * getProducts - 세일 상품 목록을 조회하는 함수 (간단 버전)
 *
 * export: 다른 파일에서 이 함수를 import할 수 있게 합니다.
 * async: 비동기 함수입니다. Promise<Product[]>를 반환합니다.
 *
 * @param params - 필터 파라미터 (생략 가능, 기본값: 빈 객체)
 * @returns 상품 배열 (실패 시 빈 배열 반환 — 에러를 던지지 않음)
 *
 * try-catch 패턴:
 * - try { ... }: 에러가 발생할 수 있는 코드를 감쌉니다.
 * - catch { return []; }: 에러가 발생하면 빈 배열을 반환합니다.
 *   → 호출자가 별도 에러 처리를 하지 않아도 됩니다.
 * Java 비유: try { ... } catch (Exception e) { return Collections.emptyList(); }
 */
export async function getProducts(params: Record<string, unknown> = {}): Promise<Product[]> {
  try {
    const queryString = buildQueryString(params);
    // 템플릿 리터럴: `${변수}` 형태로 문자열에 변수를 삽입합니다.
    // Java의 String.format() 또는 문자열 연결(+)과 유사합니다.
    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS_SALE}${queryString}`;

    // fetchAPI<Product[]>: Product 배열을 반환받겠다고 타입을 지정합니다.
    const data = await fetchAPI<ApiProduct[]>(url);
    return data.map((product) => normalizeProduct(product));
  } catch {
    // 에러 발생 시 빈 배열 반환 (호출자는 항상 배열을 받습니다)
    return [];
  }
}

/**
 * getProductsByBrand - 브랜드별 세일 상품을 조회하는 함수
 *
 * @param brandCode - Brand 타입 ('HM' | 'ZARA' | 'UNIQLO' | 'MUJI' | 'CHARLESKEITH')
 * @returns 상품 배열 (실패 시 빈 배열)
 *
 * URL 구조: /api/v1/products/brand/{브랜드코드}/sale
 * Java/Spring: @GetMapping("/api/v1/products/brand/{brandCode}/sale")
 */
export async function getProductsByBrand(brandCode: Brand): Promise<Product[]> {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS_BY_BRAND}/${brandCode}/sale`;
    const data = await fetchAPI<ApiProduct[]>(url);
    return data.map((product) => normalizeProduct(product));
  } catch {
    return [];
  }
}

/**
 * getProductById - 특정 상품의 상세 정보를 조회하는 함수
 *
 * @param productId - 조회할 상품의 ID (숫자)
 * @returns 상품 상세 정보 또는 null (실패 시)
 *
 * Promise<Product | null>: 비동기로 Product 또는 null을 반환합니다.
 * Java 비유: CompletableFuture<Optional<Product>>
 */
export async function getProductById(productId: number): Promise<Product | null> {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_DETAIL}/${productId}`;
    const data = await fetchAPI<Product>(url);
    return data;
  } catch {
    // 상품을 찾지 못하거나 에러 발생 시 null 반환
    return null;
  }
}

/**
 * getBrands - 브랜드 목록을 조회하는 함수
 *
 * @returns Brand 타입의 배열 (실패 시 빈 배열)
 */
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
 * searchProducts - 검색어와 필터로 상품을 검색하는 함수
 *
 * @param query - 검색어 (기본값: 빈 문자열)
 * @param filters - 필터 조건 객체 (Partial: 모든 필드가 선택 사항)
 * @returns 검색 결과 상품 배열
 *
 * Partial<SearchProductsParams>: SearchProductsParams의 모든 필드가 선택적(optional)이 됩니다.
 * Java 비유: Optional로 감싼 필드들이 있는 객체
 */
export async function searchProducts(
  query: string = '',
  filters: Partial<SearchProductsParams> = {}
): Promise<Product[]> {
  try {
    const params: Record<string, unknown> = {
      keyword: query,
      ...filters, // 필터 객체의 모든 필드를 params에 병합합니다 (스프레드 연산자)
    };

    const queryString = buildQueryString(params);
    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_SEARCH}${queryString}`;

    const data = await fetchAPI<ApiProduct[]>(url);
    return data.map((product) => normalizeProduct(product));
  } catch {
    return [];
  }
}

/**
 * SaleProductsResult - 세일 상품 조회 결과 타입 (인터페이스)
 *
 * export interface: 다른 파일에서 이 타입을 가져다 쓸 수 있게 합니다.
 * interface: 객체의 구조(필드와 타입)를 정의합니다. 실제 값은 없고 "형태"만 정의합니다.
 * Java 비유: DTO(Data Transfer Object) 클래스 + Lombok의 @Getter
 */
export interface SaleProductsResult {
  products: ApiProduct[]; // API 원본 상품 배열
  totalPages: number;     // 전체 페이지 수
  totalElements: number;  // 전체 상품 수
  hasMore: boolean;       // 다음 페이지가 있는지 (Spring Page.isLast()의 반대)
  currentPage: number;    // 현재 페이지 번호 (0부터 시작)
}

// ============================================================================
// 세일 상품 전체 카탈로그 캐시 — 클라이언트 사이드 필터링 엔진
// ============================================================================
//
// ── 왜 이런 구조가 필요한가요? (2026-07-19 백엔드 전수 감사 결과) ──
//
// 백엔드가 실제로 지원하는 것:
//   ✓ GET /products/sale?page&size&sort={필드},{방향}   — 페이지네이션 + 정렬만
//     (정렬 허용 필드: discountRate, currentPrice, createdAt — viewCount는 400 거부)
//   ✓ GET /products/brand/{brand}/sale                  — 브랜드 필터 (단, 정렬 무시)
//   ✓ GET /products/{id}, /products/sale/count, /brands
//
// 백엔드가 지원하지 않는 것:
//   ✗ 성별/카테고리/검색어/최대가격/최소할인율 필터 — sale 엔드포인트가 전부 무시
//     (어떤 파라미터를 보내도 totalElements가 그대로이고 조건 위반 상품이 섞여 옴)
//   ✗ /product/search — 어떤 파라미터로도 항상 0건 반환 (검색 인덱스 미구축)
//   ✗ 브랜드 + 정렬 조합 — 브랜드 엔드포인트는 sort 파라미터를 무시
//
// ── 해결 전략: 하이브리드 ──
// 1) 필터가 하나도 없는 기본 화면 → 서버 페이지네이션 + 서버 정렬 (가볍고 빠름)
// 2) 필터가 하나라도 있으면 → 전체 카탈로그(~3,900개)를 한 번에 받아 캐시하고,
//    필터·정렬·페이지네이션을 전부 클라이언트에서 수행
//
// 전체 데이터가 4천 개 미만이라 가능한 전략입니다:
// - size=1000이 동작하므로 4번의 병렬 요청으로 전체 확보 (~1-2MB)
// - 이후 모든 필터 변경은 네트워크 없이 즉시 반영 (서버 왕복보다 오히려 빠름)
// - 페이지네이션이 "필터링 후"에 일어나므로, 과거에 있었던
//   "서버 페이지 12개를 클라에서 필터링해 화면이 비는 버그"가 원천적으로 없습니다.
//
// Java 비유: @Cacheable("saleCatalog") + 스트림 필터링
//   products.stream().filter(...).sorted(...).skip(page*size).limit(size)

/** 카탈로그 요청 한 페이지 크기 — 백엔드가 size=1000까지 허용함을 확인했습니다. */
const CATALOG_PAGE_SIZE = 1000;

/** 카탈로그 캐시 유효 시간(5분) — 세일 데이터는 하루 단위로 갱신되므로 충분합니다. */
const CATALOG_TTL_MS = 5 * 60 * 1000;

/**
 * 캐시 항목: 원본(raw)과 정규화본(norm)을 쌍으로 보관합니다.
 * - raw: 호출자(index.tsx)가 기대하는 원본 ApiProduct (반환용)
 * - norm: 필터/정렬 매칭용 정규화 상품 (브랜드 별칭·성별 MEN→MAN·카테고리 그룹핑이 적용됨)
 * 정규화를 캐시 시점에 1회만 수행해, 필터 변경 때마다 4천 개를 재정규화하는 낭비를 막습니다.
 */
interface CatalogEntry {
  raw: ApiProduct;
  norm: NormalizedProduct;
}

// 모듈 스코프 캐시 — 페이지를 새로고침하기 전까지 유지됩니다.
// (React 상태가 아닌 모듈 변수인 이유: 어떤 컴포넌트에서 호출해도 공유되어야 하기 때문)
let catalogCache: { entries: CatalogEntry[]; fetchedAt: number } | null = null;

// 진행 중인 카탈로그 요청 — 동시에 여러 컴포넌트가 요청해도 실제 네트워크는 1번만 발생합니다.
// (예: 필터 변경 + 무한 스크롤이 겹쳐도 중복 다운로드 없음)
let catalogInFlight: Promise<CatalogEntry[]> | null = null;

/**
 * fetchSaleCatalog - 세일 상품 전체 카탈로그를 받아 캐시하는 함수
 *
 * 동작 순서:
 * 1. 유효한 캐시가 있으면 즉시 반환 (네트워크 0회)
 * 2. 이미 다운로드 중이면 그 Promise를 공유 (중복 요청 방지)
 * 3. 첫 페이지(size=1000)로 전체 페이지 수를 파악한 뒤, 나머지를 병렬로 요청
 */
async function fetchSaleCatalog(): Promise<CatalogEntry[]> {
  // 1) 캐시 히트: TTL 이내면 그대로 사용
  if (catalogCache && Date.now() - catalogCache.fetchedAt < CATALOG_TTL_MS) {
    return catalogCache.entries;
  }

  // 2) 진행 중 요청 공유 (Promise 재사용 패턴)
  if (catalogInFlight) {
    return catalogInFlight;
  }

  catalogInFlight = (async () => {
    // 3-1) 첫 페이지로 totalPages 파악
    const firstUrl = `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS_SALE}?page=0&size=${CATALOG_PAGE_SIZE}`;
    const first = await fetchAPI<PagedResponse<ApiProduct>>(firstUrl);

    // 3-2) 나머지 페이지를 병렬 요청 (Promise.all — Java의 CompletableFuture.allOf와 유사)
    const restPageNumbers = Array.from(
      { length: Math.max(0, (first.totalPages ?? 1) - 1) },
      (_, i) => i + 1,
    );
    const restPages = await Promise.all(
      restPageNumbers.map((pageNo) => {
        const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS_SALE}?page=${pageNo}&size=${CATALOG_PAGE_SIZE}`;
        return fetchAPI<PagedResponse<ApiProduct>>(url).then((p) => p.content ?? []);
      }),
    );

    // 3-3) 전체 병합 + 정규화 1회 수행
    const allRaw = [...(first.content ?? []), ...restPages.flat()];
    const normalized: CatalogEntry[] = allRaw.map((raw) => ({
      raw,
      norm: normalizeProduct(raw),
    }));

    // 3-4) 중복 제거 — 백엔드 데이터 품질 이슈 대응 (2026-07-19 감사에서 발견)
    //   a) 같은 id의 문서가 통째로 중복 저장된 경우
    //   b) 같은 상품이 다른 id의 별도 문서로 여러 번 크롤링된 경우
    //      → "브랜드|상품명|판매가" 시그니처로 대표 1건만 남깁니다.
    // 카탈로그 단계에서 제거해야 totalElements/페이지 수가 중복 제거 후 기준으로
    // 일관되게 계산됩니다. (화면에서 지우면 페이지마다 개수가 들쭉날쭉해짐)
    const seenKeys = new Set<string>();
    const entries = normalized.filter(({ norm }) => {
      const keys = [norm.id, `${norm.brand}|${norm.name}|${norm.salePrice}`];
      if (keys.some((key) => seenKeys.has(key))) return false;
      keys.forEach((key) => seenKeys.add(key));
      return true;
    });

    catalogCache = { entries, fetchedAt: Date.now() };
    return entries;
  })().finally(() => {
    // 성공/실패와 무관하게 in-flight 표시를 해제해, 실패 시 다음 호출이 재시도할 수 있게 합니다.
    catalogInFlight = null;
  });

  return catalogInFlight;
}

/**
 * SERVER_SORT_FIELD_MAP - 프론트 논리 정렬 키 → 백엔드 실제 필드명 변환 맵
 *
 * 백엔드는 Spring 표준 `?sort={필드},{방향}` 형식만 인식합니다.
 * (기존에 보내던 sortBy/sortDirection 파라미터는 조용히 무시되고 있었습니다!)
 * 허용 필드 화이트리스트: discountRate | currentPrice | createdAt
 */
const SERVER_SORT_FIELD_MAP: Record<SortBy, string> = {
  discount: 'discountRate',
  price: 'currentPrice',
  createdAt: 'createdAt',
};

/**
 * compareForSort - 클라이언트 정렬용 비교 함수 생성기
 *
 * @param sortBy - 논리 정렬 키 (discount | price | createdAt)
 * @param direction - asc | desc
 * @returns Array.prototype.sort에 넘길 비교 함수
 *
 * Java 비유: Comparator.comparing(Product::getDiscountRate).reversed()
 */
function compareForSort(sortBy: SortBy, direction: SortDirection) {
  // 각 정렬 키에서 비교할 숫자 값을 뽑는 함수
  const pick = (entry: CatalogEntry): number => {
    switch (sortBy) {
      case 'price':
        return entry.norm.salePrice ?? 0;
      case 'createdAt':
        // ISO 날짜 문자열 → epoch 밀리초. 없으면 0(가장 오래된 것으로 취급).
        return entry.norm.createdAt ? new Date(entry.norm.createdAt).getTime() : 0;
      case 'discount':
      default:
        return entry.norm.discountRate ?? 0;
    }
  };

  const sign = direction === 'asc' ? 1 : -1;

  return (a: CatalogEntry, b: CatalogEntry): number => {
    const diff = (pick(a) - pick(b)) * sign;
    if (diff !== 0) return diff;
    // 동점이면 id로 안정 정렬 — 페이지를 나눠 잘라도 순서가 흔들리지 않게 합니다.
    // (순서가 흔들리면 무한 스크롤에서 같은 상품이 중복/누락될 수 있습니다)
    return a.norm.id.localeCompare(b.norm.id);
  };
}

/**
 * matchesFilters - 정규화된 상품이 주어진 필터 조건을 모두 만족하는지 검사
 *
 * 모든 조건은 AND로 결합됩니다 (브랜드 AND 성별 AND 카테고리 AND ...).
 */
function matchesFilters(
  entry: CatalogEntry,
  filters: {
    brands?: Brand[];
    genders?: Gender[];
    categories?: Category[];
    keyword?: string;
    maxPrice?: number;
    minDiscountRate?: number;
  },
): boolean {
  const p = entry.norm;

  // 브랜드: 정규화된 브랜드 코드로 비교 (별칭 처리 완료 상태)
  if (filters.brands && filters.brands.length > 0 && !filters.brands.includes(p.brand)) {
    return false;
  }

  // 성별: 선택한 성별 + '공용(UNISEX)' 상품을 함께 보여줍니다.
  // (여성 필터에서 공용 상품을 숨기면 실제 입을 수 있는 옷이 누락되기 때문)
  if (filters.genders && filters.genders.length > 0) {
    const genderOk = filters.genders.includes(p.gender) || p.gender === 'UNISEX';
    if (!genderOk) return false;
  }

  // 카테고리: 정규화 단계에서 이미 그룹(TOP/BOTTOM/OUTER/SHOES/ETC)으로 변환되어 있습니다.
  // (백엔드의 DRESS→TOP, SKIRT→BOTTOM, UNKNOWN→ETC 매핑 포함)
  if (filters.categories && filters.categories.length > 0 && !filters.categories.includes(p.category)) {
    return false;
  }

  // 최대 가격: 판매가 기준
  if (typeof filters.maxPrice === 'number' && p.salePrice > filters.maxPrice) {
    return false;
  }

  // 최소 할인율
  if (typeof filters.minDiscountRate === 'number' && p.discountRate < filters.minDiscountRate) {
    return false;
  }

  // 검색어: 공백으로 토큰을 나눠 "모든 토큰이 어딘가에 포함"되어야 매칭 (AND 검색)
  // 검색 대상: 상품명 + 브랜드명 + 설명 + 태그 + 소분류
  // 백엔드 검색 API(/product/search)가 항상 0건을 반환해 사용할 수 없으므로
  // 클라이언트에서 직접 검색합니다.
  if (filters.keyword) {
    const haystack = [
      p.name,
      p.brandName,
      p.description ?? '',
      (p.tags ?? []).join(' '),
      p.subCategory ?? '',
    ]
      .join(' ')
      .toLowerCase();

    const tokens = filters.keyword.toLowerCase().split(/\s+/).filter(Boolean);
    const allMatch = tokens.every((token) => haystack.includes(token));
    if (!allMatch) return false;
  }

  return true;
}

/**
 * fetchSaleProducts - 페이지네이션을 지원하는 세일 상품 조회 함수
 *
 * 이 함수는 index.tsx의 무한 스크롤에서 핵심적으로 사용됩니다.
 *
 * @param params - 조회 파라미터
 *   - brands: 브랜드 필터 (배열)
 *   - genders: 성별 필터 (배열)
 *   - categories: 카테고리 필터 (배열)
 *   - keyword: 검색어
 *   - page: 페이지 번호 (0부터 시작, Spring Pageable과 동일)
 *   - size: 페이지당 상품 수
 * @returns SaleProductsResult (실패 시 빈 결과 반환 — 에러를 던지지 않음)
 *
 * Java/Spring 비유:
 * @GetMapping("/api/v1/products/sale")
 * Page<Product> getSaleProducts(@RequestParam int page, @RequestParam int size, ...)
 */
export async function fetchSaleProducts(params: {
  brands?: Brand[];
  genders?: Gender[];
  categories?: Category[];
  keyword?: string;
  maxPrice?: number;
  minDiscountRate?: number;
  page?: number;
  size?: number;
  // 정렬 기준: 논리 정렬 키 (discount | price | createdAt)
  sortBy?: SortBy;
  // 정렬 방향: 오름차순(asc) | 내림차순(desc)
  sortDirection?: SortDirection;
}): Promise<SaleProductsResult> {
  const page = params.page ?? 0;
  const size = params.size ?? 12;
  const sortBy: SortBy = params.sortBy ?? 'discount';
  const sortDirection: SortDirection = params.sortDirection ?? 'desc';

  /**
   * 라우팅 결정: 필터가 하나라도 있으면 클라이언트 엔진, 없으면 서버 페이지네이션
   *
   * 백엔드 전수 감사(파일 상단 주석 참고) 결과, 서버는 필터를 전혀 지원하지 않으므로
   * 필터가 있는 요청을 서버에 그대로 보내면 "조건과 무관한 상품"이 내려옵니다.
   * → 필터가 있으면 전체 카탈로그를 받아 클라이언트에서 처리합니다.
   */
  const hasClientSideWork =
    (params.brands?.length ?? 0) > 0 ||
    (params.genders?.length ?? 0) > 0 ||
    (params.categories?.length ?? 0) > 0 ||
    Boolean(params.keyword) ||
    (typeof params.maxPrice === 'number' && Number.isFinite(params.maxPrice)) ||
    (typeof params.minDiscountRate === 'number' && params.minDiscountRate > 0);

  // ──────────────────────────────────────────────────────────────
  // 경로 A: 필터 없음 → 서버 페이지네이션 + 서버 정렬 (가장 가벼운 경로)
  // ──────────────────────────────────────────────────────────────
  if (!hasClientSideWork) {
    /**
     * 서버 정렬은 Spring 표준 `?sort={필드},{방향}` 형식입니다.
     * 예: ?sort=discountRate,desc → 할인율 높은순
     *
     * ⚠ 과거에 보내던 sortBy/sortDirection 파라미터는 서버가 조용히 무시했습니다.
     *   (그래서 정렬 드롭다운이 무동작이었음 — 2026-07-19 감사에서 발견)
     */
    const queryParams: Record<string, unknown> = {
      page,
      size,
      sort: `${SERVER_SORT_FIELD_MAP[sortBy]},${sortDirection}`,
    };

    const queryString = buildQueryString(queryParams);
    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS_SALE}${queryString}`;

    /**
     * PagedResponse<ApiProduct>: Spring의 Page<T> 구조와 동일합니다.
     * { content: [...], totalPages, totalElements, last, number, ... }
     */
    const pagedData = await fetchAPI<PagedResponse<ApiProduct>>(url);

    // Java 비유: boolean hasMore = !page.isLast();
    return {
      products: pagedData.content,
      totalPages: pagedData.totalPages,
      totalElements: pagedData.totalElements,
      hasMore: !pagedData.last,
      currentPage: pagedData.number,
    };
  }

  // ──────────────────────────────────────────────────────────────
  // 경로 B: 필터 있음 → 전체 카탈로그 캐시에서 필터·정렬·페이지네이션
  // ──────────────────────────────────────────────────────────────
  // 첫 호출만 네트워크 비용(~4요청)이 들고, 이후 5분간은 모든 필터 조작이
  // 네트워크 없이 즉시 처리됩니다. (서버 왕복 1번보다 빠른 체감 속도)
  const catalog = await fetchSaleCatalog();

  // 1) 필터링 — 모든 조건 AND 결합 (matchesFilters 참고)
  const filtered = catalog.filter((entry) =>
    matchesFilters(entry, {
      brands: params.brands,
      genders: params.genders,
      categories: params.categories,
      keyword: params.keyword,
      maxPrice: params.maxPrice,
      minDiscountRate: params.minDiscountRate,
    }),
  );

  // 2) 정렬 — 전체 필터 결과 기준 (동점은 id로 안정 정렬)
  //    스프레드([...])로 복사 후 정렬해 캐시 원본 순서를 보존합니다.
  const sorted = [...filtered].sort(compareForSort(sortBy, sortDirection));

  // 3) 페이지네이션 — "필터링·정렬이 끝난 결과"를 잘라내므로
  //    서버 페이지를 클라에서 거르던 시절의 빈 화면 버그가 발생하지 않습니다.
  const start = page * size;
  const pageEntries = sorted.slice(start, start + size);
  const totalElements = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));

  return {
    // 호출자(index.tsx)는 원본 ApiProduct를 기대하므로 raw를 반환합니다.
    // (index.tsx가 normalizeProducts로 다시 정규화 — 기존 데이터 흐름 유지)
    products: pageEntries.map((entry) => entry.raw),
    totalPages,
    totalElements,
    hasMore: start + size < totalElements,
    currentPage: page,
  };
}

/**
 * fetchSaleProductCount - 현재 세일 중인 상품의 총 개수를 조회하는 함수
 *
 * 메인 페이지 헤더에 "현재 X개 할인 중"을 표시하기 위해 사용됩니다.
 *
 * @returns 세일 상품 총 개수 (실패 시 0 반환)
 *
 * typeof data === 'number': data가 직접 숫자인 경우를 처리합니다.
 * 백엔드 응답이 { count: 120 } 형태이거나 120처럼 숫자 자체일 수 있습니다.
 * → 두 가지 경우를 모두 처리합니다.
 */
export async function fetchSaleProductCount(): Promise<number> {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.SALE_COUNT}`;
    // SaleCountResponse: { count: number } 구조의 타입
    const data = await fetchAPI<SaleCountResponse>(url);

    // 백엔드가 숫자를 직접 반환하는 경우
    if (typeof data === 'number') {
      return data;
    }

    // 백엔드가 { count: 120 } 객체를 반환하는 경우
    if (data && typeof data.count === 'number') {
      return data.count;
    }

    return 0;
  } catch {
    return 0;
  }
}

/**
 * fetchProductDetail - 상품 상세 정보와 가격 히스토리를 조회하는 함수
 *
 * product/[id].tsx에서 특정 상품의 상세 페이지를 렌더링할 때 사용됩니다.
 *
 * @param productId - 조회할 상품 ID (string 또는 number)
 * @returns 상품 정보 + 가격 히스토리, 실패 시 null
 *
 * encodeURIComponent(): URL에 사용할 수 없는 특수문자를 인코딩합니다.
 * 예: "상품 이름" → "%EC%83%81%ED%92%88%20%EC%9D%B4%EB%A6%84"
 * Java의 URLEncoder.encode()와 같습니다.
 */
export async function fetchProductDetail(productId: string | number): Promise<ProductDetailResponse | null> {
  try {
    const encodedProductId = encodeURIComponent(String(productId));
    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_DETAIL}/${encodedProductId}`;
    const product = await fetchAPI<ApiProduct>(url);
    const normalizedProduct = normalizeProduct(product);

    /**
     * 가격 히스토리(priceHistory)는 의도적으로 채우지 않습니다.
     *
     * 이전에는 generateMockPriceHistory()로 "랜덤 가격 변동"을 만들어 넣었지만,
     * 이는 실제와 무관한 가짜 데이터라 신뢰를 해칩니다(포트폴리오 평가 시 특히 위험).
     * 또한 상세 페이지의 가격 분석(PriceHistoryChart)은 실제 원가/할인가만으로
     * "원가 대비 얼마 할인"을 보여주므로 가짜 시계열이 필요 없습니다.
     *
     * 실제 시계열 히스토리가 필요하면 백엔드 API
     * (예: GET /api/v1/products/{id}/price-history)를 연동해 여기서 받아오세요.
     */
    return {
      product: normalizedProduct,
    };
  } catch {
    return null;
  }
}

/**
 * BRAND_NAMES - 브랜드 코드를 사용자에게 보여줄 이름으로 변환하는 매핑 객체
 *
 * Record<Brand, string>: Brand 유니온 타입의 각 값을 키로, string을 값으로 갖는 객체 타입
 * Java 비유: Map<Brand, String> (enum을 키로 사용)
 *
 * export: 다른 파일에서 import { BRAND_NAMES } from '../utils/api' 로 가져다 씁니다.
 */
export const BRAND_NAMES: Record<Brand, string> = Object.fromEntries(
  Object.entries(BRAND_METADATA).map(([brand, meta]) => [brand, meta.name]),
) as Record<Brand, string>;

/**
 * getBrandDisplayName - 브랜드 코드를 표시용 이름으로 변환하는 유틸리티 함수
 *
 * @param brand - Brand 타입의 브랜드 코드
 * @returns 표시용 브랜드명 (BRAND_NAMES에 없으면 코드 그대로 반환)
 *
 * BRAND_NAMES[brand]: 객체를 딕셔너리처럼 사용하여 브랜드명을 조회합니다.
 * || brand: 조회 결과가 falsy(undefined 등)이면 brand 코드를 그대로 반환합니다.
 * Java 비유: Optional.ofNullable(BRAND_NAMES.get(brand)).orElse(brand)
 */
export const getBrandDisplayName = (brand: Brand): string => {
  return BRAND_NAMES[brand] || brand;
};
