/**
 * ============================================================================
 * api.js - 백엔드 API 통신 유틸리티 (프론트엔드의 RestTemplate/FeignClient)
 * ============================================================================
 *
 * 🎯 이 파일의 역할 (Spring Boot로 비유)
 * - RestTemplate: 백엔드 서버에 HTTP 요청을 보내는 클라이언트
 * - FeignClient: 선언적 HTTP 클라이언트
 * - @Service: 비즈니스 로직 레이어
 *
 * 📁 Spring Boot와 비교:
 *
 * [Spring Boot]
 * @Service
 * public class ProductService {
 *     @Autowired
 *     private RestTemplate restTemplate;
 *
 *     public List<Product> getProducts() {
 *         return restTemplate.getForObject(url, ProductList.class);
 *     }
 * }
 *
 * [Next.js - 이 파일]
 * export async function fetchProducts() {
 *     const response = await fetch(url);
 *     return response.json();
 * }
 *
 * 💡 왜 별도 파일로 분리하나요?
 * - 코드 재사용성 증가 (여러 페이지에서 같은 API 호출)
 * - API 엔드포인트를 한 곳에서 관리 (URL 변경 시 한 곳만 수정)
 * - 에러 처리를 일관되게 유지 (try-catch를 매번 안 써도 됨)
 * - 테스트가 쉬워짐 (Mock 객체 주입 가능)
 * - 유지보수가 편해짐 (API 변경 시 영향 범위 최소화)
 */

/**
 * ============================================================================
 * API 기본 URL 설정 (Spring Boot의 application.yml과 유사)
 * ============================================================================
 *
 * 🔧 Spring Boot와 비교:
 *
 * [Spring Boot - application.yml]
 * spring:
 *   profiles:
 *     active: ${SPRING_PROFILES_ACTIVE:dev}
 * api:
 *   url: ${API_URL:http://localhost:8080}
 *
 * [Next.js - 환경 변수]
 * .env.local 파일:
 * NEXT_PUBLIC_API_URL=http://localhost:8080  (개발)
 * NEXT_PUBLIC_API_URL=https://api.prod.com   (프로덕션)
 *
 * 📝 process.env란?
 * - Node.js의 환경 변수 객체 (System.getenv()와 동일)
 * - .env 파일이나 시스템 환경 변수에서 값을 가져옴
 * - 예: process.env.API_URL → System.getenv("API_URL")
 *
 * 🔑 || 연산자 (OR 연산자)
 * - 왼쪽 값이 없으면(null, undefined, '') 오른쪽 값 사용
 * - Java의 Optional.orElse()와 비슷
 * - 예: const url = userInput || 'default' → String url = userInput != null ? userInput : "default"
 *
 * 💡 왜 환경 변수를 사용하나요?
 * 1. 환경별 설정 분리
 *    - 개발: http://localhost:8080
 *    - 스테이징: https://api.staging.com
 *    - 프로덕션: https://api.prod.com
 *
 * 2. 보안
 *    - API 키, 비밀번호를 코드에 직접 넣지 않음
 *    - .env 파일은 .gitignore에 추가하여 Git에 올라가지 않음
 *
 * 3. 유연성
 *    - 코드 변경 없이 설정만 바꾸면 환경 전환 가능
 *    - 배포 시 환경 변수만 주입하면 됨
 */

// ============================================================================
// 환경별 기본 API URL 상수 정의
// ============================================================================
const DEFAULT_DEV_API = 'http://localhost:8080'   // 개발 환경 기본값
const DEFAULT_PROD_API = 'https://apimion.click'  // 프로덕션 환경 기본값

/**
 * 현재 환경이 개발 환경인지 확인
 * - process.env.NODE_ENV: Next.js가 자동으로 설정하는 환경 변수
 * - 'development' (npm run dev) 또는 'production' (npm run build)
 *
 * Spring Boot의 @Profile("dev")와 유사
 */
const isDev = process.env.NODE_ENV !== 'production'

