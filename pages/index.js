/**
 * index.js - 완전히 새로운 프리미엄 메인 페이지
 *
 * 포트폴리오용 전문적인 레이아웃
 */

import { useState, useEffect } from 'react'
import Head from 'next/head'
import BrandFilter from '../components/BrandFilter'
import ProductCard from '../components/ProductCard'
import styles from '../styles/Home.module.css'

export default function Home() {
  // 상태 관리
  const [products, setProducts] = useState([])
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [loading, setLoading] = useState(true)

  // 데이터 로딩
  useEffect(() => {
    // 목업 데이터
    const mockProducts = [
      {
        id: 1,
        brand: 'HM',
        name: '프리미엄 오버사이즈 옥스포드 셔츠',
        originalPrice: 59900,
        salePrice: 29900,
        discountRate: 50,
        imageUrl: 'https://via.placeholder.com/400x500?text=Premium+Shirt',
        productUrl: '#',
        vibe: 'AURALEE 맛'
      },
      {
        id: 2,
        brand: 'ZARA',
        name: '와이드핏 크롭 데님 팬츠',
        originalPrice: 89900,
        salePrice: 59900,
        discountRate: 33,
        imageUrl: 'https://via.placeholder.com/400x500?text=Designer+Denim',
        productUrl: '#',
        vibe: 'MARGIELA 맛'
      },
      {
        id: 3,
        brand: 'UNIQLO',
        name: '슈퍼마 코튼 롱슬리브 티셔츠',
        originalPrice: 29900,
        salePrice: 19900,
        discountRate: 34,
        imageUrl: 'https://via.placeholder.com/400x500?text=Cotton+Tee',
        productUrl: '#',
        vibe: 'THE ROW 맛'
      },
      {
        id: 4,
        brand: 'MUJI',
        name: '오가닉 코튼 오버사이즈 셔츠',
        originalPrice: 49900,
        salePrice: 34900,
        discountRate: 30,
        imageUrl: 'https://via.placeholder.com/400x500?text=Organic+Shirt',
        productUrl: '#',
        vibe: 'AURALEE 맛'
      },
      {
        id: 5,
        brand: 'COS',
        name: '미니멀 울 블렌드 코트',
        originalPrice: 259000,
        salePrice: 179000,
        discountRate: 31,
        imageUrl: 'https://via.placeholder.com/400x500?text=Wool+Coat',
        productUrl: '#',
        vibe: 'LEMAIRE 맛'
      },
      {
        id: 6,
        brand: 'HM',
        name: '테일러드 와이드 팬츠',
        originalPrice: 49900,
        salePrice: 29900,
        discountRate: 40,
        imageUrl: 'https://via.placeholder.com/400x500?text=Wide+Pants',
        productUrl: '#',
        vibe: 'AURALEE 맛'
      },
    ]

    setTimeout(() => {
      setProducts(mockProducts)
      setLoading(false)
    }, 1000)
  }, [selectedBrand])

  // 브랜드 변경 핸들러
  const handleBrandChange = (brand) => {
    setSelectedBrand(brand)
    setLoading(true)
  }

  // 상품 필터링
  const filteredProducts = selectedBrand === 'all'
    ? products
    : products.filter(product => product.brand === selectedBrand)

  // 통계 계산
  const totalProducts = filteredProducts.length
  const totalBrands = new Set(products.map(p => p.brand)).size
  const avgDiscount = filteredProducts.length > 0
    ? Math.round(filteredProducts.reduce((sum, p) => sum + p.discountRate, 0) / filteredProducts.length)
    : 0

  return (
    <div className={styles.container}>
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
          <h1 className={styles.heroTitle}>
            SPA 할인정보를 한눈에
          </h1>
          <p className={styles.heroSubtitle}>
            할인 중인 SPA 브랜드 상품을 발견하세요.
          </p>

          {/* 통계 */}
          <div className={styles.heroStats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{totalProducts}</span>
              <span className={styles.statLabel}>할인 상품</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{totalBrands}+</span>
              <span className={styles.statLabel}>브랜드</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{avgDiscount}%</span>
              <span className={styles.statLabel}>평균 할인율</span>
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
            지금 할인 중인 SPA 상품들을 만나보세요
          </p>
        </div>

        {/* 브랜드 필터 */}
        <BrandFilter
          selectedBrand={selectedBrand}
          onBrandChange={handleBrandChange}
        />

        {/* 로딩 상태 */}
        {loading && (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>상품을 불러오는 중...</p>
          </div>
        )}

        {/* 상품 그리드 */}
        {!loading && (
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
                  선택하신 브랜드에 현재 할인 중인 상품이 없습니다
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
  )
}
