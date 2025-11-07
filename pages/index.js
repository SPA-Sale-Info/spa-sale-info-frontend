/**
 * index.js - 완전히 새로운 프리미엄 메인 페이지
 *
 * 포트폴리오용 전문적인 레이아웃
 */

import { useState, useEffect, useMemo, useRef } from 'react'
import Head from 'next/head'
import BrandFilter from '../components/BrandFilter'
import GenderFilter from '../components/GenderFilter'
import ProductCard from '../components/ProductCard'
import styles from '../styles/Home.module.css'
import { fetchSaleProducts } from '../utils/api'

export default function Home() {
  // 상태 관리
  // ▶ products: 화면에 보여줄 전체 상품 목록
  // ▶ selectedBrand / selectedGender: 사용자가 선택한 필터
  // ▶ loading / error: API 호출 상태 표시용
  const [products, setProducts] = useState([])
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedGender, setSelectedGender] = useState('all')
  const filterLoadingTimer = useRef(null)

  /**
   * 1) 페이지가 처음 열리면 fetchSaleProducts를 호출합니다.
   * 2) 응답(JSON)을 우리가 쓰기 쉬운 모양으로 정리합니다.
   * 3) 정리된 데이터를 상태에 넣고 로딩을 끕니다.
   */
  useEffect(() => {
    let isCancelled = false

    const loadProducts = async () => {
      setLoading(true)
      setError(null)

      try {
        // page=0, size=12 → 첫 페이지 12개만 미리 불러옵니다.
        const response = await fetchSaleProducts({ page: 0, size: 12 })
        const apiProducts = response?.content ?? []

        if (isCancelled) {
          return
        }

        const normalizedProducts = apiProducts.map((product) => {
          // 이미지가 없으면 플레이스홀더를 사용해 깨지지 않도록 처리
          const firstImage = Array.isArray(product.imageUrls) && product.imageUrls.length > 0
            ? product.imageUrls[0]
            : 'https://via.placeholder.com/480x600?text=No+Image'

          const normalizedGender = typeof product.gender === 'string'
            ? product.gender.toLowerCase()
            : 'unisex'

          return {
            id: product.id || product.productCode,
            brand: product.brandType || product.brandName || 'UNKNOWN',
            gender: normalizedGender,
            name: product.name,
            originalPrice: product.originalPrice,
            salePrice: product.currentPrice,
            discountRate: product.discountRate,
            imageUrl: firstImage,
            productUrl: product.productUrl,
            vibe: product.tags && product.tags.length > 0 ? product.tags[0] : null,
          }
        })

        setProducts(normalizedProducts)
      } catch (err) {
        console.error('상품 데이터를 불러오지 못했습니다.', err)
        if (!isCancelled) {
          setError('상품 정보를 가져오는데 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    // 필터 로딩 타이머가 남아 있으면 페이지를 떠날 때 깨끗이 정리
    return () => {
      if (filterLoadingTimer.current) {
        clearTimeout(filterLoadingTimer.current)
      }
    }
  }, [])

  const triggerFilterLoading = () => {
    if (filterLoadingTimer.current) {
      clearTimeout(filterLoadingTimer.current)
    }
    // UX를 위해 필터 변경 시 잠깐 로딩 스피너를 돌립니다.
    setLoading(true)
    filterLoadingTimer.current = setTimeout(() => {
      setLoading(false)
    }, 300)
  }

  // 브랜드 변경 핸들러
  const handleBrandChange = (brand) => {
    setSelectedBrand(brand)
    triggerFilterLoading()
  }

  const handleGenderChange = (gender) => {
    setSelectedGender(gender)
    triggerFilterLoading()
  }

  // 상품 필터링
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
          {loading && (
            <div className={styles.loading}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>상품을 불러오는 중...</p>
            </div>
          )}

          {/* 에러 상태 */}
          {!loading && error && (
            <div className={styles.errorState} role="status">
              <h3 className={styles.errorTitle}>데이터를 가져오는 데 실패했어요</h3>
              <p className={styles.errorDescription}>
                {error}
              </p>
            </div>
          )}

          {/* 상품 그리드 */}
          {!loading && !error && (
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
                    선택하신 브랜드 · 성별 조합에 맞는 상품이 아직 없습니다.
                    다른 필터를 선택해 보세요.
                  </p>
                </div>
              )}
            </div>
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