/**
 * ============================================================================
 * API Base URL 결정 함수
 * ============================================================================
 *
 * 이 함수는 다음 우선순위로 API URL을 결정합니다:
 * 1. NEXT_PUBLIC_API_URL (클라이언트에서도 접근 가능)
 * 2. API_URL (서버에서만 접근 가능)
 * 3. 환경별 기본값 (개발: localhost:8080, 프로덕션: apimion.click)
 *
 * @returns {string} 검증된 API Base URL
 * @throws {Error} URL이 유효하지 않거나 프로토콜이 지원되지 않을 때
 *
 * 🔍 Spring Boot와 비교:
 * @Value("${api.url:http://localhost:8080}")
 * private String apiUrl;
 */
function resolveApiBaseUrl() {
  /**
   * 1단계: 환경 변수에서 URL 가져오기 (우선순위 순)
   *
   * NEXT_PUBLIC_* 접두사:
   * - 브라우저에서도 접근 가능한 환경 변수
   * - 빌드 시 코드에 직접 포함됨
   * - 민감한 정보(API 키 등)는 NEXT_PUBLIC_ 붙이면 안 됨!
   *
   * API_URL:
   * - 서버 사이드에서만 접근 가능
   * - 클라이언트(브라우저)에서는 undefined
   */
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||  // 1순위: 클라이언트용 환경 변수
    process.env.API_URL ||               // 2순위: 서버용 환경 변수
    (isDev ? DEFAULT_DEV_API : DEFAULT_PROD_API)  // 3순위: 환경별 기본값

  /**
   * 2단계: URL이 설정되었는지 확인
   * Java의 Objects.requireNonNull()과 유사
   */
  if (!rawBaseUrl) {
    throw new Error('API URL이 설정되지 않았습니다. NEXT_PUBLIC_API_URL 환경변수를 확인하세요.')
  }

  /**
   * 3단계: URL 유효성 검증
   *
   * try-catch 블록:
   * - Java의 try-catch와 동일
   * - 에러가 발생하면 catch 블록으로 이동
   */
  try {
    /**
     * URL 객체 생성 및 파싱
     * - JavaScript의 내장 URL 클래스
     * - Java의 java.net.URL과 유사
     * - 형식이 잘못되면 TypeError 발생
     */
    const parsed = new URL(rawBaseUrl)
    const protocol = parsed.protocol.toLowerCase()  // 'http:' 또는 'https:'

    /**
     * 프로토콜 검증
     * - 프로덕션: HTTPS만 허용 (보안)
     * - 개발: HTTP도 허용 (로컬 테스트용)
     */
    if (protocol === 'https:' || (isDev && protocol === 'http:')) {
      /**
       * origin: 프로토콜 + 호스트 + 포트
       * - 예: https://apimion.click:443
       * - replace(/\/$/, ''): 마지막 슬래시 제거
       * - 정규식: / = 구분자, \/ = 슬래시 문자, $ = 문자열 끝
       */
      return parsed.origin.replace(/\/$/, '')
    }

    throw new Error(`지원하지 않는 프로토콜입니다: ${protocol}`)

  } catch (error) {
    /**
     * 에러 처리
     * - 개발 환경: 경고만 출력하고 기본값 사용
     * - 프로덕션: 에러를 throw하여 앱 중단
     */
    if (isDev) {
      console.warn('잘못된 API URL이 감지되어 개발용 기본값(http://localhost:8080)으로 대체합니다.', error)
      return DEFAULT_DEV_API
    }

    throw error  // 프로덕션에서는 에러를 그대로 던짐
  }
}

/**
 * 최종 API Base URL
 * - 앱이 시작될 때 한 번만 실행됨
 * - 이후 모든 API 호출에서 재사용
 *
 * Spring Boot의 @Value 필드와 유사:
 * @Value("${api.url}")
 * private final String API_BASE_URL;
 */
const API_BASE_URL = resolveApiBaseUrl()

