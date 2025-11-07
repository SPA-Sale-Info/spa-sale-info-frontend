/**
 * index.js - 완전히 새로운 프리미엄 메인 페이지
 *
 * 포트폴리오용 전문적인 레이아웃
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Head from 'next/head'
import BrandFilter from '../components/BrandFilter'
import GenderFilter from '../components/GenderFilter'
import CategoryFilter from '../components/CategoryFilter'
import ProductCard from '../components/ProductCard'
import styles from '../styles/Home.module.css'
import { fetchSaleProducts } from '../utils/api'

/**
 * API에서 충분히 많은 상품을 받기 위해 한 번에 불러올 개수를 결정합니다.
 * 값이 너무 작으면 스크롤을 조금만 내려도 계속 네트워크 요청을 하게 됩니다.
 */
const PAGE_SIZE = 12
const FALLBACK_IMAGE = '/placeholder-product.svg'
const CATEGORY_GROUPS = {
  TOP: ['SHIRT', 'T_SHIRT', 'KNIT', 'SWEATSHIRT', 'DRESS', 'BLOUSE'],
  BOTTOM: ['PANTS', 'JEANS', 'SHORTS', 'SKIRT'],
  OUTER: ['JACKET', 'COAT', 'PADDING'],
  SHOES: ['SHOES'],
  ETC: ['ACCESSORIES', 'BAG', 'UNCATEGORIZED', 'UNKNOWN'],
}
const DAILY_MOODS = [
  {
    palette: '잿빛 스카이블루',
    fabric: '워셔블 울',
    focus: '여유 있는 셔츠 아우터',
    keywords: '스카이블루 · 오트밀 · 니트 텍스처',
    note: '햇빛 아래에서도 거슬리지 않는 차분한 색감을 골랐어요.',
    background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.9), rgba(96, 165, 250, 0.85))',
    textColor: '#f8fafc',
  },
  {
    palette: '먼지 낀 네이비',
    fabric: '코튼 트윌',
    focus: '하이웨이스트 팬츠',
    keywords: '네이비 · 화이트 · 스웨이드',
    note: '밝고 어두운 아이템을 자연스럽게 연결해 줍니다.',
    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 118, 110, 0.85))',
    textColor: '#e0f2f1',
  },
  {
    palette: '바랜 베이지',
    fabric: '린넨 &amp; 레이온',
    focus: '가벼운 드레스 셋업',
    keywords: '베이지 · 브라운 · 스트라이프',
    note: '공기를 머금은 느낌이 필요한 날에 어울립니다.',
    background: 'linear-gradient(135deg, rgba(244, 224, 196, 0.95), rgba(217, 180, 130, 0.85))',
    textColor: '#4a3425',
  },
  {
    palette: '모래빛 카키',
    fabric: '나일론 혼방',
    focus: '가볍게 걸칠 점퍼',
    keywords: '카키 · 크림 · 러버솔',
    note: '도로 먼지를 닮은 색감으로 무심한 분위기를 만듭니다.',
    background: 'linear-gradient(135deg, rgba(64, 64, 59, 0.95), rgba(156, 163, 175, 0.85))',
    textColor: '#f1f5f9',
  },
]

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
  const category = (product.category || 'UNCATEGORIZED').toUpperCase()
  const categoryGroup = Object.entries(CATEGORY_GROUPS).find(([, items]) => (
    items.includes(category)
  ))?.[0] || 'ETC'

  return {
    id: product.id || product.productCode || `${brand}-${product.name ?? 'unknown'}`,
    brand,
    gender,
    category,
    categoryGroup,
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
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [showScrollTop, setShowScrollTop] = useState(false)
  const loadMoreRef = useRef(null)
  const dailyMood = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const index = Number(todayKey) % DAILY_MOODS.length
    return DAILY_MOODS[index]
  }, [])

  // API에서 받은 원본 데이터를 화면에서 쓰기 좋은 형태로 바꿉니다.
  const normalizeProducts = useCallback((apiProducts = []) => (
    apiProducts.map(normalizeProduct)
  ), [])

  const mergeUniqueProducts = useCallback((prevProducts, incomingProducts, replace) => {
    if (replace) {
      return incomingProducts
    }

    const seenIds = new Set(prevProducts.map(product => product.id))
    const merged = [...prevProducts]

    incomingProducts.forEach((product) => {
      if (product.id && !seenIds.has(product.id)) {
        seenIds.add(product.id)
        merged.push(product)
      }
    })

    return merged
  }, [])

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

      setProducts(prev => mergeUniqueProducts(prev, normalized, replace))
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
  }, [mergeUniqueProducts, normalizeProducts, selectedBrand])

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

  // 브랜드, 성별, 검색어 변경 핸들러
  const handleBrandChange = (brand) => {
    setSelectedBrand(brand)
  }

  const handleGenderChange = (gender) => {
    setSelectedGender(gender)
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const keyword = formData.get('keyword') || ''
    setSearchQuery(String(keyword))
  }

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value)
  }

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 상품 필터링 (성별은 아직 프론트에서 처리)
  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return products.filter((product) => {
      const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand
      const matchesGender =
        selectedGender === 'all' ||
        product.gender === selectedGender ||
        product.gender === 'unisex'
      const matchesCategory =
        selectedCategory === 'all' ||
        product.categoryGroup === selectedCategory

      const matchesSearch = normalizedQuery === ''
        || product.name.toLowerCase().includes(normalizedQuery)
        || (product.brand && product.brand.toLowerCase().includes(normalizedQuery))

      return matchesBrand && matchesGender && matchesCategory && matchesSearch
    })
  }, [products, selectedBrand, selectedGender, selectedCategory, searchQuery])

  // 통계 계산
  const totalBrandLabels = new Set(products.map(p => p.brand)).size
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
              👔 SPA 정보 다이어리
            </div>
          </div>
        </nav>

        {/* 히어로 섹션 */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <span className={styles.heroKicker}>Sale archive</span>
              <h1 className={styles.heroTitle}>
                흩어진 할인 정보를 원하는 순서로
              </h1>
              <p className={styles.heroSubtitle}>
                여러 SPA 사이트에 흩어진 세일 소식을 한 곳에 눌러 담았습니다.
                새벽에 받은 앱 알림이나 브랜드 SNS를 뒤적일 필요 없이, 필요한 장면만 빠르게 스크랩하세요.
              </p>

              <div className={styles.heroChecklist}>
                <div className={styles.heroChecklistItem}>
                  <span>01</span>
                  <p>각 브랜드의 공지와 앱 배너를 훑어 주요 세일 단서를 보기 좋게 정리했습니다.</p>
                </div>
                <div className={styles.heroChecklistItem}>
                  <span>02</span>
                  <p>비슷한 아이템이 겹치지 않도록 실루엣과 텍스처 기준으로 다시 추렸습니다.</p>
                </div>
                <div className={styles.heroChecklistItem}>
                  <span>03</span>
                  <p>필터를 돌리면 지금 입고 싶은 역할, 색감에 맞는 후보만 남도록 구성했습니다.</p>
                </div>
              </div>

              <div className={styles.heroInsights}>
                <div className={styles.heroInsightCard}>
                  <p className={styles.heroInsightLabel}>오늘의 시선</p>
                  <strong>{dailyMood.focus}</strong>
                  <small>{dailyMood.keywords}</small>
                </div>
                <div className={styles.heroInsightCard}>
                  <p className={styles.heroInsightLabel}>지금 담긴 레이블</p>
                  <strong>{totalBrandLabels}개 브랜드</strong>
                  <small>필터로 바로 골라 보세요</small>
                </div>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div
                className={styles.heroMoodBoard}
                style={{
                  background: dailyMood.background,
                  color: dailyMood.textColor,
                }}
              >
                <p className={styles.heroMoodTitle}>Wardrobe log</p>
                <div className={styles.heroMoodRow}>
                  <span>컬러 힌트</span>
                  <strong>{dailyMood.palette}</strong>
                </div>
                <div className={styles.heroMoodRow}>
                  <span>소재 선택</span>
                  <strong dangerouslySetInnerHTML={{ __html: dailyMood.fabric }} />
                </div>
                <div className={styles.heroMoodRow}>
                  <span>포커스 아이템</span>
                  <strong>{dailyMood.focus}</strong>
                </div>
                <p className={styles.heroMoodNote}>
                  {dailyMood.note}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 메인 컨텐츠 */}
        <main className={styles.main} id="products">
          {/* 섹션 헤더 */}
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>오늘 챙겨야 할 옷장 업데이트</h2>
            <p className={styles.sectionSubtitle}>
              브랜드·성별·카테고리를 조합해서 지금 역할을 해줄 아이템만 남겨 보세요.
            </p>
          </div>

          {/* 필터 패널 */}
          <div className={styles.searchBarWrap}>
            <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
              <input
                type="text"
                name="keyword"
                value={searchQuery}
                onChange={handleSearchInputChange}
                className={styles.searchInput}
                placeholder="상품명이나 브랜드를 검색해 보세요"
                aria-label="상품 검색"
              />
              <button type="submit" className={styles.searchButton}>
                검색
              </button>
            </form>
          </div>

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
            <div className={styles.filterGroup}>
              <div className={styles.filterLabel}>카테고리</div>
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
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
      {showScrollTop && (
        <button
          type="button"
          className={styles.scrollTopButton}
          onClick={scrollToTop}
          aria-label="맨 위로 이동"
        >
          ↑
        </button>
      )}
    </div>
  )
}
