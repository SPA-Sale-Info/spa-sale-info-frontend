/**
 * index.js - 완전히 새로운 프리미엄 메인 페이지
 *
 * 포트폴리오용 전문적인 레이아웃
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Head from 'next/head'
import BrandFilter from '../components/BrandFilter'
import GenderFilter from '../components/GenderFilter'
import ProductCard from '../components/ProductCard'
import styles from '../styles/Home.module.css'
import { fetchSaleProducts } from '../utils/api'

/**
 * API에서 충분히 많은 상품을 받기 위해 한 번에 불러올 개수를 결정합니다.
 * 값이 너무 작으면 스크롤을 조금만 내려도 계속 네트워크 요청을 하게 됩니다.
 */
const PAGE_SIZE = 12
const FALLBACK_IMAGE = '/placeholder-product.svg'

const resolveImageUrl = (rawUrl) => {
  if (typeof rawUrl !== 'string' || rawUrl.trim() === '') {
    return FALLBACK_IMAGE
  }

  const trimmed = rawUrl.trim()

  // 절대 경로(URL)면 그대로 사용합니다.
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  // 슬래시로 시작하면 Next.js에서 동일 호스트 자원으로 취급할 수 있습니다.
  if (trimmed.startsWith('/')) {
    return trimmed
  }

  // 그 외의 경우(예: assets/hm/... 처럼 상대 경로)는 Next Image가 파싱하지 못하므로
  // 안전하게 플레이스홀더 이미지를 사용합니다.
  return FALLBACK_IMAGE
}

const coerceNumber = (value) => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, ''))
    return Number.isNaN(parsed) ? 0 : parsed
  }

  return 0
}

const normalizeProduct = (product = {}) => {
  const originalPrice = coerceNumber(product.originalPrice)
  const salePrice = coerceNumber(
    product.currentPrice !== undefined ? product.currentPrice : product.salePrice,
  ) || originalPrice

  const discountRate = typeof product.discountRate === 'number'
    ? product.discountRate
    : (originalPrice
      ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
      : 0)

  const rawImageUrl = Array.isArray(product.imageUrls) && product.imageUrls.length > 0
    ? product.imageUrls[0]
    : product.imageUrl

  const imageUrl = resolveImageUrl(rawImageUrl)

  const gender = typeof product.gender === 'string'
    ? product.gender.toLowerCase()
    : 'unisex'

  const brand = (product.brandType || product.brandName || 'UNKNOWN').toUpperCase()

  return {
    id: product.id || product.productCode || `${brand}-${product.name ?? 'unknown'}`,
    brand,
    gender,
    name: product.name || '이름 미정',
    originalPrice,
    salePrice,
    discountRate,
    imageUrl,
    productUrl: product.productUrl || '#',
    vibe: Array.isArray(product.tags) && product.tags.length > 0 ? product.tags[0] : null,
  }
}

