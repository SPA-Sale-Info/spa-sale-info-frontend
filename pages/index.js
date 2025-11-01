/**
 * index.js - 메인 페이지 (홈페이지)
 *
 * Next.js에서 pages 폴더의 파일명이 곧 URL 경로가 됩니다
 * - pages/index.js -> '/' (루트 경로, 즉 홈페이지)
 * - pages/about.js -> '/about'
 * - pages/products/list.js -> '/products/list'
 *
 * 이 페이지는 맛 프로젝트의 메인 페이지로,
 * SPA 브랜드의 가격 인하 상품 목록을 보여줍니다
 */

// React의 useState와 useEffect 훅을 import 합니다
// useState: 컴포넌트의 상태를 관리하는 훅
// useEffect: 컴포넌트가 렌더링될 때 특정 작업을 수행하는 훅
import { useState, useEffect } from 'react'

// next/head를 import하여 페이지별 메타데이터를 설정합니다
import Head from 'next/head'

// 우리가 만든 컴포넌트들을 import 합니다
import BrandFilter from '../components/BrandFilter'
import ProductCard from '../components/ProductCard'

// CSS 모듈을 import 합니다
// CSS 모듈은 스타일의 클래스명이 자동으로 고유하게 만들어져 충돌을 방지합니다
import styles from '../styles/Home.module.css'

/**
 * Home 컴포넌트 - 메인 페이지
 *
 * @returns {JSX.Element} 렌더링될 홈페이지 컴포넌트
 */