/**
 * 모든 상품을 가져오는 함수
 *
 * @param {Object} params - 쿼리 파라미터
 * @param {string} params.brand - 브랜드 필터 (선택사항)
 * @param {number} params.limit - 가져올 상품 개수 (선택사항)
 * @param {number} params.offset - 건너뛸 상품 개수 (선택사항, 페이지네이션용)
 * @returns {Promise<Array>} 상품 배열을 담은 Promise
 *
 * async 함수:
 * - 항상 Promise를 반환
 * - await를 사용할 수 있음
 *
 * Promise란?
 * - 비동기 작업의 완료 또는 실패를 나타내는 객체
 * - 3가지 상태: pending(대기), fulfilled(성공), rejected(실패)
 *
 * 왜 Promise를 사용하나요?
 * - 비동기 작업을 순차적으로 작성 가능 (콜백 지옥 방지)
 * - 에러 처리가 깔끔함 (try-catch)
 * - 여러 비동기 작업을 조합하기 쉬움
 */
export async function getProducts(params = {}) {
  try {
    /**
     * URLSearchParams:
     * - URL 쿼리 스트링을 쉽게 만들어주는 객체
     * - 자동으로 인코딩해줌
     *
     * 예시:
     * params = { brand: 'ZARA', limit: 10 }
     * -> '?brand=ZARA&limit=10'
     */
    const queryParams = new URLSearchParams()

    /**
     * Object.entries():
     * - 객체를 [key, value] 쌍의 배열로 변환
     *
     * 예시:
     * { brand: 'ZARA', limit: 10 }
     * -> [['brand', 'ZARA'], ['limit', 10]]
     *
     * forEach():
     * - 배열의 각 요소를 순회하며 함수 실행
     *
     * [key, value]:
     * - 구조 분해 할당
     * - ['brand', 'ZARA']를 key='brand', value='ZARA'로 분리
     */
    Object.entries(params).forEach(([key, value]) => {
      /**
       * if (value):
       * - value가 truthy(참으로 취급되는 값)일 때만 실행
       * - undefined, null, '', 0, false는 제외됨
       *
       * 왜 이렇게 하나요?
       * - undefined나 null 값을 쿼리에 포함시키지 않기 위함
       * - 예: brand가 undefined면 쿼리에 포함 안 됨
       */
      if (value) {
        queryParams.append(key, value)
      }
    })

    /**
     * 최종 URL 구성
     *
     * queryParams.toString():
     * - URLSearchParams를 문자열로 변환
     * - 'brand=ZARA&limit=10' 형태
     *
     * 삼항 연산자:
     * - 쿼리가 있으면 '?' 추가
     * - 쿼리가 없으면 빈 문자열
     */
    const queryString = queryParams.toString()
    const url = `${API_BASE_URL}/api/products${queryString ? `?${queryString}` : ''}`

    /**
     * fetch API로 데이터 요청
     *
     * fetch 옵션:
     * - method: HTTP 메서드 (GET, POST, PUT, DELETE 등)
     * - headers: HTTP 헤더
     * - body: 요청 본문 (POST, PUT 등에서 사용)
     *
     * Content-Type: application/json:
     * - JSON 데이터를 보내거나 받음을 명시
     *
     * await:
     * - Promise가 완료될 때까지 기다림
     * - 코드가 동기적으로 보이게 작성 가능
     */
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    /**
     * HTTP 응답 상태 확인
     *
     * response.ok:
     * - 상태 코드가 200-299 범위면 true
     * - 400, 500번대 에러면 false
     *
     * !:
     * - NOT 연산자
     * - true <-> false 반전
     */
    if (!response.ok) {
      /**
       * Error 객체 생성 및 throw
       *
       * throw:
       * - 에러를 발생시킴
       * - catch 블록으로 이동
       *
       * new Error():
       * - 새로운 에러 객체 생성
       * - 메시지를 포함할 수 있음
       */
      throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`)
    }

    /**
     * JSON 응답을 JavaScript 객체로 변환
     */
    const data = await response.json()
    return data

  } catch (error) {
    /**
     * 에러 처리
     *
     * console.error():
     * - 콘솔에 에러를 빨간색으로 출력
     * - 개발 중 디버깅에 유용
     *
     * 프로덕션에서는:
     * - Sentry, LogRocket 같은 에러 로깅 서비스 사용
     * - 사용자에게 친절한 에러 메시지 표시
     * - 에러를 분석하여 서비스 개선
     */
    console.error('상품 데이터를 가져오는데 실패했습니다:', error)

    /**
     * throw error:
     * - 에러를 다시 던짐
     * - 호출한 곳에서 에러를 처리할 수 있도록
     *
     * 혹은 빈 배열을 반환할 수도 있음:
     * return []
     */
    throw error
  }
}

/**
 * 특정 브랜드의 상품만 가져오는 함수
 *
 * @param {string} brandCode - 브랜드 코드 (예: 'ZARA', 'HM')
 * @returns {Promise<Array>} 상품 배열을 담은 Promise
 *
 * 이 함수는 getProducts를 재사용합니다
 * - 코드 중복 방지
 * - 일관된 에러 처리
 */
export async function getProductsByBrand(brandCode) {
  /**
   * getProducts 함수를 호출하며 brand 파라미터 전달
   *
   * { brand: brandCode }:
   * - 객체 리터럴
   * - getProducts의 params 인자로 전달됨
   */
  return getProducts({ brand: brandCode })
}

/**
 * 특정 상품의 상세 정보를 가져오는 함수
 *
 * @param {string|number} productId - 상품 ID
 * @returns {Promise<Object>} 상품 객체를 담은 Promise
 *
 * REST API 패턴:
 * - GET /api/products - 목록 조회
 * - GET /api/products/:id - 상세 조회
 * - POST /api/products - 생성
 * - PUT /api/products/:id - 수정
 * - DELETE /api/products/:id - 삭제
 */
export async function getProductById(productId) {
  try {
    /**
     * URL에 ID를 포함
     *
     * 템플릿 리터럴로 동적 URL 생성
     * 예: /api/products/123
     */
    const url = `${API_BASE_URL}/api/products/${productId}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`상품 조회 실패: ${response.status}`)
    }

    const data = await response.json()
    return data

  } catch (error) {
    console.error('상품 상세 정보를 가져오는데 실패했습니다:', error)
    throw error
  }
}