export default function Home() {
  // 상태 관리
  // ▶ products: 화면에 보여줄 전체 상품 목록
  // ▶ selectedBrand / selectedGender: 사용자가 선택한 필터
  // ▶ isInitialLoading / isFetchingMore: 처음 로딩과 추가 로딩을 구분해 UI를 부드럽게 합니다.
  const [products, setProducts] = useState([])
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [selectedGender, setSelectedGender] = useState('all')
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const loadMoreRef = useRef(null)

  // API에서 받은 원본 데이터를 화면에서 쓰기 좋은 형태로 바꿉니다.
  const normalizeProducts = useCallback((apiProducts = []) => (
    apiProducts.map(normalizeProduct)
  ), [])

  /**
   * 실질적으로 데이터를 가져오는 함수입니다.
   * - replace가 true면 기존 목록을 갈아끼우고(브랜드 변경 등),
   * - false면 무한 스크롤처럼 목록 뒤에 이어 붙입니다.
   */
  const loadProducts = useCallback(async ({ pageToLoad, replace }) => {
    if (replace) {
      setIsInitialLoading(true)
      setError(null)
    } else {
      setIsFetchingMore(true)
    }

    try {
      const response = await fetchSaleProducts({
        page: pageToLoad,
        size: PAGE_SIZE,
        brandType: selectedBrand !== 'all' ? selectedBrand : undefined,
      })

      const apiProducts = response?.content ?? []
      const normalized = normalizeProducts(apiProducts)

      setProducts(prev => (replace ? normalized : [...prev, ...normalized]))
      setPage(pageToLoad)

      const isLastPage = typeof response?.last === 'boolean'
        ? response.last
        : (response?.totalPages
          ? pageToLoad + 1 >= response.totalPages
          : normalized.length < PAGE_SIZE)

      setHasMore(!isLastPage)
    } catch (err) {
      console.error('상품 데이터를 불러오지 못했습니다.', err)
      setError(replace
        ? '상품 정보를 가져오는데 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'
        : '추가 상품을 불러오는데 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      )
      setHasMore(false)
      if (replace) {
        setProducts([])
      }
    } finally {
      if (replace) {
        setIsInitialLoading(false)
      } else {
        setIsFetchingMore(false)
      }
    }
  }, [normalizeProducts, selectedBrand])

  /**
   * 선택한 브랜드가 바뀌면
   * 1) 목록을 비우고
   * 2) 첫 페이지(0페이지)를 다시 불러옵니다.
   */
  useEffect(() => {
    setProducts([])
    setPage(0)
    setHasMore(true)
    loadProducts({ pageToLoad: 0, replace: true })
  }, [selectedBrand, loadProducts])

  /**
   * IntersectionObserver를 사용해 화면 하단에 숨겨둔 loadMoreRef 요소가 보이면
   * 다음 페이지를 불러옵니다. (무한 스크롤)
   */
  const loadNextPage = useCallback(() => {
    if (isInitialLoading || isFetchingMore || !hasMore) {
      return
    }
    loadProducts({ pageToLoad: page + 1, replace: false })
  }, [hasMore, isFetchingMore, isInitialLoading, loadProducts, page])

  useEffect(() => {
    if (!loadMoreRef.current) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          loadNextPage()
        }
      },
      { rootMargin: '200px' }, // 미리 여유를 두고 요청하기 위해 여백을 주었습니다.
    )

    const target = loadMoreRef.current
    observer.observe(target)

    return () => observer.unobserve(target)
  }, [loadNextPage])

  // 브랜드 변경 핸들러
  const handleBrandChange = (brand) => {
    setSelectedBrand(brand)
  }

  const handleGenderChange = (gender) => {
    setSelectedGender(gender)
  }

  // 상품 필터링 (성별은 아직 프론트에서 처리)
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand
      const matchesGender =
        selectedGender === 'all' ||
        product.gender === selectedGender ||
        product.gender === 'unisex'

      return matchesBrand && matchesGender
    })
  }, [products, selectedBrand, selectedGender])

  // 통계 계산
  const totalProducts = filteredProducts.length
  const totalBrands = new Set(filteredProducts.map(p => p.brand)).size
  const avgDiscount = filteredProducts.length > 0
    ? Math.round(filteredProducts.reduce((sum, p) => sum + p.discountRate, 0) / filteredProducts.length)
    : 0

  return (
    <div className={styles.container}>
      <div className={styles.leftAd}>
        {/* 광고 영역 */}
      </div>
      <div className={styles.mainContent}>
        <Head>
          <title>Bang for the buck</title>
          <meta name="description" content="고가 브랜드의 감성을 닮은 합리적인 가격의 SPA 브랜드 상품을 발견하세요" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        {/* 네비게이션 */}
        <nav className={styles.navbar}>
          <div className={styles.navContent}>
            <div className={styles.logo}>
              👔 SPA 할인정보
            </div>
            <ul className={styles.navLinks}>
              <li><a href="#products" className={styles.navLink}>상품</a></li>
              <li><a href="#brands" className={styles.navLink}>브랜드</a></li>
              <li><a href="#about" className={styles.navLink}>소개</a></li>
            </ul>
          </div>
        </nav>

        {/* 히어로 섹션 */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <span className={styles.heroKicker}>Gender aware curation</span>
              <h1 className={styles.heroTitle}>
                성별 맞춤 SPA 할인 인텔리전스
              </h1>
              <p className={styles.heroSubtitle}>
                남성 · 여성 · 공용 카테고리를 한 번에 스캔하고,
                지금 가장 매력적인 가격의 아이템을 빠르게 찾아보세요.
              </p>

              <div className={styles.heroActions}>
                <a className={styles.primaryCTA} href="#products">
                  상품 바로 보기
                </a>
                <div className={styles.heroHint}>
                  🔄 필터를 변경하면 즉시 재계산됩니다
                </div>
              </div>

              <div className={styles.heroStats}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{totalProducts}</span>
                  <span className={styles.statLabel}>실시간 상품</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{totalBrands}</span>
                  <span className={styles.statLabel}>활성 브랜드</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{avgDiscount}%</span>
                  <span className={styles.statLabel}>평균 할인율</span>
                </div>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div className={`${styles.heroHighlight} ${styles.heroHighlightMen}`}>
                <span className={styles.heroHighlightLabel}>👔 남성 베스트</span>
                <strong>옥스포드 셔츠 · 테일러드</strong>
                <em>최대 50% 할인</em>
              </div>
              <div className={`${styles.heroHighlight} ${styles.heroHighlightWomen}`}>
                <span className={styles.heroHighlightLabel}>👗 여성 베스트</span>
                <strong>데님 · 아우터 컬렉션</strong>
                <em>이번 주 인기 급상승</em>
              </div>
              <div className={`${styles.heroHighlight} ${styles.heroHighlightUnisex}`}>
                <span className={styles.heroHighlightLabel}>🧥 공용 추천</span>
                <strong>후디 · 린넨 셔츠</strong>
                <em>편안한 리빙웨어</em>
              </div>
            </div>
          </div>
        </section>

        {/* 메인 컨텐츠 */}
        <main className={styles.main} id="products">
          {/* 섹션 헤더 */}
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>할인 중인 상품</h2>
            <p className={styles.sectionSubtitle}>
              브랜드와 성별을 조합해 원하는 무드를 빠르게 필터링하세요.
            </p>
          </div>

          {/* 필터 패널 */}
          <div className={styles.filterPanel}>
            <div className={styles.filterGroup}>
              <div className={styles.filterLabel}>브랜드</div>
              <BrandFilter
                selectedBrand={selectedBrand}
                onBrandChange={handleBrandChange}
              />
            </div>
            <div className={styles.filterGroup}>
              <div className={styles.filterLabel}>성별</div>
              <GenderFilter
                selectedGender={selectedGender}
                onGenderChange={handleGenderChange}
              />
            </div>
          </div>

          {/* 로딩 상태 */}
          {isInitialLoading && (
            <div className={styles.loading}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>상품을 불러오는 중...</p>
            </div>
          )}

          {/* 에러 상태 */}
          {!isInitialLoading && error && products.length === 0 && (
            <div className={styles.errorState} role="status">
              <h3 className={styles.errorTitle}>데이터를 가져오는 데 실패했어요</h3>
              <p className={styles.errorDescription}>
                {error}
              </p>
            </div>
          )}

          {/* 상품 그리드 */}
          {!isInitialLoading && !error && (
            <>
              <div className={styles.productsGrid}>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      {...product}
                    />
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🔍</div>
                    <h3 className={styles.emptyTitle}>상품이 없습니다</h3>
                    <p className={styles.emptyDescription}>
                      선택하신 조건에 맞는 상품이 아직 없습니다.
                      다른 필터를 선택해 보세요.
                    </p>
                  </div>
                )}
              </div>

              {isFetchingMore && (
                <div className={styles.loading}>
                  <div className={styles.loadingSpinner}></div>
                  <p className={styles.loadingText}>추가 상품을 불러오는 중...</p>
                </div>
              )}

              {!isInitialLoading && error && products.length > 0 && (
                <div className={styles.errorState} role="status">
                  <h3 className={styles.errorTitle}>추가 데이터를 가져오지 못했습니다</h3>
                  <p className={styles.errorDescription}>
                    {error}
                  </p>
                </div>
              )}

              {/* 이 div는 화면에 보이지 않지만, 관찰 대상이 되어 다음 페이지를 로드합니다. */}
              <div
                ref={loadMoreRef}
                style={{ width: '100%', height: '1px' }}
                aria-hidden="true"
              />
            </>
          )}
        </main>

        {/* 푸터 */}
        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <h3 className={styles.footerTitle}>맛 프로젝트</h3>
            <p className={styles.footerText}>
              고가 브랜드의 감성을 합리적인 가격에 즐기는 스마트한 쇼핑
            </p>
            <div className={styles.footerLinks}>
              <a href="#" className={styles.footerLink}>Instagram</a>
              <a href="#" className={styles.footerLink}>Twitter</a>
              <a href="#" className={styles.footerLink}>Contact</a>
            </div>
            <p className={styles.footerText} style={{ marginTop: '2rem', fontSize: '0.875rem', opacity: 0.6 }}>
              © 2024 맛 프로젝트. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
      <div className={styles.rightAd}>
        {/* 광고 영역 */}
      </div>
    </div>
  )
}