export default function Home() {
  /**
   * useState 훅 사용 예시
   *
   * 문법: const [상태값, 상태변경함수] = useState(초기값)
   *
   * - 상태값: 현재 상태를 담고 있는 변수
   * - 상태변경함수: 상태를 변경할 때 사용하는 함수
   * - 초기값: 컴포넌트가 처음 렌더링될 때의 값
   *
   * 왜 일반 변수가 아닌 useState를 쓰나요?
   * - 일반 변수는 값이 바뀌어도 화면이 다시 그려지지 않습니다
   * - useState로 만든 상태는 값이 바뀌면 자동으로 화면이 다시 그려집니다 (리렌더링)
   */

  // products: 상품 목록 데이터를 저장하는 상태
  // setProducts: products 상태를 변경하는 함수
  // 초기값: 빈 배열 []
  const [products, setProducts] = useState([])

  // selectedBrand: 현재 선택된 브랜드를 저장하는 상태
  // setSelectedBrand: selectedBrand 상태를 변경하는 함수
  // 초기값: 'all' (모든 브랜드)
  const [selectedBrand, setSelectedBrand] = useState('all')

  // loading: 데이터를 불러오는 중인지 여부를 저장하는 상태
  // setLoading: loading 상태를 변경하는 함수
  // 초기값: true (처음에는 로딩 중)
  const [loading, setLoading] = useState(true)

  /**
   * useEffect 훅 사용 예시
   *
   * 문법: useEffect(() => { 실행할 코드 }, [의존성 배열])
   *
   * - 첫 번째 인자: 실행할 함수
   * - 두 번째 인자: 의존성 배열 (이 배열의 값이 변경될 때마다 함수가 다시 실행됨)
   *
   * 의존성 배열의 동작:
   * - []: 컴포넌트가 처음 렌더링될 때 한 번만 실행
   * - [selectedBrand]: selectedBrand가 변경될 때마다 실행
   * - 생략: 매 렌더링마다 실행 (거의 사용하지 않음)
   *
   * 언제 사용하나요?
   * - API 호출
   * - 외부 데이터 구독
   * - DOM 직접 조작
   * - 타이머 설정 등
   */
  useEffect(() => {
    /**
     * fetchProducts 함수 - 상품 데이터를 가져오는 함수
     *
     * async/await란?
     * - 비동기 작업을 동기적으로 작성할 수 있게 해주는 문법
     * - async: 이 함수가 비동기 함수임을 나타냄
     * - await: 비동기 작업이 완료될 때까지 기다림
     *
     * 왜 비동기로 처리하나요?
     * - API 호출은 시간이 걸리므로, 기다리는 동안 다른 작업을 할 수 있어야 합니다
     * - 화면이 멈추지 않고 계속 반응할 수 있습니다
     */
    async function fetchProducts() {
      try {
        /**
         * try-catch 문
         * - try: 에러가 발생할 수 있는 코드를 실행
         * - catch: 에러가 발생하면 이 블록이 실행됨
         *
         * 왜 필요한가요?
         * - API 호출은 네트워크 문제, 서버 에러 등으로 실패할 수 있습니다
         * - 에러가 발생해도 앱이 멈추지 않고 적절히 처리할 수 있습니다
         */

        // API 엔드포인트 URL을 구성합니다
        // 선택된 브랜드가 'all'이면 모든 상품을, 아니면 해당 브랜드만 요청합니다
        const url = selectedBrand === 'all'
          ? `${process.env.API_URL}/api/products`
          : `${process.env.API_URL}/api/products?brand=${selectedBrand}`

        /**
         * fetch API로 데이터를 가져옵니다
         *
         * fetch란?
         * - 브라우저에 내장된 HTTP 요청 함수
         * - 서버에 데이터를 요청하거나 전송할 때 사용
         *
         * await를 사용하는 이유:
         * - 서버 응답을 기다려야 다음 코드를 실행할 수 있기 때문
         */
        const response = await fetch(url)

        /**
         * JSON 형식으로 응답 데이터를 변환합니다
         *
         * .json()이란?
         * - 서버에서 받은 JSON 문자열을 JavaScript 객체로 변환
         * - 이것도 비동기 작업이므로 await를 사용
         */
        const data = await response.json()

        /**
         * setProducts로 상품 데이터를 상태에 저장합니다
         * - 상태가 업데이트되면 컴포넌트가 자동으로 리렌더링됩니다
         * - 화면에 새로운 데이터가 표시됩니다
         */
        setProducts(data)

        // 데이터 로딩이 완료되었으므로 loading을 false로 변경
        setLoading(false)

      } catch (error) {
        /**
         * 에러 처리
         * - API 호출이 실패하면 이 블록이 실행됩니다
         * - 개발 중에는 콘솔에 에러를 출력하여 디버깅에 도움을 줍니다
         */
        console.error('상품 데이터를 불러오는데 실패했습니다:', error)

        // 에러가 발생해도 로딩 상태는 종료합니다
        setLoading(false)

        /**
         * 실제 프로덕션에서는:
         * - 사용자에게 에러 메시지를 보여주거나
         * - 에러 로깅 서비스에 에러를 전송하거나
         * - 재시도 로직을 구현할 수 있습니다
         */
      }
    }

    /**
     * 백엔드 API가 아직 준비되지 않았을 경우를 대비한 임시 데이터
     *
     * 개발 중에는 이 데이터를 사용하고,
     * 실제 API가 준비되면 위의 fetchProducts()를 사용하면 됩니다
     */

    // 임시 목업 데이터
    const mockProducts = [
      {
        id: 1,
        brand: 'HM',
        name: '오버사이즈 옥스포드 셔츠',
        originalPrice: 39900,
        salePrice: 19900,
        discountRate: 50,
        imageUrl: 'https://via.placeholder.com/300x400?text=H%26M+Shirt',
        productUrl: '#',
        vibe: 'AURALEE 맛'
      },
      {
        id: 2,
        brand: 'ZARA',
        name: '와이드핏 데님 팬츠',
        originalPrice: 59900,
        salePrice: 39900,
        discountRate: 33,
        imageUrl: 'https://via.placeholder.com/300x400?text=ZARA+Denim',
        productUrl: '#',
        vibe: 'MARGIELA 맛'
      },
      {
        id: 3,
        brand: 'UNIQLO',
        name: '슈퍼마 코튼 크루넥 티셔츠',
        originalPrice: 14900,
        salePrice: 9900,
        discountRate: 34,
        imageUrl: 'https://via.placeholder.com/300x400?text=UNIQLO+T-Shirt',
        productUrl: '#',
        vibe: 'THE ROW 맛'
      },
    ]

    /**
     * setTimeout을 사용하여 실제 API 호출처럼 지연을 시뮬레이션
     *
     * setTimeout(함수, 밀리초)
     * - 지정한 시간(밀리초) 후에 함수를 실행
     * - 1000 밀리초 = 1초
     *
     * 왜 이렇게 하나요?
     * - 실제 API는 네트워크 지연이 있습니다
     * - 로딩 상태가 제대로 작동하는지 테스트하기 위함
     */
    setTimeout(() => {
      setProducts(mockProducts)
      setLoading(false)
    }, 1000)

    // 실제 API를 사용하려면 위의 setTimeout을 주석처리하고
    // 아래 줄의 주석을 해제하세요:
    // fetchProducts()

  }, [selectedBrand]) // selectedBrand가 변경될 때마다 이 useEffect가 다시 실행됩니다

  /**
   * 브랜드 필터 변경 핸들러
   *
   * @param {string} brand - 선택된 브랜드 코드
   *
   * 함수를 다른 컴포넌트에 전달하는 이유:
   * - BrandFilter 컴포넌트에서 브랜드가 선택되면
   * - 이 함수를 호출하여 부모 컴포넌트(Home)의 상태를 변경합니다
   * - 이를 "상태 끌어올리기(Lifting State Up)"라고 합니다
   */
  const handleBrandChange = (brand) => {
    setSelectedBrand(brand)
    setLoading(true) // 브랜드가 변경되면 다시 로딩 시작
  }

  /**
   * 상품 목록 필터링
   *
   * .filter() 메서드:
   * - 배열의 각 요소를 검사하여 조건에 맞는 요소만 반환
   * - 원본 배열은 변경되지 않고 새 배열을 반환
   *
   * 삼항 연산자 (조건 ? 참일때값 : 거짓일때값):
   * - if-else를 간단하게 표현하는 방법
   *
   * 예시:
   * selectedBrand === 'all'
   *   -> 모든 상품 반환
   * selectedBrand !== 'all'
   *   -> product.brand === selectedBrand인 상품만 반환
   */
  const filteredProducts = selectedBrand === 'all'
    ? products
    : products.filter(product => product.brand === selectedBrand)

  /**
   * JSX 반환 (화면에 그려질 내용)
   *
   * JSX란?
   * - JavaScript + XML의 약자
   * - HTML처럼 생겼지만 JavaScript 코드입니다
   * - React가 이를 실제 HTML로 변환합니다
   *
   * 주의사항:
   * - return 바로 뒤에 ()가 있으면 그 안의 내용을 반환
   * - JSX에서는 class 대신 className을 사용
   * - JSX에서 JavaScript 표현식을 사용하려면 {}로 감싸야 함
   */
  return (
    <div className={styles.container}>
      {/**
       * Head 컴포넌트
       * - 페이지의 <head> 태그 내용을 동적으로 설정
       * - SEO(검색 엔진 최적화)에 중요합니다
       */}
      <Head>
        <title>맛 프로젝트 - SPA 브랜드 가격 인하 정보</title>
        <meta name="description" content="감성은 같지만 가격은 합리적인 옷을 찾아보세요" />
      </Head>

      {/**
       * 메인 컨텐츠 영역
       */}
      <main className={styles.main}>
        {/* 헤더 섹션 */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            {/* 이모지는 시각적 재미를 더합니다 */}
            👔 맛 프로젝트
          </h1>
          <p className={styles.description}>
            감성은 같지만 가격은 합리적인 옷을 찾아보세요
          </p>
        </div>

        {/**
         * 브랜드 필터 컴포넌트
         *
         * Props 전달:
         * - selectedBrand={selectedBrand}: 현재 선택된 브랜드를 전달
         * - onBrandChange={handleBrandChange}: 브랜드 변경 함수를 전달
         *
         * Props란?
         * - 부모 컴포넌트가 자식 컴포넌트에게 데이터를 전달하는 방법
         * - 읽기 전용이며, 자식 컴포넌트에서 직접 수정할 수 없습니다
         */}
        <BrandFilter
          selectedBrand={selectedBrand}
          onBrandChange={handleBrandChange}
        />

        {/**
         * 조건부 렌더링
         *
         * {조건 && JSX} 문법:
         * - 조건이 true면 JSX를 렌더링
         * - 조건이 false면 아무것도 렌더링하지 않음
         *
         * && 연산자:
         * - 논리 AND 연산자
         * - 왼쪽이 true면 오른쪽 값을 반환
         * - 왼쪽이 false면 왼쪽 값을 반환
         */}
        {loading && (
          <div className={styles.loading}>
            <p>상품을 불러오는 중입니다...</p>
          </div>
        )}

        {/**
         * 조건부 렌더링 - 상품 목록 또는 빈 상태
         */}
        {!loading && (
          <div className={styles.productsGrid}>
            {/**
             * 배열 렌더링 - .map() 메서드
             *
             * .map(콜백함수):
             * - 배열의 각 요소를 순회하며 JSX를 생성
             * - 각 요소를 변환하여 새로운 배열을 반환
             *
             * key prop의 중요성:
             * - React가 어떤 항목이 변경/추가/삭제되었는지 식별하는데 사용
             * - 고유한 값이어야 합니다 (보통 id 사용)
             * - 배열의 인덱스를 key로 사용하는 것은 권장되지 않습니다
             *
             * {...product} 스프레드 연산자:
             * - product 객체의 모든 속성을 ProductCard에 props로 전달
             * - product = {id: 1, name: "셔츠", price: 10000}
             * - <ProductCard id={1} name="셔츠" price={10000} />와 같습니다
             */}
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  {...product}
                />
              ))
            ) : (
              /**
               * 삼항 연산자를 사용한 조건부 렌더링
               * - 상품이 있으면 ProductCard 렌더링
               * - 상품이 없으면 빈 상태 메시지 렌더링
               */
              <div className={styles.emptyState}>
                <p>현재 등록된 상품이 없습니다.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className={styles.footer}>
        <p>© 2024 맛 프로젝트. 감성은 같지만 가격은 합리적인 패션 큐레이션.</p>
      </footer>
    </div>
  )
}