/**
 * 브랜드 목록을 가져오는 함수
 *
 * @returns {Promise<Array>} 브랜드 배열을 담은 Promise
 *
 * 브랜드 목록은 자주 변하지 않으므로
 * 나중에 캐싱을 추가하면 성능 향상 가능
 */
export async function getBrands() {
  try {
    const url = `${API_BASE_URL}/api/brands`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`브랜드 목록 조회 실패: ${response.status}`)
    }

    const data = await response.json()
    return data

  } catch (error) {
    console.error('브랜드 목록을 가져오는데 실패했습니다:', error)
    throw error
  }
}

/**
 * 검색 함수
 *
 * @param {string} query - 검색어
 * @param {Object} filters - 추가 필터 (브랜드, 가격대 등)
 * @returns {Promise<Array>} 검색 결과 배열을 담은 Promise
 */
export async function searchProducts(query, filters = {}) {
  try {
    const queryParams = new URLSearchParams({
      q: query, // 검색어
      ...filters, // 스프레드 연산자로 filters 객체의 모든 속성 추가
    })

    const url = `${API_BASE_URL}/api/products/search?${queryParams.toString()}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`검색 실패: ${response.status}`)
    }

    const data = await response.json()
    return data

  } catch (error) {
    console.error('검색에 실패했습니다:', error)
    throw error
  }
}

/**
 * export:
 * - 함수들을 외부에서 사용할 수 있게 내보냄
 *
 * 사용 예시:
 * import { getProducts, getProductsByBrand } from '../utils/api'
 *
 * 혹은:
 * import * as api from '../utils/api'
 * api.getProducts()
 */

/**
 * ============================================================================
 * 세일 상품 목록 조회 함수 (가장 중요한 API 호출 함수)
 * ============================================================================
 *
 * 🎯 Spring Boot Controller 메서드와 비교:
 *
 * [Spring Boot]
 * @GetMapping("/api/products/sale")
 * public ResponseEntity<Page<Product>> getSaleProducts(
 *     @RequestParam(defaultValue = "0") int page,
 *     @RequestParam(defaultValue = "12") int size,
 *     @RequestParam(required = false) String brandType,
 *     @RequestParam(required = false) String gender,
 *     @RequestParam(required = false) String mainCategory,
 *     @RequestParam(required = false) String keyword
 * ) {
 *     Page<Product> products = productService.findSaleProducts(...);
 *     return ResponseEntity.ok(products);
 * }
 *
 * [Next.js - 이 함수]
 * const products = await fetchSaleProducts({
 *     page: 0,
 *     size: 12,
 *     brandType: 'ZARA',
 *     gender: 'men',
 *     mainCategory: 'TOP',
 *     keyword: '셔츠'
 * })
 *
 * 📡 이 함수가 호출하는 백엔드 API 엔드포인트:
 * 1. /api/v1/product/search - 필터/검색이 있을 때
 *    - gender, mainCategory, keyword 중 하나라도 있으면 이 엔드포인트 사용
 *    - 예: GET /api/v1/product/search?gender=MEN&mainCategory=TOP&page=0&size=12
 *
 * 2. /api/v1/products/brand/{brand}/sale - 특정 브랜드의 세일 상품만 볼 때
 *    - 예: GET /api/v1/products/brand/ZARA/sale?page=0&size=12
 *
 * 3. /api/v1/products/sale - 모든 세일 상품 (기본)
 *    - 예: GET /api/v1/products/sale?page=0&size=12
 *
 * @param {Object} options - 요청 옵션 객체 (Spring의 @RequestParam과 유사)
 * @param {number} [options.page=0] - 페이지 번호 (0부터 시작, Spring Data JPA Pageable과 동일)
 * @param {number} [options.size=12] - 페이지 크기 (한 페이지에 몇 개?)
 * @param {string} [options.brandType] - 브랜드 코드 (예: 'ZARA', 'HM', 'UNIQLO')
 * @param {string} [options.gender] - 성별 필터 ('men', 'women', 'all')
 * @param {string} [options.mainCategory] - 메인 카테고리 ('TOP', 'BOTTOM', 'OUTER' 등)
 * @param {string} [options.keyword] - 검색 키워드 (상품명 검색)
 *
 * @returns {Promise<Object>} 백엔드 API 응답 (Spring의 Page 객체와 유사)
 *          {
 *            content: Product[],    // 상품 목록 (Spring Page.getContent())
 *            last: boolean,          // 마지막 페이지 여부 (Spring Page.isLast())
 *            totalPages: number      // 전체 페이지 수 (Spring Page.getTotalPages())
 *          }
 *
 * @throws {Error} API 요청 실패 시 에러 발생
 *
 * 🔍 사용 예시:
 * const result = await fetchSaleProducts({ page: 0, size: 12, brandType: 'ZARA' })
 * console.log(result.content)     // [Product, Product, ...]
 * console.log(result.last)        // false (더 불러올 데이터가 있음)
 * console.log(result.totalPages)  // 10 (전체 10페이지)
 */
export async function fetchSaleProducts({
  page = 0,        // 기본값 0 (Spring의 @RequestParam(defaultValue = "0")과 동일)
  size = 12,       // 기본값 12
  brandType,       // 선택사항 (undefined일 수 있음)
  gender,          // 선택사항
  mainCategory,    // 선택사항
  keyword,         // 선택사항
} = {}) {          // = {} → 인자를 안 넘겨도 에러 안 남 (기본값 빈 객체)

  /**
   * ============================================================================
   * 1단계: 파라미터 정규화 (Normalization)
   * ============================================================================
   *
   * 사용자 입력을 백엔드가 기대하는 형식으로 변환합니다.
   * - 소문자를 대문자로 변환 (zara → ZARA)
   * - 'all' 값을 null로 변환 (백엔드에 안 보냄)
   * - 빈 문자열을 null로 변환
   *
   * Spring Boot에서는 보통 @RequestParam으로 자동 변환되지만,
   * 프론트엔드에서는 직접 처리해야 합니다.
   */

  /**
   * 브랜드 정규화
   * - 문자열이고 'all'이 아니면 → 대문자로 변환
   * - 그 외에는 null (백엔드에 파라미터 안 보냄)
   *
   * typeof brandType === 'string': 타입 체크 (Java의 instanceof String)
   * brandType !== 'all': 'all'은 "전체"를 의미하므로 필터 안 함
   * brandType.toUpperCase(): 대문자 변환 (Java의 String.toUpperCase())
   */
  const normalizedBrand = typeof brandType === 'string' && brandType !== 'all'
    ? brandType.toUpperCase()  // 'zara' → 'ZARA'
    : null

  /**
   * 성별 정규화
   * - 'men' → 'MEN', 'women' → 'WOMEN'
   * - 'all' → null (전체 보기)
   */
  const normalizedGender = typeof gender === 'string' && gender !== 'all'
    ? gender.toUpperCase()
    : null

  /**
   * 카테고리 정규화
   * - 'top' → 'TOP', 'bottom' → 'BOTTOM'
   * - 'all' → null
   */
  const normalizedCategory = typeof mainCategory === 'string' && mainCategory !== 'all'
    ? mainCategory.toUpperCase()
    : null

  /**
   * 검색 키워드 정규화
   * - 앞뒤 공백 제거 (trim)
   * - 빈 문자열이면 null
   *
   * Java 비슷한 코드:
   * String trimmedKeyword = keyword != null && !keyword.trim().isEmpty()
   *     ? keyword.trim()
   *     : null;
   */
  const trimmedKeyword = typeof keyword === 'string' && keyword.trim() !== ''
    ? keyword.trim()
    : null

  /**
   * ============================================================================
   * 2단계: API 엔드포인트 결정
   * ============================================================================
   *
   * gender, mainCategory, keyword 중 하나라도 있으면
   * 검색 API(/api/v1/product/search)를 사용해야 합니다.
   *
   * Boolean(): 값을 true/false로 변환
   * - null → false
   * - 'MEN' → true
   *
   * || 연산자: OR 연산 (하나라도 true면 true)
   */
  const requiresSearch = Boolean(normalizedGender || normalizedCategory || trimmedKeyword)

  /**
   * ============================================================================
   * 헬퍼 함수 1: 쿼리 스트링 생성 (buildQuery)
   * ============================================================================
   *
   * URL에 붙일 쿼리 스트링을 만듭니다.
   * 예: ?page=0&size=12&gender=MEN
   *
   * @param {Object} additionalParams - 추가 파라미터 (검색 조건 등)
   * @returns {URLSearchParams} 쿼리 객체
   *
   * Spring Boot의 UriComponentsBuilder와 유사:
   * UriComponentsBuilder.fromPath("/api/products")
   *     .queryParam("page", 0)
   *     .queryParam("size", 12)
   *     .build()
   */
  const buildQuery = (additionalParams = {}) => {
    /**
     * URLSearchParams 객체 생성
     * - page, size는 필수 파라미터 (항상 포함)
     * - ...additionalParams: 스프레드 연산자로 추가 파라미터 병합
     *
     * Java 비슷한 코드:
     * Map<String, String> params = new HashMap<>();
     * params.put("page", String.valueOf(page));
     * params.put("size", String.valueOf(size));
     * params.putAll(additionalParams);
     */
    const query = new URLSearchParams({
      page: String(page),      // 숫자를 문자열로 변환 (필수)
      size: String(size),
      ...additionalParams,     // { gender: 'MEN' } → gender=MEN 추가
    })
    return query
  }

  /**
   * ============================================================================
   * 헬퍼 함수 2: HTTP 요청 실행 (request)
   * ============================================================================
   *
   * 실제 HTTP 요청을 보내고 응답을 처리합니다.
   *
   * @param {string} endpoint - API 엔드포인트 (예: '/api/v1/products/sale')
   * @param {URLSearchParams} query - 쿼리 파라미터
   * @returns {Promise<Object>} API 응답 데이터
   *
   * Spring Boot의 RestTemplate.exchange()와 유사:
   * ResponseEntity<ApiResponse> response = restTemplate.exchange(
   *     url, HttpMethod.GET, entity, ApiResponse.class
   * );
   */
  const request = async (endpoint, query) => {
    /**
     * fetch() - HTTP 요청 보내기
     * - JavaScript의 내장 HTTP 클라이언트
     * - Spring의 RestTemplate, Java의 HttpClient와 동일
     *
     * ${API_BASE_URL}${endpoint}?${query.toString()}:
     * - 템플릿 리터럴로 URL 조합
     * - 예: https://apimion.click/api/v1/products/sale?page=0&size=12
     */
    const response = await fetch(`${API_BASE_URL}${endpoint}?${query.toString()}`, {
      method: 'GET',               // HTTP 메서드
      headers: {
        'Accept': 'application/json',  // JSON 응답을 기대함
      },
    })

    /**
     * HTTP 상태 코드 확인
     * - response.ok: 200~299 범위면 true
     * - 400, 500번대 에러면 false
     *
     * Java 비슷한 코드:
     * if (!response.getStatusCode().is2xxSuccessful()) {
     *     throw new RuntimeException("요청 실패: " + response.getStatusCode());
     * }
     */
    if (!response.ok) {
      const text = await response.text()  // 에러 메시지 읽기
      throw new Error(`요청 실패 (${response.status}): ${text}`)
    }

    /**
     * JSON 응답을 JavaScript 객체로 변환
     * - response.json(): JSON 파싱
     * - Java의 ObjectMapper.readValue()와 동일
     *
     * 백엔드 응답 구조:
     * {
     *   success: true,
     *   data: {
     *     content: [...],
     *     last: true,
     *     totalPages: 10
     *   }
     * }
     */
    const payload = await response.json()

    /**
     * 응답 검증 1: success 필드 확인
     * - payload?.success: Optional chaining (null-safe)
     * - Java의 Optional.ofNullable(payload).map(p -> p.success)와 유사
     *
     * payload?.success === false:
     * - success 필드가 명시적으로 false인 경우
     * - 백엔드에서 에러를 성공 응답으로 감싸서 보낼 때
     */
    if (payload?.success === false) {
      throw new Error(payload?.message || '응답이 성공 상태가 아닙니다.')
    }

    /**
     * 응답 검증 2: data 필드 추출
     * - 백엔드가 data 필드로 감쌌으면 안의 내용만 반환
     * - 아니면 payload 전체 반환
     *
     * Java 비슷한 코드:
     * return payload.getData() != null ? payload.getData() : payload;
     */
    if (payload?.data) {
      return payload.data  // { content: [...], last: true, ... }
    }

    return payload  // 혹시 data가 없으면 payload 전체 반환
  }

  /**
   * ============================================================================
   * 3단계: API 엔드포인트 선택 및 호출
   * ============================================================================
   *
   * 조건에 따라 적절한 API를 호출합니다.
   * - 필터/검색이 있으면: /api/v1/product/search
   * - 브랜드만 있으면: /api/v1/products/brand/{brand}/sale
   * - 아무것도 없으면: /api/v1/products/sale
   */

  /**
   * Case 1: 검색 API 사용
   * - gender, mainCategory, keyword 중 하나라도 있는 경우
   */
  if (requiresSearch) {
    /**
     * 검색 파라미터 객체 생성
     * - 있는 것만 추가 (null인 것은 제외)
     *
     * Java 비슷한 코드:
     * Map<String, String> searchParams = new HashMap<>();
     * if (normalizedBrand != null) searchParams.put("brandType", normalizedBrand);
     * if (normalizedGender != null) searchParams.put("gender", normalizedGender);
     */
    const searchParams = {}
    if (normalizedBrand) searchParams.brandType = normalizedBrand
    if (normalizedGender) searchParams.gender = normalizedGender
    if (normalizedCategory) searchParams.mainCategory = normalizedCategory
    if (trimmedKeyword) searchParams.keyword = trimmedKeyword
    searchParams.onSale = 'true'           // 세일 상품만
    searchParams.sortBy = 'discount'       // 할인율 순 정렬
    searchParams.sortDirection = 'desc'    // 내림차순 (높은 순)

    /**
     * try-catch로 에러 처리
     * - 검색 API 실패 시 기본 세일 목록으로 fallback
     *
     * Spring Boot에서는:
     * try {
     *     return searchService.search(params);
     * } catch (Exception e) {
     *     log.warn("검색 실패, 기본 목록 사용", e);
     *     return productService.getSaleProducts();
     * }
     */
    try {
      return await request('/api/v1/product/search', buildQuery(searchParams))
    } catch (error) {
      console.warn('검색 API 호출에 실패했습니다. 기본 세일 목록으로 대체합니다.', error)
      // 검색 실패 시 아래 로직으로 계속 진행 (fallthrough)
    }
  }

  /**
   * Case 2: 브랜드별 세일 상품 API
   * - 브랜드가 선택되었지만 다른 필터는 없는 경우
   * - 예: GET /api/v1/products/brand/ZARA/sale?page=0&size=12
   */
  if (normalizedBrand) {
    return request(`/api/v1/products/brand/${normalizedBrand}/sale`, buildQuery())
  }

  /**
   * Case 3: 전체 세일 상품 API (기본)
   * - 아무 필터도 없는 경우
   * - 예: GET /api/v1/products/sale?page=0&size=12
   */
  return request('/api/v1/products/sale', buildQuery())
}

/**
 * 총 할인 상품 개수를 가져오는 함수
 *
 * @returns {Promise<number>} 할인 중인 상품 총 개수
 */
export async function fetchSaleProductCount() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/sale/count`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`요청 실패 (${response.status})`)
    }

    const payload = await response.json()

    if (payload?.success === false) {
      throw new Error(payload?.message || '응답이 성공 상태가 아닙니다.')
    }

    // payload.data가 숫자값
    return payload?.data ?? 0
  } catch (error) {
    console.error('할인 상품 개수 조회 실패:', error)
    return 0
  }
}

