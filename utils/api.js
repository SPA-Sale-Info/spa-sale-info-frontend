/**
 * api.js - API 통신 유틸리티 함수 모음
 *
 * 이 파일은 백엔드 API와 통신하는 함수들을 모아놓은 곳입니다
 *
 * 왜 별도 파일로 분리하나요?
 * - 코드 재사용성 증가
 * - API 엔드포인트를 한 곳에서 관리
 * - 에러 처리를 일관되게 유지
 * - 테스트가 쉬워짐
 * - 유지보수가 편해짐
 */

/**
 * API 기본 URL
 *
 * process.env:
 * - Node.js의 환경 변수 객체
 * - .env 파일이나 시스템 환경 변수에서 값을 가져옴
 *
 * ||:
 * - OR 연산자
 * - 왼쪽 값이 없으면 오른쪽 값 사용 (기본값 설정)
 *
 * 왜 환경 변수를 사용하나요?
 * - 개발/스테이징/프로덕션 환경마다 다른 API 주소 사용 가능
 * - 보안에 민감한 정보(API 키 등)를 코드에 직접 넣지 않음
 * - 코드 변경 없이 설정만으로 환경 전환 가능
 */
// 개발 환경에서 백엔드 주소를 따로 입력하지 않았다면 이 값을 씁니다.
const DEFAULT_DEV_API = 'http://localhost:8080'
const isDev = process.env.NODE_ENV !== 'production'

function resolveApiBaseUrl() {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    (isDev ? DEFAULT_DEV_API : '')

  if (!rawBaseUrl) {
    throw new Error('API URL이 설정되지 않았습니다. NEXT_PUBLIC_API_URL 환경변수를 확인하세요.')
  }

  try {
    const parsed = new URL(rawBaseUrl)
    const protocol = parsed.protocol.toLowerCase()

    if (protocol === 'https:' || (isDev && protocol === 'http:')) {
      return parsed.origin.replace(/\/$/, '')
    }

    throw new Error(`지원하지 않는 프로토콜입니다: ${protocol}`)
  } catch (error) {
    if (isDev) {
      console.warn('잘못된 API URL이 감지되어 개발용 기본값(http://localhost:8080)으로 대체합니다.', error)
      return DEFAULT_DEV_API
    }

    throw error
  }
}

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
 * SPA 세일 상품 목록을 가져오는 함수
 *
 * @param {Object} options - 페이지네이션 옵션
 * @param {number} options.page - 페이지 번호 (기본값 0)
 * @param {number} options.size - 페이지 크기 (기본값 12)
 * @param {string} [options.brandType] - 브랜드 코드 (예: 'ZARA')
 * @param {string} [options.gender] - 'men' 또는 'women'
 * @param {string} [options.mainCategory] - 'TOP', 'BOTTOM' 등 메인 카테고리
 * @param {string} [options.keyword] - 검색 키워드
 * @returns {Promise<Object>} 백엔드가 반환하는 data 객체
 */
export async function fetchSaleProducts({
  page = 0,
  size = 12,
  brandType,
  gender,
  mainCategory,
  keyword,
} = {}) {
  const normalizedBrand = typeof brandType === 'string' && brandType !== 'all'
    ? brandType.toUpperCase()
    : null
  const normalizedGender = typeof gender === 'string' && gender !== 'all'
    ? gender.toUpperCase()
    : null
  const normalizedCategory = typeof mainCategory === 'string' && mainCategory !== 'all'
    ? mainCategory.toUpperCase()
    : null
  const trimmedKeyword = typeof keyword === 'string' && keyword.trim() !== ''
    ? keyword.trim()
    : null

  const requiresSearch = Boolean(normalizedGender || normalizedCategory || trimmedKeyword)

  const buildQuery = (additionalParams = {}) => {
    const query = new URLSearchParams({
      page: String(page),
      size: String(size),
      ...additionalParams,
    })
    return query
  }

  const request = async (endpoint, query) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`요청 실패 (${response.status}): ${text}`)
    }

    const payload = await response.json()

    if (payload?.success === false) {
      throw new Error(payload?.message || '응답이 성공 상태가 아닙니다.')
    }

    if (payload?.data) {
      return payload.data
    }

    return payload
  }

  if (requiresSearch) {
    const searchParams = {}
    if (normalizedBrand) searchParams.brandType = normalizedBrand
    if (normalizedGender) searchParams.gender = normalizedGender
    if (normalizedCategory) searchParams.mainCategory = normalizedCategory
    if (trimmedKeyword) searchParams.keyword = trimmedKeyword
    searchParams.onSale = 'true'
    searchParams.sortBy = 'discount'
    searchParams.sortDirection = 'desc'

    try {
      return await request('/api/v1/product/search', buildQuery(searchParams))
    } catch (error) {
      console.warn('검색 API 호출에 실패했습니다. 기본 세일 목록으로 대체합니다.', error)
    }
  }

  if (normalizedBrand) {
    return request(`/api/v1/products/brand/${normalizedBrand}/sale`, buildQuery())
  }

  return request('/api/v1/products/sale', buildQuery())
}