/**
 * 상품 상세 정보를 조회하는 함수
 *
 * @param {string} productId - 상품 ID (MongoDB ObjectId)
 * @returns {Promise<Object>} 상품 상세 정보 객체
 *
 * API 엔드포인트: GET /api/v1/products/{id}
 *
 * 응답 구조:
 * {
 *   success: true,
 *   data: {
 *     id: string,
 *     brandType: string,
 *     brandName: string,
 *     productCode: string,
 *     name: string,
 *     description: string,
 *     mainCategory: string,
 *     subCategory: string,
 *     gender: string,
 *     originalPrice: number,
 *     currentPrice: number,
 *     discountRate: number,
 *     onSale: boolean,
 *     imageUrls: string[],
 *     productUrl: string,
 *     colors: string[],
 *     sizes: string[],
 *     inStock: boolean,
 *     material: string,
 *     tags: string[],
 *     saleStartDate: string,
 *     saleEndDate: string,
 *     viewCount: number,
 *     likeCount: number,
 *     createdAt: string,
 *     updatedAt: string
 *   }
 * }
 */
export async function fetchProductDetail(productId) {
  try {
    if (!productId) {
      throw new Error('상품 ID가 필요합니다.')
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('상품을 찾을 수 없습니다.')
      }
      const text = await response.text()
      throw new Error(`요청 실패 (${response.status}): ${text}`)
    }

    const payload = await response.json()

    if (payload?.success === false) {
      throw new Error(payload?.message || '응답이 성공 상태가 아닙니다.')
    }

    if (!payload?.data) {
      throw new Error('상품 데이터가 없습니다.')
    }

    return payload.data
  } catch (error) {
    console.error('상품 상세 조회 실패:', error)
    throw error
  }
}
